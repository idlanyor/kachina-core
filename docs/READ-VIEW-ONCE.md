# Reading View Once Messages

Kachina-MD supports reading and revealing WhatsApp "View Once" messages (media that disappears after being viewed).

## Overview

View Once messages are images or videos that can only be viewed once in WhatsApp. This feature allows you to:
- Read and download view once media
- Reveal view once messages without them disappearing
- Forward view once media to other chats
- Save view once media to file/database

## Methods

### 1. `readViewOnce(quotedMessage)`

Downloads and returns the view once media as a buffer.

**Parameters:**
- `quotedMessage` - The quoted message object (from `m.quoted`)

**Returns:**
```javascript
{
    buffer: Buffer,           // The media buffer
    type: 'image' | 'video',  // Media type
    caption: string           // Original caption (or empty string)
}
```

**Throws:**
- `Error` - If quoted message is not provided
- `Error` - If message is not a view once message
- `Error` - If download fails

**Example:**
```javascript
const { buffer, type, caption } = await client.readViewOnce(m.quoted);

console.log('Type:', type);
console.log('Caption:', caption);
console.log('Size:', buffer.length);
```

### 2. `sendViewOnce(jid, quotedMessage, options)`

Reads a view once message and sends it to a chat.

**Parameters:**
- `jid` - Chat ID to send to
- `quotedMessage` - The quoted message object (from `m.quoted`)
- `options` - Additional options (optional)

**Returns:**
- Promise that resolves when message is sent

**Example:**
```javascript
// Simple usage
await client.sendViewOnce(m.from, m.quoted);

// With options
await client.sendViewOnce(m.from, m.quoted, {
    quoted: m  // Reply to original message
});
```

## Usage Examples

### Basic Usage

```javascript
import { Client } from '@roidev/kachina-md';

const client = new Client({ sessionId: 'my-session' });

client.on('message', async (m) => {
    if (m.body === '!readvo') {
        // Check if replied to a message
        if (!m.quoted) {
            await client.sendText(m.from, 'Reply to a view once message!');
            return;
        }

        try {
            // Read and send the view once
            await client.sendViewOnce(m.from, m.quoted);
            await client.sendReact(m.from, m.key, '✅');
        } catch (error) {
            await client.sendText(m.from, 'Failed: ' + error.message);
        }
    }
});

client.start();
```

### Advanced: Get Buffer and Process

```javascript
client.on('message', async (m) => {
    if (m.body === '!savevo') {
        try {
            // Get the buffer
            const { buffer, type, caption } = await client.readViewOnce(m.quoted);

            // Save to file
            const fs = await import('fs');
            const filename = `viewonce-${Date.now()}.${type === 'image' ? 'jpg' : 'mp4'}`;
            await fs.promises.writeFile(filename, buffer);

            await client.sendText(m.from, `✅ Saved as ${filename}`);
        } catch (error) {
            await client.sendText(m.from, 'Error: ' + error.message);
        }
    }
});
```

### Forward to Multiple Chats

```javascript
client.on('message', async (m) => {
    if (m.body === '!forwardvo') {
        try {
            // Read once
            const { buffer, type, caption } = await client.readViewOnce(m.quoted);

            // Send to multiple chats
            const chats = ['628123456789@s.whatsapp.net', '628987654321@s.whatsapp.net'];

            for (const chat of chats) {
                if (type === 'image') {
                    await client.sendImage(chat, buffer, caption);
                } else {
                    await client.sendVideo(chat, buffer, caption);
                }
            }

            await client.sendText(m.from, `✅ Forwarded to ${chats.length} chats`);
        } catch (error) {
            await client.sendText(m.from, 'Error: ' + error.message);
        }
    }
});
```

### With Reactions

```javascript
client.on('message', async (m) => {
    if (m.body === '!rvo') {
        if (!m.quoted) {
            await client.sendText(m.from, '❌ Reply to view once message!');
            return;
        }

        // Show processing
        await client.sendReact(m.from, m.key, '⏳');

        try {
            await client.sendViewOnce(m.from, m.quoted, { quoted: m });

            // Success reaction
            await client.sendReact(m.from, m.key, '✅');
        } catch (error) {
            // Error reaction
            await client.sendReact(m.from, m.key, '❌');
            await client.sendText(m.from, `Error: ${error.message}`);
        }
    }
});
```

### Custom Caption

```javascript
client.on('message', async (m) => {
    if (m.body === '!revealvo') {
        try {
            const { buffer, type, caption } = await client.readViewOnce(m.quoted);

            const customCaption =
                `📸 *View Once Revealed*\n\n` +
                `Original: ${caption || 'No caption'}\n` +
                `Type: ${type}\n` +
                `Size: ${(buffer.length / 1024).toFixed(2)} KB\n` +
                `Revealed by: ${m.pushName}`;

            if (type === 'image') {
                await client.sendImage(m.from, buffer, customCaption);
            } else {
                await client.sendVideo(m.from, buffer, customCaption);
            }
        } catch (error) {
            await client.sendText(m.from, 'Error: ' + error.message);
        }
    }
});
```

### Upload to Cloud Storage

