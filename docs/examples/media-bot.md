# Media Processing Bot

Complete example of a bot that processes, converts, and manipulates media files.

## Image Processing Bot

```javascript
import { Client } from '@roidev/kachina-md';
import sharp from 'sharp';

const client = new Client({
    sessionId: 'media-bot',
    prefix: '!'
});

client.on('message', async (m) => {
    // Convert to sticker
    if ((m.body === '!sticker' || m.body === '!s') && m.message?.imageMessage) {
        const buffer = await m.download();
        
        await client.sendSticker(m.chat, buffer, {
            pack: 'Media Bot',
            author: m.pushName
        });
    }
    
    // Blur image
    if (m.body === '!blur' && m.message?.imageMessage) {
        try {
            await m.react('⏳');
            
            const buffer = await m.download();
            const blurred = await sharp(buffer)
                .blur(10)
                .toBuffer();
            
            await client.sendImage(m.chat, blurred, '🌫️ Blurred image');
            await m.react('✅');
        } catch (error) {
            await m.react('❌');
            await m.reply('❌ Failed to blur image');
        }
    }
    
    // Grayscale
    if (m.body === '!grayscale' && m.message?.imageMessage) {
        try {
            await m.react('⏳');
            
            const buffer = await m.download();
            const gray = await sharp(buffer)
                .grayscale()
                .toBuffer();
            
            await client.sendImage(m.chat, gray, '⚫⚪ Grayscale');
            await m.react('✅');
        } catch (error) {
            await m.react('❌');
            await m.reply('❌ Failed to process');
        }
    }
    
    // Flip image
    if (m.body === '!flip' && m.message?.imageMessage) {
        try {
            await m.react('⏳');
            
            const buffer = await m.download();
            const flipped = await sharp(buffer)
                .flip()
                .toBuffer();
            
            await client.sendImage(m.chat, flipped, '🔄 Flipped');
            await m.react('✅');
        } catch (error) {
            await m.react('❌');
        }
    }
    
    // Mirror image
    if (m.body === '!mirror' && m.message?.imageMessage) {
        try {
            await m.react('⏳');
            
            const buffer = await m.download();
            const mirrored = await sharp(buffer)
                .flop()
                .toBuffer();
            
            await client.sendImage(m.chat, mirrored, '↔️ Mirrored');
            await m.react('✅');
        } catch (error) {
            await m.react('❌');
        }
    }
    
    // Rotate image
    if (m.body?.startsWith('!rotate ') && m.message?.imageMessage) {
        try {
            await m.react('⏳');
            
            const degrees = parseInt(m.body.split(' ')[1]) || 90;
            const buffer = await m.download();
            const rotated = await sharp(buffer)
                .rotate(degrees)
                .toBuffer();
            
            await client.sendImage(m.chat, rotated, `🔄 Rotated ${degrees}°`);
            await m.react('✅');
        } catch (error) {
            await m.react('❌');
        }
    }
    
    // Resize image
    if (m.body?.startsWith('!resize ') && m.message?.imageMessage) {
        try {
            await m.react('⏳');
            
            const size = parseInt(m.body.split(' ')[1]) || 512;
            const buffer = await m.download();
            const resized = await sharp(buffer)
                .resize(size, size, { fit: 'inside' })
                .toBuffer();
            
            await client.sendImage(m.chat, resized, `📏 Resized to ${size}px`);
            await m.react('✅');
        } catch (error) {
            await m.react('❌');
        }
    }
    
    // Apply filter
    if (m.body === '!sepia' && m.message?.imageMessage) {
        try {
            await m.react('⏳');
            
            const buffer = await m.download();
            const sepia = await sharp(buffer)
                .tint({ r: 112, g: 66, b: 20 })
                .toBuffer();
            
            await client.sendImage(m.chat, sepia, '🟤 Sepia filter');
            await m.react('✅');
        } catch (error) {
            await m.react('❌');
        }
    }
    
    // Enhance/Sharpen
    if (m.body === '!sharpen' && m.message?.imageMessage) {
        try {
            await m.react('⏳');
            
            const buffer = await m.download();
            const sharp_img = await sharp(buffer)
                .sharpen()
                .toBuffer();
            
            await client.sendImage(m.chat, sharp_img, '✨ Sharpened');
            await m.react('✅');
        } catch (error) {
            await m.react('❌');
        }
    }
    
    // Get image info
    if (m.body === '!imageinfo' && m.message?.imageMessage) {
        try {
            const buffer = await m.download();
            const metadata = await sharp(buffer).metadata();
            
            const info = `
*📸 IMAGE INFO*

Format: ${metadata.format}
Size: ${metadata.width}x${metadata.height}
File size: ${(buffer.length / 1024).toFixed(2)} KB
Color space: ${metadata.space}
Channels: ${metadata.channels}
Has alpha: ${metadata.hasAlpha}
            `.trim();
            
            await m.reply(info);
        } catch (error) {
            await m.reply('❌ Failed to get info');
        }
    }
});

client.start();
```

