# Getting Started

Get up and running with Kachina-MD in minutes.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 16.0.0 or higher
- **npm**, **yarn**, or **pnpm** package manager
- A WhatsApp account (for bot authentication)

## Installation

Install Kachina-MD using your preferred package manager:

::: code-group

```bash [npm]
npm install @roidev/kachina-md
```

```bash [yarn]
yarn add @roidev/kachina-md
```

```bash [pnpm]
pnpm add @roidev/kachina-md
```

:::

## Your First Bot

Create a file named `bot.js`:

```javascript
import { Client } from '@roidev/kachina-md';

// Create a new client
const client = new Client({
    sessionId: 'my-first-bot'
});

// Listen for when the bot is ready
client.on('ready', (user) => {
    console.log('✅ Bot is ready!');
    console.log('Logged in as:', user.name);
});

// Listen for incoming messages
client.on('message', async (message) => {
    // Ignore messages from yourself
    if (message.fromMe) return;

    console.log('📩 New message:', message.body);

    // Respond to !ping command
    if (message.body === '!ping') {
        await client.sendText(message.from, 'Pong! 🏓');
    }

    // Respond to !hello command
    if (message.body === '!hello') {
        await client.sendText(
            message.from,
            `Hello, ${message.pushName}! 👋`
        );
    }
});

// Start the bot
client.start().catch(console.error);
```

## Running Your Bot

Run your bot with Node.js:

```bash
node bot.js
```

When you run your bot for the first time:

1. A QR code will appear in your terminal
2. Open WhatsApp on your phone
3. Go to **Settings** → **Linked Devices**
4. Tap **Link a Device**
5. Scan the QR code

::: tip
The session will be saved, so you won't need to scan the QR code again on subsequent runs!
:::

## Testing Your Bot

Once your bot is connected, send it a message:

```
!ping
```

You should receive a reply:

```
Pong! 🏓
```

Congratulations! 🎉 You've successfully created your first WhatsApp bot!

## Next Steps

Now that you have a basic bot running, you can:

- [Learn about authentication methods](/guide/authentication/overview) - QR Code vs Pairing Code
- [Explore message handling](/guide/core/messages) - Handle different message types
- [Send media messages](/guide/features/media) - Images, videos, audio, and more
- [Create stickers](/guide/features/stickers) - Built-in sticker creation
- [Manage groups](/guide/features/groups) - Group administration features
- [Build plugins](/guide/core/plugins) - Extend your bot with plugins

## Common Patterns

### Command Handler

```javascript
const commands = {
    '!ping': async (client, message) => {
        await client.sendText(message.from, 'Pong! 🏓');
    },

    '!help': async (client, message) => {
        await client.sendText(
            message.from,
            'Available commands:\n!ping - Check bot status\n!help - Show this message'
        );
    },

    '!time': async (client, message) => {
        const time = new Date().toLocaleString();
        await client.sendText(message.from, `Current time: ${time}`);
    }
};

client.on('message', async (message) => {
    const handler = commands[message.body];
    if (handler) {
        await handler(client, message);
    }
});
```

### Environment Variables

It's good practice to use environment variables:

```javascript
import { Client } from '@roidev/kachina-md';
import 'dotenv/config'; // npm install dotenv

const client = new Client({
    sessionId: process.env.SESSION_ID || 'my-bot',
    loginMethod: process.env.LOGIN_METHOD || 'qr'
});
```

Create a `.env` file:

```env
SESSION_ID=my-production-bot
LOGIN_METHOD=qr
```

### Error Handling

Always handle errors gracefully:

```javascript
client.on('message', async (message) => {
    try {
        if (message.body === '!ping') {
            await client.sendText(message.from, 'Pong!');
        }
    } catch (error) {
        console.error('Error handling message:', error);
        await client.sendText(
            message.from,
            'Sorry, an error occurred!'
        );
    }
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
});
```

## Project Structure

Here's a recommended project structure:

```bash
my-whatsapp-bot/
├── node_modules/
├── sessions/           # Bot sessions stored here
├── src/
│   ├── commands/      # Command handlers
│   ├── handlers/      # Event handlers
│   ├── utils/         # Utility functions
│   └── index.js       # Main bot file
├── .env               # Environment variables
├── .gitignore
├── package.json
└── README.md
```

Example `.gitignore`:

```gitignore
node_modules/
sessions/
.env
*.log
```

## Troubleshooting

### QR Code Not Showing

If the QR code doesn't appear:

1. Make sure your terminal supports unicode
2. Try using a different terminal
3. Use pairing code method instead (see [Pairing Code Guide](/guide/authentication/pairing-code))

### Connection Issues

If you're having connection issues:

1. Check your internet connection
2. Make sure WhatsApp is working on your phone
3. Try clearing the session folder and reconnecting
4. Check if port 443 is accessible (WhatsApp uses this port)

### Session Errors

If you get session-related errors:

```bash
# Clear the session and start fresh
rm -rf ./my-first-bot
node bot.js
```

## Getting Help

If you're stuck:

- 📖 Check the [API Reference](/api/client)
- 💬 [Open a discussion](https://github.com/idlanyor/kachina-core/discussions)
- 🐛 [Report a bug](https://github.com/idlanyor/kachina-core/issues)
- 📚 Browse [examples](/examples/basic-bot)

## What's Next?

Ready to dive deeper? Check out these guides:

- [Authentication Methods](/guide/authentication/overview) - Learn about QR and Pairing methods
- [Core Concepts](/guide/core/client) - Understand how Kachina-MD works
- [Sending Messages](/guide/features/sending-messages) - Send different types of messages
- [Examples](/examples/basic-bot) - See real-world examples

Happy coding! 🚀
