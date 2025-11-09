import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion,
    downloadMediaMessage,
    Browsers
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
import chalk from 'chalk';

/**
 * @typedef {Object} ClientOptions
 * @property {string} [sessionId='kachina-session'] - Session ID for storing authentication data
 * @property {string} [phoneNumber=''] - Phone number for pairing method (format: 628123456789)
 * @property {'qr'|'pairing'} [loginMethod='qr'] - Login method: 'qr' for QR code, 'pairing' for pairing code
 * @property {Array<string>} [browser=['Kachina-MD', 'Chrome', '1.0.0']] - Browser identification
 * @property {Object} [logger] - Pino logger instance
 * @property {string} [prefix='!'] - Command prefix for plugin system
 * @property {Object} [store] - Optional message store for caching
 */

/**
 * Main WhatsApp bot client class
 *
 * @class Client
 * @extends EventEmitter
 *
 * @fires Client#ready - Emitted when bot is connected and ready
 * @fires Client#message - Emitted when a new message is received
 * @fires Client#group.update - Emitted when group participants are updated
 * @fires Client#groups.update - Emitted when group info is updated
 * @fires Client#call - Emitted when receiving a call
 * @fires Client#pairing.code - Emitted when pairing code is generated (pairing mode only)
 * @fires Client#pairing.error - Emitted when pairing code request fails
 * @fires Client#reconnecting - Emitted when bot is reconnecting
 * @fires Client#connecting - Emitted when bot is connecting
 * @fires Client#logout - Emitted when bot is logged out
 *
 * @example
 * // QR Code login
 * const client = new Client({
 *   sessionId: 'my-bot',
 *   loginMethod: 'qr'
 * });
 *
 * @example
 * // Pairing code login
 * const client = new Client({
 *   sessionId: 'my-bot',
 *   phoneNumber: '628123456789',
 *   loginMethod: 'pairing'
 * });
 */
export class Client extends EventEmitter {
    static StickerTypes = StickerTypes;

    /**
     * Creates a new Client instance
     * @param {ClientOptions} [options={}] - Client configuration options
     */
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

    /**
     * Start the WhatsApp bot connection
     * Initializes the socket connection and handles authentication
     * @async
     * @returns {Promise<Object>} The initialized socket connection
     * @throws {Error} If phone number is invalid (pairing mode)
     * @example
     * await client.start();
     * client.on('ready', (user) => {
     *   console.log('Bot ready:', user.id);
     * });
     */
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
            browser: Browsers.macOS('safari'),
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

        // Handle pairing code request (before connection.update listener)
        if (this.config.loginMethod === 'pairing' && !state.creds.registered) {
            if (!this.config.phoneNumber) {
                throw new Error('Phone number is required for pairing method. Example: { phoneNumber: "628123456789" }');
            }

            const phoneNumber = this.config.phoneNumber.replace(/[^0-9]/g, '');
            if (phoneNumber.length < 10) {
                throw new Error('Invalid phone number format. Use country code without +. Example: 628123456789');
            }

            console.log('🔐 Initiating pairing code process...');

            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            let retryCount = 0;
            const maxRetries = 3;
            let pairingSuccess = false;

            while (retryCount < maxRetries && !pairingSuccess) {
                try {
                    await delay(3000);
                    const code = await this.sock.requestPairingCode(phoneNumber);
                    this.emit('pairing.code', code);

                    console.log('\n┌─────────────────────────────────────┐');
                    console.log('│     WhatsApp Pairing Code           │');
                    console.log('├─────────────────────────────────────┤');
                    console.log(`│         Code: ${chalk.bgYellowBright.white(code)}               │`);
                    console.log('└─────────────────────────────────────┘');
                    console.log('\nSteps to pair:');
                    console.log('1. Open WhatsApp on your phone');
                    console.log('2. Go to Settings > Linked Devices');
                    console.log('3. Tap "Link a Device"');
                    console.log('4. Enter the code above\n');

                    pairingSuccess = true;
                    break;
                } catch (err) {
                    retryCount++;
                    console.error(`Pairing attempt ${retryCount}/${maxRetries} failed:`, err.message);
                    this.emit('pairing.error', err);

                    if (retryCount >= maxRetries) {
                        console.error('❌ Max pairing retries reached. Please try again later.');
                        throw err;
                    }

                    await delay(2000);
                }
            }
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

    /**
     * Handle connection updates from WhatsApp socket
     * @private
     * @async
     * @param {Object} update - Connection update object
     * @param {string} [update.connection] - Connection status: 'open', 'close', 'connecting'
     * @param {Object} [update.lastDisconnect] - Last disconnect information
     * @param {string} [update.qr] - QR code data for scanning
     */
    async handleConnectionUpdate(update) {
        const { connection, lastDisconnect, qr } = update;

        // Handle QR code for QR login method
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

            if (this.config.loginMethod === 'pairing') {
                console.log('\n✓ Successfully connected via pairing code!\n');
            }
        } else if (connection === 'connecting') {
            this.emit('connecting');
        }
    }

