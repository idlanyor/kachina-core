# Media Guide - @kachina-md/core

Panduan lengkap penggunaan fitur media di @kachina-md/core

## 📤 Sending Media

### Text Messages

```javascript
// Simple text
await client.sendText(jid, 'Hello World!');

// With options (quoted message)
await client.sendMessage(jid, { text: 'Hello' }, { quoted: msg });
```

### Images

```javascript
import fs from 'fs';
import axios from 'axios';

// From file
const buffer = fs.readFileSync('./image.jpg');
await client.sendImage(jid, buffer, 'Caption here');

// From URL
const response = await axios.get(url, { responseType: 'arraybuffer' });
const buffer = Buffer.from(response.data);
await client.sendImage(jid, buffer, 'Downloaded image');

// With additional options
await client.sendImage(jid, buffer, 'Caption', {
    quoted: msg,           // Quote a message
    mentions: [jid1, jid2] // Mention users
});
```

### Videos

```javascript
// Basic video
await client.sendVideo(jid, buffer, 'Video caption');

// With options
await client.sendVideo(jid, buffer, 'Caption', {
    gifPlayback: true,  // Send as GIF
    quoted: msg
});
```

### Audio

```javascript
// Audio file (shows as audio player)
await client.sendAudio(jid, buffer, {
    mimetype: 'audio/mp4'
});

// Voice note / PTT (Push to Talk)
await client.sendAudio(jid, buffer, {
    ptt: true,
    mimetype: 'audio/ogg; codecs=opus'
});
```

### Documents

```javascript
// PDF document
await client.sendDocument(jid, buffer, 'document.pdf', 'application/pdf');

// Excel file
await client.sendDocument(jid, buffer, 'spreadsheet.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

// With additional options
await client.sendDocument(jid, buffer, 'file.pdf', 'application/pdf', {
    quoted: msg,
    caption: 'Here is the document'
});
```

### Stickers

```javascript
import { createSticker, StickerTypes } from '@kachina-md/core';

// Create sticker from image/video
const stickerBuffer = await createSticker(imageBuffer, {
    pack: 'My Sticker Pack',
    author: 'Author Name',
    type: StickerTypes.FULL,
    quality: 50
});

await client.sendSticker(jid, stickerBuffer);
```

#### Sticker Types

```javascript
import { StickerTypes } from '@kachina-md/core';

// Available types:
StickerTypes.DEFAULT   // Default (cropped)
StickerTypes.FULL     // Full size (no crop)
StickerTypes.CROPPED  // Cropped to square
StickerTypes.CIRCLE   // Circle shaped
StickerTypes.ROUNDED  // Rounded corners
```

#### Sticker Helper Functions

```javascript
import {
    createSticker,
    createFullSticker,
    createCroppedSticker,
    createCircleSticker,
    createRoundedSticker
} from '@kachina-md/core';

// Full sticker
const buffer = await createFullSticker(imageBuffer, {
    pack: 'Pack Name',
    author: 'Author'
});

// Circle sticker
const buffer = await createCircleSticker(imageBuffer, {
    pack: 'Pack Name',
    author: 'Author'
});
```

### Contacts

```javascript
// Single contact
await client.sendContact(jid, [{
    displayName: 'John Doe',
    vcard: `BEGIN:VCARD
VERSION:3.0
FN:John Doe
TEL;type=CELL;type=VOICE;waid=1234567890:+1 234 567 890
END:VCARD`
}]);

// Multiple contacts
await client.sendContact(jid, [
    { displayName: 'Contact 1', vcard: '...' },
    { displayName: 'Contact 2', vcard: '...' }
]);
```

### Location

```javascript
// Send location coordinates
await client.sendLocation(jid, -6.200000, 106.816666);

// Jakarta coordinates example
await client.sendLocation(jid, -6.2088, 106.8456);
```

### Polls

```javascript
// Single choice poll
await client.sendPoll(jid, 'What is your favorite color?', [
    'Red',
    'Blue',
    'Green',
    'Yellow'
], { selectableCount: 1 });

// Multiple choice poll
await client.sendPoll(jid, 'Select your hobbies:', [
    'Reading',
    'Gaming',
    'Sports',
    'Music'
], { selectableCount: 3 });
```

### Reactions

```javascript
// React to a message
await client.sendReact(jid, messageKey, '👍');

// Using message object
await client.sendReact(m.chat, m.key, '❤️');

// Or using message helper
await m.react('🔥');
```

## 📥 Receiving & Processing Media

### Download Media from Message

```javascript
bot.on('message', async (m) => {
    // Check if message contains media
    if (['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'].includes(m.type)) {

        // Download media
        const buffer = await m.download();

        if (buffer) {
            console.log('Media downloaded, size:', buffer.length);

            // Process the buffer...
            // Save to file, upload, convert, etc.
        }
    }
});
```

### Working with Different Media Types