```javascript
import { uploadToS3 } from './your-storage-service.js';

client.on('message', async (m) => {
    if (m.body === '!uploadvo') {
        try {
            const { buffer, type, caption } = await client.readViewOnce(m.quoted);

            // Upload to cloud
            const url = await uploadToS3(buffer, `viewonce.${type === 'image' ? 'jpg' : 'mp4'}`);

            await client.sendText(
                m.from,
                `✅ Uploaded to cloud!\n\n` +
                `URL: ${url}\n` +
                `Caption: ${caption || 'none'}`
            );
        } catch (error) {
            await client.sendText(m.from, 'Upload failed: ' + error.message);
        }
    }
});
```

## Error Handling

### Common Errors

#### 1. Not a View Once Message

```javascript
try {
    await client.readViewOnce(m.quoted);
} catch (error) {
    if (error.message.includes('not a view once')) {
        await client.sendText(m.from, 'This is not a view once message!');
    }
}
```

#### 2. No Quoted Message

```javascript
if (!m.quoted) {
    await client.sendText(m.from, 'Please reply to a view once message!');
    return;
}
```

#### 3. Download Failed

```javascript
try {
    await client.readViewOnce(m.quoted);
} catch (error) {
    console.error('Download error:', error);
    await client.sendText(m.from, 'Failed to download media. Try again.');
}
```

### Comprehensive Error Handling

```javascript
client.on('message', async (m) => {
    if (m.body === '!readvo') {
        // Validate quoted message
        if (!m.quoted) {
            await client.sendText(m.from, '❌ Reply to a view once message!');
            return;
        }

        try {
            // Show processing
            await client.sendReact(m.from, m.key, '⏳');

            // Read and send
            await client.sendViewOnce(m.from, m.quoted, { quoted: m });

            // Success
            await client.sendReact(m.from, m.key, '✅');
            console.log(`View once revealed for ${m.pushName}`);
        } catch (error) {
            // Error handling
            await client.sendReact(m.from, m.key, '❌');

            let errorMessage = '❌ Failed to read view once:\n\n';

            if (error.message.includes('not a view once')) {
                errorMessage += 'The message you replied to is not a view once message.';
            } else if (error.message.includes('Quoted message')) {
                errorMessage += 'Please reply to a message first.';
            } else {
                errorMessage += error.message;
            }

            await client.sendText(m.from, errorMessage);
            console.error('View once error:', error);
        }
    }
});
```

## Plugin Integration

If you're using the plugin system:

```javascript
// plugins/readvo.js
export const handler = {
    command: ['readvo', 'rvo'],
    category: 'tools',
    help: 'Read view once messages\n\nUsage: Reply to view once with !readvo',
    exec: async ({ client, m }) => {
        if (!m.quoted) {
            await client.sendText(m.from, '❌ Reply to a view once message!');
            return;
        }

        try {
            await client.sendReact(m.from, m.key, '⏳');
            await client.sendViewOnce(m.from, m.quoted, { quoted: m });
            await client.sendReact(m.from, m.key, '✅');
        } catch (error) {
            await client.sendReact(m.from, m.key, '❌');
            await client.sendText(m.from, `❌ Error: ${error.message}`);
        }
    }
};
```

## Best Practices

### 1. Always Check for Quoted Message

```javascript
if (!m.quoted) {
    await client.sendText(m.from, 'Reply to a view once message first!');
    return;
}
```

### 2. Use Try-Catch

```javascript
try {
    await client.sendViewOnce(m.from, m.quoted);
} catch (error) {
    // Handle error
}
```

### 3. Provide User Feedback

```javascript
// Processing
await client.sendReact(m.from, m.key, '⏳');

// Success
await client.sendReact(m.from, m.key, '✅');

// Error
await client.sendReact(m.from, m.key, '❌');
```

### 4. Log Errors

```javascript
try {
    await client.readViewOnce(m.quoted);
} catch (error) {
    console.error('View once error:', {
        user: m.pushName,
        error: error.message,
        timestamp: new Date()
    });
}
```

## Limitations

- Only works with image and video view once messages
- Message must be quoted (replied to)
- Requires the view once message to still exist in WhatsApp
- Download speed depends on network and media size

## Security Considerations

- View once messages are meant to be temporary
- Respect user privacy when using this feature
- Use responsibly and ethically
- Consider legal implications in your jurisdiction

## FAQ

**Q: Can I read view once messages that have already been viewed?**
A: Yes, as long as you have access to the message object.

**Q: Does this work with audio view once?**
A: Currently only supports images and videos.

**Q: Can I read view once from other chats?**
A: Only if you have access to the message in your bot's chats.

**Q: Is the original sender notified?**
A: No, this operates locally within your bot.

## Complete Example

See [`examples/readvo-example.js`](../examples/readvo-example.js) for a complete working example.

Run it with:
```bash
node examples/readvo-example.js
```

## Related

- [Client Methods](./CLIENT-METHODS.md)
- [Message Handling](./MESSAGE-HANDLING.md)
- [Examples](../examples/)

---

**Version:** 2.0.4
**Last Updated:** 2025-11-09
