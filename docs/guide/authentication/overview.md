# Authentication Overview

Kachina-MD supports two methods to authenticate and connect your bot to WhatsApp. Choose the method that best fits your deployment scenario.

## Available Methods

### 1. QR Code Method (Default)

Scan a QR code with your phone to authenticate.

**Best for:**
- ✅ Local development
- ✅ Desktop applications with GUI
- ✅ Quick testing
- ✅ When you can access the display

[Learn more about QR Code →](/guide/authentication/qr-code)

### 2. Pairing Code Method

Enter an 8-character code in WhatsApp to authenticate.

**Best for:**
- ✅ Headless servers (no GUI)
- ✅ Docker containers
- ✅ Remote deployments
- ✅ CI/CD environments
- ✅ Automated setups

[Learn more about Pairing Code →](/guide/authentication/pairing-code)

## Quick Comparison

| Feature | QR Code | Pairing Code |
|---------|---------|--------------|
| **Requires Phone Number** | ❌ No | ✅ Yes |
| **GUI Required** | ✅ Yes | ❌ No |
| **Expiration Time** | ~20 seconds | 60 seconds |
| **Code Format** | QR Image | 8 characters |
| **Remote Setup** | Difficult | Easy |
| **Headless Server** | ❌ Limited | ✅ Perfect |
| **Docker/Container** | Complex | Simple |
| **Security** | Same | Same |

## QR Code Method

### Setup

```javascript
import { Client } from '@roidev/kachina-md';

const client = new Client({
    loginMethod: 'qr', // or omit (qr is default)
    sessionId: 'my-bot'
});

await client.start();
// QR code will appear in terminal
```

### Flow

1. Start your bot
2. QR code appears in terminal
3. Open WhatsApp on phone
4. Go to: **Settings** → **Linked Devices** → **Link a Device**
5. Scan the QR code
6. Bot connects automatically

### Pros & Cons

**Pros:**
- ✅ No phone number needed
- ✅ Familiar process
- ✅ Visual confirmation
- ✅ Quick for local dev

**Cons:**
- ❌ Requires display
- ❌ Difficult for remote servers
- ❌ Short expiration time (~20s)
- ❌ Hard to automate

[Read full QR Code guide →](/guide/authentication/qr-code)

## Pairing Code Method

### Setup

```javascript
import { Client } from '@roidev/kachina-md';

const client = new Client({
    loginMethod: 'pairing',
    phoneNumber: '628123456789', // Required
    sessionId: 'my-bot'
});

client.on('pairing.code', (code) => {
    console.log('Pairing Code:', code);
});

await client.start();
```

### Flow

1. Start your bot
2. Bot generates 8-character code
3. Code is displayed in terminal
4. Open WhatsApp on phone
5. Go to: **Settings** → **Linked Devices** → **Link a Device**
6. Enter the code
7. Bot connects automatically

### Pros & Cons

**Pros:**
- ✅ No GUI needed
- ✅ Perfect for headless servers
- ✅ Easy to automate
- ✅ Longer expiration (60s)
- ✅ Can send code via API/webhook

**Cons:**
- ❌ Requires phone number
- ❌ Extra configuration

[Read full Pairing Code guide →](/guide/authentication/pairing-code)

## Choosing the Right Method

### Use QR Code if you:

- Are developing locally on desktop
- Have access to the terminal display
- Need quick setup for testing
- Don't have phone number available
- Prefer visual confirmation

```javascript
// Simple QR setup
const client = new Client({ sessionId: 'dev-bot' });
await client.start();
// Scan and go!
```

### Use Pairing Code if you:

- Deploy to headless server
- Use Docker/containers
- Need to automate authentication
- Build a web service
- Can't access the display
- Want to send code via API

```javascript
// Pairing setup
const client = new Client({
    loginMethod: 'pairing',
    phoneNumber: process.env.PHONE_NUMBER
});

client.on('pairing.code', async (code) => {
    // Send code via API, email, SMS, etc.
    await sendCodeToUser(code);
});

await client.start();
```

## Switch Between Methods

You can easily switch between methods:

```javascript
// Use environment variable
const loginMethod = process.env.LOGIN_METHOD || 'qr';

const client = new Client({
    loginMethod,
    phoneNumber: process.env.PHONE_NUMBER, // Only used for pairing
    sessionId: 'my-bot'
});

// Handle pairing code if using pairing method
if (loginMethod === 'pairing') {
    client.on('pairing.code', (code) => {
        console.log('Code:', code);
    });
}

await client.start();
```