    /**
     * Send a raw message to WhatsApp
     * @async
     * @param {string} jid - WhatsApp JID (chat ID) - format: number@s.whatsapp.net or groupId@g.us
     * @param {Object} content - Message content object (text, image, video, etc.)
     * @param {Object} [options={}] - Additional options for message
     * @returns {Promise<Object>} Sent message object
     * @example
     * await client.sendMessage('628xxx@s.whatsapp.net', { text: 'Hello' });
     */
    async sendMessage(jid, content, options = {}) {
        return await this.sock.sendMessage(jid, content, options);
    }

    /**
     * Send a text message
     * @async
     * @param {string} jid - WhatsApp JID (chat ID)
     * @param {string} text - Text message content
     * @param {Object} [options={}] - Additional options
     * @returns {Promise<Object>} Sent message object
     * @example
     * await client.sendText('628xxx@s.whatsapp.net', 'Hello World!');
     */
    async sendText(jid, text, options = {}) {
        return await this.sendMessage(jid, { text }, options);
    }

    /**
     * Send an image message
     * @async
     * @param {string} jid - WhatsApp JID (chat ID)
     * @param {Buffer|string} buffer - Image buffer or file path/URL
     * @param {string} [caption=''] - Image caption
     * @param {Object} [options={}] - Additional options
     * @returns {Promise<Object>} Sent message object
     * @example
     * await client.sendImage('628xxx@s.whatsapp.net', imageBuffer, 'My Image');
     */
    async sendImage(jid, buffer, caption = '', options = {}) {
        const content = {
            image: buffer,
            ...options
        };
        if (caption) content.caption = caption;
        return await this.sendMessage(jid, content, options);
    }

    /**
     * Send a video message
     * @async
     * @param {string} jid - WhatsApp JID (chat ID)
     * @param {Buffer|string} buffer - Video buffer or file path/URL
     * @param {string} [caption=''] - Video caption
     * @param {Object} [options={}] - Additional options
     * @returns {Promise<Object>} Sent message object
     * @example
     * await client.sendVideo('628xxx@s.whatsapp.net', videoBuffer, 'My Video');
     */
    async sendVideo(jid, buffer, caption = '', options = {}) {
        const content = {
            video: buffer,
            ...options
        };
        if (caption) content.caption = caption;
        return await this.sendMessage(jid, content, options);
    }

