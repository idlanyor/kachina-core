import { downloadMediaMessage, getContentType } from 'baileys';
import { fileTypeFromBuffer } from 'file-type';

export async function serialize(msg, sock) {
    if (!msg) return msg;

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
    const type = getContentType(msg.message);
    m.type = type;
    m.message = msg.message;

    // Get message body
    m.body = getBody(msg.message);

    // Get quoted message
    const quoted = msg.message?.[type]?.contextInfo?.quotedMessage;
    if (quoted) {
        m.quoted = await serialize({
            key: {
                remoteJid: m.chat,
                fromMe: msg.message[type].contextInfo.participant === sock.user.id,
                id: msg.message[type].contextInfo.stanzaId,
                participant: msg.message[type].contextInfo.participant
            },
            message: quoted,
            pushName: msg.message[type].contextInfo.pushName || ''
        }, sock);
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
