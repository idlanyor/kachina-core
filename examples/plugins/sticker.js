import { createSticker, StickerTypes } from '@kachina-md/core';

export default {
    name: 'sticker',
    commands: ['sticker', 's', 'stiker'],
    category: 'converter',
    description: 'Create sticker from image/video',

    async exec({ client, m, args }) {
        // Check if there's quoted message or media
        const quoted = m.quoted;

        if (!quoted && !['imageMessage', 'videoMessage'].includes(m.type)) {
            return await m.reply(
                '⚠️ Reply to an image/video or send image/video with caption!\n\n' +
                'Usage:\n' +
                '!sticker (reply to image/video)\n' +
                '!sticker full (full sticker)\n' +
                '!sticker crop (cropped)\n' +
                '!sticker circle (circle sticker)\n' +
                '!sticker rounded (rounded corners)'
            );
        }

        const messageToProcess = quoted || m;

        // Check if it's image or video
        if (!['imageMessage', 'videoMessage'].includes(messageToProcess.type)) {
            return await m.reply('⚠️ Only image and video are supported!');
        }

        await m.react('⏳');

        try {
            // Download media
            const buffer = await messageToProcess.download();

            if (!buffer) {
                await m.react('❌');
                return await m.reply('❌ Failed to download media!');
            }

            // Determine sticker type
            let type = StickerTypes.DEFAULT;
            const arg = args[0]?.toLowerCase();

            if (arg === 'full' || arg === 'f') {
                type = StickerTypes.FULL;
            } else if (arg === 'crop' || arg === 'c') {
                type = StickerTypes.CROPPED;
            } else if (arg === 'circle') {
                type = StickerTypes.CIRCLE;
            } else if (arg === 'rounded' || arg === 'round') {
                type = StickerTypes.ROUNDED;
            }

            // Create sticker
            const stickerBuffer = await createSticker(buffer, {
                pack: 'Created with',
                author: 'Kachina Bot',
                type: type,
                quality: 50
            });

            // Send sticker
            await client.sendSticker(m.chat, stickerBuffer);

            await m.react('✅');

        } catch (error) {
            console.error('Sticker creation error:', error);
            await m.react('❌');
            await m.reply('❌ Failed to create sticker: ' + error.message);
        }
    }
};
