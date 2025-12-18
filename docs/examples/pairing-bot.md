# Pairing Code Bot Example

Learn how to use the pairing code authentication method instead of QR code scanning.

## What is Pairing Code?

Pairing code is an alternative authentication method where WhatsApp generates an 8-digit code that you enter in the WhatsApp app to link the device, instead of scanning a QR code.

**Benefits:**
- ✅ No need for QR code scanner
- ✅ Easier for headless/remote servers
- ✅ Can send code via API, SMS, email
- ✅ More suitable for automated deployments

## Basic Example

```javascript
import { Client } from '@roidev/kachina-md';

const client = new Client({
    sessionId: 'pairing-bot',
    loginMethod: 'pairing',           // ⚠️ Use pairing method
    phoneNumber: '628123456789',      // ⚠️ Your phone number (no +)
    prefix: '!'
});

// Listen for pairing code
client.on('pairing.code', (code) => {
    console.log('📱 Pairing Code:', code);
    console.log('Enter this code in WhatsApp app');
});

// Ready event
client.on('ready', (user) => {
    console.log('✅ Bot ready!', user.name);
});

// Message handler
client.on('message', async (m) => {
    if (m.body === '!ping') {
        await m.reply('Pong! 🏓');
    }
});

await client.start();
```

## Phone Number Format

The phone number must be in international format **without** the `+` sign:

```javascript
// ✅ Correct formats
phoneNumber: '628123456789'     // Indonesia
phoneNumber: '14155552671'      // USA
phoneNumber: '447700900123'     // UK
phoneNumber: '919876543210'     // India

// ❌ Wrong formats
phoneNumber: '+628123456789'    // Don't include +
phoneNumber: '08123456789'      // Don't start with 0
phoneNumber: '62 812 345 6789'  // No spaces
```

## Complete Example

```javascript
import { Client } from '@roidev/kachina-md';

// Configuration
const config = {
    sessionId: 'pairing-session',
    loginMethod: 'pairing',
    phoneNumber: '628123456789',   // Replace with your number
    prefix: '!',
    owners: ['628123456789']       // Bot owners
};

const client = new Client(config);

// Event: Connecting
client.on('connecting', () => {
    console.log('🔄 Connecting to WhatsApp...');
});

// Event: Pairing code generated
client.on('pairing.code', (code) => {
    console.log('\n┌─────────────────────────────────────┐');
    console.log('│     WhatsApp Pairing Code           │');
    console.log('├─────────────────────────────────────┤');
    console.log(`│         Code: ${code}               │`);
    console.log('└─────────────────────────────────────┘');
    console.log('\nSteps to pair:');
    console.log('1. Open WhatsApp on your phone');
    console.log('2. Go to Settings > Linked Devices');
    console.log('3. Tap "Link a Device"');
    console.log('4. Enter the code above\n');
    
    // Optional: Send code via API/SMS/Email
    // sendCodeViaSMS(config.phoneNumber, code);
});

// Event: Pairing error
client.on('pairing.error', (error) => {
    console.error('❌ Pairing error:', error.message);
    
    if (error.message.includes('Invalid phone')) {
        console.log('Please check your phone number format');
        console.log('Format: country_code + number (e.g., 628123456789)');
    }
});

// Event: Bot ready
client.on('ready', (user) => {
    console.log('✅ Bot is ready!');
    console.log('Bot Number:', user.id.split(':')[0]);
    console.log('Bot Name:', user.name);
});

// Event: Reconnecting
client.on('reconnecting', () => {
    console.log('🔄 Reconnecting...');
});

// Event: Logout
client.on('logout', () => {
    console.log('👋 Bot logged out');
    process.exit(0);
});

// Event: Message received
client.on('message', async (m) => {
    // Skip own messages
    if (m.fromMe) return;
    
    console.log(`📩 [${m.pushName}]: ${m.body}`);
    
    // Commands
    if (m.body === '!ping') {
        await m.reply('Pong! 🏓');
    }
    
    if (m.body === '!info') {
        const info = `
*🤖 Bot Information*

Method: Pairing Code
Status: Online ✅
Number: ${client.user.id.split(':')[0]}
Uptime: ${process.uptime().toFixed(0)}s
        `.trim();
        
        await m.reply(info);
    }
});

// Start bot
console.log('🚀 Starting bot with pairing method...');
console.log('Phone number:', config.phoneNumber);
console.log('\nWaiting for pairing code...\n');

client.start().catch((error) => {
    console.error('Failed to start:', error.message);
    process.exit(1);
});
```

## Send Code via API

You can send the pairing code programmatically:

```javascript
import axios from 'axios';

client.on('pairing.code', async (code) => {
    console.log('Pairing code:', code);
    
    // Send via SMS API
    try {
        await axios.post('https://api.sms.com/send', {
            to: config.phoneNumber,
            message: `Your WhatsApp Bot pairing code: ${code}`
        });
        console.log('✅ Code sent via SMS');
    } catch (error) {
        console.error('Failed to send SMS:', error.message);
    }
    
    // Or send via Email
    // await sendEmail(userEmail, 'Pairing Code', `Your code: ${code}`);
    
    // Or send via Web API
    // io.emit('pairing-code', code);
});
```

