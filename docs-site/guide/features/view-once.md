# View Once Messages

Read and download WhatsApp "View Once" messages (photos/videos that disappear after viewing) with Kachina-MD.

## What are View Once Messages?

View Once messages are photos, videos, or audio messages that can only be viewed once in WhatsApp. After viewing, they disappear automatically. With Kachina-MD, you can:

- ✅ Read view once messages without them disappearing
- ✅ Download and save view once media (images, videos, audio)
- ✅ Forward view once media to other chats
- ✅ Process view once content programmatically

## Quick Start

```javascript
client.on('message', async (m) => {
    if (m.body === '!readvo' && m.quoted) {
        // Read and reveal view once message
        await client.sendViewOnce(m.from, m.quoted);
    }
});
```

## Basic Usage

### Read and Send

The simplest way to reveal a view once message:

```javascript
// Read view once and send to same chat
await client.sendViewOnce(jid, quotedMessage);

// Send to different chat
await client.sendViewOnce(anotherJid, quotedMessage);
```

### Download View Once

Get the media buffer for custom processing:

```javascript
const { buffer, type, caption } = await client.readViewOnce(quotedMessage);

console.log('Type:', type);        // 'image', 'video', or 'audio'
console.log('Caption:', caption);  // Original caption
console.log('Size:', buffer.length); // File size in bytes
```

## Methods

### `sendViewOnce(jid, quotedMessage, options)`

Read a view once message and send it to a chat.

```javascript
await client.sendViewOnce(jid, m.quoted, {
    quoted: m  // Reply to original message
});
```

**Returns:** Promise (resolved when sent)

**Throws:**
- Error if not a view once message
- Error if download fails

### `readViewOnce(quotedMessage)`

Download and return view once media.

```javascript
const result = await client.readViewOnce(m.quoted);

// result.buffer  - Buffer containing media
// result.type    - 'image' or 'video'
// result.caption - Original caption (or empty string)
```

**Returns:**

```typescript
{
    buffer: Buffer,                    // Media buffer
    type: 'image' | 'video' | 'audio', // Media type
    caption: string,                   // Original caption
    mimetype?: string,                 // Audio mimetype (for audio only)
    ptt?: boolean                      // Push to talk flag (for audio only)
}
```

## Command Examples

### Simple View Once Reader

```javascript
client.on('message', async (m) => {
    if (m.body === '!readvo' || m.body === '!rvo') {
        // Check if replied to a message
        if (!m.quoted) {
            await m.reply('❌ Reply to a view once message!');
            return;
        }

        try {
            // Show processing
            await m.react('⏳');

            // Read and send
            await client.sendViewOnce(m.from, m.quoted, {
                quoted: m
            });

            // Success
            await m.react('✅');
        } catch (error) {
            await m.react('❌');

            if (error.message.includes('not a view once')) {
                await m.reply('❌ That is not a view once message!');
            } else {
                await m.reply('❌ Failed to read view once');
            }
        }
    }
});
```

### Advanced View Once Bot

```javascript
client.on('message', async (m) => {
    const command = m.body?.toLowerCase();

    // Read view once
    if (command === '!readvo') {
        if (!m.quoted) {
            await m.reply('❌ Reply to a view once message!');
            return;
        }

        try {
            await m.react('⏳');

            // Get media details
            const { buffer, type, caption } = await client.readViewOnce(m.quoted);

            // Send with custom caption
            const customCaption = `
📸 *View Once Revealed*

