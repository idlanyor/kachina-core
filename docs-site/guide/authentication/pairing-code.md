# Pairing Code Authentication

The pairing code method allows you to connect your bot without scanning a QR code. This is perfect for headless servers, Docker containers, and remote deployments.

## Quick Start

```javascript
import { Client } from '@roidev/kachina-md';

const client = new Client({
    loginMethod: 'pairing',
    phoneNumber: '628123456789', // Your phone number
    sessionId: 'pairing-session'
});

client.on('pairing.code', (code) => {
    console.log('Pairing Code:', code);
    // Code will also be displayed in formatted box automatically
});

client.on('ready', (user) => {
    console.log('Connected!', user.name);
});

await client.start();
```

## How It Works

1. **Start your bot** with `loginMethod: 'pairing'`
2. **Bot generates** an 8-character pairing code
3. **Code is displayed** in terminal (and emitted via event)
4. **Open WhatsApp** on your phone
5. **Go to Settings** → Linked Devices → Link a Device
6. **Enter the code** shown by the bot
7. **Bot connects** automatically

## Phone Number Format

The phone number must include the country code without the `+` sign:

::: code-group

```javascript [Indonesia 🇮🇩]
phoneNumber: '628123456789'
```

```javascript [USA 🇺🇸]
phoneNumber: '12025551234'
```

```javascript [UK 🇬🇧]
phoneNumber: '447911123456'
```

```javascript [India 🇮🇳]
phoneNumber: '919876543210'
```

:::

### ✅ Correct Formats

```javascript
'628123456789'     // Indonesia
'12025551234'      // USA
'447911123456'     // UK
'919876543210'     // India
'5511987654321'    // Brazil
```

### ❌ Incorrect Formats

```javascript
'+628123456789'    // Remove the + sign
'62 812 345 6789'  // Remove spaces
'62-812-345-6789'  // Remove dashes
'0812345678'       // Missing country code
```

## Configuration

### Basic Configuration

```javascript
const client = new Client({
    loginMethod: 'pairing',        // Required
    phoneNumber: '628123456789',   // Required
    sessionId: 'my-session'        // Optional
});
```

### Full Configuration

```javascript
const client = new Client({
    // Authentication
    loginMethod: 'pairing',
    phoneNumber: '628123456789',
    sessionId: 'production-bot',

    // Optional settings
    browser: ['MyBot', 'Chrome', '1.0.0'],
    logger: pino({ level: 'silent' })
});
```

## Events

### pairing.code

Emitted when the pairing code is generated.

```javascript
client.on('pairing.code', (code) => {
    console.log('Pairing Code:', code);

    // You can:
    // - Send via email
    // - Send via SMS
    // - Display on dashboard
    // - Save to database
    // - Send to webhook
});
```

**Code Properties:**
- **Format:** 8 alphanumeric characters
- **Expiration:** 60 seconds
- **Usage:** One-time use only

### pairing.error

Emitted when pairing fails.

```javascript
client.on('pairing.error', (error) => {
    console.error('Pairing failed:', error.message);

    // Handle errors:
    // - Invalid phone number
    // - Network timeout
    // - Too many attempts
});
```

## Environment Variables

Best practice: Use environment variables for sensitive data.

```javascript
import { Client } from '@roidev/kachina-md';

const client = new Client({
    loginMethod: 'pairing',
    phoneNumber: process.env.PHONE_NUMBER,
    sessionId: process.env.SESSION_ID || 'default'
});
```

Create a `.env` file:

```env
PHONE_NUMBER=628123456789
SESSION_ID=production-bot
LOGIN_METHOD=pairing
```

Don't forget to install `dotenv`:

```bash
npm install dotenv
```

Then in your code:

```javascript
import 'dotenv/config';
```

## Advanced Examples

### Retry on Failure

```javascript
let retries = 0;
const MAX_RETRIES = 3;

client.on('pairing.error', async (error) => {
    if (retries < MAX_RETRIES) {
        retries++;
        console.log(`Retrying... (${retries}/${MAX_RETRIES})`);

        await new Promise(r => setTimeout(r, 5000));
        await client.start();
    } else {
        console.error('Max retries reached');
        process.exit(1);
    }
});
```

### Save Code to File

```javascript
import fs from 'fs/promises';

client.on('pairing.code', async (code) => {
    const data = {
        code,
        phoneNumber: client.config.phoneNumber,
        timestamp: new Date().toISOString(),
        expiresIn: '60 seconds'
    };

    await fs.writeFile(
        'pairing-code.json',
        JSON.stringify(data, null, 2)
    );

    console.log('✓ Code saved to pairing-code.json');
});
```

### Send to API/Webhook