    /**
     * Send an audio message
     * @async
     * @param {string} jid - WhatsApp JID (chat ID)
     * @param {Buffer|string} buffer - Audio buffer or file path/URL
     * @param {Object} [options={}] - Additional options
     * @param {string} [options.mimetype='audio/mp4'] - Audio mime type
     * @param {boolean} [options.ptt=false] - Push to talk (voice note)
     * @returns {Promise<Object>} Sent message object
     * @example
     * // Send as audio file
     * await client.sendAudio('628xxx@s.whatsapp.net', audioBuffer);
     * // Send as voice note
     * await client.sendAudio('628xxx@s.whatsapp.net', audioBuffer, { ptt: true });
     */
    async sendAudio(jid, buffer, options = {}) {
        const content = {
            audio: buffer,
            mimetype: options.mimetype || 'audio/mp4',
            ptt: options.ptt || false, // Push to talk (voice note)
            ...options
        };
        return await this.sendMessage(jid, content, options);
    }

    /**
     * Send a document message
     * @async
     * @param {string} jid - WhatsApp JID (chat ID)
     * @param {Buffer|string} buffer - Document buffer or file path/URL
     * @param {string} filename - Document filename with extension
     * @param {string} mimetype - Document mime type (e.g., 'application/pdf')
     * @param {Object} [options={}] - Additional options
     * @returns {Promise<Object>} Sent message object
     * @example
     * await client.sendDocument('628xxx@s.whatsapp.net', pdfBuffer, 'file.pdf', 'application/pdf');
     */
    async sendDocument(jid, buffer, filename, mimetype, options = {}) {
        return await this.sendMessage(jid, {
            document: buffer,
            fileName: filename,
            mimetype,
            ...options
        });
    }

    /**
     * Send a sticker message
     * @async
     * @param {string} jid - WhatsApp JID (chat ID)
     * @param {Buffer|string} buffer - Image buffer or file path/URL to convert to sticker
     * @param {Object} [options={}] - Sticker options
     * @param {string} [options.pack] - Sticker pack name
     * @param {string} [options.author] - Sticker author name
     * @param {string} [options.type] - Sticker type from Client.StickerTypes
     * @returns {Promise<Object>} Sent message object
     * @example
     * await client.sendSticker('628xxx@s.whatsapp.net', imageBuffer, {
     *   pack: 'My Stickers',
     *   author: 'Bot'
     * });
     */
    async sendSticker(jid, buffer, options = {}) {
        const stickerBuffer = await createSticker(buffer, options);
        return await this.sendMessage(jid, {
            sticker: stickerBuffer,
            ...options
        });
    }

    /**
     * Send contact(s) message
     * @async
     * @param {string} jid - WhatsApp JID (chat ID)
     * @param {Array<{displayName: string, vcard: string}>} contacts - Array of contact objects
     * @param {Object} [options={}] - Additional options
     * @returns {Promise<Object>} Sent message object
     * @example
     * await client.sendContact('628xxx@s.whatsapp.net', [{
     *   displayName: 'John Doe',
     *   vcard: 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEND:VCARD'
     * }]);
     */
    async sendContact(jid, contacts, options = {}) {
        return await this.sendMessage(jid, {
            contacts: { contacts },
            ...options
        });
    }

    /**
     * Send location message
     * @async
     * @param {string} jid - WhatsApp JID (chat ID)
     * @param {number} latitude - Location latitude
     * @param {number} longitude - Location longitude
     * @param {Object} [options={}] - Additional options
     * @returns {Promise<Object>} Sent message object
     * @example
     * await client.sendLocation('628xxx@s.whatsapp.net', -6.200000, 106.816666);
     */
    async sendLocation(jid, latitude, longitude, options = {}) {
        return await this.sendMessage(jid, {
            location: { degreesLatitude: latitude, degreesLongitude: longitude },
            ...options
        });
    }

    /**
     * Send poll message
     * @async
     * @param {string} jid - WhatsApp JID (chat ID)
     * @param {string} name - Poll question
     * @param {Array<string>} values - Poll options
     * @param {Object} [options={}] - Additional options
     * @param {number} [options.selectableCount=1] - Number of selectable options
     * @returns {Promise<Object>} Sent message object
     * @example
     * await client.sendPoll('628xxx@s.whatsapp.net', 'Favorite color?', ['Red', 'Blue', 'Green']);
     */
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

