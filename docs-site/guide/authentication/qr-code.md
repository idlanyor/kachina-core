# QR Code Authentication

The QR code method is the default and easiest way to authenticate your bot with WhatsApp. Simply scan a QR code with your phone to connect.

## Quick Start

```javascript
import { Client } from '@roidev/kachina-md';

const client = new Client({
    sessionId: 'my-bot'
    // loginMethod: 'qr' is default, can be omitted
});

await client.start();
// QR code will appear in your terminal
```

That's it! A QR code will be displayed in your terminal.

## How It Works

1. **Start your bot** - Run your Node.js script
2. **QR appears** - A QR code is printed to the terminal
3. **Open WhatsApp** - On your phone
4. **Scan QR** - Go to Settings → Linked Devices → Link a Device
5. **Connected!** - Bot authenticates and starts running

## Configuration

### Basic Setup

```javascript
import { Client } from '@roidev/kachina-md';

const client = new Client({
    sessionId: 'qr-bot'
});

client.on('ready', (user) => {
    console.log('✅ Connected!');
    console.log('Name:', user.name);
    console.log('Number:', user.id.split(':')[0]);
});

await client.start();
```

### Explicit QR Mode

```javascript
const client = new Client({
    loginMethod: 'qr', // Explicitly set QR mode
    sessionId: 'my-bot'
});
```

### Full Configuration

```javascript
const client = new Client({
    loginMethod: 'qr',
    sessionId: 'production-bot',
    browser: ['MyBot', 'Chrome', '1.0.0'],
    logger: pino({ level: 'silent' })
});
```

## Step-by-Step Guide

### 1. Create Your Bot

```javascript
// bot.js
import { Client } from '@roidev/kachina-md';

const client = new Client({
    sessionId: 'my-whatsapp-bot'
});

client.on('ready', (user) => {
    console.log('🤖 Bot is online!');
    console.log('Logged in as:', user.name);
});

client.on('message', async (m) => {
    if (m.body === '!ping') {
        await client.sendText(m.from, 'Pong!');
    }
});

client.start().catch(console.error);
```

### 2. Run Your Bot

```bash
node bot.js
```

### 3. Scan the QR Code

You'll see output like this:

```
🚀 Starting bot...

█▀▀▀▀▀█ ▀▀█▄ ▄▀▀█▄  █▀▀▀▀▀█
█ ███ █ ▀▄ █▀▄█ █▄▀ █ ███ █
█ ▀▀▀ █ █▀█▀█▀  ▀█▀ █ ▀▀▀ █
▀▀▀▀▀▀▀ █▄▀ █ ▀ ▀ █ ▀▀▀▀▀▀▀
▀ ▀▀█▀▀▀▄█▄▀▀▀▄▀▀█▀▄█▀▀█▀▄▀
█▄█▀▄▀▀▀█▀▀▄▀▄ ▄▀▀▀▀▀▄█  ▀█
...

Scan this QR code with WhatsApp
```

### 4. Open WhatsApp

On your phone:
1. Open **WhatsApp**
2. Tap **Settings** (⚙️)
3. Tap **Linked Devices**
4. Tap **Link a Device**
5. Point your camera at the QR code

### 5. Done!

Once scanned, you'll see:

```
✅ Connected!
Name: John Doe
Number: 628123456789
```

## Connection Events

Handle connection lifecycle:

```javascript
// When connecting
client.on('connecting', () => {
    console.log('⏳ Connecting to WhatsApp...');
});

// When connected and ready
client.on('ready', (user) => {
    console.log('✅ Bot is ready!');
    console.log('User:', user);
});

// When reconnecting after connection drop
client.on('reconnecting', () => {
    console.log('🔄 Reconnecting...');
});

// When logged out
client.on('logout', () => {
    console.log('👋 Logged out');
});
```

## Session Persistence

The first time you connect, a session is saved. On subsequent runs, the bot automatically reconnects without needing to scan again.

### Session Location

Sessions are saved in the `sessionId` folder:

```
your-project/
└── my-whatsapp-bot/     # Your sessionId
    ├── creds.json       # Authentication credentials
    └── keys/            # Encryption keys
        └── ...
```

