import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';

export default {
    name: 'toimage',
    commands: ['toimage', 'toimg'],
    category: 'converter',
    description: 'Convert sticker to image',

    async exec({ client, m }) {
        const quoted = m.quoted;

        if (!quoted || quoted.type !== 'stickerMessage') {
            return await m.reply('⚠️ Reply to a sticker!');
        }

        await m.react('⏳');

        try {
            // Download sticker
            const buffer = await quoted.download();

            if (!buffer) {
                await m.react('❌');
                return await m.reply('❌ Failed to download sticker!');
            }

            // Convert webp to png using sharp
            let imageBuffer = buffer;
            const fileType = await fileTypeFromBuffer(buffer);

            if (fileType?.mime === 'image/webp') {
                // Convert webp to png
                imageBuffer = await sharp(buffer)
                    .png()
                    .toBuffer();
            }

            // Send as image
            await client.sendImage(m.chat, imageBuffer, '✅ Converted to image');

            await m.react('✅');

        } catch (error) {
            console.error('Conversion error:', error);
            await m.react('❌');
            await m.reply('❌ Failed to convert: ' + error.message);
        }
    }
};