    /**
     * Send reaction to a message
     * @async
     * @param {string} jid - WhatsApp JID (chat ID)
     * @param {Object} messageKey - Message key object from the message to react to
     * @param {string} emoji - Emoji to react with
     * @returns {Promise<Object>} Sent reaction object
     * @example
     * await client.sendReact('628xxx@s.whatsapp.net', message.key, '👍');
     */
    async sendReact(jid, messageKey, emoji) {
        return await this.sendMessage(jid, {
            react: { text: emoji, key: messageKey }
        });
    }

    /**
     * Helper function to unwrap view once message from various structures
     * @private
     * @param {Object} quotedMessage - The quoted message object
     * @returns {Object|null} Unwrapped message or null if not view once
     */
    _unwrapViewOnceMessage(quotedMessage) {
        const quotedMsg = quotedMessage?.message;
        const quotedRaw = quotedMessage?.raw?.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        let innerMsg = null;
        let isViewOnce = false;

        // Helper to extract from wrapper
        const extractFromWrapper = (wrapper) => {
            if (wrapper?.viewOnceMessageV2?.message) {
                return { msg: wrapper.viewOnceMessageV2.message, isVO: true };
            }
            if (wrapper?.viewOnceMessageV2Extension?.message) {
                return { msg: wrapper.viewOnceMessageV2Extension.message, isVO: true };
            }
            if (wrapper?.viewOnceMessage?.message) {
                return { msg: wrapper.viewOnceMessage.message, isVO: true };
            }
            return null;
        };

        // Try multiple paths to find view once message
        // Path 1: Direct from quotedRaw
        if (quotedRaw) {
            const extracted = extractFromWrapper(quotedRaw);
            if (extracted) {
                innerMsg = extracted.msg;
                isViewOnce = extracted.isVO;
            } else if (quotedRaw.ephemeralMessage?.message) {
                const ephExtracted = extractFromWrapper(quotedRaw.ephemeralMessage.message);
                if (ephExtracted) {
                    innerMsg = ephExtracted.msg;
                    isViewOnce = ephExtracted.isVO;
                }
            }
        }

        // Path 2: From quotedMsg
        if (!innerMsg && quotedMsg) {
            const extracted = extractFromWrapper(quotedMsg);
            if (extracted) {
                innerMsg = extracted.msg;
                isViewOnce = extracted.isVO;
            } else if (quotedMsg.ephemeralMessage?.message) {
                const ephExtracted = extractFromWrapper(quotedMsg.ephemeralMessage.message);
                if (ephExtracted) {
                    innerMsg = ephExtracted.msg;
                    isViewOnce = ephExtracted.isVO;
                }
            }
        }

        // Path 3: Already unwrapped (has viewOnce flag)
        if (!innerMsg && quotedMsg) {
            if (quotedMsg.imageMessage?.viewOnce ||
                quotedMsg.videoMessage?.viewOnce ||
                quotedMsg.audioMessage?.viewOnce) {
                innerMsg = quotedMsg;
                isViewOnce = true;
            }
        }

        // Path 4: Check raw message directly
        if (!innerMsg && quotedRaw) {
            if (quotedRaw.imageMessage?.viewOnce ||
                quotedRaw.videoMessage?.viewOnce ||
                quotedRaw.audioMessage?.viewOnce) {
                innerMsg = quotedRaw;
                isViewOnce = true;
            }
        }

        return isViewOnce ? innerMsg : null;
    }

