import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    makeInMemoryStore,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion
} from 'baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import EventEmitter from 'events';
import { serialize } from '../helpers/serialize.js';
import { PluginHandler } from '../handlers/PluginHandler.js';

export class Client extends EventEmitter {
    constructor(options = {}) {
        super();

        this.config = {
            sessionId: options.sessionId || 'kachina-session',
            phoneNumber: options.phoneNumber || '',
            printQRInTerminal: options.printQRInTerminal !== false,
            loginMethod: options.loginMethod || 'qr', // 'qr' or 'pairing'
            browser: options.browser || ['Kachina-MD', 'Chrome', '1.0.0'],
            logger: options.logger || pino({ level: 'silent' }),
            ...options
        };

        this.sock = null;
        this.store = null;
        this.isReady = false;
        this.pluginHandler = new PluginHandler(this);
    }

    async start() {
        const { state, saveCreds } = await useMultiFileAuthState(this.config.sessionId);
        const { version } = await fetchLatestBaileysVersion();

        if (this.config.useStore) {
            this.store = makeInMemoryStore({
                logger: pino().child({ level: 'silent', stream: 'store' })
            });
        }

        this.sock = makeWASocket({
            version,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, this.config.logger)
            },
            logger: this.config.logger,
            printQRInTerminal: this.config.printQRInTerminal && this.config.loginMethod === 'qr',
            browser: this.config.browser,
            getMessage: async (key) => {
                if (this.store) {
                    const msg = await this.store.loadMessage(key.remoteJid, key.id);
                    return msg?.message || undefined;
                }
                return { conversation: '' };
            }
        });

        if (this.store) {
            this.store.bind(this.sock.ev);
        }

        this.sock.ev.on('creds.update', saveCreds);

        this.sock.ev.on('connection.update', async (update) => {
            await this.handleConnectionUpdate(update);
        });

        this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;

            for (const message of messages) {
                const m = await serialize(message, this.sock);
                this.emit('message', m);

                // Auto plugin handler
                if (this.pluginHandler.isLoaded && m.body?.startsWith(this.config.prefix || '!')) {
                    await this.pluginHandler.execute(m);
                }
            }
        });

        this.sock.ev.on('group-participants.update', (update) => {
            this.emit('group.update', update);
        });

        this.sock.ev.on('groups.update', (updates) => {
            this.emit('groups.update', updates);
        });

        this.sock.ev.on('call', (calls) => {
            this.emit('call', calls);
        });

        return this.sock;
    }

    async handleConnectionUpdate(update) {
        const { connection, lastDisconnect, qr } = update;

        if (qr && this.config.loginMethod === 'qr') {
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)
                ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
                : true;

            if (shouldReconnect) {
                this.emit('reconnecting');
                await this.start();
            } else {
                this.emit('logout');
            }
        } else if (connection === 'open') {
            this.isReady = true;
            this.user = this.sock.user;
            this.emit('ready', this.user);

            // Request pairing code if needed
            if (!this.sock.authState.creds.registered && this.config.loginMethod === 'pairing') {
                if (this.config.phoneNumber) {
                    setTimeout(async () => {
                        const code = await this.sock.requestPairingCode(this.config.phoneNumber);
                        this.emit('pairing.code', code);
                    }, 3000);
                }
            }
        } else if (connection === 'connecting') {
            this.emit('connecting');
        }
    }

    // Helper methods
    async sendMessage(jid, content, options = {}) {
        return await this.sock.sendMessage(jid, content, options);
    }

    async sendText(jid, text, options = {}) {
        return await this.sendMessage(jid, { text }, options);
    }

    async sendImage(jid, buffer, caption = '', options = {}) {
        const content = {
            image: buffer,
            ...options
        };
        if (caption) content.caption = caption;
        return await this.sendMessage(jid, content, options);
    }

    async sendVideo(jid, buffer, caption = '', options = {}) {
        const content = {
            video: buffer,
            ...options
        };
        if (caption) content.caption = caption;
        return await this.sendMessage(jid, content, options);
    }

    async sendAudio(jid, buffer, options = {}) {
        const content = {
            audio: buffer,
            mimetype: options.mimetype || 'audio/mp4',
            ptt: options.ptt || false, // Push to talk (voice note)
            ...options
        };
        return await this.sendMessage(jid, content, options);
    }

    async sendDocument(jid, buffer, filename, mimetype, options = {}) {
        return await this.sendMessage(jid, {
            document: buffer,
            fileName: filename,
            mimetype,
            ...options
        });
    }

    async sendSticker(jid, buffer, options = {}) {
        return await this.sendMessage(jid, {
            sticker: buffer,
            ...options
        });
    }

    async sendContact(jid, contacts, options = {}) {
        // contacts = [{ displayName, vcard }]
        return await this.sendMessage(jid, {
            contacts: { contacts },
            ...options
        });
    }

    async sendLocation(jid, latitude, longitude, options = {}) {
        return await this.sendMessage(jid, {
            location: { degreesLatitude: latitude, degreesLongitude: longitude },
            ...options
        });
    }

    async sendPoll(jid, name, values, options = {}) {
        return await this.sendMessage(jid, {
            poll: {
                name,
                values,
                selectableCount: options.selectableCount || 1
            },
            ...options
        });
    }

    async sendReact(jid, messageKey, emoji) {
        return await this.sendMessage(jid, {
            react: { text: emoji, key: messageKey }
        });
    }

    async groupMetadata(jid) {
        return await this.sock.groupMetadata(jid);
    }

    async groupParticipantsUpdate(jid, participants, action) {
        return await this.sock.groupParticipantsUpdate(jid, participants, action);
    }

    async groupUpdateSubject(jid, subject) {
        return await this.sock.groupUpdateSubject(jid, subject);
    }

    async groupUpdateDescription(jid, description) {
        return await this.sock.groupUpdateDescription(jid, description);
    }

    async loadPlugin(path) {
        await this.pluginHandler.load(path);
    }

    async loadPlugins(directory) {
        await this.pluginHandler.loadAll(directory);
    }

    get prefix() {
        return this.config.prefix || '!';
    }

    set prefix(prefix) {
        this.config.prefix = prefix;
    }
}

export default Client;