Type: ${type}
Size: ${(buffer.length / 1024).toFixed(2)} KB
Original: ${caption || 'No caption'}
Revealed by: ${m.pushName}
            `.trim();

            if (type === 'image') {
                await client.sendImage(m.from, buffer, customCaption);
            } else if (type === 'video') {
                await client.sendVideo(m.from, buffer, customCaption);
            } else if (type === 'audio') {
                await client.sendAudio(m.from, buffer, {
                    mimetype: result.mimetype || 'audio/mpeg',
                    ptt: result.ptt || false
                });
            }

            await m.react('✅');
        } catch (error) {
            await m.react('❌');
            await m.reply(`❌ Error: ${error.message}`);
        }
    }

    // Forward to saved messages
    if (command === '!savevo') {
        if (!m.quoted) {
            await m.reply('❌ Reply to a view once message!');
            return;
        }

        try {
            // Read view once
            const { buffer, type, caption } = await client.readViewOnce(m.quoted);

            // Send to self (user's JID)
            const myJid = client.user.id;

            if (type === 'image') {
                await client.sendImage(myJid, buffer, `Saved view once\n${caption}`);
            } else if (type === 'video') {
                await client.sendVideo(myJid, buffer, `Saved view once\n${caption}`);
            } else if (type === 'audio') {
                await client.sendAudio(myJid, buffer, {
                    mimetype: result.mimetype || 'audio/mpeg',
                    ptt: result.ptt || false
                });
            }

            await m.reply('✅ View once saved to your messages!');
        } catch (error) {
            await m.reply('❌ Failed to save');
        }
    }
});
```

## Advanced Features

### Save to File

```javascript
import fs from 'fs/promises';

client.on('message', async (m) => {
    if (m.body === '!downloadvo' && m.quoted) {
        try {
            const { buffer, type, caption } = await client.readViewOnce(m.quoted);

            // Generate filename
            const timestamp = Date.now();
            const ext = type === 'image' ? 'jpg' : type === 'video' ? 'mp4' : 'mp3';
            const filename = `viewonce_${timestamp}.${ext}`;

            // Save to file
            await fs.writeFile(filename, buffer);

            await m.reply(`✅ Saved as ${filename}`);
        } catch (error) {
            await m.reply('❌ Failed to download');
        }
    }
});
```

### Forward to Multiple Chats

```javascript
async function forwardViewOnce(quotedMessage, targets) {
    const { buffer, type, caption } = await client.readViewOnce(quotedMessage);

    for (const jid of targets) {
        try {
            if (type === 'image') {
                await client.sendImage(jid, buffer, caption);
            } else if (type === 'video') {
                await client.sendVideo(jid, buffer, caption);
            } else if (type === 'audio') {
                await client.sendAudio(jid, buffer, {
                    mimetype: result.mimetype || 'audio/mpeg',
                    ptt: result.ptt || false
                });
            }

            console.log('✓ Sent to', jid);

            // Delay between sends
            await new Promise(r => setTimeout(r, 1000));
        } catch (error) {
            console.error('✗ Failed for', jid);
        }
    }
}

// Usage
const targets = ['628xxx@s.whatsapp.net', '628yyy@s.whatsapp.net'];
await forwardViewOnce(m.quoted, targets);
```

### Upload to Cloud Storage

```javascript
import { uploadToS3 } from './storage.js';

client.on('message', async (m) => {
    if (m.body === '!uploadvo' && m.quoted) {
        try {
            await m.react('⏳');

            const { buffer, type, caption } = await client.readViewOnce(m.quoted);

            // Upload to cloud (e.g., AWS S3)
            const ext = type === 'image' ? 'jpg' : type === 'video' ? 'mp4' : 'mp3';
            const key = `viewonce/${Date.now()}.${ext}`;
            const url = await uploadToS3(buffer, key);

            await m.reply(`
✅ *Uploaded to Cloud*

URL: ${url}
Type: ${type}
Size: ${(buffer.length / 1024).toFixed(2)} KB
Caption: ${caption || 'None'}
            `.trim());

            await m.react('✅');
        } catch (error) {
            await m.react('❌');
            await m.reply('❌ Upload failed');
        }
    }
});
```

### Process Image/Video

