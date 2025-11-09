# WhatsApp Pairing Code Authentication Guide

## Overview

Kachina-MD supports two authentication methods:
1. **QR Code** - Scan QR code with your phone (default)
2. **Pairing Code** - Enter a code in your WhatsApp app

This guide covers the **Pairing Code** method, which is useful for:
- Headless servers without GUI
- Automated deployments
- Remote setups where QR scanning is impractical
- Mobile-first workflows

## Table of Contents

- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Events](#events)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)
- [FAQ](#faq)

## Quick Start

### Basic Setup

```javascript
import { Client } from '@roidev/kachina-md';

const client = new Client({
    loginMethod: 'pairing',
    phoneNumber: '628123456789', // Your phone number with country code
    sessionId: 'my-session'
});

client.on('pairing.code', (code) => {
    console.log('Pairing Code:', code);
    // Code will be displayed automatically in console
});

client.on('ready', (user) => {
    console.log('Connected!', user);
});

await client.start();
```

### How It Works

1. Start your bot with `loginMethod: 'pairing'`
2. Bot generates a pairing code (8 characters)
3. Code is displayed in terminal and emitted via event
4. Open WhatsApp on your phone
5. Go to: **Settings → Linked Devices → Link a Device**
6. Enter the code
7. Bot connects automatically

## Configuration

### Required Options

```javascript
{
    loginMethod: 'pairing',        // Must be 'pairing'
    phoneNumber: '628123456789'    // Required for pairing
}
```

### Phone Number Format

| Country | Format | Example |
|---------|--------|---------|
| Indonesia 🇮🇩 | 628xxxxxxxxx | 628123456789 |
| USA 🇺🇸 | 1xxxxxxxxxx | 12025551234 |
| UK 🇬🇧 | 44xxxxxxxxxx | 447911123456 |
| India 🇮🇳 | 91xxxxxxxxxx | 919876543210 |
| Brazil 🇧🇷 | 55xxxxxxxxxx | 5511987654321 |

**Important:**
- Use country code without `+` sign
- Remove spaces and dashes
- Use only numbers

### Full Configuration Example

```javascript
const client = new Client({
    // Authentication
    loginMethod: 'pairing',
    phoneNumber: '628123456789',
    sessionId: 'pairing-session',

    // Optional
    browser: ['Kachina-Bot', 'Chrome', '1.0.0'],
    logger: pino({ level: 'silent' })
});
```

## Events

### pairing.code

Emitted when pairing code is generated.

```javascript
client.on('pairing.code', (code) => {
    console.log('Code:', code);

    // Examples of what you can do:
    // - Send via email
    // - Send via SMS
    // - Display on web dashboard
    // - Save to database
    // - Send to webhook
});
```

**Code Details:**
- **Format:** 8 alphanumeric characters
- **Expiration:** 60 seconds
- **One-time use:** Each code can only be used once

### pairing.error

Emitted when pairing fails.

```javascript
client.on('pairing.error', (error) => {
    console.error('Pairing failed:', error.message);

    // Common errors:
    // - Invalid phone number
    // - Network timeout
    // - Too many attempts
});
```

### Other Important Events

```javascript
// Connection status
client.on('connecting', () => {
    console.log('Connecting...');
});

client.on('ready', (user) => {
    console.log('Connected as:', user.name);
});

client.on('reconnecting', () => {
    console.log('Reconnecting...');
});

client.on('logout', () => {
    console.log('Logged out');
});
```

## Examples

### Example 1: Basic Bot

See [`examples/pairing-bot.js`](../examples/pairing-bot.js)

```bash
node examples/pairing-bot.js
```

### Example 2: Advanced with Custom Handlers

See [`examples/pairing-advanced.js`](../examples/pairing-advanced.js)

Features:
- Save pairing code to file
- Send code via webhook
- Retry logic on failure
- Multiple notification channels
- Environment variable support

```bash
PHONE_NUMBER=628123456789 node examples/pairing-advanced.js
```

### Example 3: Web Dashboard Integration

```javascript
import { Client } from '@roidev/kachina-md';
import express from 'express';

const app = express();
let currentPairingCode = null;

const client = new Client({
    loginMethod: 'pairing',
    phoneNumber: '628123456789'
});

client.on('pairing.code', (code) => {
    currentPairingCode = code;

    // Code expires after 60 seconds
    setTimeout(() => {
        currentPairingCode = null;
    }, 60000);
});

// Web endpoint to get pairing code
app.get('/pairing-code', (req, res) => {
    if (!currentPairingCode) {
        return res.json({ error: 'No active pairing code' });
    }

    res.json({
        code: currentPairingCode,
        expiresIn: '60 seconds',
        instructions: [
            'Open WhatsApp on your phone',
            'Go to Settings > Linked Devices',
            'Tap Link a Device',
            'Enter the code shown above'
        ]
    });
});

app.listen(3000);
client.start();
```

### Example 4: Docker Environment

```javascript
import { Client } from '@roidev/kachina-md';

const client = new Client({
    loginMethod: 'pairing',
    phoneNumber: process.env.WHATSAPP_NUMBER,
    sessionId: process.env.SESSION_ID || 'docker-session'
});

client.on('pairing.code', (code) => {
    // Log to Docker logs
    console.log(JSON.stringify({
        type: 'pairing_code',
        code,
        timestamp: new Date().toISOString()
    }));
});

client.start();
```

**Docker Compose:**

```yaml
services:
  whatsapp-bot:
    build: .
    environment:
      - WHATSAPP_NUMBER=628123456789
      - SESSION_ID=production
    volumes:
      - ./sessions:/app/sessions
```

### Example 5: Retry Logic

```javascript
import { Client } from '@roidev/kachina-md';

async function startWithRetry(maxRetries = 3) {
    let retries = 0;

    const client = new Client({
        loginMethod: 'pairing',
        phoneNumber: '628123456789'
    });

    client.on('pairing.error', async (error) => {
        if (retries < maxRetries) {
            retries++;
            console.log(`Retry ${retries}/${maxRetries}...`);
            await new Promise(r => setTimeout(r, 5000));
            await client.start();
        } else {
            console.error('Max retries reached');
            process.exit(1);
        }
    });

    await client.start();
    return client;
}

const client = await startWithRetry();
```

## Troubleshooting

### Common Issues

#### 1. "Phone number is required"

**Error:**
```
Error: Phone number is required for pairing method
```

**Solution:**
```javascript
const client = new Client({
    loginMethod: 'pairing',
    phoneNumber: '628123456789' // Add this!
});
```

#### 2. "Invalid phone number format"

**Error:**
```
Error: Invalid phone number format
```

**Solutions:**
- Remove `+` sign: `+62` → `62`
- Remove spaces: `62 812 345 6789` → `628123456789`
- Remove dashes: `62-812-345-6789` → `628123456789`
- Use country code: `0812345678` → `628123456789`

**Valid formats:**
```javascript
✅ '628123456789'
✅ '12025551234'
✅ '447911123456'

❌ '+628123456789'
❌ '62 812 345 6789'
❌ '62-812-345-6789'
❌ '0812345678' (missing country code)
```

#### 3. Pairing code not appearing

**Possible causes:**
- Wrong login method: Set `loginMethod: 'pairing'`
- Missing phone number: Add `phoneNumber` config
- Network issues: Check internet connection
- Already logged in: Delete session folder and try again

**Debug:**
```javascript
client.on('pairing.code', (code) => {
    console.log('CODE RECEIVED:', code); // Should appear
});

client.on('pairing.error', (error) => {
    console.error('ERROR:', error); // Check for errors
});
```

#### 4. Code expired before entering

Pairing codes expire after 60 seconds. If you're too slow:

```javascript
let pairingCode = null;

client.on('pairing.code', (code) => {
    pairingCode = code;
    console.log('You have 60 seconds to enter:', code);

    // Set timer reminder
    setTimeout(() => {
        console.log('⚠️  30 seconds remaining!');
    }, 30000);
});
```

#### 5. "Connection timeout"

Increase timeout:

```javascript
// This is handled automatically, but you can add retry logic
client.on('pairing.error', async (error) => {
    if (error.message.includes('timeout')) {
        console.log('Timeout - retrying...');
        await client.start();
    }
});
```

#### 6. Multiple pairing attempts

If you see multiple codes, you might be calling `start()` multiple times:

```javascript
// ❌ Wrong
client.start();
client.start(); // Don't do this!

// ✅ Correct
await client.start(); // Call only once
```

### Debug Mode

Enable detailed logging:

```javascript
import pino from 'pino';

const client = new Client({
    loginMethod: 'pairing',
    phoneNumber: '628123456789',
    logger: pino({ level: 'debug' }) // Enable debug logs
});
```

### Clear Session

If you encounter persistent issues, clear the session:

```bash
# Remove session folder
rm -rf pairing-session

# Or in code
import fs from 'fs';
fs.rmSync('./pairing-session', { recursive: true, force: true });
```

## Security Best Practices

### 1. Don't Hardcode Phone Numbers

❌ **Bad:**
```javascript
const client = new Client({
    phoneNumber: '628123456789' // Hardcoded!
});
```

✅ **Good:**
```javascript
const client = new Client({
    phoneNumber: process.env.PHONE_NUMBER
});
```

### 2. Protect Pairing Codes

Pairing codes are sensitive! Don't:
- Log them to public logs
- Send them over unencrypted channels
- Store them in databases
- Share them publicly

```javascript
// ❌ Bad
client.on('pairing.code', (code) => {
    fetch('http://public-api.com/log?code=' + code); // Insecure!
});

// ✅ Good
client.on('pairing.code', (code) => {
    // Send over HTTPS with auth
    fetch('https://api.com/pairing', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + process.env.API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
    });
});
```

### 3. Secure Session Storage

```javascript
// Use secure session paths
const client = new Client({
    sessionId: '/secure/path/sessions/user-' + userId,
    phoneNumber: process.env.PHONE_NUMBER
});

// Set proper permissions
fs.chmodSync('/secure/path/sessions', 0o700);
```

### 4. Rate Limiting

Implement rate limiting to prevent abuse:

```javascript
let lastPairingAttempt = 0;
const RATE_LIMIT_MS = 60000; // 1 minute

async function startWithRateLimit(client) {
    const now = Date.now();
    if (now - lastPairingAttempt < RATE_LIMIT_MS) {
        throw new Error('Please wait before requesting a new code');
    }

    lastPairingAttempt = now;
    await client.start();
}
```

### 5. Monitor Suspicious Activity

```javascript
client.on('pairing.code', (code) => {
    // Log pairing attempts
    logSecurityEvent({
        type: 'pairing_attempt',
        timestamp: new Date(),
        phoneNumber: client.config.phoneNumber,
        sessionId: client.config.sessionId
    });
});
```

## FAQ

### Q: Can I use pairing without a phone number?

**A:** No, pairing requires a valid phone number. Use QR code method instead.

### Q: How long does the pairing code last?

**A:** Pairing codes expire after 60 seconds.

### Q: Can I request a new code?

**A:** Yes, just restart the bot or call `client.start()` again after clearing the session.

### Q: Can I use pairing in production?

**A:** Yes! Pairing is secure and suitable for production use.

### Q: What happens if I enter the wrong code?

**A:** The pairing will fail and you'll need to request a new code.

### Q: Can multiple devices use the same session?

**A:** No, each device needs its own session ID.

### Q: How do I switch from QR to pairing?

**A:** Just change the config:

```javascript
// Before (QR)
const client = new Client({
    loginMethod: 'qr'
});

// After (Pairing)
const client = new Client({
    loginMethod: 'pairing',
    phoneNumber: '628123456789'
});
```

### Q: Can I use pairing in a web app?

**A:** Yes! See [Example 3: Web Dashboard Integration](#example-3-web-dashboard-integration)

### Q: Does pairing work in Docker?

**A:** Yes! See [Example 4: Docker Environment](#example-4-docker-environment)

### Q: How secure is pairing mode?

**A:** Pairing uses the same security as QR codes. The code is one-time use and expires quickly.

### Q: Can I customize the pairing code format?

**A:** No, the format is determined by WhatsApp (8 alphanumeric characters).

## Comparison: QR vs Pairing

| Feature | QR Code | Pairing Code |
|---------|---------|--------------|
| GUI Required | Yes | No |
| Remote Setup | Difficult | Easy |
| Code Format | QR Image | 8 characters |
| Expiration | ~20 seconds | 60 seconds |
| Use Case | Desktop, GUI | Headless, CLI, Remote |
| Security | Same | Same |
| Ease of Use | Easier | More flexible |

## Migration Guide

### From QR to Pairing

```javascript
// 1. Clear existing session
fs.rmSync('./your-session', { recursive: true, force: true });

// 2. Update configuration
const client = new Client({
    loginMethod: 'pairing', // Changed from 'qr'
    phoneNumber: '628123456789', // Added
    sessionId: 'your-session'
});

// 3. Remove QR event handlers
// client.on('qr', ...) // Remove this

// 4. Add pairing event handlers
client.on('pairing.code', (code) => {
    console.log('Code:', code);
});
```

### From Pairing to QR

```javascript
// 1. Clear existing session
fs.rmSync('./your-session', { recursive: true, force: true });

// 2. Update configuration
const client = new Client({
    loginMethod: 'qr', // Changed from 'pairing'
    // Remove: phoneNumber
    sessionId: 'your-session'
});

// 3. Remove pairing event handlers
// client.on('pairing.code', ...) // Remove this

// 4. QR will be printed automatically to terminal
```

## Additional Resources

- [Main Documentation](../README.md)
- [Examples](../examples/)
- [GitHub Issues](https://github.com/idlanyor/kachina-core/issues)
- [Baileys Documentation](https://github.com/WhiskeySockets/Baileys)

## Support

Need help?
- 📖 Read the [troubleshooting](#troubleshooting) section
- 💬 Open an issue on [GitHub](https://github.com/idlanyor/kachina-core/issues)
- 📧 Contact the maintainers

---

**Last Updated:** 2025-11-09
**Version:** 2.0.4