### Auto-Reconnect

```javascript
const client = new Client({ sessionId: 'my-bot' });

// First run: Shows QR, you scan
await client.start();

// Second run: No QR needed, auto-connects
await client.start();
```

### Clear Session

To re-authenticate (logout and start fresh):

```bash
# Remove session folder
rm -rf ./my-whatsapp-bot

# Run bot again - will show QR
node bot.js
```

Or in code:

```javascript
import fs from 'fs';

// Clear session programmatically
if (fs.existsSync('./my-bot')) {
    fs.rmSync('./my-bot', { recursive: true });
}

// Start fresh
await client.start();
```

## Advanced Usage

### Custom QR Display

By default, QR is printed to terminal. You can disable this:

```javascript
const client = new Client({
    sessionId: 'my-bot',
    printQRInTerminal: false
});

// Handle QR yourself
client.sock.ev.on('connection.update', ({ qr }) => {
    if (qr) {
        // Do something with QR
        console.log('QR code data:', qr);

        // Generate QR image, send to web dashboard, etc.
    }
});
```

### Generate QR Image

```javascript
import QRCode from 'qrcode';

const client = new Client({
    sessionId: 'my-bot',
    printQRInTerminal: false
});

client.sock.ev.on('connection.update', async ({ qr }) => {
    if (qr) {
        // Generate QR image
        const qrImage = await QRCode.toDataURL(qr);

        // Save to file
        const base64Data = qrImage.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync('qr.png', base64Data, 'base64');

        console.log('QR code saved to qr.png');
    }
});

await client.start();
```

### Web Dashboard QR

Display QR on web page:

```javascript
import express from 'express';
import QRCode from 'qrcode';

const app = express();
let currentQR = null;

const client = new Client({
    sessionId: 'my-bot',
    printQRInTerminal: false
});

client.sock.ev.on('connection.update', async ({ qr }) => {
    if (qr) {
        currentQR = await QRCode.toDataURL(qr);
    }
});

app.get('/qr', (req, res) => {
    if (!currentQR) {
        return res.send('No QR available - already connected or waiting');
    }

    res.send(`
        <html>
            <body>
                <h1>Scan QR to Connect Bot</h1>
                <img src="${currentQR}" />
            </body>
        </html>
    `);
});

app.listen(3000, () => {
    console.log('QR available at http://localhost:3000/qr');
});

client.start();
```

## Multiple Sessions

Run multiple bots with different sessions:

```javascript
// Bot 1
const bot1 = new Client({ sessionId: 'bot-1' });
await bot1.start();

// Bot 2
const bot2 = new Client({ sessionId: 'bot-2' });
await bot2.start();

// Each has its own QR and session
```

## Environment Variables

Use environment variables for flexibility:

```javascript
import 'dotenv/config';

const client = new Client({
    sessionId: process.env.SESSION_ID || 'default-bot',
    browser: [
        process.env.BOT_NAME || 'MyBot',
        'Chrome',
        '1.0.0'
    ]
});
```

`.env` file:

```env
SESSION_ID=production-bot
BOT_NAME=Customer Support Bot
```

## Troubleshooting

### QR Code Not Showing

**Problem:** Terminal doesn't display QR

**Solutions:**

1. **Check terminal supports unicode**
   ```bash
   # Try a different terminal
   # Windows: Use Windows Terminal or PowerShell
   # Mac: Use Terminal.app or iTerm2
   # Linux: Use GNOME Terminal or Konsole
   ```

2. **Resize terminal window**
   - Make terminal window larger
   - QR might be too small to render

3. **Use QR image instead**
   ```javascript
   import QRCode from 'qrcode';

   client.sock.ev.on('connection.update', async ({ qr }) => {
       if (qr) {
           await QRCode.toFile('qr.png', qr);
           console.log('QR saved to qr.png');
       }
   });
   ```

4. **Switch to pairing method**
   - Use [pairing code](/guide/authentication/pairing-code) instead

### QR Expired

**Problem:** QR code expired before scanning

**Solutions:**

1. **Scan faster** - QR expires in ~20 seconds
2. **Restart bot** - New QR will appear
3. **Use pairing method** - 60 second timeout

