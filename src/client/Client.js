import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion
} from 'baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import EventEmitter from 'events';
import { serialize } from '../helpers/serialize.js';
import { PluginHandler } from '../handlers/PluginHandler.js';
import {
    createSticker,
    StickerTypes
} from '../helpers/sticker.js';

export class Client extends EventEmitter {
    static StickerTypes = StickerTypes;

    constructor(options = {}) {
        super();

        this.config = {
            sessionId: options.sessionId || 'kachina-session',
            phoneNumber: options.phoneNumber || '',
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


        this.sock = makeWASocket({
            version,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, this.config.logger)
            },
            logger: this.config.logger,
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

        // Handle pairing code request (must be before connection)
        if (this.config.loginMethod === 'pairing' && !state.creds.registered) {
            if (!this.config.phoneNumber) {
                throw new Error('Phone number is required for pairing method. Example: { phoneNumber: "628123456789" }');
            }

            // Format phone number (remove + and spaces)
            const phoneNumber = this.config.phoneNumber.replace(/[^0-9]/g, '');

            if (phoneNumber.length < 10) {
                throw new Error('Invalid phone number format. Use country code without +. Example: 628123456789');
            }

            // Request pairing code after socket is initialized
            setTimeout(async () => {
                try {
                    const code = await this.sock.requestPairingCode(phoneNumber);
                    this.emit('pairing.code', code);

                    // Log to console with formatting
                    console.log('\n┌─────────────────────────────────────┐');
                    console.log('│     WhatsApp Pairing Code           │');
                    console.log('├─────────────────────────────────────┤');
                    console.log(`│         Code: ${code}                │`);
                    console.log('└─────────────────────────────────────┘');
                    console.log('\nSteps to pair:');
                    console.log('1. Open WhatsApp on your phone');
                    console.log('2. Go to Settings > Linked Devices');
                    console.log('3. Tap "Link a Device"');
                    console.log('4. Enter the code above\n');
                } catch (error) {
                    this.emit('pairing.error', error);
                    console.error('Failed to request pairing code:', error.message);
                }
            }, 3000);
        }

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

            // Log success message
            if (this.config.loginMethod === 'pairing') {
                console.log('\n✓ Successfully connected via pairing code!\n');
            }
        } else if (connection === 'connecting') {
            this.emit('connecting');
            if (this.config.loginMethod === 'pairing') {
                console.log('Waiting for pairing code confirmation...');
            }
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
        const stickerBuffer = await createSticker(buffer, options);
        return await this.sendMessage(jid, {
            sticker: stickerBuffer,
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
