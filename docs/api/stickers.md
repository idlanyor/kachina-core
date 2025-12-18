# Stickers API

Complete API reference for creating and sending stickers in Kachina-MD.

## Overview

Kachina-MD provides comprehensive sticker creation utilities powered by `wa-sticker-formatter`. All sticker methods support Buffer, URL, or file path inputs.

## Main Methods

### client.sendSticker(jid, buffer, options)

Create and send a sticker from image or video.

**Signature:**
```javascript
await client.sendSticker(jid, buffer, options?)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jid` | `string` | Yes | Chat JID |
| `buffer` | `Buffer\|string` | Yes | Image/video buffer, URL, or file path |
| `options` | `StickerOptions` | No | Sticker configuration |

**StickerOptions:**
```typescript
{
    pack?: string;          // Sticker pack name (default: 'Sticker')
    author?: string;        // Author name (default: 'Kachina Bot')
    type?: StickerTypes;    // Sticker type (default: DEFAULT)
    quality?: number;       // Quality 0-100 (default: 50)
    background?: string;    // Background color (default: 'transparent')
    categories?: string[];  // Emoji categories (default: [])
    id?: string;           // Custom sticker ID (default: '')
}
```

**Example:**
```javascript
const buffer = fs.readFileSync('image.jpg');

await client.sendSticker(jid, buffer, {
    pack: 'My Stickers',
    author: 'Bot',
    type: Client.StickerTypes.CIRCLE,
    quality: 75
});
```

---

## Sticker Creation Functions

### createSticker(buffer, options)

Create a sticker buffer from image/video.

**Signature:**
```javascript
import { createSticker } from '@roidev/kachina-md';

const stickerBuffer = await createSticker(buffer, options)
```

**Parameters:**
- `buffer` (Buffer|string) - Image/video buffer, URL, or file path
- `options` (StickerOptions) - Sticker configuration

**Returns:** `Promise<Buffer>` - Sticker buffer (WebP format)

**Example:**
```javascript
const imageBuffer = fs.readFileSync('photo.jpg');

const stickerBuffer = await createSticker(imageBuffer, {
    pack: 'My Pack',
    author: 'Me',
    type: StickerTypes.FULL,
    quality: 80
});

// Send manually
await client.sock.sendMessage(jid, {
    sticker: stickerBuffer
});
```

---

### createFullSticker(buffer, options)

Create full-size sticker (preserves original aspect ratio).

**Signature:**
```javascript
import { createFullSticker } from '@roidev/kachina-md';

const sticker = await createFullSticker(buffer, options)
```

**Example:**
```javascript
const sticker = await createFullSticker(buffer, {
    pack: 'My Stickers',
    author: 'Bot'
});
```

Equivalent to:
```javascript
await createSticker(buffer, {
    ...options,
    type: StickerTypes.FULL
});
```

---

### createCroppedSticker(buffer, options)

Create cropped sticker (1:1 aspect ratio, center-cropped).

**Signature:**
```javascript
import { createCroppedSticker } from '@roidev/kachina-md';

const sticker = await createCroppedSticker(buffer, options)
```

**Example:**
```javascript
const sticker = await createCroppedSticker(buffer, {
    pack: 'Square Stickers'
});
```

---

### createCircleSticker(buffer, options)

Create circle-shaped sticker.

**Signature:**
```javascript
import { createCircleSticker } from '@roidev/kachina-md';

const sticker = await createCircleSticker(buffer, options)
```

**Example:**
```javascript
const sticker = await createCircleSticker(profilePicBuffer, {
    pack: 'Profile Pics',
    author: 'Bot'
});
```

---

### createRoundedSticker(buffer, options)

Create sticker with rounded corners.

**Signature:**
```javascript
import { createRoundedSticker } from '@roidev/kachina-md';

const sticker = await createRoundedSticker(buffer, options)
```

**Example:**
```javascript
const sticker = await createRoundedSticker(buffer, {
    pack: 'Rounded Stickers'
});
```

---

## Sticker Types

Access via `Client.StickerTypes` or import `StickerTypes`:

```javascript
import { Client, StickerTypes } from '@roidev/kachina-md';

// Via Client
Client.StickerTypes.DEFAULT
Client.StickerTypes.FULL
Client.StickerTypes.CROPPED
Client.StickerTypes.CIRCLE
Client.StickerTypes.ROUNDED

// Via import
StickerTypes.DEFAULT
StickerTypes.FULL
// etc.
```

### StickerTypes.DEFAULT

Default sticker format.

```javascript
await client.sendSticker(jid, buffer, {
    type: Client.StickerTypes.DEFAULT
});
```

---

### StickerTypes.FULL

Full image sticker (no cropping, preserves aspect ratio).

```javascript
await client.sendSticker(jid, buffer, {
    type: Client.StickerTypes.FULL
});
```

