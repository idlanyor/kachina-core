# Client

The [`Client`](c:\Users\Administrator\kachina-core\src\client\Client.js) class is the core of Kachina-MD. It handles WhatsApp connection, message processing, and event management.

## Overview

The Client class extends Node.js `EventEmitter`, providing an event-driven architecture for your WhatsApp bot.

```javascript
import { Client } from '@roidev/kachina-md';

const client = new Client({
    sessionId: 'my-bot',
    prefix: '!',
    owners: ['628123456789']
});
```

## Constructor

### Syntax

```javascript
new Client(options)
```

### Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sessionId` | `string` | `'kachina-session'` | Session folder name for storing auth data |
| `loginMethod` | `'qr'\|'pairing'` | `'qr'` | Authentication method |
| `phoneNumber` | `string` | `''` | Phone number for pairing (format: 628xxx) |
| `owners` | `string[]` | `[]` | Bot owner phone numbers |
| `prefix` | `string` | `'!'` | Command prefix for plugins |
| `browser` | `string[]` | `['Kachina-MD', 'Chrome', '1.0.0']` | Browser identification |
| `logger` | `Object` | Pino silent logger | Custom logger instance |
| `store` | `Object` | `null` | Message store for caching |

### Examples

#### Basic Setup

```javascript
const client = new Client({
    sessionId: 'my-bot',
    prefix: '!'
});
```

#### With Pairing Method

```javascript
const client = new Client({
    sessionId: 'pairing-bot',
    loginMethod: 'pairing',
    phoneNumber: '628123456789',
    owners: ['628123456789']
});
```

#### With Custom Logger

```javascript
import pino from 'pino';

const client = new Client({
    sessionId: 'my-bot',
    logger: pino({ level: 'debug' })
});
```

## Properties

### client.sock

The underlying Baileys socket instance. Use this for direct access to Baileys API.

```javascript
// Access raw socket
const socket = client.sock;

// Send presence update
await client.sock.sendPresenceUpdate('available');

// Get profile picture
const ppUrl = await client.sock.profilePictureUrl(jid);
```

### client.user

Current bot user information (available after `ready` event).

```javascript
client.on('ready', (user) => {
    console.log('Bot ID:', client.user.id);
    console.log('Bot Name:', client.user.name);
});
```

### client.isReady

Boolean indicating connection status.

```javascript
if (client.isReady) {
    await client.sendText(jid, 'Bot is ready!');
}
```

### client.config

Client configuration object.

```javascript
console.log('Session:', client.config.sessionId);
console.log('Prefix:', client.config.prefix);
console.log('Owners:', client.config.owners);
```

### client.pluginHandler

Plugin handler instance for managing plugins.

```javascript
// Get loaded plugins
const plugins = client.pluginHandler.list();

// Get specific plugin
const pingPlugin = client.pluginHandler.get('ping');
```

### client.prefix

Get or set command prefix.

```javascript
// Get prefix
console.log(client.prefix); // '!'

// Set new prefix
client.prefix = '/';
```

## Methods

### start()

Start the WhatsApp connection.

```javascript
await client.start();
```

**Returns:** `Promise<WASocket>` - Baileys socket instance

**Throws:** `Error` if phone number is invalid (pairing mode)

**Example:**

```javascript
try {
    await client.start();
    console.log('Bot started successfully');
} catch (error) {
    console.error('Failed to start:', error);
}
```

### Plugin Methods

#### loadPlugin(path)

Load a single plugin file.

```javascript
await client.loadPlugin('./plugins/ping.js');
```

#### loadPlugins(directory)

Load all plugins from a directory.

```javascript
await client.loadPlugins('./plugins');
```

## Events

The Client emits various events during its lifecycle.

### Connection Events

#### ready

Emitted when bot is connected and ready to receive messages.

```javascript
client.on('ready', (user) => {
    console.log('Bot ready!');
    console.log('User ID:', user.id);
    console.log('User Name:', user.name);
});
```

**Parameters:**
- `user` - Bot user object containing `id`, `name`, etc.

#### connecting

Emitted when connection is in progress.

```javascript
client.on('connecting', () => {
    console.log('Connecting to WhatsApp...');
});
```

#### reconnecting

Emitted when bot is reconnecting after disconnect.

```javascript
client.on('reconnecting', () => {
    console.log('Reconnecting...');
});
```

#### logout

Emitted when bot is logged out.

```javascript
client.on('logout', () => {
    console.log('Logged out');
    process.exit(0);
});
```

### Authentication Events

#### pairing.code

Emitted when pairing code is generated (pairing method only).

