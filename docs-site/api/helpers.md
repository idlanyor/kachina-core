# Helpers API

Complete API reference for utility functions and helper classes in Kachina-MD.

## Database

### Database Class

Simple JSON-based database wrapper using LowDB.

**Import:**
```javascript
import { Database } from '@roidev/kachina-md';
```

**Constructor:**
```javascript
const db = new Database(options?)
```

**Options:**
```javascript
{
    path: string  // Database directory path (default: './database')
}
```

**Example:**
```javascript
const db = new Database({ path: './data' });
```

---

### Database Methods

#### set(collection, key, value)

Set a value in collection.

```javascript
await db.set('users', 'user123', {
    name: 'John',
    balance: 1000
});
```

**Returns:** The value that was set

---

#### get(collection, key, defaultValue?)

Get a value from collection.

```javascript
const user = await db.get('users', 'user123', {
    name: 'Unknown',
    balance: 0
});
```

**Returns:** Value or default value if key doesn't exist

---

#### has(collection, key)

Check if key exists.

```javascript
const exists = await db.has('users', 'user123');
```

**Returns:** `boolean`

---

#### delete(collection, key)

Delete a key.

```javascript
await db.delete('users', 'user123');
```

**Returns:** `boolean`

---

#### all(collection)

Get all data from collection.

```javascript
const allUsers = await db.all('users');
// { user123: {...}, user456: {...} }
```

**Returns:** `Object` - All collection data

---

#### clear(collection)

Clear all data from collection.

```javascript
await db.clear('users');
```

**Returns:** `boolean`

---

#### update(collection, key, updater)

Update a value.

```javascript
// Using function
await db.update('users', 'user123', (user) => ({
    ...user,
    balance: user.balance + 100
}));

// Using object merge
await db.update('users', 'user123', {
    balance: 1500
});
```

**Returns:** Updated value

---

#### increment(collection, key, field, amount?)

Increment a numeric field.

```javascript
// Increment by 1 (default)
await db.increment('users', 'user123', 'loginCount');

// Increment by specific amount
await db.increment('users', 'user123', 'balance', 100);
```

**Returns:** Updated object

---

#### push(collection, key, value)

Push value to array.

```javascript
await db.push('users', 'user123.items', 'sword');
await db.push('users', 'user123.items', 'shield');
// items = ['sword', 'shield']
```

**Returns:** Updated array

---

#### pull(collection, key, value)

Remove value from array.

```javascript
await db.pull('users', 'user123.items', 'sword');
```

**Returns:** Updated array

---

#### collection(name, defaultData?)

Get or create a LowDB collection instance.

```javascript
const usersDb = await db.collection('users', {});

// Direct LowDB operations
usersDb.data.user123 = { name: 'John' };
await usersDb.write();
```

**Returns:** `Promise<Low>` - LowDB instance

---

### Database Examples

```javascript
// User economy system
const db = new Database();

// Register user
await db.set('users', userId, {
    name: userName,
    balance: 1000,
    inventory: [],
    lastDaily: 0
});

// Add money
await db.increment('users', userId, 'balance', 500);

// Add item to inventory
await db.push('users', userId + '.inventory', 'sword');

// Check if user exists
if (await db.has('users', userId)) {
    console.log('User exists');
}

// Get user data
const user = await db.get('users', userId);

// Update user
await db.update('users', userId, {
    lastDaily: Date.now()
});

// Get all users
const allUsers = await db.all('users');
```

---

## Logger

### Logger Class

Colored console logger with different log levels.

**Import:**
```javascript
import { Logger } from '@roidev/kachina-md';
```

**Constructor:**
```javascript
const logger = new Logger(options?)
```

**Options:**
```javascript
{
    level: 'debug' | 'info' | 'success' | 'warn' | 'error',  // Minimum level (default: 'info')
    prefix: string  // Prefix for all messages (default: '')
}
```

**Example:**
```javascript
const logger = new Logger({
    prefix: 'BOT',
    level: 'debug'
});
```

---

### Logger Methods

#### debug(...args)

Log debug message (gray).

```javascript
logger.debug('Debugging info', { data: 'value' });
```

---

#### info(...args)

Log info message (blue).

```javascript
logger.info('Bot started successfully');
```

---

#### success(...args)

Log success message (green).

```javascript
logger.success('Connected to WhatsApp');
```

---

#### warn(...args)

