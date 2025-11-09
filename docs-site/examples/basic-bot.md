# Basic Bot Example

A simple WhatsApp bot that responds to basic commands.

## Code

```javascript
import { Client } from '@roidev/kachina-md';

// Create client
const client = new Client({
    sessionId: 'basic-bot',
    prefix: '!'
});

// Ready event
client.on('ready', (user) => {
    console.log('🤖 Bot is online!');
    console.log('Name:', user.name);
    console.log('Number:', user.id.split(':')[0]);
    console.log('\nAvailable commands:');
    console.log('  !ping - Check bot status');
    console.log('  !hello - Greeting');
    console.log('  !time - Current time');
    console.log('  !echo <text> - Echo message');
    console.log('  !sticker - Convert image to sticker');
});

// Message handler
client.on('message', async (m) => {
    // Ignore own messages
    if (m.fromMe) return;

    const command = m.body?.toLowerCase();

    // Command: ping
    if (command === '!ping') {
        await client.sendText(m.from, 'Pong! 🏓\nBot is running!');
    }

    // Command: hello
    if (command === '!hello') {
        await client.sendText(
            m.from,
            `Hello, ${m.pushName}! 👋\nNice to meet you!`
        );
    }

    // Command: time
    if (command === '!time') {
        const time = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Jakarta',
            dateStyle: 'full',
            timeStyle: 'long'
        });
        await client.sendText(m.from, `🕐 Current time:\n${time}`);
    }

    // Command: echo
    if (command?.startsWith('!echo ')) {
        const text = m.body.slice(6);
        if (text) {
            await client.sendText(m.from, text);
        } else {
            await client.sendText(m.from, 'Usage: !echo <text>');
        }
    }

    // Command: sticker
    if (command === '!sticker') {
        if (!m.quoted || !m.quoted.hasMedia) {
            await client.sendText(
                m.from,
                '❌ Reply to an image with !sticker'
            );
            return;
        }

        try {
            // Download media
            const media = await m.quoted.download();

            // Send react while processing
            await client.sendReact(m.from, m.key, '⏳');

            // Create and send sticker
            await client.sendSticker(m.from, media, {
                pack: 'Basic Bot',
                author: 'Kachina-MD'
            });

            // Success react
            await client.sendReact(m.from, m.key, '✅');
        } catch (error) {
            await client.sendText(m.from, '❌ Failed to create sticker');
            await client.sendReact(m.from, m.key, '❌');
        }
    }

    // Command: help
    if (command === '!help' || command === '!menu') {
        const menu = `
📖 *Basic Bot Menu*

*Commands:*
!ping - Check bot status
!hello - Get a greeting
!time - Show current time
!echo <text> - Echo your text
!sticker - Reply to image to make sticker
!help - Show this menu

*Info:*
Prefix: ${client.prefix}
Bot: Basic Example Bot
Framework: Kachina-MD
        `.trim();

        await client.sendText(m.from, menu);
    }
});

// Error handlers
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

// Start
console.log('🚀 Starting Basic Bot...\n');
client.start().catch(console.error);
```

## Features

This basic bot demonstrates:

- ✅ Text message handling
- ✅ Command processing
- ✅ Reactions
- ✅ Sticker creation
- ✅ Quoted message handling
- ✅ Error handling

## Running

1. Create a file `bot.js` with the code above
2. Run: `node bot.js`
3. Scan the QR code
4. Send `!help` to see available commands

## Try It Out

Send these commands to your bot:

```
!ping
!hello
!time
!echo Hello World
!help
```

To create a sticker:
1. Send an image to the bot
2. Reply to the image with `!sticker`

## Customization

### Change Prefix

```javascript
const client = new Client({
    prefix: '/' // Use / instead of !
});

// Now commands are: /ping, /hello, etc.
```

### Add More Commands

```javascript
client.on('message', async (m) => {
    const command = m.body?.toLowerCase();

    if (command === '!mycommand') {
        await client.sendText(m.from, 'My custom response!');
    }
});
```

### Add Response Delay

```javascript
if (command === '!slow') {
    await client.sendText(m.from, 'Processing...');

    // Wait 2 seconds
    await new Promise(r => setTimeout(r, 2000));

    await client.sendText(m.from, 'Done!');
}
```

## Next Steps

- Add [more features](/guide/features/sending-messages)
- Implement [plugins](/guide/core/plugins)
- Try [pairing mode](/examples/pairing-bot)
- Build a [group manager](/examples/group-management)

## Full Example

The complete code is available in the repository:
[examples/basic-bot.js](https://github.com/idlanyor/kachina-core/blob/main/examples/basic-bot.js)
