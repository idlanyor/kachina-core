# Stickers

Create and send WhatsApp stickers from images and videos with Kachina-MD's built-in sticker creation system.

## Quick Start

```javascript
import fs from 'fs';

// Load image
const buffer = fs.readFileSync('image.jpg');

// Create and send sticker
await client.sendSticker(jid, buffer, {
    pack: 'My Stickers',
    author: 'Bot Name'
});
```

That's it! The image is automatically converted to a WhatsApp sticker.

## Basic Usage

### From File

```javascript
import fs from 'fs';

// From image file
const imageBuffer = fs.readFileSync('photo.jpg');
await client.sendSticker(jid, imageBuffer);

// From video file (first frame becomes sticker)
const videoBuffer = fs.readFileSync('video.mp4');
await client.sendSticker(jid, videoBuffer);
```

### From URL

```javascript
import axios from 'axios';

const response = await axios.get('https://example.com/image.jpg', {
    responseType: 'arraybuffer'
});

const buffer = Buffer.from(response.data);
await client.sendSticker(jid, buffer, {
    pack: 'Downloaded',
    author: 'Bot'
});
```

### From Message

Convert received media to sticker:

```javascript
client.on('message', async (m) => {
    if (m.body === '!sticker' && m.quoted?.hasMedia) {
        // Download quoted message media
        const buffer = await m.quoted.download();

        // React while processing
        await m.react('⏳');

        // Create and send sticker
        await client.sendSticker(m.from, buffer, {
            pack: 'User Stickers',
            author: m.pushName
        });

        // Success reaction
        await m.react('✅');
    }
});
```

## Sticker Types

Kachina-MD supports multiple sticker formats:

### Default Sticker

Standard WhatsApp sticker (cropped to fit):

```javascript
await client.sendSticker(jid, buffer, {
    type: Client.StickerTypes.DEFAULT
});
```

### Full Sticker

Full image without cropping:

```javascript
await client.sendSticker(jid, buffer, {
    type: Client.StickerTypes.FULL
});
```

### Cropped Sticker

Cropped to square:

```javascript
await client.sendSticker(jid, buffer, {
    type: Client.StickerTypes.CROPPED
});
```

### Circle Sticker

Circular shape with transparent background:

```javascript
await client.sendSticker(jid, buffer, {
    type: Client.StickerTypes.CIRCLE
});
```

### Rounded Sticker

Rounded corners:

```javascript
await client.sendSticker(jid, buffer, {
    type: Client.StickerTypes.ROUNDED
});
```

## Configuration Options

### Complete Options

```javascript
await client.sendSticker(jid, buffer, {
    pack: 'Pack Name',        // Sticker pack name
    author: 'Author Name',    // Author name
    type: Client.StickerTypes.CIRCLE,  // Sticker type
    quality: 50,              // Quality 0-100
    background: 'transparent', // Background color
    categories: ['🎉', '😄']  // Emoji categories
});
```

### Pack Name & Author

These appear in the sticker info:

```javascript
await client.sendSticker(jid, buffer, {
    pack: 'My Bot Stickers',
    author: 'Kachina Bot'
});
```

### Quality

Control sticker quality (0-100):

```javascript
// High quality (larger file)
await client.sendSticker(jid, buffer, {
    quality: 100
});

// Balanced
await client.sendSticker(jid, buffer, {
    quality: 50  // Default
});

// Low quality (smaller file)
await client.sendSticker(jid, buffer, {
    quality: 20
});
```

### Background Color

Set background for transparent images:

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

## Sticker Types Reference

Access sticker types via `Client.StickerTypes`:

```javascript
Client.StickerTypes.DEFAULT   // Default sticker
Client.StickerTypes.FULL      // Full image
Client.StickerTypes.CROPPED   // Cropped square
Client.StickerTypes.CIRCLE    // Circle shape
Client.StickerTypes.ROUNDED   // Rounded corners
```

## Command Examples

### Simple Sticker Command

```javascript
client.on('message', async (m) => {
    if (m.body === '!sticker' || m.body === '!s') {
        if (!m.quoted || !m.quoted.hasMedia) {
            await m.reply('❌ Reply to an image or video with !sticker');
            return;
        }

        try {
            await m.react('⏳');
            const buffer = await m.quoted.download();

            await client.sendSticker(m.from, buffer, {
                pack: 'User Stickers',
                author: m.pushName
            });

            await m.react('✅');
        } catch (error) {
            await m.reply('❌ Failed to create sticker');
            await m.react('❌');
        }
    }
});
```

### Sticker with Type Selection