## Web Interface Integration

Display pairing code in a web interface:

```javascript
import express from 'express';
import { Server } from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let currentPairingCode = null;

// Serve HTML page
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>WhatsApp Bot - Pairing</title>
            <script src="/socket.io/socket.io.js"></script>
        </head>
        <body>
            <h1>WhatsApp Bot Pairing</h1>
            <div id="code">Waiting for code...</div>
            
            <script>
                const socket = io();
                socket.on('pairing-code', (code) => {
                    document.getElementById('code').innerHTML = 
                        '<h2>Pairing Code: ' + code + '</h2>';
                });
            </script>
        </body>
        </html>
    `);
});

// Emit pairing code to web clients
client.on('pairing.code', (code) => {
    currentPairingCode = code;
    io.emit('pairing-code', code);
    console.log('Pairing code sent to web clients');
});

server.listen(3000, () => {
    console.log('Web interface: http://localhost:3000');
});
```

## Auto-Retry on Failure

Handle pairing failures with retry logic:

```javascript
let retryCount = 0;
const MAX_RETRIES = 3;

client.on('pairing.error', async (error) => {
    console.error(`Pairing failed (${retryCount + 1}/${MAX_RETRIES}):`, error.message);
    
    if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`Retrying in 5 seconds...`);
        
        setTimeout(() => {
            console.log('Attempting to reconnect...');
            client.start().catch(console.error);
        }, 5000);
    } else {
        console.error('Max retries reached. Exiting...');
        process.exit(1);
    }
});

client.on('ready', () => {
    retryCount = 0; // Reset on success
});
```

## Environment Variables

Store sensitive data in `.env`:

```env
# .env
BOT_PHONE_NUMBER=628123456789
BOT_SESSION_ID=pairing-bot
BOT_PREFIX=!
OWNER_NUMBER=628123456789
```

Load in your code:

```javascript
import 'dotenv/config';

const client = new Client({
    sessionId: process.env.BOT_SESSION_ID,
    loginMethod: 'pairing',
    phoneNumber: process.env.BOT_PHONE_NUMBER,
    prefix: process.env.BOT_PREFIX,
    owners: [process.env.OWNER_NUMBER]
});
```

## Comparison with QR Code

| Feature | QR Code | Pairing Code |
|---------|---------|--------------|
| Ease of use | Easy (scan) | Easy (type code) |
| Headless server | Need QR display | ✅ Just show code |
| Automation | ❌ Hard to automate | ✅ Easy to automate |
| Remote setup | ❌ Need screen access | ✅ Send code remotely |
| Security | Secure | Secure |
| Speed | Fast | Fast |

## Troubleshooting

### Invalid Phone Number

```javascript
// Error: Invalid phone number format
// Solution: Use format without + or spaces
phoneNumber: '628123456789'  // ✅ Correct
```

### Code Expired

```javascript
// If code expires, restart the bot
// Code is valid for a limited time (usually 1 minute)

client.on('pairing.error', (error) => {
    if (error.message.includes('expired')) {
        console.log('Code expired, restarting...');
        setTimeout(() => client.start(), 2000);
    }
});
```

### Already Paired

```javascript
// If phone is already paired, delete session folder
import fs from 'fs';

// Delete session
fs.rmSync('./pairing-session', { recursive: true, force: true });

// Restart bot
await client.start();
```

## Best Practices

### 1. Validate Phone Number

```javascript
function validatePhoneNumber(phone) {
    // Remove spaces and +
    phone = phone.replace(/[\s+]/g, '');
    
    // Check if numeric
    if (!/^\d+$/.test(phone)) {
        throw new Error('Phone number must contain only digits');
    }
    
    // Check length
    if (phone.length < 10 || phone.length > 15) {
        throw new Error('Invalid phone number length');
    }
    
    return phone;
}

const phoneNumber = validatePhoneNumber(process.env.PHONE_NUMBER);
```

### 2. Secure Code Display

```javascript
client.on('pairing.code', (code) => {
    // Don't log code in production
    if (process.env.NODE_ENV === 'production') {
        console.log('Pairing code generated');
        // Send via secure channel
    } else {
        console.log('Pairing Code:', code);
    }
});
```

### 3. Timeout Handling

```javascript
let pairingTimeout;

client.on('pairing.code', (code) => {
    console.log('Code:', code);
    
    // Set timeout
    pairingTimeout = setTimeout(() => {
        console.log('Pairing timeout - restarting...');
        client.start();
    }, 60000); // 60 seconds
});

client.on('ready', () => {
    clearTimeout(pairingTimeout);
});
```

## See Also

- [QR Code Method](/guide/authentication/qr-code) - Alternative authentication
- [Authentication Overview](/guide/authentication/overview) - Compare methods
- [Client Guide](/guide/core/client) - Client configuration
- [Basic Bot Example](/examples/basic-bot) - Simple bot example
