# Authentication Methods

Kachina-MD supports two methods to authenticate and connect your bot to WhatsApp:

## 1. QR Code (Default)

Traditional method using QR code scanning.

### When to Use
- ✅ Local development
- ✅ Desktop applications with GUI
- ✅ When you can access the display
- ✅ Quick testing

### Pros
- Easy and familiar
- No phone number needed
- Visual confirmation

### Cons
- Requires display/GUI
- Difficult for headless servers
- Limited time to scan (~20 seconds)

### Example

```javascript
import { Client } from '@roidev/kachina-md';

const client = new Client({
    loginMethod: 'qr', // Default
    sessionId: 'my-session'
});

// QR will be printed to terminal automatically
await client.start();
```

## 2. Pairing Code

Modern method using 8-character code.

### When to Use
- ✅ Headless servers (no GUI)
- ✅ Docker containers
- ✅ Remote deployments
- ✅ CI/CD environments
- ✅ Automated setups
- ✅ Web applications

### Pros
- No GUI required
- Longer expiration (60 seconds)
- Easy to automate
- Can be sent via API/webhook/SMS

### Cons
- Requires phone number
- More configuration

### Example

```javascript
import { Client } from '@roidev/kachina-md';

const client = new Client({
    loginMethod: 'pairing',
    phoneNumber: '628123456789', // Required
    sessionId: 'my-session'
});

client.on('pairing.code', (code) => {
    console.log('Enter this code in WhatsApp:', code);
});

await client.start();
```

## Comparison Table

| Feature | QR Code | Pairing Code |
|---------|---------|--------------|
| **Requires Phone Number** | ❌ No | ✅ Yes |
| **GUI Required** | ✅ Yes | ❌ No |
| **Expiration Time** | ~20 seconds | 60 seconds |
| **Code Format** | QR Image | 8 alphanumeric |
| **Remote Setup** | Difficult | Easy |
| **Automation** | Hard | Easy |
| **Docker/Container** | Complex | Simple |
| **Security** | Same | Same |
| **Headless Server** | ❌ | ✅ |
| **Web Integration** | Complex | Simple |
| **CLI/Terminal** | Works | Better |

## Step-by-Step Comparison

### QR Code Flow

```mermaid
graph LR
    A[Start Bot] --> B[Generate QR]
    B --> C[Display QR]
    C --> D[Scan with Phone]
    D --> E[Connected]
```

1. Start the bot
2. QR code is generated
3. QR is displayed in terminal/GUI
4. Open WhatsApp on phone
5. Go to Linked Devices
6. Scan the QR code
7. Connected!

### Pairing Code Flow

```mermaid
graph LR
    A[Start Bot] --> B[Generate Code]
    B --> C[Display Code]
    C --> D[Enter in WhatsApp]
    D --> E[Connected]
```

1. Start the bot
2. Pairing code is generated (8 characters)
3. Code is displayed/sent
4. Open WhatsApp on phone
5. Go to Linked Devices → Link a Device
6. Enter the code
7. Connected!

## How to Choose?

### Use QR Code if:
- You have a display/GUI
- Running locally on desktop
- Quick testing/development
- No phone number available
- Prefer visual confirmation

### Use Pairing Code if:
- Running on headless server
- Docker/container deployment
- Need to automate authentication
- Building a web service
- Remote server setup
- CI/CD pipeline
- Want to integrate with other systems

## Switch Between Methods

### Same Codebase, Different Methods

```javascript
// Use environment variable to switch
const loginMethod = process.env.LOGIN_METHOD || 'qr';

const client = new Client({
    loginMethod,
    phoneNumber: process.env.PHONE_NUMBER, // Only used for pairing
    sessionId: 'my-session'
});

if (loginMethod === 'pairing') {
    client.on('pairing.code', (code) => {
        console.log('Code:', code);
    });
}

await client.start();
```

### Run with Different Methods

```bash
# QR Code
node bot.js

# Pairing Code
LOGIN_METHOD=pairing PHONE_NUMBER=628123456789 node bot.js
```

## Common Use Cases

### Local Development
```javascript
// QR is easier for local dev
const client = new Client({
    loginMethod: 'qr'
});
```

### Production Server
```javascript
// Pairing for production
const client = new Client({
    loginMethod: 'pairing',
    phoneNumber: process.env.WHATSAPP_NUMBER
});
```

### Multi-Environment
```javascript
// Auto-detect based on environment
const isProd = process.env.NODE_ENV === 'production';

const client = new Client({
    loginMethod: isProd ? 'pairing' : 'qr',
    phoneNumber: isProd ? process.env.PHONE_NUMBER : undefined
});
```

### Docker
```yaml
# docker-compose.yml
services:
  bot:
    image: my-bot
    environment:
      - LOGIN_METHOD=pairing
      - PHONE_NUMBER=628123456789
```

## Security Considerations

Both methods are equally secure:
- ✅ End-to-end encrypted
- ✅ One-time use codes
- ✅ Short expiration times
- ✅ Same WhatsApp security model

**Best Practices:**
- Don't share QR codes publicly
- Don't share pairing codes
- Use secure channels for code transmission
- Rotate sessions regularly
- Use environment variables for sensitive data

## Migration

### From QR to Pairing

1. Clear existing session:
   ```bash
   rm -rf ./your-session
   ```

2. Update code:
   ```javascript
   const client = new Client({
       loginMethod: 'pairing', // Changed
       phoneNumber: '628123456789', // Added
       sessionId: 'your-session'
   });
   ```

3. Add event handler:
   ```javascript
   client.on('pairing.code', (code) => {
       console.log('Code:', code);
   });
   ```

### From Pairing to QR

1. Clear existing session:
   ```bash
   rm -rf ./your-session
   ```

2. Update code:
   ```javascript
   const client = new Client({
       loginMethod: 'qr', // Changed
       sessionId: 'your-session'
       // Remove phoneNumber
   });
   ```

3. Remove pairing handler and QR will auto-display

## Troubleshooting

### QR Code Issues
- QR not displaying → Check terminal supports unicode
- QR too small → Adjust terminal font size
- QR expired → Restart bot for new QR

### Pairing Code Issues
- No code generated → Check phone number format
- Code expired → Restart for new code (60s limit)
- Invalid phone → Use country code without +

## Examples

See the examples directory:
- [`examples/basic-bot.js`](../examples/basic-bot.js) - QR Code method
- [`examples/pairing-bot.js`](../examples/pairing-bot.js) - Pairing Code method
- [`examples/pairing-advanced.js`](../examples/pairing-advanced.js) - Advanced pairing

## Documentation

- [Pairing Mode Complete Guide](./PAIRING-MODE.md)
- [Main README](../README.md)

## Summary

| Method | Best For |
|--------|----------|
| **QR Code** | Local development, GUI environments |
| **Pairing Code** | Production, headless servers, automation |

**Recommendation:**
- Development: Use QR Code
- Production: Use Pairing Code
- Both work great - choose based on your deployment environment!

---

Still have questions? Check the [Pairing Mode Guide](./PAIRING-MODE.md) or [open an issue](https://github.com/idlanyor/kachina-core/issues).