## Video/Audio Converter

```javascript
import { Client } from '@roidev/kachina-md';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

const client = new Client({
    sessionId: 'converter-bot',
    prefix: '!'
});

const tempDir = './temp';
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Video to GIF
client.on('message', async (m) => {
    if (m.body === '!togif' && m.message?.videoMessage) {
        try {
            await m.react('⏳');
            
            const buffer = await m.download();
            const inputPath = path.join(tempDir, `input_${Date.now()}.mp4`);
            const outputPath = path.join(tempDir, `output_${Date.now()}.gif`);
            
            fs.writeFileSync(inputPath, buffer);
            
            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .outputOptions([
                        '-vf scale=320:-1',
                        '-t 6',
                        '-r 15'
                    ])
                    .save(outputPath)
                    .on('end', resolve)
                    .on('error', reject);
            });
            
            const gifBuffer = fs.readFileSync(outputPath);
            
            await client.sendVideo(m.chat, gifBuffer, 'GIF converted', {
                gifPlayback: true
            });
            
            // Cleanup
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
            
            await m.react('✅');
            
        } catch (error) {
            await m.react('❌');
            await m.reply('❌ Failed to convert to GIF');
            console.error(error);
        }
    }
    
    // Audio to Voice Note
    if (m.body === '!tovoice' && m.message?.audioMessage) {
        try {
            await m.react('⏳');
            
            const buffer = await m.download();
            const inputPath = path.join(tempDir, `audio_${Date.now()}.mp3`);
            const outputPath = path.join(tempDir, `voice_${Date.now()}.ogg`);
            
            fs.writeFileSync(inputPath, buffer);
            
            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .audioCodec('libopus')
                    .audioBitrate('64k')
                    .format('ogg')
                    .save(outputPath)
                    .on('end', resolve)
                    .on('error', reject);
            });
            
            const voiceBuffer = fs.readFileSync(outputPath);
            
            await client.sendAudio(m.chat, voiceBuffer, {
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            });
            
            // Cleanup
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
            
            await m.react('✅');
            
        } catch (error) {
            await m.react('❌');
            await m.reply('❌ Failed to convert');
        }
    }
    
    // Video to Audio
    if (m.body === '!toaudio' && m.message?.videoMessage) {
        try {
            await m.react('⏳');
            
            const buffer = await m.download();
            const inputPath = path.join(tempDir, `video_${Date.now()}.mp4`);
            const outputPath = path.join(tempDir, `audio_${Date.now()}.mp3`);
            
            fs.writeFileSync(inputPath, buffer);
            
            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .noVideo()
                    .audioCodec('libmp3lame')
                    .audioBitrate('128k')
                    .save(outputPath)
                    .on('end', resolve)
                    .on('error', reject);
            });
            
            const audioBuffer = fs.readFileSync(outputPath);
            
            await client.sendAudio(m.chat, audioBuffer, {
                mimetype: 'audio/mp3'
            });
            
            // Cleanup
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
            
            await m.react('✅');
            
        } catch (error) {
            await m.react('❌');
            await m.reply('❌ Failed to extract audio');
        }
    }
});
```

## Media Downloader Bot

```javascript
import { Client } from '@roidev/kachina-md';
import axios from 'axios';

const client = new Client({
    sessionId: 'downloader-bot',
    prefix: '!'
});

client.on('message', async (m) => {
    // Image from URL
    if (m.body?.startsWith('!img ')) {
        const url = m.body.slice(5).trim();
        
        try {
            await m.react('⏳');
            
            // Just pass URL directly
            await client.sendImage(m.chat, url, 'Downloaded image');
            
            await m.react('✅');
        } catch (error) {
            await m.react('❌');
            await m.reply('❌ Invalid URL or failed to download');
        }
    }
    
    // Video from URL
    if (m.body?.startsWith('!video ')) {
        const url = m.body.slice(7).trim();
        
        try {
            await m.react('⏳');
            await client.sendVideo(m.chat, url, 'Downloaded video');
            await m.react('✅');
        } catch (error) {
            await m.react('❌');
            await m.reply('❌ Failed to download video');
        }
    }
    
    // Document from URL
    if (m.body?.startsWith('!file ')) {
        const url = m.body.slice(6).trim();
        
        try {
            await m.react('⏳');
            
            const response = await axios.get(url, {
                responseType: 'arraybuffer'
            });
            
            const buffer = Buffer.from(response.data);
            const filename = url.split('/').pop() || 'file';
            const mimetype = response.headers['content-type'] || 'application/octet-stream';
            
            await client.sendDocument(m.chat, buffer, filename, mimetype);
            await m.react('✅');
        } catch (error) {
            await m.react('❌');
            await m.reply('❌ Failed to download file');
        }
    }
});

client.start();
```

