# Sending Messages

Learn how to send different types of messages with Kachina-MD.

## Text Messages

### Basic Text

Send a simple text message:

```javascript
await client.sendText(jid, 'Hello, World!');
```

### With Formatting

WhatsApp supports basic text formatting:

```javascript
// Bold
await client.sendText(jid, '*Bold text*');

// Italic
await client.sendText(jid, '_Italic text_');

// Strikethrough
await client.sendText(jid, '~Strikethrough~');

// Monospace
await client.sendText(jid, '```Monospace```');

// Combined
await client.sendText(jid, '*Bold*, _italic_, and ~strikethrough~');
```

### Multiline Text

```javascript
const message = `
*Welcome to Kachina Bot!*

Available commands:
• !ping - Check status
• !help - Show help
• !about - Bot info

_Type !help for more info_
`.trim();

await client.sendText(jid, message);
```

### Reply to Message

```javascript
client.on('message', async (m) => {
    // Quick reply
    await m.reply('This is a reply!');

    // Or with client.sendText
    await client.sendText(m.from, 'Reply text', {
        quoted: m
    });
});
```

## Media Messages

### Images

#### Send Image

```javascript
import fs from 'fs';

// From file buffer
const buffer = fs.readFileSync('image.jpg');
await client.sendImage(jid, buffer, 'Optional caption');

// From URL string
await client.sendImage(jid, 'https://example.com/image.jpg', 'Downloaded image');

// From file path
await client.sendImage(jid, './path/to/image.jpg', 'Image from file');
```

#### With Options

```javascript
await client.sendImage(jid, buffer, 'Caption here', {
    quoted: message,  // Reply to a message
    jpegThumbnail: null  // No thumbnail
});
```

### Videos

```javascript
import fs from 'fs';

// From file buffer
const buffer = fs.readFileSync('video.mp4');
await client.sendVideo(jid, buffer, 'Video caption', {
    quoted: message,
    gifPlayback: false,  // true for GIF playback
    jpegThumbnail: null
});

// From URL
await client.sendVideo(jid, 'https://example.com/video.mp4', 'Video from URL');

// From file path
await client.sendVideo(jid, './videos/my-video.mp4', 'My video');
```

### Audio

#### Regular Audio

```javascript
import fs from 'fs';

// From file buffer
const buffer = fs.readFileSync('audio.mp3');
await client.sendAudio(jid, buffer, {
    mimetype: 'audio/mp4',
    ptt: false  // Regular audio, not voice note
});

// From URL
await client.sendAudio(jid, 'https://example.com/audio.mp3', {
    mimetype: 'audio/mpeg'
});

// From file path
await client.sendAudio(jid, './sounds/notification.mp3');
```

#### Voice Note

```javascript
const buffer = fs.readFileSync('voice.ogg');

await client.sendAudio(jid, buffer, {
    mimetype: 'audio/ogg; codecs=opus',
    ptt: true  // Voice note (push to talk)
});
```

### Documents

```javascript
import fs from 'fs';

// From file buffer
const buffer = fs.readFileSync('document.pdf');
await client.sendDocument(
    jid,
    buffer,
    'document.pdf',  // Filename
    'application/pdf',  // Mimetype
    {
        quoted: message
    }
);

// From URL
await client.sendDocument(
    jid,
    'https://example.com/file.pdf',
    'file.pdf',
    'application/pdf'
);

// From file path
await client.sendDocument(
    jid,
    './documents/report.pdf',
    'report.pdf',
    'application/pdf'
);
```

Common mimetypes:
- PDF: `'application/pdf'`
- Word: `'application/msword'`
- Excel: `'application/vnd.ms-excel'`
- ZIP: `'application/zip'`
- Text: `'text/plain'`

## Stickers

### Basic Sticker

```javascript
import fs from 'fs';

// From file buffer
const imageBuffer = fs.readFileSync('image.jpg');
await client.sendSticker(jid, imageBuffer, {
    pack: 'My Stickers',
    author: 'Bot Name'
});

// From URL
await client.sendSticker(jid, 'https://example.com/image.jpg', {
    pack: 'Downloaded Stickers',
    author: 'Bot'
});

// From file path
await client.sendSticker(jid, './stickers/cute.png', {
    pack: 'Cute Stickers'
});
```

### Sticker Types

```javascript
// Full image (no crop)
await client.sendSticker(jid, buffer, {
    type: Client.StickerTypes.FULL
});

// Cropped to square
await client.sendSticker(jid, buffer, {
    type: Client.StickerTypes.CROPPED
});

// Circle shape
await client.sendSticker(jid, buffer, {
    type: Client.StickerTypes.CIRCLE
});

// Rounded corners
await client.sendSticker(jid, buffer, {
    type: Client.StickerTypes.ROUNDED
});
```

### Advanced Options