**Best for:** Landscape/portrait images that should not be cropped

---

### StickerTypes.CROPPED

Cropped to 1:1 square (center-cropped).

```javascript
await client.sendSticker(jid, buffer, {
    type: Client.StickerTypes.CROPPED
});
```

**Best for:** Images that work well when center-cropped to square

---

### StickerTypes.CIRCLE

Circle-shaped sticker.

```javascript
await client.sendSticker(jid, buffer, {
    type: Client.StickerTypes.CIRCLE
});
```

**Best for:** Profile pictures, logos

---

### StickerTypes.ROUNDED

Rounded corners sticker.

```javascript
await client.sendSticker(jid, buffer, {
    type: Client.StickerTypes.ROUNDED
});
```

**Best for:** Modern, clean look

---

## Sticker Options

### pack

Sticker pack name (shown in WhatsApp sticker info).

```javascript
await client.sendSticker(jid, buffer, {
    pack: 'Kachina Bot Stickers'
});
```

**Default:** `'Sticker'`

---

### author

Sticker author name (shown in WhatsApp sticker info).

```javascript
await client.sendSticker(jid, buffer, {
    author: 'My Bot'
});
```

**Default:** `'Kachina Bot'`

---

### quality

Image quality (0-100).

```javascript
// High quality (larger file size)
await client.sendSticker(jid, buffer, {
    quality: 100
});

// Balanced (default)
await client.sendSticker(jid, buffer, {
    quality: 50
});

// Low quality (smaller file size)
await client.sendSticker(jid, buffer, {
    quality: 20
});
```

**Default:** `50`

**Note:** Higher quality = larger file size

---

### background

Background color for transparent images.

```javascript
// Transparent (default)
await client.sendSticker(jid, buffer, {
    background: 'transparent'
});

// White background
await client.sendSticker(jid, buffer, {
    background: '#FFFFFF'
});

// Custom color
await client.sendSticker(jid, buffer, {
    background: '#FF5733'
});
```

**Default:** `'transparent'`

**Formats:** Color name, hex code, rgb/rgba

---

### categories

Emoji categories for sticker.

```javascript
await client.sendSticker(jid, buffer, {
    categories: ['🎉', '😄', '👍']
});
```

**Default:** `[]`

---

## Common Use Cases

### Image to Sticker

```javascript
client.on('message', async (m) => {
    if (m.body === '!sticker' && m.message?.imageMessage) {
        const buffer = await m.download();
        
        await client.sendSticker(m.chat, buffer, {
            pack: 'User Stickers',
            author: m.pushName
        });
    }
});
```

---

### Video to Animated Sticker

```javascript
client.on('message', async (m) => {
    if (m.body === '!sticker' && m.message?.videoMessage) {
        const buffer = await m.download();
        
        await client.sendSticker(m.chat, buffer, {
            pack: 'Animated Stickers',
            author: m.pushName
        });
    }
});
```

**Note:** Videos must be short (<6 seconds) for animated stickers

---

### URL to Sticker

```javascript
client.on('message', async (m) => {
    if (m.body?.startsWith('!sticker ')) {
        const url = m.body.slice(9);
        
        try {
            await client.sendSticker(m.chat, url, {
                pack: 'Downloaded',
                author: 'Bot'
            });
        } catch (error) {
            await m.reply('Invalid URL or image');
        }
    }
});
```

---

### Sticker to Image

```javascript
client.on('message', async (m) => {
    if (m.body === '!toimage' && m.message?.stickerMessage) {
        const buffer = await m.download();
        
        await client.sendImage(m.chat, buffer, 'Sticker converted to image');
    }
});
```

---

### Custom Sticker Types

```javascript
const commands = {
    '!sticker': Client.StickerTypes.DEFAULT,
    '!sfull': Client.StickerTypes.FULL,
    '!scircle': Client.StickerTypes.CIRCLE,
    '!srounded': Client.StickerTypes.ROUNDED
};

client.on('message', async (m) => {
    const type = commands[m.body];
    
    if (type && m.message?.imageMessage) {
        const buffer = await m.download();
        
        await client.sendSticker(m.chat, buffer, {
            type,
            pack: 'Custom',
            author: m.pushName
        });
    }
});
```

---

## Advanced Examples

### Sticker with Image Processing

```javascript
import sharp from 'sharp';

client.on('message', async (m) => {
    if (m.body === '!sticker' && m.message?.imageMessage) {
        const buffer = await m.download();
        
        // Process image
        const processed = await sharp(buffer)
            .resize(512, 512, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png()
            .toBuffer();
        
        // Create sticker
        await client.sendSticker(m.chat, processed, {
            pack: 'Processed Stickers',
            author: 'Bot'
        });
    }
});
```

---

