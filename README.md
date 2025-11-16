# @roidev/kachina-md

WhatsApp Bot Framework - Simple, Fast, and Modular

[![npm version](https://img.shields.io/npm/v/@roidev/kachina-md.svg)](https://www.npmjs.com/package/@roidev/kachina-md)
[![License](https://img.shields.io/npm/l/@roidev/kachina-md.svg)](https://github.com/your-username/kachina-core/blob/main/LICENSE)
[![Documentation](https://img.shields.io/badge/docs-kachina--core-blue)](https://kachina-core.antidonasi.web.id/)

## 📖 Documentation

Complete documentation is available at [https://kachina-core.antidonasi.web.id/](https://kachina-core.antidonasi.web.id/)

- 🚀 [Getting Started](https://kachina-core.antidonasi.web.id/guide/getting-started)
- 📘 [API Reference](https://kachina-core.antidonasi.web.id/api/client)
- 💡 [Examples](https://kachina-core.antidonasi.web.id/examples/basic-bot)
- 🔐 [Authentication Guide](https://kachina-core.antidonasi.web.id/guide/authentication/overview)

## 🚀 Features

- ✨ Simple and clean API
- 🔌 Plugin system with auto-loading
- 📦 Built-in database (LowDB)
- 🎯 Event-driven architecture
- 📱 Dual login method (QR Code & Pairing Code)
- 🛠️ Rich helper utilities
- 📝 TypeScript-ready
- 🔄 Auto-reconnect
- 💾 Message serialization

## 📦 Installation

```bash
npm install @roidev/kachina-md
```

## 🎯 Quick Start

### Basic Usage

```javascript
import { Client } from '@roidev/kachina-md';

const bot = new Client({
    sessionId: 'my-session',
    prefix: '!',
    owners: ['628xxx'] // Bot owner phone numbers
});

bot.on('ready', (user) => {
    console.log('Bot is ready!', user.id);
});

bot.on('message', async (m) => {
    if (m.body === '!ping') {
        await m.reply('Pong! 🏓');
    }
});

await bot.start();
```

### With Plugins

```javascript
import { Client } from '@roidev/kachina-md';
import path from 'path';

const bot = new Client({
    sessionId: 'my-session',
    prefix: '!',
    owner: ['628xxx']
});

// Load plugins from directory
await bot.loadPlugins(path.join(process.cwd(), 'plugins'));

await bot.start();
```

## 🔌 Plugin System

### Creating a Plugin

Create a file in `plugins/` directory:

```javascript
// plugins/hello.js

export default {
    name: 'hello',
    commands: ['hello', 'hi'],
    category: 'fun',
    description: 'Say hello',

    async exec({ m, args }) {
        await m.reply(`Hello ${m.pushName}! 👋`);
    }
};
```

### Plugin Structure

```javascript
export default {
    // Plugin metadata
    name: 'plugin-name',           // Required
    commands: ['cmd1', 'cmd2'],    // Command aliases
    category: 'category',          // Plugin category
    description: 'Description',    // Help text

    // Plugin flags
    owner: false,      // Owner only
    group: false,      // Group only
    private: false,    // Private chat only
    admin: false,      // Group admin only
    botAdmin: false,   // Bot must be admin

    // Execution function
    async exec({ client, m, args, command, prefix, sock }) {
        // Your code here
    }
};
```

### Plugin Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `client` | Client | Bot client instance |
| `m` | Message | Serialized message object |
| `args` | Array | Command arguments |
| `command` | String | Command name used |
| `prefix` | String | Command prefix |
| `sock` | Socket | Baileys socket |

## 📝 Message Object

The serialized message object (`m`) includes:

### Properties

```javascript
m.key           // Message key
m.chat          // Chat ID (remoteJid)
m.sender        // Sender ID
m.pushName      // Sender push name
m.body          // Message text
m.type          // Message type
m.isGroup       // Is from group
m.fromMe        // Is from bot
m.quoted        // Quoted message (if any)
m.mentions      // Mentioned JIDs
m.caption       // Media caption
m.mimetype      // Media mime type
m.fileSize      // Media file size
```

### Methods

```javascript
// Reply to message
await m.reply('Text')

// React to message
await m.react('👍')

// Download media
const buffer = await m.download()

// Delete message
await m.delete()

// Forward message
await m.forward(jid)
```

## 🛠️ Client API

### Methods

```javascript
// Send messages
await bot.sendText(jid, 'Hello')

// Send media
await bot.sendImage(jid, buffer, 'Caption', { /* options */ })
await bot.sendVideo(jid, buffer, 'Caption', { /* options */ })
await bot.sendAudio(jid, buffer, { mimetype: 'audio/mp4', ptt: false })
await bot.sendDocument(jid, buffer, 'file.pdf', 'application/pdf')
await bot.sendSticker(jid, buffer, { pack: 'Pack', author: 'Author' })

// View once messages
await bot.readViewOnce(quotedMessage)  // Returns { buffer, type, caption, mimetype?, ptt? }
await bot.sendViewOnce(jid, quotedMessage)  // Read and send view once

// Send other content
await bot.sendContact(jid, [{ displayName: 'John', vcard: '...' }])
await bot.sendLocation(jid, latitude, longitude)
await bot.sendPoll(jid, 'Question?', ['Option 1', 'Option 2'])
await bot.sendReact(jid, messageKey, '👍')

// Group methods
await bot.groupMetadata(jid)
await bot.groupParticipantsUpdate(jid, [participant], 'add|remove|promote|demote')
await bot.groupUpdateSubject(jid, 'New Subject')
await bot.groupUpdateDescription(jid, 'New Description')

// Plugin methods
await bot.loadPlugin('./plugins/my-plugin.js')
await bot.loadPlugins('./plugins')
```

### Events

```javascript
bot.on('ready', (user) => {
    // Bot is ready
})

bot.on('message', async (m) => {
    // New message
})

bot.on('group.update', (update) => {
    // Group participants update
})

bot.on('pairing.code', (code) => {
    // Pairing code (when using pairing method)
})

bot.on('reconnecting', () => {
    // Reconnecting
})

bot.on('logout', () => {
    // Bot logged out
})
```

## 💾 Database

```javascript
import { Database } from '@roidev/kachina-md';

const db = new Database({ path: './database' });

// Basic operations
await db.set('users', 'user123', { name: 'John', balance: 100 })
await db.get('users', 'user123')
await db.has('users', 'user123')
await db.delete('users', 'user123')
await db.all('users')

// Advanced operations
await db.update('users', 'user123', { balance: 200 })
await db.increment('users', 'user123', 'balance', 50)
await db.push('users', 'user123.items', 'item1')
```

## 🔧 Helpers

```javascript
import {
    formatTime,
    formatBytes,
    parseCommand,
    isUrl,
    extractUrls,
    randomString,
    randomNumber,
    pickRandom,
    chunk,
    sleep,
    createSticker,
    createFullSticker,
    createCroppedSticker,
    createCircleSticker,
    createRoundedSticker,
    StickerTypes,
    Logger,
    Database
} from '@roidev/kachina-md';

// Format utilities
formatTime(3600)           // "1h 0m 0s"
formatBytes(1024)          // "1 KB"

// String utilities
parseCommand('!ping test')  // { command: 'ping', args: ['test'], text: 'test' }
isUrl('https://...')       // true
extractUrls(text)          // Array of URLs

// Random utilities
randomString(10)           // Random string
randomNumber(1, 100)       // Random number
pickRandom([1,2,3])       // Random item from array
chunk([1,2,3,4], 2)       // [[1,2], [3,4]]
sleep(1000)               // Sleep for 1 second (returns Promise)

// Logger utility
const logger = new Logger({ prefix: 'MyBot', level: 'info' });
logger.info('Bot started');
logger.success('Connected');
logger.warn('Warning message');
logger.error('Error occurred');
logger.debug('Debug info');
logger.command('!ping', 'User@s.whatsapp.net');

// Sticker utilities
const stickerBuffer = await createSticker(imageBuffer, {
    pack: 'My Pack',
    author: 'My Name',
    type: StickerTypes.FULL,
    quality: 50
})

// Sticker type shortcuts
await createFullSticker(buffer, options)      // Full size
await createCroppedSticker(buffer, options)   // Cropped
await createCircleSticker(buffer, options)    // Circle
await createRoundedSticker(buffer, options)   // Rounded
```

## 📚 Examples

### Example 1: Simple Command

```javascript
export default {
    name: 'dice',
    commands: ['dice', 'roll'],
    category: 'fun',
    description: 'Roll a dice',

    async exec({ m }) {
        const result = Math.floor(Math.random() * 6) + 1;
        await m.reply(`🎲 You rolled: ${result}`);
    }
};
```

### Example 2: With Arguments

```javascript
export default {
    name: 'say',
    commands: ['say', 'echo'],
    category: 'fun',
    description: 'Repeat your message',

    async exec({ m, args }) {
        if (args.length === 0) {
            return await m.reply('⚠️ Provide text to repeat!');
        }

        await m.reply(args.join(' '));
    }
};
```

### Example 3: Owner Only

```javascript
export default {
    name: 'broadcast',
    commands: ['bc', 'broadcast'],
    category: 'owner',
    description: 'Broadcast message',
    owner: true,

    async exec({ client, m, args }) {
        const text = args.join(' ');
        const chats = await client.sock.getChats();

        for (const chat of chats) {
            await client.sendText(chat.id, text);
        }

        await m.reply(`✅ Broadcasted to ${chats.length} chats`);
    }
};
```

### Example 4: Group Only

```javascript
export default {
    name: 'tagall',
    commands: ['tagall', 'everyone'],
    category: 'group',
    description: 'Mention all members',
    group: true,
    admin: true,

    async exec({ client, m }) {
        const metadata = await client.groupMetadata(m.chat);
        const participants = metadata.participants.map(p => p.id);

        const text = '📢 Attention everyone!\n\n' +
            participants.map(p => `@${p.split('@')[0]}`).join('\n');

        await client.sendMessage(m.chat, {
            text,
            mentions: participants
        });
    }
};
```

### Example 5: With Database

```javascript
import { Database } from '@roidev/kachina-md';
const db = new Database();

export default {
    name: 'balance',
    commands: ['balance', 'bal'],
    category: 'economy',
    description: 'Check your balance',

    async exec({ m }) {
        const userId = m.sender;
        const user = await db.get('users', userId, { balance: 0 });

        await m.reply(`💰 Your balance: $${user.balance}`);
    }
};
```

## 🔐 Configuration

```javascript
const bot = new Client({
    // Session
    sessionId: 'my-session',        // Session folder name (default: 'kachina-session')
    phoneNumber: '628xxx',          // For pairing code (format: 628123456789)

    // Login
    loginMethod: 'qr',              // 'qr' or 'pairing' (default: 'qr')

    // Bot config
    prefix: '!',                    // Command prefix (default: '!')
    owners: ['628xxx', '628yyy'],   // Owner numbers (array format)

    // Advanced
    browser: ['Bot', 'Chrome', '1.0.0'],  // Browser metadata
    logger: pino({ level: 'silent' }),    // Pino logger instance
    store: null                      // Optional message store
});
```

## 📦 Project Structure

```
my-bot/
├── plugins/
│   ├── ping.js
│   ├── help.js
│   └── ...
├── database/
│   ├── users.json
│   └── groups.json
├── my-session/
│   └── creds.json
├── index.js
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © Roynaldi

## 🔗 Links

- 📖 [Documentation](https://kachina-core.antidonasi.web.id/) - Complete documentation
- 📦 [NPM Package](https://www.npmjs.com/package/@roidev/kachina-md) - Install via NPM
- 💻 [GitHub](https://github.com/idlanyor/kachina-core) - Source code
- 🔧 [Baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API

## ⚠️ Disclaimer

This project is not affiliated with WhatsApp. Use at your own risk. Do not spam or violate WhatsApp Terms of Service.

---

Made with ❤️ by Roynaldi