```javascript
await client.sendSticker(jid, buffer, {
    pack: 'Pack Name',
    author: 'Author Name',
    type: Client.StickerTypes.CIRCLE,
    quality: 50,  // 0-100
    background: 'transparent'  // or '#FFFFFF'
});
```

[Learn more about stickers →](/guide/features/stickers)

## Interactive Messages

### Polls

```javascript
await client.sendPoll(
    jid,
    'What is your favorite color?',
    ['Red', 'Blue', 'Green', 'Yellow'],
    {
        selectableCount: 1  // Allow 1 selection
    }
);

// Multiple choice
await client.sendPoll(
    jid,
    'Select your interests:',
    ['Sports', 'Music', 'Gaming', 'Reading'],
    {
        selectableCount: 3  // Allow up to 3 selections
    }
);
```

### Reactions

```javascript
// React to a message
await client.sendReact(jid, messageKey, '👍');

// Common reactions
await client.sendReact(jid, messageKey, '❤️');
await client.sendReact(jid, messageKey, '😂');
await client.sendReact(jid, messageKey, '😮');
await client.sendReact(jid, messageKey, '😢');
await client.sendReact(jid, messageKey, '🙏');

// Remove reaction
await client.sendReact(jid, messageKey, '');
```

Quick react from message handler:

```javascript
client.on('message', async (m) => {
    if (m.body === '!like') {
        await m.react('👍');
    }
});
```

## Location & Contact

### Location

```javascript
await client.sendLocation(
    jid,
    -6.2088,   // Latitude
    106.8456,  // Longitude
    {
        quoted: message
    }
);
```

### Contact

```javascript
const contacts = [
    {
        displayName: 'John Doe',
        vcard: 'BEGIN:VCARD\n' +
               'VERSION:3.0\n' +
               'FN:John Doe\n' +
               'TEL;type=CELL;type=VOICE;waid=628123456789:+62 812-3456-789\n' +
               'END:VCARD'
    }
];

await client.sendContact(jid, contacts);
```

Multiple contacts:

```javascript
const contacts = [
    {
        displayName: 'John Doe',
        vcard: '...'
    },
    {
        displayName: 'Jane Smith',
        vcard: '...'
    }
];

await client.sendContact(jid, contacts);
```

## Advanced Techniques

### Send with Delay

```javascript
async function sendWithDelay(jid, text, delayMs) {
    await new Promise(resolve => setTimeout(resolve, delayMs));
    await client.sendText(jid, text);
}

// Use it
await sendWithDelay(jid, 'Processing...', 1000);
await sendWithDelay(jid, 'Almost done...', 2000);
await sendWithDelay(jid, 'Complete!', 3000);
```

### Typing Indicator

```javascript
// Show typing...
await client.sock.sendPresenceUpdate('composing', jid);

// Wait a bit
await new Promise(r => setTimeout(r, 2000));

// Send message
await client.sendText(jid, 'Message here');

// Back to available
await client.sock.sendPresenceUpdate('available', jid);
```

### Simulate Human Typing

```javascript
async function sendTyping(jid, text, typingTime = 2000) {
    // Start typing
    await client.sock.sendPresenceUpdate('composing', jid);

    // Wait (simulate typing)
    await new Promise(r => setTimeout(r, typingTime));

    // Send message
    await client.sendText(jid, text);

    // Stop typing
    await client.sock.sendPresenceUpdate('paused', jid);
}

await sendTyping(jid, 'Hello!', 1500);
```

### Bulk Messages

```javascript
const recipients = [
    '628123456789@s.whatsapp.net',
    '628987654321@s.whatsapp.net',
    '628555555555@s.whatsapp.net'
];

for (const jid of recipients) {
    await client.sendText(jid, 'Bulk message');

    // Delay to avoid spam detection
    await new Promise(r => setTimeout(r, 1000));
}
```

### Message Queue

```javascript
class MessageQueue {
    constructor(client, delayMs = 1000) {
        this.client = client;
        this.queue = [];
        this.processing = false;
        this.delayMs = delayMs;
    }

    async add(jid, text) {
        this.queue.push({ jid, text });
        if (!this.processing) {
            await this.process();
        }
    }

    async process() {
        this.processing = true;

        while (this.queue.length > 0) {
            const { jid, text } = this.queue.shift();
            await this.client.sendText(jid, text);
            await new Promise(r => setTimeout(r, this.delayMs));
        }

        this.processing = false;
    }
}

// Usage
const queue = new MessageQueue(client);
await queue.add(jid1, 'Message 1');
await queue.add(jid2, 'Message 2');
await queue.add(jid3, 'Message 3');
```

### Error Handling

```javascript
async function sendSafe(jid, text) {
    try {
        await client.sendText(jid, text);
        console.log('✓ Message sent');
    } catch (error) {
        console.error('✗ Failed to send:', error.message);

        // Retry logic
        if (error.message.includes('timeout')) {
            console.log('Retrying...');
            await new Promise(r => setTimeout(r, 2000));
            await client.sendText(jid, text);
        }
    }
}
```

## Message Options