```javascript
import sharp from 'sharp';

client.on('message', async (m) => {
    if (m.body === '!processvo' && m.quoted) {
        try {
            const { buffer, type } = await client.readViewOnce(m.quoted);

            if (type === 'image') {
                // Process image with sharp
                const processed = await sharp(buffer)
                    .resize(800, 800, { fit: 'inside' })
                    .jpeg({ quality: 80 })
                    .toBuffer();

                await client.sendImage(m.from, processed, 'Processed view once image');
            } else {
                // Send video as-is
                await client.sendVideo(m.from, buffer, 'View once video');
            }
        } catch (error) {
            await m.reply('❌ Processing failed');
        }
    }
});
```

## Error Handling

### Comprehensive Error Handling

```javascript
client.on('message', async (m) => {
    if (m.body === '!readvo') {
        // Validate quoted message
        if (!m.quoted) {
            await m.reply('❌ Reply to a view once message!');
            return;
        }

        try {
            await m.react('⏳');

            // Attempt to read
            const { buffer, type, caption } = await client.readViewOnce(m.quoted);

            // Send media
            if (type === 'image') {
                await client.sendImage(m.from, buffer, caption);
            } else if (type === 'video') {
                await client.sendVideo(m.from, buffer, caption);
            } else if (type === 'audio') {
                await client.sendAudio(m.from, buffer, {
                    mimetype: result.mimetype || 'audio/mpeg',
                    ptt: result.ptt || false
                });
            }

            await m.react('✅');
            console.log(`View once revealed for ${m.pushName}`);

        } catch (error) {
            await m.react('❌');

            let errorMessage = '❌ Failed to read view once:\n\n';

            // Specific error messages
            if (error.message.includes('not a view once')) {
                errorMessage += 'The message you replied to is not a view once message.';
            } else if (error.message.includes('Quoted message')) {
                errorMessage += 'Please reply to a message first.';
            } else if (error.message.includes('download')) {
                errorMessage += 'Failed to download media. Try again.';
            } else {
                errorMessage += error.message;
            }

            await m.reply(errorMessage);
            console.error('View once error:', error);
        }
    }
});
```

### Retry Logic

```javascript
async function readViewOnceWithRetry(quotedMessage, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await client.readViewOnce(quotedMessage);
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error.message);

            if (i < maxRetries - 1) {
                // Wait before retry
                await new Promise(r => setTimeout(r, 1000 * (i + 1)));
            } else {
                throw error;
            }
        }
    }
}

// Usage
try {
    const result = await readViewOnceWithRetry(m.quoted);
    // Process result
} catch (error) {
    await m.reply('❌ Failed after multiple attempts');
}
```

## Validation

### Check if View Once

```javascript
function isViewOnce(message) {
    const hasViewOnceImage = message?.message?.imageMessage?.viewOnce;
    const hasViewOnceVideo = message?.message?.videoMessage?.viewOnce;

    return !!(hasViewOnceImage || hasViewOnceVideo);
}

// Usage
if (!m.quoted) {
    await m.reply('Reply to a message!');
    return;
}

if (!isViewOnce(m.quoted)) {
    await m.reply('That is not a view once message!');
    return;
}

// Proceed to read view once
const result = await client.readViewOnce(m.quoted);
```

### Check Media Type

```javascript
function getViewOnceType(message) {
    if (message?.message?.imageMessage?.viewOnce) {
        return 'image';
    }
    if (message?.message?.videoMessage?.viewOnce) {
        return 'video';
    }
    return null;
}

// Usage
const type = getViewOnceType(m.quoted);

if (type === 'image') {
    console.log('View once image detected');
} else if (type === 'video') {
    console.log('View once video detected');
} else {
    console.log('Not a view once message');
}
```

## Best Practices

### 1. Always Check Quoted Message

```javascript
// ✅ Good
if (!m.quoted) {
    await m.reply('Reply to a view once message!');
    return;
}

// ❌ Bad - may crash
const result = await client.readViewOnce(m.quoted);
```

### 2. Provide User Feedback

```javascript
// ✅ Good
await m.react('⏳');  // Show processing
await client.sendViewOnce(m.from, m.quoted);
await m.react('✅');  // Show success

// ❌ Bad - no feedback
await client.sendViewOnce(m.from, m.quoted);
```

### 3. Handle Both Image and Video