### Batch Sticker Creation

```javascript
async function createStickerPack(jid, images, packName) {
    for (let i = 0; i < images.length; i++) {
        await client.sendSticker(jid, images[i], {
            pack: packName,
            author: 'Bot'
        });
        
        // Delay between stickers
        await new Promise(r => setTimeout(r, 1000));
    }
}

// Usage
const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];
await createStickerPack(jid, images, 'My Pack');
```

---

### Sticker from Multiple Sources

```javascript
export default {
    name: 'sticker',
    commands: ['sticker', 's'],
    
    async exec({ client, m }) {
        let buffer;
        
        // From quoted message
        if (m.quoted?.message?.imageMessage) {
            buffer = await m.quoted.download();
        }
        // From URL in message
        else if (m.body.includes('http')) {
            const url = m.body.match(/https?:\/\/[^\s]+/)[0];
            buffer = url;
        }
        // From current message
        else if (m.message?.imageMessage) {
            buffer = await m.download();
        }
        else {
            return await m.reply('Send or reply to an image!');
        }
        
        await client.sendSticker(m.chat, buffer, {
            pack: 'Bot Stickers',
            author: m.pushName
        });
    }
};
```

---

## Error Handling

### Common Errors

```javascript
try {
    await client.sendSticker(jid, buffer, options);
} catch (error) {
    if (error.message.includes('Invalid')) {
        await m.reply('Invalid image format');
    }
    else if (error.message.includes('size')) {
        await m.reply('File too large');
    }
    else {
        await m.reply('Failed to create sticker');
    }
}
```

---

### Validate Before Creating

```javascript
client.on('message', async (m) => {
    if (m.body === '!sticker') {
        // Check if has media
        const hasImage = m.message?.imageMessage;
        const hasVideo = m.message?.videoMessage;
        
        if (!hasImage && !hasVideo) {
            return await m.reply('Send an image or video!');
        }
        
        // Check file size
        const size = hasImage 
            ? m.message.imageMessage.fileLength
            : m.message.videoMessage.fileLength;
        
        if (size > 5 * 1024 * 1024) {
            return await m.reply('File too large! Max 5MB');
        }
        
        // Check video duration
        if (hasVideo) {
            const duration = m.message.videoMessage.seconds;
            if (duration > 6) {
                return await m.reply('Video too long! Max 6 seconds');
            }
        }
        
        // Create sticker
        const buffer = await m.download();
        await client.sendSticker(m.chat, buffer);
    }
});
```

---

## TypeScript Definitions

```typescript
enum StickerTypes {
    DEFAULT = 'default',
    FULL = 'full',
    CROPPED = 'cropped',
    CIRCLE = 'circle',
    ROUNDED = 'rounded'
}

interface StickerOptions {
    pack?: string;
    author?: string;
    type?: StickerTypes;
    quality?: number;
    background?: string;
    categories?: string[];
    id?: string;
}

interface Client {
    sendSticker(
        jid: string,
        buffer: Buffer | string,
        options?: StickerOptions
    ): Promise<any>;
    
    static StickerTypes: typeof StickerTypes;
}

// Standalone functions
function createSticker(
    buffer: Buffer | string,
    options?: StickerOptions
): Promise<Buffer>;

function createFullSticker(
    buffer: Buffer | string,
    options?: StickerOptions
): Promise<Buffer>;

function createCroppedSticker(
    buffer: Buffer | string,
    options?: StickerOptions
): Promise<Buffer>;

function createCircleSticker(
    buffer: Buffer | string,
    options?: StickerOptions
): Promise<Buffer>;

function createRoundedSticker(
    buffer: Buffer | string,
    options?: StickerOptions
): Promise<Buffer>;
```

---

## Best Practices

### 1. Validate Input

```javascript
if (!m.message?.imageMessage && !m.message?.videoMessage) {
    return await m.reply('Send an image or video!');
}
```

### 2. Check File Size

```javascript
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

if (fileSize > MAX_SIZE) {
    return await m.reply('File too large!');
}
```

### 3. Limit Video Duration

```javascript
if (videoSeconds > 6) {
    return await m.reply('Video too long! Max 6 seconds');
}
```

### 4. Use Appropriate Quality

```javascript
// For photos: higher quality
quality: 75

// For memes/simple images: lower quality
quality: 40
```

### 5. Consistent Pack Names

```javascript
const STICKER_CONFIG = {
    pack: 'Kachina Bot',
    author: 'Bot',
    quality: 60
};

await client.sendSticker(jid, buffer, STICKER_CONFIG);
```

---

## See Also

- [Stickers Guide](/guide/features/stickers) - Detailed sticker guide
- [Media API](/api/media) - Media handling reference
- [Client API](/api/client) - Client methods
- [Examples](/examples/plugins) - Sticker plugin examples
