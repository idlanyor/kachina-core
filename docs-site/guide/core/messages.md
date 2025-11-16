# Message Handling

Learn how to receive, process, and respond to WhatsApp messages in Kachina-MD.

## Basic Message Handling

The `message` event is emitted whenever a new message is received:

```javascript
client.on('message', async (message) => {
    console.log('New message:', message.body);
});
```

## Message Object

Every message has these common properties:

```javascript
client.on('message', async (m) => {
    // Message metadata
    console.log('Chat:', m.chat);              // Chat JID (remoteJid)
    console.log('From:', m.sender);            // Sender JID
    console.log('Sender:', m.pushName);        // Sender name
    console.log('Body:', m.body);              // Message text

    // Message type checks
    console.log('From me:', m.fromMe);         // Is from bot
    console.log('Is group:', m.isGroup);       // Is group message
    console.log('Type:', m.type);              // Message type
    console.log('Is quoted:', m.quoted);       // Is reply to another message

    // Message key
    console.log('Key:', m.key);                // Message key (for reactions, etc.)
});
```

### Full Message Properties

```typescript
{
    // Identifiers
    key: MessageKey,              // Unique message identifier
    chat: string,                 // Chat JID (remoteJid)
    sender: string,               // Sender JID
    fromMe: boolean,              // Message sent by bot
    isGroup: boolean,             // Message in group chat

    // Content
    body: string,                 // Message text content
    message: WAMessage,           // Raw Baileys message object
    type: string,                 // Message type (e.g., 'conversation', 'imageMessage')

    // Sender info
    pushName: string,             // Sender display name

    // Media info
    caption: string,              // Media caption
    mimetype: string,             // Media mime type
    fileSize: number,             // Media file size

    // Reply/Quote
    quoted?: Message,             // Quoted message (if reply)
    mentions: Array<string>,      // Mentioned JIDs

    // Methods
    reply: Function,              // Quick reply method
    react: Function,              // React to message
    download: Function,           // Download media
    delete: Function,             // Delete message
    forward: Function,            // Forward message
}
```

## Message Types

### Text Messages

```javascript
client.on('message', async (m) => {
    if (m.body === '!hello') {
        await m.reply('Hello! 👋');
    }
});
```

### Media Messages

```javascript
client.on('message', async (m) => {
    // Check if message has media by inspecting message type
    const hasImage = m.message?.imageMessage;
    const hasVideo = m.message?.videoMessage;
    const hasAudio = m.message?.audioMessage;
    const hasDocument = m.message?.documentMessage;
    const hasSticker = m.message?.stickerMessage;

    if (hasImage || hasVideo || hasAudio || hasDocument || hasSticker) {
        // Download media
        const buffer = await m.download();

        console.log('Media type:', m.type);
        console.log('Caption:', m.caption);
        console.log('Mimetype:', m.mimetype);
        console.log('File size:', m.fileSize);

        // Process buffer
        // ...
    }
});
```

### Quoted/Reply Messages

```javascript
client.on('message', async (m) => {
    if (m.quoted) {
        console.log('Reply to:', m.quoted.body);
        console.log('Original sender:', m.quoted.pushName);

        // Download media from quoted message
        const hasQuotedMedia = m.quoted.message?.imageMessage || 
                              m.quoted.message?.videoMessage ||
                              m.quoted.message?.audioMessage;
        if (hasQuotedMedia) {
            const buffer = await m.quoted.download();
        }
    }
});
```

## Filtering Messages

### Ignore Own Messages

```javascript
client.on('message', async (m) => {
    // Ignore messages sent by bot
    if (m.fromMe) return;

    // Process other messages
    console.log('Message from user:', m.body);
});
```

### Group vs Private

```javascript
client.on('message', async (m) => {
    if (m.isGroup) {
        console.log('Group message');
        console.log('Group JID:', m.chat);
        console.log('Sender:', m.sender);
    } else {
        console.log('Private message');
        console.log('Sender JID:', m.sender);
    }
});
```

### Filter by Command

```javascript
client.on('message', async (m) => {
    // Skip if no text
    if (!m.body) return;

    // Get command
    const command = m.body.toLowerCase().trim();

    // Handle commands
    if (command === '!ping') {
        await m.reply('Pong!');
    }
    else if (command === '!help') {
        await m.reply('Available commands: !ping, !help');
    }
    else if (command.startsWith('!echo ')) {
        const text = m.body.slice(6);
        await m.reply(text);
    }
});
```

## Message Methods

### `m.reply(text)`

Quick reply to a message:

```javascript
await m.reply('This is a reply!');
```

Equivalent to:

```javascript
await client.sendText(m.from, 'This is a reply!', {
    quoted: m
});
```

### `m.download()`

Download media from message:

```javascript
if (m.hasMedia) {
    const buffer = await m.download();

    // buffer is a Node.js Buffer
    // Use it to save, process, or forward
}
```

### `m.react(emoji)`

React to a message:

```javascript
await m.react('👍');
await m.react('❤️');
await m.react('😂');
```