```javascript
// ✅ Good
const { buffer, type, caption } = await client.readViewOnce(m.quoted);

if (type === 'image') {
    await client.sendImage(m.from, buffer, caption);
} else if (type === 'video') {
    await client.sendVideo(m.from, buffer, caption);
}

// ❌ Bad - assumes type
await client.sendImage(m.from, buffer, caption); // May fail for videos
```

### 4. Log for Debugging

```javascript
try {
    const { buffer, type, caption } = await client.readViewOnce(m.quoted);

    console.log('View once read:', {
        user: m.pushName,
        type,
        size: buffer.length,
        hasCaption: !!caption,
        timestamp: new Date()
    });

    // Process...
} catch (error) {
    console.error('View once error:', {
        user: m.pushName,
        error: error.message,
        timestamp: new Date()
    });
}
```

## Limitations

- ✅ Works with images, videos, and audio
- ✅ Message must be quoted (replied to)
- ✅ Requires view once message still exists
- ⚠️ Must reply to view once BEFORE it is opened
- ❌ Download speed depends on network

## Security & Ethics

::: warning Important
View once messages are designed to be temporary for privacy reasons. Use this feature responsibly and ethically.
:::

**Best practices:**
- Respect user privacy
- Don't distribute private view once media
- Use only for legitimate purposes
- Consider legal implications in your jurisdiction
- Inform users if view once is being monitored

## Complete Example

Full-featured view once bot:

```javascript
const viewOnceCommands = {
    '!readvo': 'Read and reveal view once',
    '!savevo': 'Save to your messages',
    '!downloadvo': 'Download to file',
    '!votype': 'Check view once type'
};

client.on('message', async (m) => {
    const cmd = m.body?.toLowerCase();

    // Help
    if (cmd === '!vohelp') {
        const help = Object.entries(viewOnceCommands)
            .map(([cmd, desc]) => `${cmd} - ${desc}`)
            .join('\n');

        await m.reply(`*View Once Commands*

${help}

Reply to a view once message`);
        return;
    }

    // Read view once
    if (cmd === '!readvo') {
        if (!m.quoted) {
            await m.reply('❌ Reply to a view once message!');
            return;
        }

        try {
            await m.react('⏳');
            await client.sendViewOnce(m.from, m.quoted, { quoted: m });
            await m.react('✅');
        } catch (error) {
            await m.react('❌');
            await m.reply(`❌ ${error.message}`);
        }
    }

    // Save to user's messages
    if (cmd === '!savevo') {
        if (!m.quoted) return;

        try {
            const { buffer, type, caption } = await client.readViewOnce(m.quoted);

            // Send to self
            const myJid = client.user.id;
            const saveCaption = `📥 Saved from ${m.pushName}\n\n${caption}`;

            if (type === 'image') {
                await client.sendImage(myJid, buffer, saveCaption);
            } else if (type === 'video') {
                await client.sendVideo(myJid, buffer, saveCaption);
            } else if (type === 'audio') {
                await client.sendAudio(myJid, buffer, {
                    mimetype: result.mimetype || 'audio/mpeg',
                    ptt: result.ptt || false
                });
            }

            await m.reply('✅ Saved!');
        } catch (error) {
            await m.reply('❌ Failed to save');
        }
    }

    // Check type
    if (cmd === '!votype') {
        if (!m.quoted) return;

        try {
            const { type, caption } = await client.readViewOnce(m.quoted);
            await m.reply(`Type: ${type}\nHas caption: ${caption ? 'Yes' : 'No'}`);
        } catch (error) {
            await m.reply('Not a view once message');
        }
    }
});
```

## Next Steps

- [Send different message types](/guide/features/sending-messages)
- [Create stickers](/guide/features/stickers)
- [Handle media messages](/guide/features/media)
- [See complete examples](/examples/view-once)

## Reference

- [Client API - readViewOnce](/api/client#readviewonce)
- [Client API - sendViewOnce](/api/client#sendviewonce)
- [Examples](/examples/view-once)
