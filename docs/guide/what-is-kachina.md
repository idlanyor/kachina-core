# What is Kachina-MD?

Kachina-MD is a modern, easy-to-use WhatsApp bot framework built on top of [Baileys](https://github.com/WhiskeySockets/Baileys), designed to make creating WhatsApp bots simple and enjoyable.

## Overview

Kachina-MD provides a high-level, developer-friendly API that abstracts the complexities of WhatsApp's protocol, allowing you to focus on building features rather than dealing with low-level implementation details.

```javascript
import { Client } from '@roidev/kachina-md';

const client = new Client({ sessionId: 'my-bot' });

client.on('message', async (message) => {
    if (message.body === '!ping') {
        await client.sendText(message.from, 'Pong!');
    }
});

await client.start();
```

That's it! You have a working WhatsApp bot.

## Why Kachina-MD?

### 🎯 Simple & Intuitive

Built with developer experience in mind. The API is clean, consistent, and easy to learn.

```javascript
// Send different types of messages
await client.sendText(jid, 'Hello!');
await client.sendImage(jid, buffer, 'Caption');
await client.sendSticker(jid, buffer);
await client.sendPoll(jid, 'Favorite color?', ['Red', 'Blue', 'Green']);
```

### 🚀 Fast & Efficient

Optimized for performance with minimal overhead. Handle thousands of messages efficiently.

### 🔌 Extensible

Powerful plugin system allows you to extend functionality without modifying core code.

```javascript
// Load plugins
await client.loadPlugins('./plugins');

// Plugins automatically handle commands
// plugins/ping.js handles !ping command
```

### 🔐 Flexible Authentication

Choose between QR Code scanning or Pairing Code entry - perfect for any deployment scenario.

```javascript
// QR Code (default) - great for local development
const client = new Client({ loginMethod: 'qr' });

// Pairing Code - perfect for headless servers
const client = new Client({
    loginMethod: 'pairing',
    phoneNumber: '628123456789'
});
```

### 📦 Feature-Rich

Everything you need to build powerful WhatsApp bots:

- ✅ **All message types** - Text, images, videos, audio, documents, stickers
- ✅ **Reactions** - React to messages with emojis
- ✅ **Polls** - Create interactive polls
- ✅ **Groups** - Complete group management
- ✅ **View Once** - Read and download view once messages
- ✅ **Stickers** - Built-in sticker creation
- ✅ **Media** - Download and process media
- ✅ **Events** - Rich event system for all WhatsApp events

### 🐳 Production Ready

Deploy with confidence:

- ✅ **Docker support** - Containerized deployment
- ✅ **Auto-reconnect** - Handles connection drops automatically
- ✅ **Error recovery** - Graceful error handling
- ✅ **Session persistence** - Save and restore sessions
- ✅ **TypeScript** - Full type definitions included

## How It Works

Kachina-MD is built on top of Baileys, the most popular WhatsApp Web API library for Node.js. It provides:

1. **High-level API** - Simple methods for common tasks
2. **Event system** - React to WhatsApp events easily
3. **Session management** - Automatic session handling
4. **Plugin system** - Modular, reusable commands
5. **Helper functions** - Utilities for common operations

### Architecture

```
┌─────────────────────────────────────┐
│         Your Bot Code               │
├─────────────────────────────────────┤
│         Kachina-MD API              │
│   (Client, Helpers, Plugins)        │
├─────────────────────────────────────┤
│         Baileys Library             │
│    (WhatsApp Web Protocol)          │
├─────────────────────────────────────┤
│      WhatsApp Web Socket            │
└─────────────────────────────────────┘
```

## Use Cases

Kachina-MD is perfect for:

### 📢 **Business Automation**
- Customer support bots
- Order management systems
- Notification systems
- Broadcast messages

### 🎮 **Community Bots**
- Group management bots
- Game bots
- Quiz bots
- Moderation bots

### 🛠️ **Utility Bots**
- Reminder bots
- Weather bots
- News bots
- Translation bots

### 📊 **Data Collection**
- Survey bots
- Feedback collection
- Form submissions
- Analytics tracking

## Key Features

### Message Handling

```javascript
client.on('message', async (m) => {
    console.log('From:', m.pushName);
    console.log('Body:', m.body);
    console.log('Is Group:', m.isGroup);

    // Handle different message types
    if (m.hasMedia) {
        const buffer = await m.download();
        // Process media
    }

    // Reply to message
    await m.reply('Got your message!');
});
```

### Sticker Creation

```javascript
// Create sticker from image
await client.sendSticker(jid, imageBuffer, {
    pack: 'My Stickers',
    author: 'Bot',
    type: Client.StickerTypes.CIRCLE
});
```

### View Once Reader

```javascript
// Read view once messages
const { buffer, type, caption } = await client.readViewOnce(m.quoted);

// Send to another chat
await client.sendViewOnce(anotherJid, m.quoted);
```

### Group Management

```javascript
// Get group info
const metadata = await client.groupMetadata(groupJid);

// Add/remove participants
await client.groupParticipantsUpdate(groupJid, [jid], 'add');

// Update group name
await client.groupUpdateSubject(groupJid, 'New Group Name');
```

### Plugin System

Create reusable commands:

```javascript
// plugins/weather.js
export const handler = {
    command: ['weather', 'cuaca'],
    category: 'utility',
    help: 'Get weather information',
    exec: async ({ client, m }) => {
        const weather = await getWeather(m.args[0]);
        await client.sendText(m.from, weather);
    }
};
```

## Comparison

### vs Raw Baileys

| Feature | Kachina-MD | Raw Baileys |
|---------|-----------|-------------|
| Learning Curve | Easy ⭐ | Steep ⭐⭐⭐ |
| Code Verbosity | Minimal | High |
| Plugin System | ✅ Built-in | ❌ Manual |
| Helper Functions | ✅ Included | ❌ Build yourself |
| Documentation | ✅ Extensive | Limited |
| Examples | ✅ Many | Few |

### Kachina-MD Code

```javascript
const client = new Client({ sessionId: 'bot' });

client.on('message', async (m) => {
    if (m.body === '!ping') {
        await client.sendText(m.from, 'Pong!');
    }
});

await client.start();
```

### Raw Baileys Code

```javascript
const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ auth: state });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;

        const text = m.message.conversation ||
                    m.message.extendedTextMessage?.text;

        if (text === '!ping') {
            await sock.sendMessage(m.key.remoteJid, {
                text: 'Pong!'
            });
        }
    });
}
```

Much simpler with Kachina-MD! 🎉

## Philosophy

Kachina-MD is built on these principles:

1. **Simplicity** - Easy to learn, easy to use
2. **Flexibility** - Adapt to any use case
3. **Reliability** - Production-ready with error handling
4. **Modularity** - Plugin system for extensibility
5. **Developer Experience** - Great DX with clear docs

## Browser Support

Kachina-MD works with Node.js. Supported versions:

- ✅ Node.js 16.x
- ✅ Node.js 18.x (recommended)
- ✅ Node.js 20.x
- ✅ Node.js 22.x

## What's Included?

When you install Kachina-MD, you get:

```
@roidev/kachina-md
├── Client class          # Main bot interface
├── Message utilities     # Message serialization & utilities
├── Sticker utilities     # Sticker creation
├── Type definitions      # Full TypeScript support
└── Examples              # Working code examples
```

## Community & Support

- 🌟 [GitHub Repository](https://github.com/idlanyor/kachina-core)
- 📦 [NPM Package](https://www.npmjs.com/package/@roidev/kachina-md)
- 💬 [Discussions](https://github.com/idlanyor/kachina-core/discussions)
- 🐛 [Issue Tracker](https://github.com/idlanyor/kachina-core/issues)
- 📖 [Documentation](https://idlanyor.github.io/kachina-core/)

## License

Kachina-MD is [MIT licensed](https://github.com/idlanyor/kachina-core/blob/main/LICENSE), meaning you can use it for free in both personal and commercial projects.

## Ready to Start?

Jump right in with our [Getting Started Guide](/guide/getting-started) and build your first WhatsApp bot in minutes!

<div style="text-align: center; margin: 2rem 0;">
  <a href="/guide/getting-started" style="display: inline-block; padding: 12px 24px; background: #25D366; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
    Get Started →
  </a>
</div>