    /**
     * Read and download view once message
     * @async
     * @param {Object} quotedMessage - The quoted message object (m.quoted)
     * @returns {Promise<{buffer: Buffer, type: 'image'|'video'|'audio', caption: string, mimetype?: string, ptt?: boolean}>} Object containing media buffer, type, and caption
     * @throws {Error} If quoted message is not provided or not a view once message
     * @example
     * const { buffer, type, caption } = await client.readViewOnce(m.quoted);
     * if (type === 'image') {
     *   await client.sendImage(m.from, buffer, caption);
     * }
     */
    async readViewOnce(quotedMessage) {
        if (!quotedMessage) {
            throw new Error('Quoted message is required');
        }

        // Try to unwrap view once message
        const innerMsg = this._unwrapViewOnceMessage(quotedMessage);

        if (!innerMsg) {
            throw new Error('Message is not a view once message or has already been opened');
        }

        // Extract media messages
        const ViewOnceImg = innerMsg.imageMessage;
        const ViewOnceVid = innerMsg.videoMessage;
        const ViewOnceAud = innerMsg.audioMessage;

        // Get the media message
        const mediaMsg = ViewOnceImg || ViewOnceVid || ViewOnceAud;

        if (!mediaMsg) {
            throw new Error('No media found in view once message');
        }

        // Check if media key exists (if not, it's expired/opened)
        if (!mediaMsg.mediaKey || mediaMsg.mediaKey.length === 0) {
            throw new Error('View once message has been opened or expired. Reply to view once BEFORE it is opened.');
        }

        // Download the media with multiple fallback methods
        let buffer = null;
        const errors = [];

        // Method 1: Try using quotedMessage.download() if available
        if (typeof quotedMessage.download === 'function') {
            try {
                buffer = await quotedMessage.download();
                this.config.logger?.debug('Downloaded view once using m.quoted.download()');
            } catch (err) {
                errors.push(`Method 1 (m.quoted.download): ${err.message}`);
                this.config.logger?.debug('Download via m.quoted.download failed:', err.message);
            }
        }

        // Method 2: Try downloadMediaMessage with innerMsg
        if (!buffer) {
            try {
                buffer = await downloadMediaMessage(
                    { message: innerMsg, key: quotedMessage.key },
                    'buffer',
                    {},
                    { logger: this.config.logger }
                );
                this.config.logger?.debug('Downloaded view once using downloadMediaMessage with innerMsg');
            } catch (err) {
                errors.push(`Method 2 (downloadMediaMessage with innerMsg): ${err.message}`);
                this.config.logger?.debug('Download via downloadMediaMessage (innerMsg) failed:', err.message);
            }
        }

        // Method 3: Try downloadMediaMessage with original quotedMessage
        if (!buffer) {
            try {
                buffer = await downloadMediaMessage(
                    quotedMessage,
                    'buffer',
                    {},
                    { logger: this.config.logger }
                );
                this.config.logger?.debug('Downloaded view once using downloadMediaMessage with quotedMessage');
            } catch (err) {
                errors.push(`Method 3 (downloadMediaMessage with quotedMessage): ${err.message}`);
                this.config.logger?.debug('Download via downloadMediaMessage (quotedMessage) failed:', err.message);
            }
        }

        if (!buffer) {
            const errorMsg = `Failed to download view once media. Tried ${errors.length} methods:\n${errors.join('\n')}`;
            this.config.logger?.error(errorMsg);
            throw new Error(errorMsg);
        }

        // Return buffer with type and caption
        const result = {
            buffer,
            caption: ViewOnceImg?.caption || ViewOnceVid?.caption || ViewOnceAud?.caption || ''
        };

        if (ViewOnceImg) {
            result.type = 'image';
        } else if (ViewOnceVid) {
            result.type = 'video';
        } else if (ViewOnceAud) {
            result.type = 'audio';
            result.mimetype = ViewOnceAud.mimetype || 'audio/mpeg';
            result.ptt = !!ViewOnceAud.ptt;
        }

        return result;
    }