## Command Patterns

### Basic Command Handler

```javascript
const commands = {
    '!ping': async (client, m) => {
        await m.reply('Pong! 🏓');
    },

    '!time': async (client, m) => {
        const time = new Date().toLocaleString();
        await m.reply(`Current time: ${time}`);
    },

    '!whoami': async (client, m) => {
        await m.reply(`You are: ${m.pushName}\nNumber: ${m.from}`);
    }
};

client.on('message', async (m) => {
    if (m.fromMe) return;

    const handler = commands[m.body?.toLowerCase()];
    if (handler) {
        await handler(client, m);
    }
});
```

### Command with Arguments

```javascript
client.on('message', async (m) => {
    if (!m.body) return;

    // Parse command and args
    const [command, ...args] = m.body.split(' ');

    if (command === '!say') {
        if (args.length === 0) {
            await m.reply('Usage: !say <text>');
            return;
        }

        const text = args.join(' ');
        await m.reply(text);
    }

    if (command === '!calculate') {
        // !calculate 10 + 20
        try {
            const result = eval(args.join(' '));
            await m.reply(`Result: ${result}`);
        } catch (error) {
            await m.reply('Invalid calculation');
        }
    }
});
```

### Prefix-based Commands

```javascript
const PREFIX = '!';

client.on('message', async (m) => {
    // Check if message starts with prefix
    if (!m.body?.startsWith(PREFIX)) return;

    // Remove prefix
    const text = m.body.slice(PREFIX.length);
    const [command, ...args] = text.split(' ');

    switch (command.toLowerCase()) {
        case 'ping':
            await m.reply('Pong!');
            break;

        case 'help':
            await m.reply('Commands: !ping, !help, !echo <text>');
            break;

        case 'echo':
            await m.reply(args.join(' ') || 'No text provided');
            break;

        default:
            await m.reply('Unknown command. Type !help');
    }
});
```

## Media Handling

### Images

```javascript
client.on('message', async (m) => {
    // Check if message has image
    if (m.message?.imageMessage) {
        const buffer = await m.download();

        console.log('Image received');
        console.log('Caption:', m.message.imageMessage.caption);
        console.log('Size:', buffer.length);

        // Process image
        // await processImage(buffer);
    }
});
```

### Videos

```javascript
client.on('message', async (m) => {
    if (m.message?.videoMessage) {
        const buffer = await m.download();

        console.log('Video received');
        console.log('Duration:', m.message.videoMessage.seconds, 'seconds');

        // Process video
    }
});
```

### Audio/Voice Notes

```javascript
client.on('message', async (m) => {
    // Voice note
    if (m.message?.audioMessage?.ptt) {
        const buffer = await m.download();
        console.log('Voice note received');
    }

    // Regular audio
    if (m.message?.audioMessage && !m.message.audioMessage.ptt) {
        const buffer = await m.download();
        console.log('Audio file received');
    }
});
```

### Documents

```javascript
client.on('message', async (m) => {
    if (m.message?.documentMessage) {
        const buffer = await m.download();
        const doc = m.message.documentMessage;

        console.log('Document received');
        console.log('Filename:', doc.fileName);
        console.log('Mimetype:', doc.mimetype);
        console.log('Size:', doc.fileLength);

        // Save or process document
    }
});
```

### Stickers

```javascript
client.on('message', async (m) => {
    if (m.message?.stickerMessage) {
        const buffer = await m.download();

        console.log('Sticker received');

        // Convert sticker to image if needed
    }
});
```

## Group Message Handling

### Group Info

```javascript
client.on('message', async (m) => {
    if (m.isGroup) {
        // Get group metadata
        const groupMeta = await client.groupMetadata(m.chat);

        console.log('Group name:', groupMeta.subject);
        console.log('Participants:', groupMeta.participants.length);
        console.log('Sender:', m.sender);
    }
});
```

### Mention Detection

```javascript
client.on('message', async (m) => {
    if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
        const mentions = m.message.extendedTextMessage.contextInfo.mentionedJid;

        console.log('Mentioned users:', mentions);

        // Check if bot is mentioned
        const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net';
        if (mentions.includes(botJid)) {
            await m.reply('You mentioned me!');
        }
    }
});
```

### Admin-only Commands

```javascript
client.on('message', async (m) => {
    if (!m.isGroup) return;

    const command = m.body?.toLowerCase();

    // Commands that require admin
    if (['!kick', '!promote', '!demote'].includes(command)) {
        // Get group metadata
        const groupMeta = await client.groupMetadata(m.chat);

        // Check if sender is admin
        const senderIsAdmin = groupMeta.participants.some(
            p => p.id === m.sender && (p.admin === 'admin' || p.admin === 'superadmin')
        );

        if (!senderIsAdmin) {
            await m.reply('❌ Admin only command!');
            return;
        }

        // Process admin command
        // ...
    }
});
```

## Advanced Patterns

### Rate Limiting

