# Events

Kachina-MD provides an event-driven architecture built on Node.js EventEmitter. This guide covers all available events and how to use them effectively.

## Overview

The Client class emits various events throughout its lifecycle. You can listen to these events to respond to different WhatsApp interactions.

```javascript
client.on('event-name', (data) => {
    // Handle event
});
```

## Connection Events

### ready

Emitted when the bot is successfully connected and ready to operate.

**Event Data:**
```typescript
{
    id: string,        // Bot JID (e.g., '628xxx:45@s.whatsapp.net')
    name: string,      // Bot display name
    // ... other user properties
}
```

**Example:**

```javascript
client.on('ready', (user) => {
    console.log('✅ Bot is ready!');
    console.log('Bot Number:', user.id.split(':')[0]);
    console.log('Bot Name:', user.name);
    
    // You can now send messages
    // await client.sendText(ownerJid, 'Bot is online!');
});
```

---

### connecting

Emitted when the bot is attempting to connect to WhatsApp.

**Event Data:** None

**Example:**

```javascript
client.on('connecting', () => {
    console.log('🔄 Connecting to WhatsApp...');
});
```

---

### reconnecting

Emitted when the bot is reconnecting after a disconnection.

**Event Data:** None

**Example:**

```javascript
client.on('reconnecting', () => {
    console.log('🔄 Reconnecting to WhatsApp...');
    // Optional: Notify admins
    // await notifyAdmins('Bot is reconnecting...');
});
```

---

### logout

Emitted when the bot is logged out (manual logout or session invalidated).

**Event Data:** None

**Example:**

```javascript
client.on('logout', () => {
    console.log('👋 Bot logged out');
    
    // Cleanup and exit
    process.exit(0);
});
```

## Authentication Events

### pairing.code

Emitted when a pairing code is generated (only in pairing login method).

**Event Data:** `string` - 8-digit pairing code

**Example:**

```javascript
client.on('pairing.code', (code) => {
    console.log('📱 Pairing Code:', code);
    
    // Send code via API, email, SMS, etc.
    sendCodeViaSMS(phoneNumber, code);
    
    // Or display in web interface
    // io.emit('pairing-code', code);
});
```

---

### pairing.error

Emitted when pairing code request fails.

**Event Data:** `Error` object

**Example:**

```javascript
client.on('pairing.error', (error) => {
    console.error('❌ Pairing error:', error.message);
    
    // Handle error
    if (error.message.includes('Invalid phone')) {
        console.log('Please check phone number format');
    }
});
```

## Message Events

### message

Emitted when a new message is received.

**Event Data:** Serialized message object

**Example:**

```javascript
client.on('message', async (m) => {
    // Skip messages from self
    if (m.fromMe) return;
    
    console.log('📩 Message from:', m.pushName);
    console.log('Content:', m.body);
    
    // Handle commands
    if (m.body === '!ping') {
        await m.reply('Pong! 🏓');
    }
    
    // Handle media
    if (m.message?.imageMessage) {
        console.log('Image received');
        const buffer = await m.download();
        // Process image...
    }
});
```

**Message Properties:**

```typescript
{
    key: Object,           // Message key
    chat: string,          // Chat JID
    sender: string,        // Sender JID
    pushName: string,      // Sender name
    body: string,          // Message text
    type: string,          // Message type
    fromMe: boolean,       // From bot
    isGroup: boolean,      // Is group message
    quoted: Object,        // Quoted message
    message: Object,       // Raw message
    
    // Helper methods
    reply: Function,       // Reply to message
    react: Function,       // React to message
    download: Function,    // Download media
    delete: Function,      // Delete message
    forward: Function      // Forward message
}
```

See [Messages Guide](/guide/core/messages) for complete documentation.

## Group Events

### group.update

Emitted when group participants change (add, remove, promote, demote).

**Event Data:**

```typescript
{
    id: string,              // Group JID
    participants: string[],  // Affected participant JIDs
    action: string          // 'add' | 'remove' | 'promote' | 'demote'
}
```

**Example:**

```javascript
client.on('group.update', async (update) => {
    const { id, participants, action } = update;
    
    try {
        const metadata = await client.groupMetadata(id);
        
        for (const participant of participants) {
            const number = participant.split('@')[0];
            
            if (action === 'add') {
                const text = `Welcome @${number} to *${metadata.subject}*! 👋`;
                await client.sendMessage(id, {
                    text,
                    mentions: [participant]
                });
            }
            
            else if (action === 'remove') {
                const text = `Goodbye @${number}! 👋`;
                await client.sendMessage(id, {
                    text,
                    mentions: [participant]
                });
            }
            
            else if (action === 'promote') {
                const text = `Congratulations @${number}! Now admin! 👑`;
                await client.sendMessage(id, {
                    text,
                    mentions: [participant]
                });
            }
            
            else if (action === 'demote') {
                const text = `@${number} is no longer admin`;
                await client.sendMessage(id, {
                    text,
                    mentions: [participant]
                });
            }
        }
    } catch (error) {
        console.error('Group update error:', error);
    }
});
```

---

### groups.update

Emitted when group metadata changes (name, description, settings, etc.).

**Event Data:** Array of group update objects

```typescript
[
    {
        id: string,           // Group JID
        subject?: string,     // New group name
        desc?: string,        // New description
        // ... other metadata
    }
]
```

**Example:**

```javascript
client.on('groups.update', (updates) => {
    updates.forEach(update => {
        console.log('Group updated:', update.id);
        
        if (update.subject) {
            console.log('New name:', update.subject);
        }
        
        if (update.desc) {
            console.log('New description:', update.desc);
        }
    });
});
```