Run with different methods:

```bash
# QR Code
node bot.js

# Pairing Code
LOGIN_METHOD=pairing PHONE_NUMBER=628123456789 node bot.js
```

## Session Management

Both methods create and save sessions for automatic reconnection.

### Session Files

Sessions are saved in the `sessionId` folder:

```
your-project/
└── my-bot/              # sessionId folder
    ├── creds.json       # Credentials
    └── keys/            # Encryption keys
```

### Reusing Sessions

Once authenticated, sessions are automatically reused:

```javascript
const client = new Client({ sessionId: 'my-bot' });
await client.start();
// No QR/code needed - uses saved session
```

### Clear Session

To re-authenticate:

```bash
# Remove session folder
rm -rf ./my-bot
```

Or in code:

```javascript
import fs from 'fs';

// Clear session
fs.rmSync('./my-bot', { recursive: true, force: true });

// Start with new session
await client.start();
```

## Security Considerations

Both methods are equally secure:

- ✅ End-to-end encrypted
- ✅ One-time use codes
- ✅ Short expiration times
- ✅ Same WhatsApp security model

**Best Practices:**

```javascript
// ✅ Good: Use environment variables
const client = new Client({
    phoneNumber: process.env.PHONE_NUMBER
});

// ❌ Bad: Hardcode credentials
const client = new Client({
    phoneNumber: '628123456789' // Don't do this!
});
```

```javascript
// ✅ Good: Protect session files
// Add to .gitignore:
// sessions/
// *.session/

// ❌ Bad: Commit sessions to git
// Sessions contain sensitive auth data!
```

## Common Patterns

### Multi-Environment Setup

```javascript
const isProd = process.env.NODE_ENV === 'production';

const client = new Client({
    loginMethod: isProd ? 'pairing' : 'qr',
    phoneNumber: isProd ? process.env.PHONE_NUMBER : undefined,
    sessionId: isProd ? 'prod-bot' : 'dev-bot'
});
```

### Docker Deployment

```yaml
# docker-compose.yml
services:
  bot:
    image: my-bot
    environment:
      - LOGIN_METHOD=pairing
      - PHONE_NUMBER=628123456789
      - SESSION_ID=docker-bot
```

```javascript
// bot.js
const client = new Client({
    loginMethod: process.env.LOGIN_METHOD,
    phoneNumber: process.env.PHONE_NUMBER,
    sessionId: process.env.SESSION_ID
});
```

## Troubleshooting

### QR Code Issues

**Problem:** QR not displaying
- Check terminal supports unicode
- Try different terminal
- Use pairing method instead

**Problem:** QR expired
- Restart bot for new QR
- Scan faster (20s limit)

### Pairing Code Issues

**Problem:** No code generated
- Check `loginMethod: 'pairing'`
- Verify phone number format
- Check pairing.code event listener

**Problem:** Invalid phone number
- Use country code without +
- Remove spaces and dashes
- Format: `628123456789` ✅ not `+62 812 345 6789` ❌

### General Issues

**Problem:** Session errors
```bash
# Clear and retry
rm -rf ./session-name
node bot.js
```

**Problem:** Connection timeout
- Check internet connection
- Verify WhatsApp working on phone
- Try again

## Events

Both methods emit connection events:

```javascript
client.on('connecting', () => {
    console.log('Connecting...');
});

client.on('ready', (user) => {
    console.log('Connected!', user.name);
});

client.on('reconnecting', () => {
    console.log('Reconnecting...');
});

client.on('logout', () => {
    console.log('Logged out');
});
```

## Next Steps

Choose your authentication method:

- [QR Code Method →](/guide/authentication/qr-code)
- [Pairing Code Method →](/guide/authentication/pairing-code)

Or continue learning:

- [Core Concepts →](/guide/core/client)
- [Sending Messages →](/guide/features/sending-messages)
- [Examples →](/examples/basic-bot)

## Questions?

- 💬 [Discussions](https://github.com/idlanyor/kachina-core/discussions)
- 📖 [API Reference](/api/client)
- 🐛 [Report Issues](https://github.com/idlanyor/kachina-core/issues)