Log warning message (yellow).

```javascript
logger.warn('Rate limit approaching');
```

---

#### error(...args)

Log error message (red).

```javascript
logger.error('Connection failed:', error);
```

---

#### command(command, from)

Log command execution (cyan).

```javascript
logger.command('!ping', 'User@s.whatsapp.net');
```

---

### Logger Examples

```javascript
const logger = new Logger({ prefix: 'MyBot' });

logger.info('Bot starting...');
logger.success('Bot ready!');
logger.warn('Low memory');
logger.error('Connection lost');
logger.debug('Debug info:', { foo: 'bar' });
logger.command('!ping', '628xxx@s.whatsapp.net');
```

---

## Utility Functions

### sleep(ms)

Sleep for specified milliseconds.

```javascript
import { sleep } from '@roidev/kachina-md';

await sleep(1000);  // Sleep for 1 second
console.log('Done sleeping');
```

**Returns:** `Promise<void>`

---

### formatTime(seconds)

Format seconds into human-readable time string.

```javascript
import { formatTime } from '@roidev/kachina-md';

formatTime(90);       // "1m 30s"
formatTime(3661);     // "1h 1m 1s"
formatTime(90000);    // "1d 1h 0m"
```

**Returns:** `string`

---

### formatBytes(bytes)

Format bytes into human-readable size string.

```javascript
import { formatBytes } from '@roidev/kachina-md';

formatBytes(1024);        // "1 KB"
formatBytes(1536000);     // "1.46 MB"
formatBytes(0);           // "0 B"
```

**Returns:** `string`

---

### parseCommand(text, prefix?)

Parse command from text message.

```javascript
import { parseCommand } from '@roidev/kachina-md';

const result = parseCommand('!help me', '!');
// { command: 'help', args: ['me'], text: 'me' }

parseCommand('hello');  // null (no command)
```

**Returns:** `{command: string, args: string[], text: string} | null`

---

### isUrl(text)

Check if text is a URL.

```javascript
import { isUrl } from '@roidev/kachina-md';

isUrl('https://example.com');  // true
isUrl('hello world');          // false
```

**Returns:** `boolean`

---

### extractUrls(text)

Extract all URLs from text.

```javascript
import { extractUrls } from '@roidev/kachina-md';

const urls = extractUrls('Visit https://example.com and http://test.com');
// ['https://example.com', 'http://test.com']
```

**Returns:** `string[]`

---

### randomString(length?)

Generate random alphanumeric string.

```javascript
import { randomString } from '@roidev/kachina-md';

randomString(5);   // "aB3xZ"
randomString();    // "a1B2c3D4e5" (10 chars default)
```

**Returns:** `string`

---

### randomNumber(min, max)

Generate random number in range.

```javascript
import { randomNumber } from '@roidev/kachina-md';

randomNumber(1, 10);    // Random number 1-10 (inclusive)
randomNumber(0, 100);   // Random number 0-100
```

**Returns:** `number`

---

### pickRandom(array)

Pick random element from array.

```javascript
import { pickRandom } from '@roidev/kachina-md';

const color = pickRandom(['red', 'blue', 'green']);
const number = pickRandom([1, 2, 3, 4, 5]);
```

**Returns:** `T` - Random element

---

### chunk(array, size)

Split array into chunks of specified size.

```javascript
import { chunk } from '@roidev/kachina-md';

chunk([1, 2, 3, 4, 5], 2);  // [[1, 2], [3, 4], [5]]
chunk(['a', 'b', 'c', 'd'], 2);  // [['a', 'b'], ['c', 'd']]
```

**Returns:** `T[][]` - Array of chunks

---

## Complete Examples

### Economy Bot with Database

```javascript
import { Client, Database } from '@roidev/kachina-md';

const client = new Client({ sessionId: 'economy-bot' });
const db = new Database();

client.on('message', async (m) => {
    const userId = m.sender;
    
    // Balance command
    if (m.body === '!balance') {
        const user = await db.get('users', userId, { balance: 0 });
        await m.reply(`💰 Balance: $${user.balance}`);
    }
    
    // Daily reward
    if (m.body === '!daily') {
        const user = await db.get('users', userId, {
            balance: 0,
            lastDaily: 0
        });
        
        const now = Date.now();
        const cooldown = 24 * 60 * 60 * 1000; // 24 hours
        
        if (now - user.lastDaily < cooldown) {
            return await m.reply('Already claimed today!');
        }
        
        await db.increment('users', userId, 'balance', 1000);
        await db.update('users', userId, { lastDaily: now });
        
        await m.reply('✅ Claimed $1000 daily reward!');
    }
});
```