```javascript
const cooldowns = new Map();
const COOLDOWN_TIME = 5000; // 5 seconds

client.on('message', async (m) => {
    // Check cooldown
    const now = Date.now();
    const lastUsed = cooldowns.get(m.from) || 0;

    if (now - lastUsed < COOLDOWN_TIME) {
        await m.reply('⏰ Please wait before using this command again');
        return;
    }

    // Update cooldown
    cooldowns.set(m.from, now);

    // Process message
    // ...
});
```

### Message Queue

```javascript
const messageQueue = [];
let processing = false;

client.on('message', async (m) => {
    // Add to queue
    messageQueue.push(m);

    // Process queue
    if (!processing) {
        processing = true;

        while (messageQueue.length > 0) {
            const message = messageQueue.shift();
            await processMessage(message);
        }

        processing = false;
    }
});

async function processMessage(m) {
    // Process message
    if (m.body === '!ping') {
        await m.reply('Pong!');
    }
}
```

### Conversation State

```javascript
const conversations = new Map();

client.on('message', async (m) => {
    const state = conversations.get(m.from) || { step: 0 };

    if (m.body === '!register') {
        conversations.set(m.from, { step: 1 });
        await m.reply('What is your name?');
        return;
    }

    if (state.step === 1) {
        state.name = m.body;
        state.step = 2;
        conversations.set(m.from, state);
        await m.reply(`Nice to meet you, ${m.body}! What is your age?`);
        return;
    }

    if (state.step === 2) {
        state.age = m.body;
        conversations.delete(m.from);
        await m.reply(`Registration complete!\nName: ${state.name}\nAge: ${state.age}`);
    }
});
```

### Middleware Pattern

```javascript
const middlewares = [];

// Add middleware
middlewares.push(async (m, next) => {
    // Log all messages
    console.log(`[${m.pushName}]: ${m.body}`);
    await next();
});

middlewares.push(async (m, next) => {
    // Ignore bot messages
    if (m.fromMe) return;
    await next();
});

middlewares.push(async (m, next) => {
    // Check spam
    if (isSpam(m.body)) {
        await m.reply('Spam detected!');
        return;
    }
    await next();
});

// Run middlewares
client.on('message', async (m) => {
    let index = 0;

    const next = async () => {
        if (index < middlewares.length) {
            const middleware = middlewares[index++];
            await middleware(m, next);
        } else {
            // Final handler
            await handleMessage(m);
        }
    };

    await next();
});

async function handleMessage(m) {
    // Your message handler
    if (m.body === '!ping') {
        await m.reply('Pong!');
    }
}
```

## Error Handling

### Try-Catch

```javascript
client.on('message', async (m) => {
    try {
        if (m.body === '!test') {
            await m.reply('Test successful!');
        }
    } catch (error) {
        console.error('Error handling message:', error);
        await m.reply('❌ An error occurred!').catch(() => {});
    }
});
```

### Global Error Handler

```javascript
client.on('message', async (m) => {
    await handleMessage(m).catch(async (error) => {
        console.error('Message handler error:', error);

        try {
            await m.reply('❌ Sorry, an error occurred while processing your message.');
        } catch (replyError) {
            console.error('Failed to send error message:', replyError);
        }
    });
});

async function handleMessage(m) {
    // Your message handling logic
}
```

## Best Practices

### 1. Always Check Message Content

```javascript
client.on('message', async (m) => {
    // ✅ Good: Check if body exists
    if (!m.body) return;

    // ❌ Bad: Assume body exists
    // const command = m.body.toLowerCase(); // May crash!
});
```

### 2. Ignore Bot Messages

```javascript
client.on('message', async (m) => {
    // ✅ Good: Ignore own messages
    if (m.fromMe) return;

    // Process user messages
});
```

### 3. Handle Errors Gracefully

```javascript
client.on('message', async (m) => {
    try {
        await processMessage(m);
    } catch (error) {
        console.error(error);
        await m.reply('Error occurred').catch(() => {});
    }
});
```

### 4. Use Async/Await

```javascript
// ✅ Good
client.on('message', async (m) => {
    await m.reply('Hello');
    await m.react('👍');
});

// ❌ Bad
client.on('message', (m) => {
    m.reply('Hello').then(() => {
        m.react('👍');
    });
});
```

### 5. Validate Input

```javascript
client.on('message', async (m) => {
    if (m.body === '!kick') {
        // ✅ Good: Validate context
        if (!m.isGroup) {
            await m.reply('This command only works in groups');
            return;
        }

        if (!m.quoted) {
            await m.reply('Reply to a message to kick user');
            return;
        }

        // Process kick
    }
});
```

## Next Steps

- [Learn to send messages](/guide/features/sending-messages)
- [Work with media](/guide/features/media)
- [Create stickers](/guide/features/stickers)
- [See examples](/examples/basic-bot)

## Questions?

- 💬 [Discussions](https://github.com/idlanyor/kachina-core/discussions)
- 📖 [API Reference](/api/client)
- 🐛 [Report Issues](https://github.com/idlanyor/kachina-core/issues)