## Advanced Media Bot

With multiple filters and effects.

```javascript
import { Client } from '@roidev/kachina-md';
import sharp from 'sharp';

const client = new Client({
    sessionId: 'advanced-media',
    prefix: '!'
});

const filters = {
    blur: (buffer, level = 10) => sharp(buffer).blur(level).toBuffer(),
    grayscale: (buffer) => sharp(buffer).grayscale().toBuffer(),
    negate: (buffer) => sharp(buffer).negate().toBuffer(),
    normalize: (buffer) => sharp(buffer).normalize().toBuffer(),
    sharpen: (buffer) => sharp(buffer).sharpen().toBuffer(),
    flip: (buffer) => sharp(buffer).flip().toBuffer(),
    flop: (buffer) => sharp(buffer).flop().toBuffer(),
    
    sepia: (buffer) => sharp(buffer)
        .tint({ r: 112, g: 66, b: 20 })
        .toBuffer(),
    
    vintage: async (buffer) => {
        const img = sharp(buffer);
        return img
            .modulate({ saturation: 0.5 })
            .tint({ r: 255, g: 228, b: 196 })
            .toBuffer();
    },
    
    brighten: (buffer) => sharp(buffer)
        .modulate({ brightness: 1.5 })
        .toBuffer(),
    
    darken: (buffer) => sharp(buffer)
        .modulate({ brightness: 0.7 })
        .toBuffer(),
    
    saturate: (buffer) => sharp(buffer)
        .modulate({ saturation: 2 })
        .toBuffer(),
    
    desaturate: (buffer) => sharp(buffer)
        .modulate({ saturation: 0.5 })
        .toBuffer()
};

client.on('message', async (m) => {
    if (!m.message?.imageMessage) return;
    
    const command = m.body?.toLowerCase();
    
    if (command && command.startsWith('!')) {
        const filter = command.slice(1);
        
        if (filters[filter]) {
            try {
                await m.react('⏳');
                
                const buffer = await m.download();
                const processed = await filters[filter](buffer);
                
                await client.sendImage(m.chat, processed, `✨ ${filter} filter applied`);
                await m.react('✅');
                
            } catch (error) {
                await m.react('❌');
                await m.reply('❌ Failed to apply filter');
                console.error(error);
            }
        }
    }
    
    // List filters
    if (m.body === '!filters') {
        const list = `
*🎨 AVAILABLE FILTERS*

${Object.keys(filters).map(f => `• !${f}`).join('\n')}

Send an image with the filter command to apply it.
        `.trim();
        
        await m.reply(list);
    }
    
    // Combine filters
    if (m.body?.startsWith('!combine ')) {
        const filterNames = m.body.slice(9).split(',').map(f => f.trim());
        
        try {
            await m.react('⏳');
            
            let buffer = await m.download();
            
            for (const filterName of filterNames) {
                if (filters[filterName]) {
                    buffer = await filters[filterName](buffer);
                }
            }
            
            await client.sendImage(m.chat, buffer, `✨ Combined: ${filterNames.join(', ')}`);
            await m.react('✅');
            
        } catch (error) {
            await m.react('❌');
            await m.reply('❌ Failed to apply filters');
        }
    }
});

client.start();
```

## Features

✅ Image processing with Sharp  
✅ Video/Audio conversion with FFmpeg  
✅ Multiple filters and effects  
✅ Media download from URLs  
✅ Format conversion  
✅ Metadata extraction  
✅ Batch processing  
✅ Filter combining  

## Commands

### Image Processing
- `!sticker` / `!s` - Convert to sticker
- `!blur` - Blur image
- `!grayscale` - Convert to grayscale
- `!flip` - Flip vertically
- `!mirror` - Mirror horizontally
- `!rotate <degrees>` - Rotate image
- `!resize <size>` - Resize image
- `!sepia` - Sepia filter
- `!sharpen` - Sharpen image
- `!imageinfo` - Get image metadata

### Video/Audio
- `!togif` - Convert video to GIF
- `!tovoice` - Convert audio to voice note
- `!toaudio` - Extract audio from video

### Download
- `!img <url>` - Download image
- `!video <url>` - Download video
- `!file <url>` - Download file

### Advanced
- `!filters` - List all filters
- `!combine <filter1,filter2>` - Apply multiple filters

## Dependencies

```json
{
    "dependencies": {
        "@roidev/kachina-md": "latest",
        "sharp": "^0.33.0",
        "fluent-ffmpeg": "^2.1.2",
        "axios": "^1.6.0"
    }
}
```

## See Also

- [Media API](/api/media)
- [Stickers API](/api/stickers)
- [Sending Messages Guide](/guide/features/sending-messages)