```javascript
client.on('pairing.code', async (code) => {
    try {
        await fetch('https://your-api.com/pairing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code,
                phoneNumber: client.config.phoneNumber,
                timestamp: new Date().toISOString()
            })
        });

        console.log('✓ Code sent to API');
    } catch (error) {
        console.error('Failed to send code:', error);
    }
});
```

### Web Dashboard Integration

```javascript
import express from 'express';

const app = express();
let currentCode = null;

client.on('pairing.code', (code) => {
    currentCode = code;

    // Clear after 60 seconds
    setTimeout(() => {
        currentCode = null;
    }, 60000);
});

app.get('/api/pairing-code', (req, res) => {
    if (!currentCode) {
        return res.json({ error: 'No active code' });
    }

    res.json({
        code: currentCode,
        expiresIn: '60 seconds',
        steps: [
            'Open WhatsApp',
            'Go to Settings > Linked Devices',
            'Tap Link a Device',
            'Enter the code above'
        ]
    });
});

app.listen(3000);
```

## Docker Deployment

Perfect for containerized deployments:

```yaml
# docker-compose.yml
version: '3.8'

services:
  whatsapp-bot:
    build: .
    environment:
      - PHONE_NUMBER=628123456789
      - LOGIN_METHOD=pairing
      - SESSION_ID=docker-bot
    volumes:
      - ./sessions:/app/sessions
    restart: unless-stopped
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

### Error: "Phone number is required"

**Solution:** Add the `phoneNumber` configuration.

```javascript
const client = new Client({
    loginMethod: 'pairing',
    phoneNumber: '628123456789' // Add this!
});
```

### Error: "Invalid phone number format"

**Solution:** Check your phone number format.

```javascript
// ❌ Wrong
phoneNumber: '+628123456789'  // Remove +
phoneNumber: '0812345678'     // Add country code

// ✅ Correct
phoneNumber: '628123456789'
```

### Code Not Appearing

**Debug steps:**

```javascript
// 1. Check loginMethod
console.log('Login method:', client.config.loginMethod);

// 2. Listen for events
client.on('pairing.code', (code) => {
    console.log('CODE RECEIVED:', code);
});

client.on('pairing.error', (error) => {
    console.error('ERROR:', error);
});

// 3. Enable debug logs
import pino from 'pino';

const client = new Client({
    loginMethod: 'pairing',
    phoneNumber: '628123456789',
    logger: pino({ level: 'debug' })
});
```

### Code Expired

Pairing codes expire after 60 seconds. If you're too slow:

```javascript
client.on('pairing.code', (code) => {
    console.log('⏰ You have 60 seconds to enter:', code);

    // Reminder after 30 seconds
    setTimeout(() => {
        console.log('⚠️ 30 seconds remaining!');
    }, 30000);
});
```

### Clear Session

If issues persist, clear the session:

```bash
rm -rf ./session-name
node bot.js
```

## When to Use Pairing

Use pairing code when:

- ✅ Running on headless server
- ✅ Docker/container deployment
- ✅ Need automation
- ✅ Building web service
- ✅ Remote server setup
- ✅ CI/CD pipeline

Use QR code when:

- ✅ Local development
- ✅ Desktop with GUI
- ✅ Quick testing
- ✅ No phone number needed

## Security Best Practices

### 1. Don't Hardcode Credentials

```javascript
// ❌ Bad
const client = new Client({
    phoneNumber: '628123456789' // Hardcoded!
});

// ✅ Good
const client = new Client({
    phoneNumber: process.env.PHONE_NUMBER
});
```

### 2. Protect Pairing Codes

Never:
- Log codes to public logs
- Send over HTTP (use HTTPS)
- Store in databases
- Share publicly

```javascript
// ❌ Bad
client.on('pairing.code', (code) => {
    fetch('http://api.com/log?code=' + code); // Insecure!
});

// ✅ Good
client.on('pairing.code', (code) => {
    fetch('https://api.com/pairing', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
    });
});
```

### 3. Rate Limiting

```javascript
let lastAttempt = 0;
const RATE_LIMIT = 60000; // 1 minute

async function startWithRateLimit() {
    const now = Date.now();

    if (now - lastAttempt < RATE_LIMIT) {
        throw new Error('Please wait before requesting new code');
    }

    lastAttempt = now;
    await client.start();
}
```

## Next Steps

- [View complete pairing example](/examples/pairing-bot)
- [Learn about QR code method](/guide/authentication/qr-code)
- [Explore message handling](/guide/core/messages)
- [Deploy with Docker](/guide/deployment/docker)

## Related

- [Authentication Overview](/guide/authentication/overview)
- [API Reference](/api/client)
- [Examples](/examples/pairing-bot)