---

### call

Emitted when receiving a call.

**Event Data:** Array of call objects

```typescript
[
    {
        from: string,          // Caller JID
        id: string,            // Call ID
        status: string,        // Call status
        isGroup: boolean,      // Is group call
        isVideo: boolean,      // Is video call
        // ... other call data
    }
]
```

**Example:**

```javascript
client.on('call', async (calls) => {
    for (const call of calls) {
        console.log('📞 Call from:', call.from);
        console.log('Video:', call.isVideo);
        console.log('Status:', call.status);
        
        // Auto reject calls
        if (call.status === 'offer') {
            await client.sock.rejectCall(call.id, call.from);
            await client.sendText(call.from, 
                '❌ Sorry, I don\'t accept calls!'
            );
        }
    }
});
```

## Event Patterns

### Multiple Event Handlers

You can attach multiple handlers to the same event:

```javascript
// Logger
client.on('message', (m) => {
    console.log(`[${m.pushName}]: ${m.body}`);
});

// Command handler
client.on('message', async (m) => {
    if (m.body?.startsWith('!')) {
        await handleCommand(m);
    }
});

// Analytics
client.on('message', async (m) => {
    await analytics.track('message', {
        from: m.sender,
        type: m.type
    });
});
```

### Event Once

Listen to event only once:

```javascript
client.once('ready', (user) => {
    console.log('First connection:', user.name);
    // This only runs once
});
```

### Remove Event Listener

```javascript
const handler = (m) => {
    console.log('Message:', m.body);
};

// Add listener
client.on('message', handler);

// Remove listener later
client.off('message', handler);
// or
client.removeListener('message', handler);
```

### Error Handling in Events

Always wrap event handlers in try-catch:

```javascript
client.on('message', async (m) => {
    try {
        // Your logic here
        if (m.body === '!error') {
            throw new Error('Test error');
        }
    } catch (error) {
        console.error('Message handler error:', error);
        await m.reply('An error occurred!').catch(() => {});
    }
});
```

## Advanced Patterns

### Event Middleware Chain

Create a middleware pattern for events:

```javascript
const middlewares = [];

// Add middleware
middlewares.push(async (m, next) => {
    console.log('Logger:', m.body);
    await next();
});

middlewares.push(async (m, next) => {
    if (m.fromMe) return; // Skip bot messages
    await next();
});

middlewares.push(async (m, next) => {
    // Spam filter
    if (isSpam(m.body)) {
        await m.delete();
        return;
    }
    await next();
});

// Execute middleware chain
client.on('message', async (m) => {
    let index = 0;
    
    const next = async () => {
        if (index < middlewares.length) {
            const middleware = middlewares[index++];
            await middleware(m, next);
        } else {
            // Final handler
            await handleMessage(m);
        }
    };
    
    await next().catch(console.error);
});
```

### Event Emitter Pattern

Create custom events:

```javascript
import { EventEmitter } from 'events';

class BotEvents extends EventEmitter {}
const botEvents = new BotEvents();

// Emit custom event from message handler
client.on('message', (m) => {
    if (m.body?.startsWith('!admin')) {
        botEvents.emit('admin-command', m);
    }
});

// Listen to custom event
botEvents.on('admin-command', async (m) => {
    console.log('Admin command received');
    // Handle admin command
});
```

### Rate Limiting

Implement rate limiting in events:

```javascript
const rateLimits = new Map();
const RATE_LIMIT = 5000; // 5 seconds

client.on('message', async (m) => {
    const now = Date.now();
    const lastUsed = rateLimits.get(m.sender) || 0;
    
    if (now - lastUsed < RATE_LIMIT) {
        return await m.reply('⏰ Please wait before sending another command');
    }
    
    rateLimits.set(m.sender, now);
    
    // Process command
    await handleCommand(m);
});
```

### Event Logging

Log all events for debugging:

```javascript
const events = [
    'ready', 'connecting', 'reconnecting', 'logout',
    'pairing.code', 'pairing.error',
    'message', 'group.update', 'groups.update', 'call'
];

events.forEach(event => {
    client.on(event, (...args) => {
        console.log(`Event: ${event}`, args);
    });
});
```

## Best Practices

### 1. Always Handle Errors

```javascript
client.on('message', async (m) => {
    try {
        await processMessage(m);
    } catch (error) {
        console.error('Error:', error);
        await m.reply('Error occurred').catch(() => {});
    }
});
```

### 2. Avoid Blocking Operations

```javascript
// ❌ Bad: Blocking
client.on('message', async (m) => {
    const result = heavyComputation(); // Blocks event loop
    await m.reply(result);
});

// ✅ Good: Non-blocking
client.on('message', async (m) => {
    setImmediate(async () => {
        const result = await heavyComputation();
        await m.reply(result);
    });
});
```

### 3. Clean Up Resources

```javascript
client.on('logout', async () => {
    // Close database
    await db.close();
    
    // Clear intervals
    clearInterval(heartbeatInterval);
    
    // Save state
    await saveState();
    
    process.exit(0);
});
```

### 4. Use Event Namespacing

```javascript
// Group related events
client.on('group.update', handleGroupParticipants);
client.on('groups.update', handleGroupMetadata);
```

## See Also

- [Client Guide](/guide/core/client) - Client class documentation
- [Messages Guide](/guide/core/messages) - Message handling
- [Plugins Guide](/guide/core/plugins) - Create event-based plugins
- [API Reference](/api/client) - Complete API reference