```javascript
client.on('message', async (m) => {
    const command = m.body?.toLowerCase();

    // Different sticker types
    const stickerCommands = {
        '!sticker': Client.StickerTypes.DEFAULT,
        '!sfull': Client.StickerTypes.FULL,
        '!scircle': Client.StickerTypes.CIRCLE,
        '!srounded': Client.StickerTypes.ROUNDED
    };

    const stickerType = stickerCommands[command];

    if (stickerType) {
        if (!m.quoted?.hasMedia) {
            await m.reply('Reply to an image/video!');
            return;
        }

        const buffer = await m.quoted.download();

        await client.sendSticker(m.from, buffer, {
            pack: 'Bot Stickers',
            author: 'Kachina',
            type: stickerType
        });
    }
});
```

### Advanced Sticker Bot

```javascript
const stickerConfig = {
    '!s': {
        type: Client.StickerTypes.DEFAULT,
        help: 'Create default sticker'
    },
    '!sfull': {
        type: Client.StickerTypes.FULL,
        help: 'Create full sticker (no crop)'
    },
    '!scircle': {
        type: Client.StickerTypes.CIRCLE,
        help: 'Create circle sticker'
    },
    '!steal': {
        type: null,
        help: 'Convert received sticker to image'
    }
};

client.on('message', async (m) => {
    const cmd = m.body?.toLowerCase();
    const config = stickerConfig[cmd];

    if (!config) return;

    // Help command
    if (cmd === '!stickerhelp') {
        const help = Object.entries(stickerConfig)
            .map(([cmd, cfg]) => `${cmd} - ${cfg.help}`)
            .join('\n');

        await m.reply(`*Sticker Commands*\n\n${help}`);
        return;
    }

    // Steal sticker (convert to image)
    if (cmd === '!steal') {
        if (!m.quoted?.message?.stickerMessage) {
            await m.reply('❌ Reply to a sticker!');
            return;
        }

        const buffer = await m.quoted.download();
        await client.sendImage(m.from, buffer, 'Sticker converted to image');
        return;
    }

    // Create sticker
    if (!m.quoted?.hasMedia) {
        await m.reply(`❌ Reply to an image/video with ${cmd}`);
        return;
    }

    try {
        await m.react('⏳');

        const buffer = await m.quoted.download();

        await client.sendSticker(m.from, buffer, {
            pack: 'Custom Pack',
            author: m.pushName,
            type: config.type,
            quality: 75
        });

        await m.react('✅');
    } catch (error) {
        console.error('Sticker error:', error);
        await m.reply('❌ Failed to create sticker');
        await m.react('❌');
    }
});
```

## Advanced Features

### Batch Sticker Creation

Create multiple stickers at once:

```javascript
async function createStickerPack(jid, images, packName) {
    for (let i = 0; i < images.length; i++) {
        const buffer = fs.readFileSync(images[i]);

        await client.sendSticker(jid, buffer, {
            pack: packName,
            author: 'Bot',
            type: Client.StickerTypes.CIRCLE
        });

        // Delay between stickers
        await new Promise(r => setTimeout(r, 1000));

        console.log(`Sent ${i + 1}/${images.length}`);
    }
}

// Usage
const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];
await createStickerPack(jid, images, 'My Pack');
```

### Convert Sticker to Image

```javascript
client.on('message', async (m) => {
    if (m.body === '!toimg') {
        if (!m.quoted?.message?.stickerMessage) {
            await m.reply('❌ Reply to a sticker!');
            return;
        }

        // Download sticker
        const buffer = await m.quoted.download();

        // Send as image
        await client.sendImage(m.from, buffer, 'Converted from sticker');
    }
});
```

### Image Processing Before Sticker

```javascript
import sharp from 'sharp';

async function createCustomSticker(jid, inputBuffer) {
    // Process image with sharp
    const processedBuffer = await sharp(inputBuffer)
        .resize(512, 512, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer();

    // Create sticker
    await client.sendSticker(jid, processedBuffer, {
        pack: 'Processed',
        author: 'Bot'
    });
}
```

### Animated Stickers

Create animated stickers from videos:

```javascript
client.on('message', async (m) => {
    if (m.body === '!anim' && m.quoted?.message?.videoMessage) {
        await m.react('⏳');

        // Download video
        const buffer = await m.quoted.download();

        // Create animated sticker
        await client.sendSticker(m.from, buffer, {
            pack: 'Animated',
            author: m.pushName,
            type: Client.StickerTypes.FULL
        });

        await m.react('✅');
    }
});
```

## Error Handling

### Safe Sticker Creation

