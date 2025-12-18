# Media Handling

Learn how to work with media files (images, videos, audio, documents) in Kachina-MD.

## Overview

Kachina-MD provides comprehensive support for sending and receiving various media types through WhatsApp.

## Sending Media

### Images

Send images with optional captions:

```javascript
import fs from 'fs';

// From buffer
const buffer = fs.readFileSync('image.jpg');
await client.sendImage(jid, buffer, 'My caption');

// From URL
await client.sendImage(jid, 'https://example.com/image.jpg', 'Downloaded image');

// From file path
await client.sendImage(jid, './photos/photo.jpg', 'From file');
```

**Supported formats:** JPG, PNG, GIF, WebP

### Videos

Send videos with captions:

```javascript
// From buffer
const buffer = fs.readFileSync('video.mp4');
await client.sendVideo(jid, buffer, 'Video caption', {
    gifPlayback: false  // Set true for GIF mode
});

// From URL
await client.sendVideo(jid, 'https://example.com/video.mp4', 'Video');

// From file path
await client.sendVideo(jid, './videos/video.mp4', 'My video');
```

**Supported formats:** MP4, AVI, MKV, MOV

### Audio

Send audio files or voice notes:

```javascript
// Regular audio file
await client.sendAudio(jid, buffer, {
    mimetype: 'audio/mp3',
    ptt: false  // Regular audio
});

// Voice note (Push to Talk)
await client.sendAudio(jid, buffer, {
    mimetype: 'audio/ogg; codecs=opus',
    ptt: true  // Voice note
});

// From URL
await client.sendAudio(jid, 'https://example.com/song.mp3');
```

**Supported formats:** MP3, OGG, AAC, M4A

### Documents

Send files as documents:

```javascript
const buffer = fs.readFileSync('document.pdf');

await client.sendDocument(
    jid,
    buffer,
    'document.pdf',      // Filename
    'application/pdf',   // MIME type
    {
        quoted: message  // Optional: reply to message
    }
);
```

**Common MIME types:**
- PDF: `application/pdf`
- Word: `application/msword`
- Excel: `application/vnd.ms-excel`
- ZIP: `application/zip`
- Text: `text/plain`

## Receiving Media

### Detect Media Type

```javascript
client.on('message', async (m) => {
    // Check media type
    const hasImage = m.message?.imageMessage;
    const hasVideo = m.message?.videoMessage;
    const hasAudio = m.message?.audioMessage;
    const hasDocument = m.message?.documentMessage;
    const hasSticker = m.message?.stickerMessage;
    
    if (hasImage) {
        console.log('Image received');
        console.log('Caption:', m.caption);
        console.log('Size:', m.fileSize);
    }
});
```

### Download Media

Use the `m.download()` method to download media:

```javascript
client.on('message', async (m) => {
    // Download image
    if (m.message?.imageMessage) {
        const buffer = await m.download();
        
        // Save to file
        fs.writeFileSync('downloaded.jpg', buffer);
        
        // Or process buffer
        console.log('Size:', buffer.length, 'bytes');
    }
    
    // Download video
    if (m.message?.videoMessage) {
        const buffer = await m.download();
        fs.writeFileSync('downloaded.mp4', buffer);
    }
    
    // Download audio
    if (m.message?.audioMessage) {
        const buffer = await m.download();
        const ext = m.message.audioMessage.mimetype?.includes('ogg') ? 'ogg' : 'mp3';
        fs.writeFileSync(`downloaded.${ext}`, buffer);
    }
});
```

### Media Information

Get media metadata:

```javascript
client.on('message', async (m) => {
    if (m.message?.imageMessage) {
        const img = m.message.imageMessage;
        
        console.log('Width:', img.width);
        console.log('Height:', img.height);
        console.log('Size:', img.fileLength);
        console.log('MIME:', img.mimetype);
        console.log('Caption:', img.caption);
    }
    
    if (m.message?.videoMessage) {
        const vid = m.message.videoMessage;
        
        console.log('Duration:', vid.seconds, 'seconds');
        console.log('Width:', vid.width);
        console.log('Height:', vid.height);
        console.log('Size:', vid.fileLength);
    }
    
    if (m.message?.audioMessage) {
        const aud = m.message.audioMessage;
        
        console.log('Duration:', aud.seconds, 'seconds');
        console.log('MIME:', aud.mimetype);
        console.log('Is PTT:', aud.ptt);
    }
    
    if (m.message?.documentMessage) {
        const doc = m.message.documentMessage;
        
        console.log('Filename:', doc.fileName);
        console.log('MIME:', doc.mimetype);
        console.log('Size:', doc.fileLength);
        console.log('Pages:', doc.pageCount);
    }
});
```

## Media Processing

### Image Processing with Sharp

```javascript
import sharp from 'sharp';

client.on('message', async (m) => {
    if (m.body === '!resize' && m.message?.imageMessage) {
        // Download original
        const buffer = await m.download();
        
        // Resize image
        const resized = await sharp(buffer)
            .resize(800, 600, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 80 })
            .toBuffer();
        
        // Send processed image
        await client.sendImage(m.chat, resized, 'Resized to 800x600');
    }
});
```

### Create Thumbnail

```javascript
import sharp from 'sharp';

async function createThumbnail(imageBuffer) {
    return await sharp(imageBuffer)
        .resize(200, 200, { fit: 'cover' })
        .jpeg({ quality: 70 })
        .toBuffer();
}

// Usage
const thumbnail = await createThumbnail(buffer);
await client.sendImage(jid, thumbnail, 'Thumbnail');
```

### Convert Image Format

