import { downloadMediaMessage, getContentType } from 'baileys';
import { fileTypeFromBuffer } from 'file-type';

/**
 * @typedef {Object} SerializedMessage
 * @property {Object} key - Message key
 * @property {string} chat - Chat JID (remoteJid)
 * @property {boolean} fromMe - Whether message is from bot
 * @property {string} id - Message ID
 * @property {boolean} isGroup - Whether chat is a group
 * @property {string} sender - Sender JID
 * @property {string} pushName - Sender push name
 * @property {string} type - Message type (e.g., 'conversation', 'imageMessage')
 * @property {Object} message - Raw message object
 * @property {string} body - Message text content
 * @property {SerializedMessage} [quoted] - Quoted/replied message
 * @property {string} caption - Media caption
 * @property {string} mimetype - Media mime type
 * @property {number} fileSize - Media file size
 * @property {Array<string>} mentions - Mentioned JIDs
 * @property {Function} reply - Reply to message
 * @property {Function} react - React to message with emoji
 * @property {Function} download - Download media from message
 * @property {Function} delete - Delete message
 * @property {Function} forward - Forward message
 * @property {Function} copyNForward - Copy and forward message
 */

/**
 * Serialize raw Baileys message into standardized format with helper methods
 * @async
 * @param {import('baileys').WAMessage[]} messages - Raw Baileys message object
 * @param {Object} sock - WhatsApp socket instance
 * @returns {Promise<SerializedMessage>} Serialized message object
 * @example
 * const m = await serialize(rawMessage, sock);
 * console.log(m.body); // Message text
 * await m.reply('Hello!'); // Reply to message
 * await m.react('👍'); // React with emoji
 */
export async function serialize(messages, sock) {
    let msg = messages[0];

    if (!msg) return null;
    const m = {};

    // Basic info
    m.key = msg.key;
    m.chat = msg.key.remoteJid;
    m.fromMe = msg.key.fromMe;
    m.id = msg.key.id;
    m.isGroup = m.chat.endsWith('@g.us');
    m.sender = m.isGroup ? msg.key.participant : m.chat;
    m.pushName = msg.pushName || '';

    // Message type
    const type = Object.keys(msg.message)[0];
    m.type = type;
    m.message = msg.message;

    // Get message body
    m.body = getBody(msg.message);

    // Get quoted message
    const quoted = msg.message?.[type]?.contextInfo?.quotedMessage;
    if (quoted) {
        m.quoted = await serialize([{
            key: {
                remoteJid: m.chat,
                fromMe: msg.message[type].contextInfo.participant === sock.user.id,
                id: msg.message[type].contextInfo.stanzaId,
                participant:  msg.key.participant
            },
            message: quoted,
            pushName: msg.message[type].contextInfo.pushName || ''
        }], sock);
    }

    // Media info
    if (type && msg.message[type]) {
        const msgContent = msg.message[type];
        m.caption = msgContent.caption || '';
        m.mimetype = msgContent.mimetype || '';
        m.fileSize = msgContent.fileLength || msgContent.fileSha256 || 0;
    }

    // Mentions
    m.mentions = msg.message?.[type]?.contextInfo?.mentionedJid || [];

    // Helper methods
    m.reply = async (text, options = {}) => {
        return await sock.sendMessage(m.chat, { text, ...options }, { quoted: msg });
    };

    m.react = async (emoji) => {
        return await sock.sendMessage(m.chat, {
            react: { text: emoji, key: m.key }
        });
    };

    m.download = async () => {
        if (!msg.message) return null;
        try {
            const buffer = await downloadMediaMessage(msg, 'buffer', {});
            return buffer;
        } catch (error) {
            console.error('Download error:', error);
            return null;
        }
    };

    m.delete = async () => {
        return await sock.sendMessage(m.chat, { delete: m.key });
    };

    m.forward = async (jid, options = {}) => {
        return await sock.sendMessage(jid, { forward: msg }, options);
    };

    m.copyNForward = async (jid, options = {}) => {
        return await sock.copyNForward(jid, msg, options);
    };

    return m;
}

/**
 * Extract text body from various message types
 * @private
 * @param {Object} message - Message object
 * @returns {string} Extracted text content
 */
function getBody(message) {
    if (!message) return '';

    const type = getContentType(message);
    if (!type) return '';

    const content = message[type];

    // Text messages
    if (type === 'conversation') return content;
    if (type === 'extendedTextMessage') return content.text;

    // Button responses
    if (type === 'buttonsResponseMessage') return content.selectedButtonId;
    if (type === 'templateButtonReplyMessage') return content.selectedId;
    if (type === 'listResponseMessage') return content.singleSelectReply?.selectedRowId;
    if (type === 'interactiveResponseMessage') {
        try {
            const response = JSON.parse(content.nativeFlowResponseMessage?.paramsJson || '{}');
            return response.id || '';
        } catch {
            return '';
        }
    }

    // Media messages with caption
    if (content.caption) return content.caption;

    return '';
}

export default serialize;