```javascript
client.on('pairing.code', (code) => {
    console.log('Pairing Code:', code);
    // Send code via API, email, etc.
});
```

**Parameters:**
- `code` - 8-digit pairing code string

#### pairing.error

Emitted when pairing code request fails.

```javascript
client.on('pairing.error', (error) => {
    console.error('Pairing failed:', error);
});
```

**Parameters:**
- `error` - Error object

### Message Events

#### message

Emitted when a new message is received.

```javascript
client.on('message', async (m) => {
    console.log('From:', m.sender);
    console.log('Body:', m.body);
    
    if (m.body === '!ping') {
        await m.reply('Pong!');
    }
});
```

**Parameters:**
- `m` - Serialized message object

See [Messages Guide](/guide/core/messages) for full message object documentation.

### Group Events

#### group.update

Emitted when group participants change (add/remove/promote/demote).

```javascript
client.on('group.update', (update) => {
    console.log('Group:', update.id);
    console.log('Action:', update.action);
    console.log('Participants:', update.participants);
});
```

**Parameters:**
- `update.id` - Group JID
- `update.action` - Action type: `'add'`, `'remove'`, `'promote'`, `'demote'`
- `update.participants` - Array of affected participant JIDs

#### groups.update

Emitted when group metadata changes (name, description, settings, etc.).

```javascript
client.on('groups.update', (updates) => {
    updates.forEach(update => {
        console.log('Group updated:', update.id);
    });
});
```

#### call

Emitted when receiving a call.

```javascript
client.on('call', (calls) => {
    calls.forEach(call => {
        console.log('Call from:', call.from);
        console.log('Call status:', call.status);
    });
});
```

## Best Practices

### 1. Error Handling

Always wrap start() and message handlers in try-catch:

```javascript
try {
    await client.start();
} catch (error) {
    console.error('Start error:', error);
    process.exit(1);
}

client.on('message', async (m) => {
    try {
        // Your message handling logic
        if (m.body === '!test') {
            await m.reply('Test successful!');
        }
    } catch (error) {
        console.error('Message handler error:', error);
        await m.reply('An error occurred!').catch(() => {});
    }
});
```

### 2. Graceful Shutdown

Handle process termination:

```javascript
process.on('SIGINT', async () => {
    console.log('Shutting down...');
    // Save data, cleanup, etc.
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
});
```

### 3. Owner Verification

Use owner check for sensitive commands:

```javascript
client.on('message', async (m) => {
    if (m.body === '!eval') {
        const isOwner = client.pluginHandler.isOwner(m.sender);
        
        if (!isOwner) {
            return await m.reply('Owner only command!');
        }
        
        // Execute eval
    }
});
```

### 4. Session Management

Store sessions separately from code:

```javascript
const client = new Client({
    sessionId: `bot-${process.env.BOT_ID}`,
    // Other options...
});
```

### 5. Resource Cleanup

Clean up resources on logout:

```javascript
client.on('logout', async () => {
    // Close database connections
    await db.close();
    
    // Save state
    await saveState();
    
    // Exit process
    process.exit(0);
});
```

## Advanced Usage

### Custom Message Store

Implement a custom message store for caching:

```javascript
import { makeInMemoryStore } from '@whiskeysockets/baileys';

const store = makeInMemoryStore({});
store.readFromFile('./baileys_store.json');

// Save every 10s
setInterval(() => {
    store.writeToFile('./baileys_store.json');
}, 10000);

const client = new Client({
    sessionId: 'my-bot',
    store: store
});
```

### Multiple Clients

Run multiple bots simultaneously:

```javascript
const bots = [];

for (let i = 1; i <= 3; i++) {
    const bot = new Client({
        sessionId: `bot-${i}`,
        prefix: '!'
    });
    
    bot.on('ready', (user) => {
        console.log(`Bot ${i} ready:`, user.name);
    });
    
    await bot.start();
    bots.push(bot);
}
```

### Event Middleware

Create reusable event handlers:

```javascript
function createLogger(prefix) {
    return (m) => {
        console.log(`[${prefix}] ${m.pushName}: ${m.body}`);
    };
}

const logger = createLogger('BOT');
client.on('message', logger);
```

## Debugging

Enable debug logging:

```javascript
import pino from 'pino';

const client = new Client({
    sessionId: 'debug-bot',
    logger: pino({
        level: 'debug',
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true
            }
        }
    })
});
```

## See Also

- [Messages Guide](/guide/core/messages) - Handle incoming messages
- [Events Guide](/guide/core/events) - All available events
- [Plugins Guide](/guide/core/plugins) - Create bot plugins
- [API Reference](/api/client) - Complete API documentation