```javascript
// Image message
if (m.type === 'imageMessage') {
    const buffer = await m.download();

    // Process image with sharp
    const resized = await sharp(buffer)
        .resize(500, 500)
        .toBuffer();

    await client.sendImage(m.chat, resized, 'Resized!');
}

// Video message
if (m.type === 'videoMessage') {
    const buffer = await m.download();
    console.log('Video size:', m.fileSize);
    console.log('Duration:', m.message.videoMessage.seconds);
}

// Audio message
if (m.type === 'audioMessage') {
    const buffer = await m.download();
    const isPTT = m.message.audioMessage.ptt; // Is voice note?
}

// Document message
if (m.type === 'documentMessage') {
    const buffer = await m.download();
    const filename = m.message.documentMessage.fileName;
    const mimetype = m.message.documentMessage.mimetype;

    // Save to file
    fs.writeFileSync(`./downloads/${filename}`, buffer);
}

// Sticker message
if (m.type === 'stickerMessage') {
    const buffer = await m.download();

    // Convert to image
    const image = await sharp(buffer).png().toBuffer();
    await client.sendImage(m.chat, image, 'Converted sticker');
}
```

## 🔄 Media Conversion Examples

### Image to Sticker

```javascript
import { createSticker, StickerTypes } from '@kachina-md/core';

export default {
    name: 'sticker',
    commands: ['s', 'sticker'],

    async exec({ client, m }) {
        if (m.type !== 'imageMessage' && !m.quoted?.type === 'imageMessage') {
            return await m.reply('Reply to an image!');
        }

        const msg = m.quoted || m;
        const buffer = await msg.download();

        const sticker = await createSticker(buffer, {
            pack: 'My Bot',
            author: 'Bot',
            type: StickerTypes.FULL
        });

        await client.sendSticker(m.chat, sticker);
    }
};
```

### Sticker to Image

```javascript
import sharp from 'sharp';

export default {
    name: 'toimage',
    commands: ['toimg'],

    async exec({ client, m }) {
        if (m.type !== 'stickerMessage' && m.quoted?.type !== 'stickerMessage') {
            return await m.reply('Reply to a sticker!');
        }

        const msg = m.quoted || m;
        const buffer = await msg.download();

        // Convert webp to png
        const png = await sharp(buffer).png().toBuffer();

        await client.sendImage(m.chat, png);
    }
};
```

### Video to GIF

```javascript
export default {
    name: 'togif',
    commands: ['togif'],

    async exec({ client, m }) {
        if (m.type !== 'videoMessage' && m.quoted?.type !== 'videoMessage') {
            return await m.reply('Reply to a video!');
        }

        const msg = m.quoted || m;
        const buffer = await msg.download();

        // Send as GIF
        await client.sendVideo(m.chat, buffer, 'GIF', {
            gifPlayback: true
        });
    }
};
```

## 📂 File Type Detection

```javascript
import { fileTypeFromBuffer } from 'file-type';

const buffer = await m.download();
const fileType = await fileTypeFromBuffer(buffer);

console.log(fileType);
// {
//   ext: 'jpg',
//   mime: 'image/jpeg'
// }

// Use in plugin
if (fileType?.mime?.startsWith('image/')) {
    console.log('This is an image');
} else if (fileType?.mime?.startsWith('video/')) {
    console.log('This is a video');
}
```

## 💡 Best Practices

### 1. Error Handling

```javascript
async exec({ client, m }) {
    try {
        const buffer = await m.download();

        if (!buffer) {
            return await m.reply('❌ Failed to download media');
        }

        // Process buffer...

    } catch (error) {
        console.error('Media error:', error);
        await m.reply('❌ Error: ' + error.message);
    }
}
```

### 2. File Size Validation

```javascript
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

if (m.fileSize > MAX_SIZE) {
    return await m.reply('❌ File too large! Max 10MB');
}

const buffer = await m.download();
```

### 3. Progress Feedback

```javascript
await m.react('⏳'); // Loading

// Process media...

await m.react('✅'); // Success
```

### 4. Buffer Cleanup

```javascript
async exec({ client, m }) {
    let buffer;

    try {
        buffer = await m.download();

        // Process buffer...

    } finally {
        // Clear buffer from memory
        buffer = null;
    }
}
```

## 🎨 Advanced Examples

### Image Effects

```javascript
import sharp from 'sharp';

// Blur effect
const blurred = await sharp(buffer)
    .blur(10)
    .toBuffer();

// Grayscale
const grayscale = await sharp(buffer)
    .grayscale()
    .toBuffer();

// Resize with aspect ratio
const resized = await sharp(buffer)
    .resize(500, 500, { fit: 'cover' })
    .toBuffer();

// Add text watermark
const watermarked = await sharp(buffer)
    .composite([{
        input: textBuffer,
        gravity: 'southeast'
    }])
    .toBuffer();
```

### Batch Media Sending

```javascript
const images = [buffer1, buffer2, buffer3];

for (const buffer of images) {
    await client.sendImage(m.chat, buffer, `Image ${images.indexOf(buffer) + 1}`);
    await sleep(1000); // Wait 1 second between sends
}
```

### Media with Buttons (if supported)

```javascript
await client.sendMessage(m.chat, {
    image: buffer,
    caption: 'Choose an option:',
    footer: 'Powered by Bot',
    buttons: [
        { buttonId: 'id1', buttonText: { displayText: 'Option 1' }, type: 1 },
        { buttonId: 'id2', buttonText: { displayText: 'Option 2' }, type: 1 }
    ],
    headerType: 4
});
```

---

Made with ❤️ using @kachina-md/core
