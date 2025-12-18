import axios from 'axios';
import { fileTypeFromBuffer } from 'file-type';

export default {
    name: 'media',
    commands: ['send'],
    category: 'tool',
    description: 'Send various media types (demo)',

    async exec({ client, m, args }) {
        const subcommand = args[0]?.toLowerCase();

        if (!subcommand) {
            return await m.reply(
                '*📤 MEDIA SENDER*\n\n' +
                'Usage:\n' +
                '!send text <message>\n' +
                '!send image <url>\n' +
                '!send video <url>\n' +
                '!send audio <url>\n' +
                '!send document <url> <filename>\n' +
                '!send sticker <url>\n' +
                '!send location <lat> <long>\n' +
                '!send contact\n' +
                '!send poll'
            );
        }

        await m.react('⏳');

        try {
            switch (subcommand) {
                case 'text': {
                    const text = args.slice(1).join(' ');
                    await client.sendText(m.chat, text || 'Hello World!');
                    break;
                }

                case 'image': {
                    const url = args[1];
                    if (!url) return await m.reply('⚠️ Provide image URL!');

                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                    const buffer = Buffer.from(response.data);

                    await client.sendImage(m.chat, buffer, 'Here is your image!');
                    break;
                }

                case 'video': {
                    const url = args[1];
                    if (!url) return await m.reply('⚠️ Provide video URL!');

                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                    const buffer = Buffer.from(response.data);

                    await client.sendVideo(m.chat, buffer, 'Here is your video!');
                    break;
                }

                case 'audio': {
                    const url = args[1];
                    if (!url) return await m.reply('⚠️ Provide audio URL!');

                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                    const buffer = Buffer.from(response.data);

                    // Send as audio
                    await client.sendAudio(m.chat, buffer, { mimetype: 'audio/mp4' });

                    // Or send as voice note (PTT)
                    // await client.sendAudio(m.chat, buffer, { ptt: true });
                    break;
                }

                case 'document': {
                    const url = args[1];
                    const filename = args[2] || 'document.pdf';

                    if (!url) return await m.reply('⚠️ Provide document URL!');

                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                    const buffer = Buffer.from(response.data);

                    // Detect mimetype
                    const fileType = await fileTypeFromBuffer(buffer);
                    const mimetype = fileType?.mime || 'application/octet-stream';

                    await client.sendDocument(m.chat, buffer, filename, mimetype);
                    break;
                }

                case 'sticker': {
                    const url = args[1];
                    if (!url) return await m.reply('⚠️ Provide sticker URL!');

                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                    const buffer = Buffer.from(response.data);

                    await client.sendSticker(m.chat, buffer);
                    break;
                }

                case 'location': {
                    const lat = parseFloat(args[1]);
                    const long = parseFloat(args[2]);

                    if (isNaN(lat) || isNaN(long)) {
                        return await m.reply('⚠️ Invalid coordinates!\nUsage: !send location <lat> <long>');
                    }

                    await client.sendLocation(m.chat, lat, long);
                    break;
                }

                case 'contact': {
                    const contacts = [{
                        displayName: 'John Doe',
                        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL;type=CELL;type=VOICE;waid=1234567890:+1 234 567 890\nEND:VCARD`
                    }];

                    await client.sendContact(m.chat, contacts);
                    break;
                }

                case 'poll': {
                    await client.sendPoll(
                        m.chat,
                        'What is your favorite color?',
                        ['Red', 'Blue', 'Green', 'Yellow'],
                        { selectableCount: 1 }
                    );
                    break;
                }

                default:
                    return await m.reply('❌ Unknown subcommand!');
            }

            await m.react('✅');

        } catch (error) {
            console.error('Send media error:', error);
            await m.react('❌');
            await m.reply('❌ Failed to send: ' + error.message);
        }
    }
};