    /**
     * Read view once message and send to chat
     * @async
     * @param {string} jid - WhatsApp JID (chat ID) to send to
     * @param {Object} quotedMessage - The quoted message object (m.quoted)
     * @param {Object} [options={}] - Additional options
     * @returns {Promise<Object>} Sent message object
     * @throws {Error} If reading or sending view once message fails
     * @example
     * // Forward a view once message
     * await client.sendViewOnce(m.from, m.quoted);
     */
    async sendViewOnce(jid, quotedMessage, options = {}) {
        try {
            // Read the view once message
            const result = await this.readViewOnce(quotedMessage);
            const { buffer, type, caption, mimetype, ptt } = result;

            // Send based on type
            if (type === 'image') {
                return await this.sendImage(jid, buffer, caption, {
                    jpegThumbnail: null,
                    ...options
                });
            } else if (type === 'video') {
                return await this.sendVideo(jid, buffer, caption, {
                    jpegThumbnail: null,
                    ...options
                });
            } else if (type === 'audio') {
                return await this.sendAudio(jid, buffer, {
                    mimetype: mimetype || 'audio/mpeg',
                    ptt: ptt || false,
                    ...options
                });
            } else {
                throw new Error(`Unsupported view once media type: ${type}`);
            }
        } catch (error) {
            throw new Error(`Failed to send view once: ${error.message}`);
        }
    }

    /**
     * Get group metadata
     * @async
     * @param {string} jid - Group JID (format: groupId@g.us)
     * @returns {Promise<Object>} Group metadata object containing id, subject, participants, etc.
     * @example
     * const metadata = await client.groupMetadata('groupId@g.us');
     * console.log(metadata.subject); // Group name
     */
    async groupMetadata(jid) {
        return await this.sock.groupMetadata(jid);
    }

    /**
     * Update group participants (add, remove, promote, demote)
     * @async
     * @param {string} jid - Group JID (format: groupId@g.us)
     * @param {Array<string>} participants - Array of participant JIDs
     * @param {'add'|'remove'|'promote'|'demote'} action - Action to perform
     * @returns {Promise<Object>} Update result
     * @example
     * // Remove participants
     * await client.groupParticipantsUpdate('groupId@g.us', ['628xxx@s.whatsapp.net'], 'remove');
     * // Promote to admin
     * await client.groupParticipantsUpdate('groupId@g.us', ['628xxx@s.whatsapp.net'], 'promote');
     */
    async groupParticipantsUpdate(jid, participants, action) {
        return await this.sock.groupParticipantsUpdate(jid, participants, action);
    }

    /**
     * Update group subject (name)
     * @async
     * @param {string} jid - Group JID (format: groupId@g.us)
     * @param {string} subject - New group name
     * @returns {Promise<Object>} Update result
     * @example
     * await client.groupUpdateSubject('groupId@g.us', 'My New Group Name');
     */
    async groupUpdateSubject(jid, subject) {
        return await this.sock.groupUpdateSubject(jid, subject);
    }

    /**
     * Update group description
     * @async
     * @param {string} jid - Group JID (format: groupId@g.us)
     * @param {string} description - New group description
     * @returns {Promise<Object>} Update result
     * @example
     * await client.groupUpdateDescription('groupId@g.us', 'This is my group description');
     */
    async groupUpdateDescription(jid, description) {
        return await this.sock.groupUpdateDescription(jid, description);
    }

    /**
     * Load a single plugin from file path
     * @async
     * @param {string} path - Path to plugin file
     * @returns {Promise<void>}
     * @example
     * await client.loadPlugin('./plugins/my-plugin.js');
     */
    async loadPlugin(path) {
        await this.pluginHandler.load(path);
    }

    /**
     * Load all plugins from a directory
     * @async
     * @param {string} directory - Path to plugins directory
     * @returns {Promise<void>}
     * @example
     * await client.loadPlugins('./plugins');
     */
    async loadPlugins(directory) {
        await this.pluginHandler.loadAll(directory);
    }

    /**
     * Get command prefix
     * @returns {string} Current command prefix
     * @example
     * console.log(client.prefix); // '!'
     */
    get prefix() {
        return this.config.prefix || '!';
    }

    /**
     * Set command prefix
     * @param {string} prefix - New command prefix
     * @example
     * client.prefix = '.';
     */
    set prefix(prefix) {
        this.config.prefix = prefix;
    }
}

export default Client;