### Connection Failed

**Problem:** Scanned QR but connection failed

**Solutions:**

1. **Check internet** - Both bot and phone need internet
2. **Check WhatsApp** - Make sure WhatsApp works on your phone
3. **Clear session** - Delete session folder and retry
4. **Check firewall** - Allow port 443 (WhatsApp uses this)

### Session Corrupted

**Problem:** Error loading session

**Solution:**

```bash
# Clear corrupted session
rm -rf ./session-name

# Restart bot
node bot.js
```

### Multiple QR Codes

**Problem:** QR keeps regenerating

**Solution:**

```javascript
// Make sure you're not calling start() multiple times
await client.start(); // Call only once

// ❌ Don't do this:
// await client.start();
// await client.start(); // This causes multiple QRs
```

## Security Best Practices

### 1. Protect Session Files

```bash
# Add to .gitignore
echo "*.session/" >> .gitignore
echo "session-*/" >> .gitignore

# Never commit sessions to git
```

### 2. Don't Share QR Codes

- ❌ Never share QR screenshots publicly
- ❌ Don't stream/record QR on screen share
- ✅ QR is temporary but still sensitive

### 3. Secure Session Storage

```javascript
// Set proper permissions (Linux/Mac)
import { chmodSync } from 'fs';

chmodSync('./my-bot', 0o700); // Owner read/write/execute only
```

### 4. Use Environment Variables

```javascript
// ✅ Good
const client = new Client({
    sessionId: process.env.SESSION_ID
});

// ❌ Bad
const client = new Client({
    sessionId: 'hardcoded-session' // Don't hardcode
});
```

## Comparison: QR vs Pairing

| Feature | QR Code | Pairing Code |
|---------|---------|--------------|
| Setup Complexity | Easiest | Simple |
| GUI Required | Yes | No |
| Phone Number | Not needed | Required |
| Expiration | ~20 seconds | 60 seconds |
| Headless Server | Difficult | Perfect |
| Local Dev | Perfect | Good |

## When to Use QR

Use QR code when:

✅ Developing locally
✅ You have GUI/display access
✅ Quick testing needed
✅ No phone number available
✅ Prefer visual confirmation

Consider [Pairing Code](/guide/authentication/pairing-code) when:

❌ Running on headless server
❌ Docker deployment
❌ Need automation
❌ No display access

## Complete Example

```javascript
import { Client } from '@roidev/kachina-md';
import pino from 'pino';

// Create client
const client = new Client({
    sessionId: 'my-production-bot',
    browser: ['Production Bot', 'Chrome', '2.0.0'],
    logger: pino({ level: 'silent' })
});

// Connection events
client.on('connecting', () => {
    console.log('⏳ Connecting...');
});

client.on('ready', (user) => {
    console.log('═══════════════════════════════');
    console.log('✅ Bot Connected Successfully!');
    console.log('═══════════════════════════════');
    console.log('Name:', user.name);
    console.log('Number:', user.id.split(':')[0]);
    console.log('═══════════════════════════════\n');
});

client.on('reconnecting', () => {
    console.log('🔄 Connection lost, reconnecting...');
});

client.on('logout', () => {
    console.log('👋 Bot logged out');
});

// Message handler
client.on('message', async (m) => {
    if (m.fromMe) return;

    console.log(`📩 ${m.pushName}: ${m.body}`);

    if (m.body === '!ping') {
        await client.sendText(m.from, 'Pong! 🏓');
    }
});

// Error handlers
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Rejection:', error);
});

// Start bot
console.log('🚀 Starting bot...\n');
client.start().catch((error) => {
    console.error('Failed to start:', error);
    process.exit(1);
});
```

## Next Steps

- [Learn about Pairing Code method](/guide/authentication/pairing-code)
- [Understand message handling](/guide/core/messages)
- [Send different message types](/guide/features/sending-messages)
- [See complete examples](/examples/basic-bot)

## Questions?

- 💬 [Ask in Discussions](https://github.com/idlanyor/kachina-core/discussions)
- 🐛 [Report Issues](https://github.com/idlanyor/kachina-core/issues)
- 📖 [Read API Reference](/api/client)