```javascript
async function sendStickerSafe(jid, buffer, options = {}) {
    try {
        await client.sendSticker(jid, buffer, options);
        return { success: true };
    } catch (error) {
        console.error('Sticker error:', error);

        // Handle specific errors
        if (error.message.includes('invalid')) {
            return { success: false, error: 'Invalid image format' };
        }

        if (error.message.includes('size')) {
            return { success: false, error: 'File too large' };
        }

        return { success: false, error: 'Failed to create sticker' };
    }
}

// Usage
const result = await sendStickerSafe(jid, buffer, {
    pack: 'Test',
    author: 'Bot'
});

if (!result.success) {
    await client.sendText(jid, `❌ ${result.error}`);
}
```

### Retry Logic

```javascript
async function createStickerWithRetry(jid, buffer, options, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await client.sendSticker(jid, buffer, options);
            return true;
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error.message);

            if (i < maxRetries - 1) {
                await new Promise(r => setTimeout(r, 1000 * (i + 1)));
            }
        }
    }

    return false;
}
```

## Best Practices

### 1. Validate Media Type

```javascript
client.on('message', async (m) => {
    if (m.body === '!sticker') {
        if (!m.quoted) {
            await m.reply('Reply to an image or video');
            return;
        }

        // Check media type
        const hasImage = m.quoted.message?.imageMessage;
        const hasVideo = m.quoted.message?.videoMessage;

        if (!hasImage && !hasVideo) {
            await m.reply('❌ Only images and videos supported');
            return;
        }

        // Create sticker
        const buffer = await m.quoted.download();
        await client.sendSticker(m.from, buffer);
    }
});
```

### 2. Provide User Feedback

```javascript
client.on('message', async (m) => {
    if (m.body === '!sticker' && m.quoted?.hasMedia) {
        // Show processing
        await m.react('⏳');
        await m.reply('Creating sticker...');

        try {
            const buffer = await m.quoted.download();
            await client.sendSticker(m.from, buffer);

            // Success feedback
            await m.react('✅');
        } catch (error) {
            // Error feedback
            await m.react('❌');
            await m.reply('Failed to create sticker');
        }
    }
});
```

### 3. Limit File Size

```javascript
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

client.on('message', async (m) => {
    if (m.body === '!sticker' && m.quoted?.hasMedia) {
        const fileSize = m.quoted.message?.imageMessage?.fileLength ||
                        m.quoted.message?.videoMessage?.fileLength;

        if (fileSize > MAX_SIZE) {
            await m.reply('❌ File too large! Max 5MB');
            return;
        }

        const buffer = await m.quoted.download();
        await client.sendSticker(m.from, buffer);
    }
});
```

### 4. Use Consistent Pack Names

```javascript
const STICKER_CONFIG = {
    pack: 'Kachina Bot Stickers',
    author: 'Kachina',
    quality: 75
};

// Use everywhere
await client.sendSticker(jid, buffer, STICKER_CONFIG);
```

## Common Issues

### Sticker Not Animated

Videos must be short (<6 seconds) for animated stickers:

```javascript
// Check video duration
const duration = m.quoted.message?.videoMessage?.seconds;

if (duration > 6) {
    await m.reply('❌ Video too long! Max 6 seconds for animated stickers');
    return;
}
```

### Poor Quality Stickers

Increase quality setting:

```javascript
await client.sendSticker(jid, buffer, {
    quality: 90  // Higher quality
});
```

### Large File Size

Reduce quality or resize image:

```javascript
import sharp from 'sharp';

const resized = await sharp(buffer)
    .resize(512, 512, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toBuffer();

await client.sendSticker(jid, resized);
```

## Examples

### Multi-command Sticker Bot

```javascript
client.on('message', async (m) => {
    if (!m.body) return;

    const commands = {
        '!s': 'Create sticker',
        '!sfull': 'Full sticker (no crop)',
        '!scircle': 'Circle sticker',
        '!srounded': 'Rounded sticker',
        '!steal': 'Convert sticker to image'
    };

    if (m.body === '!stickerhelp') {
        const help = Object.entries(commands)
            .map(([cmd, desc]) => `${cmd} - ${desc}`)
            .join('\n');

        await m.reply(`*Sticker Commands*\n\n${help}`);
        return;
    }

    // Handle sticker commands
    // ... implementation ...
});
```

## Next Steps

- [Learn about view once messages](/guide/features/view-once)
- [Handle media messages](/guide/features/media)
- [Send different message types](/guide/features/sending-messages)
- [See complete examples](/examples/basic-bot)

## Reference

- [Client API - sendSticker](/api/client#sendsticker)
- [Sticker Types](/api/stickers)
- [Examples](/examples/basic-bot)