---

### Logging Bot

```javascript
import { Client, Logger } from '@roidev/kachina-md';

const client = new Client({ sessionId: 'log-bot' });
const logger = new Logger({ prefix: 'BOT' });

client.on('ready', (user) => {
    logger.success('Bot ready!');
    logger.info('Number:', user.id.split(':')[0]);
});

client.on('message', async (m) => {
    logger.info(`[${m.pushName}]: ${m.body}`);
    
    if (m.body?.startsWith('!')) {
        logger.command(m.body, m.sender);
    }
});

client.on('reconnecting', () => {
    logger.warn('Reconnecting...');
});

client.on('logout', () => {
    logger.error('Bot logged out');
});
```

---

### Utility Usage Example

```javascript
import {
    formatTime,
    formatBytes,
    randomString,
    pickRandom,
    chunk
} from '@roidev/kachina-md';

client.on('message', async (m) => {
    // Uptime command
    if (m.body === '!uptime') {
        const uptime = formatTime(process.uptime());
        await m.reply(`⏰ Uptime: ${uptime}`);
    }
    
    // Stats command
    if (m.body === '!stats') {
        const memory = process.memoryUsage();
        const stats = `
*📊 Bot Stats*

Uptime: ${formatTime(process.uptime())}
Memory: ${formatBytes(memory.heapUsed)}
        `.trim();
        
        await m.reply(stats);
    }
    
    // Random command
    if (m.body === '!random') {
        const choices = ['Option A', 'Option B', 'Option C'];
        const choice = pickRandom(choices);
        await m.reply(`🎲 Random: ${choice}`);
    }
    
    // Generate ID
    if (m.body === '!genid') {
        const id = randomString(8);
        await m.reply(`🆔 ID: ${id}`);
    }
});
```

---

### Batch Processing with chunk()

```javascript
import { chunk } from '@roidev/kachina-md';

// Send messages in batches
const recipients = [...]; // Large array of JIDs

const batches = chunk(recipients, 10); // 10 per batch

for (const batch of batches) {
    for (const jid of batch) {
        await client.sendText(jid, 'Broadcast message');
    }
    
    // Wait between batches
    await sleep(5000);
}
```

---

## TypeScript Definitions

```typescript
// Database
class Database {
    constructor(options?: { path?: string });
    
    set<T>(collection: string, key: string, value: T): Promise<T>;
    get<T>(collection: string, key: string, defaultValue?: T): Promise<T>;
    has(collection: string, key: string): Promise<boolean>;
    delete(collection: string, key: string): Promise<boolean>;
    all<T>(collection: string): Promise<T>;
    clear(collection: string): Promise<boolean>;
    update<T>(collection: string, key: string, updater: Function | object): Promise<T>;
    increment(collection: string, key: string, field: string, amount?: number): Promise<any>;
    push<T>(collection: string, key: string, value: T): Promise<T[]>;
    pull<T>(collection: string, key: string, value: T): Promise<T[]>;
    collection(name: string, defaultData?: any): Promise<Low>;
}

// Logger
class Logger {
    constructor(options?: {
        level?: 'debug' | 'info' | 'success' | 'warn' | 'error';
        prefix?: string;
    });
    
    debug(...args: any[]): void;
    info(...args: any[]): void;
    success(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    command(command: string, from: string): void;
}

// Utilities
function sleep(ms: number): Promise<void>;
function formatTime(seconds: number): string;
function formatBytes(bytes: number): string;
function parseCommand(text: string, prefix?: string): {
    command: string;
    args: string[];
    text: string;
} | null;
function isUrl(text: string): boolean;
function extractUrls(text: string): string[];
function randomString(length?: number): string;
function randomNumber(min: number, max: number): number;
function pickRandom<T>(array: T[]): T;
function chunk<T>(array: T[], size: number): T[][];
```

---

## See Also

- [Client API](/api/client) - Client methods
- [Messages API](/api/messages) - Message handling
- [Examples](/examples/basic-bot) - Usage examples
- [Plugin Guide](/guide/core/plugins) - Using helpers in plugins