```javascript
import sharp from 'sharp';

// JPG to PNG
const png = await sharp(jpgBuffer)
    .png()
    .toBuffer();

// PNG to JPG
const jpg = await sharp(pngBuffer)
    .jpeg({ quality: 90 })
    .toBuffer();

// Any to WebP
const webp = await sharp(buffer)
    .webp({ quality: 80 })
    .toBuffer();
```

### Add Watermark

```javascript
import sharp from 'sharp';

async function addWatermark(imageBuffer, watermarkText) {
    const svg = `
        <svg width="800" height="100">
            <text x="10" y="50" 
                  font-family="Arial" 
                  font-size="24" 
                  fill="white" 
                  opacity="0.5">
                ${watermarkText}
            </text>
        </svg>
    `;
    
    return await sharp(imageBuffer)
        .composite([{
            input: Buffer.from(svg),
            gravity: 'southeast'
        }])
        .toBuffer();
}
```

## Media from URL

### Download and Send

```javascript
import axios from 'axios';

async function sendMediaFromUrl(url, jid) {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer'
        });
        
        const buffer = Buffer.from(response.data);
        const contentType = response.headers['content-type'];
        
        if (contentType.startsWith('image/')) {
            await client.sendImage(jid, buffer);
        } else if (contentType.startsWith('video/')) {
            await client.sendVideo(jid, buffer);
        } else if (contentType.startsWith('audio/')) {
            await client.sendAudio(jid, buffer);
        }
    } catch (error) {
        console.error('Download failed:', error);
    }
}
```

Or use the built-in URL support:

```javascript
// Simpler - client handles URL internally
await client.sendImage(jid, 'https://example.com/image.jpg');
await client.sendVideo(jid, 'https://example.com/video.mp4');
await client.sendAudio(jid, 'https://example.com/audio.mp3');
```

## Advanced Examples

### Media Converter Bot

```javascript
client.on('message', async (m) => {
    // Image to Sticker
    if (m.body === '!sticker' && m.message?.imageMessage) {
        const buffer = await m.download();
        await client.sendSticker(m.chat, buffer, {
            pack: 'My Bot',
            author: m.pushName
        });
    }
    
    // Sticker to Image
    if (m.body === '!toimage' && m.message?.stickerMessage) {
        const buffer = await m.download();
        await client.sendImage(m.chat, buffer, 'Sticker converted');
    }
    
    // Compress Image
    if (m.body === '!compress' && m.message?.imageMessage) {
        const buffer = await m.download();
        const compressed = await sharp(buffer)
            .jpeg({ quality: 50 })
            .toBuffer();
        
        await client.sendImage(m.chat, compressed, 
            `Compressed from ${buffer.length} to ${compressed.length} bytes`
        );
    }
});
```

### Image Filter Bot

```javascript
import sharp from 'sharp';

const filters = {
    grayscale: (buffer) => sharp(buffer).grayscale().toBuffer(),
    blur: (buffer) => sharp(buffer).blur(5).toBuffer(),
    sharpen: (buffer) => sharp(buffer).sharpen().toBuffer(),
    negate: (buffer) => sharp(buffer).negate().toBuffer()
};

client.on('message', async (m) => {
    const filter = m.body?.replace('!', '');
    
    if (filters[filter] && m.message?.imageMessage) {
        await m.react('⏳');
        
        const buffer = await m.download();
        const filtered = await filters[filter](buffer);
        
        await client.sendImage(m.chat, filtered, `${filter} filter applied`);
        await m.react('✅');
    }
});
```

### Media Downloader Plugin

```javascript
import axios from 'axios';

export default {
    name: 'download',
    commands: ['download', 'dl'],
    description: 'Download media from URL',
    
    async exec({ client, m, args }) {
        if (args.length === 0) {
            return await m.reply('Usage: !download <url>');
        }
        
        const url = args[0];
        await m.react('⏳');
        
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                maxContentLength: 50 * 1024 * 1024, // 50MB limit
                timeout: 60000
            });
            
            const buffer = Buffer.from(response.data);
            const contentType = response.headers['content-type'];
            const filename = url.split('/').pop() || 'download';
            
            if (contentType.startsWith('image/')) {
                await client.sendImage(m.chat, buffer, filename);
            } else if (contentType.startsWith('video/')) {
                await client.sendVideo(m.chat, buffer, filename);
            } else if (contentType.startsWith('audio/')) {
                await client.sendAudio(m.chat, buffer);
            } else {
                await client.sendDocument(m.chat, buffer, filename, contentType);
            }
            
            await m.react('✅');
        } catch (error) {
            await m.react('❌');
            await m.reply('Download failed: ' + error.message);
        }
    }
};
```

## Best Practices

### 1. File Size Limits

Always check file sizes:

```javascript
const MAX_SIZE = 16 * 1024 * 1024; // 16MB

if (buffer.length > MAX_SIZE) {
    return await m.reply('File too large! Max 16MB');
}
```

### 2. Validate Media Type

```javascript
client.on('message', async (m) => {
    if (m.body === '!process') {
        if (!m.message?.imageMessage) {
            return await m.reply('Please send an image!');
        }
        
        // Process image
    }
});
```

### 3. Error Handling

```javascript
try {
    const buffer = await m.download();
    await client.sendImage(jid, buffer);
} catch (error) {
    console.error('Media error:', error);
    await m.reply('Failed to process media');
}
```

### 4. Cleanup Temp Files

```javascript
import { unlink } from 'fs/promises';

const tempFile = './temp.jpg';

try {
    fs.writeFileSync(tempFile, buffer);
    // Process file
} finally {
    await unlink(tempFile).catch(() => {});
}
```

## See Also

- [Sending Messages](/guide/features/sending-messages) - Send different message types
- [Stickers](/guide/features/stickers) - Create and send stickers
- [View Once](/guide/features/view-once) - Handle view once media
- [API Reference](/api/media) - Media API documentation