Common options for all message types:

```javascript
{
    quoted: message,        // Reply to a message
    ephemeralExpiration: 86400,  // 24h disappearing message
    // ... more options available
}
```

## JID Formats

Understanding JID (Jabber ID) formats:

```javascript
// Individual chat
'628123456789@s.whatsapp.net'

// Group chat
'120363012345678901@g.us'

// Broadcast
'status@broadcast'  // WhatsApp Status
```

Get JID from message:

```javascript
client.on('message', async (m) => {
    console.log('Chat JID:', m.from);
    console.log('Sender JID:', m.participant || m.from);
});
```

## Best Practices

### 1. Check Connection

```javascript
if (!client.isReady) {
    console.log('Client not ready');
    return;
}

await client.sendText(jid, 'Message');
```

### 2. Validate JID

```javascript
function isValidJID(jid) {
    return /^\d+@s\.whatsapp\.net$/.test(jid) ||  // Individual
           /^\d+@g\.us$/.test(jid);  // Group
}

if (isValidJID(jid)) {
    await client.sendText(jid, 'Valid JID');
}
```

### 3. Handle Errors

```javascript
try {
    await client.sendText(jid, 'Message');
} catch (error) {
    console.error('Send failed:', error);
    // Handle error appropriately
}
```

### 4. Rate Limiting

```javascript
const lastSent = new Map();
const RATE_LIMIT = 1000; // 1 second

async function sendWithRateLimit(jid, text) {
    const now = Date.now();
    const last = lastSent.get(jid) || 0;

    if (now - last < RATE_LIMIT) {
        await new Promise(r => setTimeout(r, RATE_LIMIT - (now - last)));
    }

    await client.sendText(jid, text);
    lastSent.set(jid, Date.now());
}
```

### 5. Message Templates

```javascript
const templates = {
    welcome: (name) => `Welcome ${name}! 👋\nType !help for commands`,
    error: (error) => `❌ Error: ${error}`,
    success: () => '✅ Operation completed!',
    processing: () => '⏳ Processing...'
};

// Use
await client.sendText(jid, templates.welcome('John'));
await client.sendText(jid, templates.error('Invalid input'));
```

## Common Patterns

### Command Response

```javascript
client.on('message', async (m) => {
    if (m.body === '!info') {
        await m.react('⏳');

        const info = `
*Bot Information*

Name: Kachina Bot
Version: 2.0.0
Uptime: ${process.uptime()}s

Type !help for commands
        `.trim();

        await client.sendText(m.from, info);
        await m.react('✅');
    }
});
```

### Multi-step Messages

```javascript
async function sendWelcome(jid) {
    await client.sendText(jid, 'Welcome to our service! 👋');
    await new Promise(r => setTimeout(r, 1000));

    await client.sendText(jid, 'Let me show you around...');
    await new Promise(r => setTimeout(r, 1000));

    await client.sendText(jid, 'Type !help to see available commands');
}
```

### Conditional Sending

```javascript
async function sendNotification(jid, type, message) {
    const prefix = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌'
    };

    await client.sendText(jid, `${prefix[type]} ${message}`);
}

await sendNotification(jid, 'success', 'Operation completed');
await sendNotification(jid, 'error', 'Something went wrong');
```

## Examples

### Welcome Message

```javascript
client.on('group.update', async (update) => {
    if (update.action === 'add') {
        for (const participant of update.participants) {
            const welcome = `
Welcome @${participant.split('@')[0]}! 🎉

Read the group rules and enjoy your stay!
            `.trim();

            await client.sendText(update.id, welcome, {
                mentions: [participant]
            });
        }
    }
});
```

### Auto Reply

```javascript
const autoReplies = {
    'hello': 'Hi there! How can I help?',
    'price': 'Our prices start from $10. Type !pricing for details',
    'hours': 'We are open 24/7!',
    'contact': 'Email: support@example.com\nPhone: +1234567890'
};

client.on('message', async (m) => {
    const keyword = m.body?.toLowerCase();
    const reply = autoReplies[keyword];

    if (reply) {
        await client.sendText(m.from, reply);
    }
});
```

### Broadcast Message

```javascript
async function broadcast(message, groups) {
    for (const groupJid of groups) {
        try {
            await client.sendText(groupJid, message);
            console.log('✓ Sent to', groupJid);

            // Delay between messages
            await new Promise(r => setTimeout(r, 2000));
        } catch (error) {
            console.error('✗ Failed for', groupJid, error);
        }
    }
}

const groups = ['120xxx@g.us', '120yyy@g.us'];
await broadcast('Important announcement!', groups);
```

## Next Steps

- [Learn about stickers](/guide/features/stickers)
- [Handle media messages](/guide/features/media)
- [Work with groups](/guide/features/groups)
- [See complete examples](/examples/basic-bot)

## Reference

- [Client API Documentation](/api/client)
- [Message Types](/api/messages)
- [Examples](/examples/basic-bot)
