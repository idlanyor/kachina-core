# Client API Reference

The `Client` class is the main interface for interacting with WhatsApp.

## Constructor

```javascript
new Client(options)
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options` | `Object` | `{}` | Configuration options |

### Options

```typescript
interface ClientOptions {
    // Session management
    sessionId?: string;                    // Session folder name (default: 'kachina-session')

    // Authentication
    loginMethod?: 'qr' | 'pairing';       // Login method (default: 'qr')
    phoneNumber?: string;                  // Phone number for pairing (format: 628123456789)
    owners?: string[];                     // Bot owner phone numbers

    // Configuration
    browser?: [string, string, string];   // Browser metadata (default: ['Kachina-MD', 'Chrome', '1.0.0'])
    prefix?: string;                       // Command prefix (default: '!')
    logger?: Logger;                       // Pino logger instance
    store?: Object;                        // Optional message store for caching
}
```

### Example

```javascript
import { Client } from '@roidev/kachina-md';

const client = new Client({
    sessionId: 'my-bot',
    loginMethod: 'qr',
    prefix: '!',
    browser: ['MyBot', 'Chrome', '1.0.0']
});
```

## Methods

### Connection Methods

#### `start()`

Start the client and connect to WhatsApp.

```javascript
await client.start()
```

**Returns:** `Promise<WASocket>`

**Example:**

```javascript
await client.start();
console.log('Client started');
```

---

### Message Methods

#### `sendText(jid, text, options)`

Send a text message.

```javascript
await client.sendText(jid, text, options)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jid` | `string` | Yes | Chat ID |
| `text` | `string` | Yes | Message text |
| `options` | `Object` | No | Additional options |

**Example:**

```javascript
await client.sendText('628xxx@s.whatsapp.net', 'Hello!');

// With options
await client.sendText(jid, 'Hello!', {
    quoted: message // Reply to a message
});
```

---

#### `sendImage(jid, buffer, caption, options)`

Send an image message.

```javascript
await client.sendImage(jid, buffer, caption, options)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jid` | `string` | Yes | Chat ID |
| `buffer` | `Buffer\|string` | Yes | Image buffer, URL, or file path |
| `caption` | `string` | No | Image caption |
| `options` | `Object` | No | Additional options |

**Example:**

```javascript
import fs from 'fs';

const buffer = fs.readFileSync('image.jpg');
await client.sendImage(jid, buffer, 'Check this out!');
```

---

#### `sendVideo(jid, buffer, caption, options)`

Send a video message.

```javascript
await client.sendVideo(jid, buffer, caption, options)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jid` | `string` | Yes | Chat ID |
| `buffer` | `Buffer\|string` | Yes | Video buffer, URL, or file path |
| `caption` | `string` | No | Video caption |
| `options` | `Object` | No | Additional options |

**Example:**

```javascript
const buffer = fs.readFileSync('video.mp4');
await client.sendVideo(jid, buffer, 'Cool video!');
```

---

#### `sendAudio(jid, buffer, options)`

Send an audio message.

```javascript
await client.sendAudio(jid, buffer, options)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jid` | `string` | Yes | Chat ID |
| `urlBuffer` | `Buffer\|string` | Yes | Audio buffer, URL, or file path |
| `options` | `Object` | No | Additional options |

**Options:**

```javascript
{
    mimetype: 'audio/mp4',  // Audio mimetype
    ptt: false              // Push to talk (voice note)
}
```

**Example:**

```javascript
const buffer = fs.readFileSync('audio.mp3');

// Regular audio
await client.sendAudio(jid, buffer);

// Voice note
await client.sendAudio(jid, buffer, { ptt: true });
```

---

#### `sendDocument(jid, buffer, filename, mimetype, options)`

Send a document.

```javascript
await client.sendDocument(jid, buffer, filename, mimetype, options)
```

**Example:**

```javascript
const buffer = fs.readFileSync('document.pdf');
await client.sendDocument(
    jid,
    buffer,
    'document.pdf',
    'application/pdf'
);
```

---

#### `sendSticker(jid, buffer, options)`

Create and send a sticker from an image/video buffer.

```javascript
await client.sendSticker(jid, buffer, options)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jid` | `string` | Yes | Chat ID |
| `buffer` | `Buffer\|string` | Yes | Image/video buffer, URL, or file path |
| `options` | `Object` | No | Sticker options |

**Options:**

```javascript
{
    pack: 'Sticker Pack',   // Pack name
    author: 'Author Name',  // Author name
    type: StickerTypes.DEFAULT, // Sticker type
    quality: 50,            // Quality (0-100)
    background: 'transparent' // Background color
}
```

**Sticker Types:**

- `Client.StickerTypes.DEFAULT` - Default sticker
- `Client.StickerTypes.FULL` - Full image (no crop)
- `Client.StickerTypes.CROPPED` - Cropped to square
- `Client.StickerTypes.CIRCLE` - Circle shaped
- `Client.StickerTypes.ROUNDED` - Rounded corners

**Example:**

```javascript
const buffer = fs.readFileSync('image.jpg');

await client.sendSticker(jid, buffer, {
    pack: 'My Pack',
    author: 'Bot',
    type: Client.StickerTypes.CIRCLE
});
```

---

#### `sendContact(jid, contacts, options)`

Send contact card(s).

```javascript
await client.sendContact(jid, contacts, options)
```

**Parameters:**

```javascript
const contacts = [
    {
        displayName: 'John Doe',
        vcard: 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEND:VCARD'
    }
];

await client.sendContact(jid, contacts);
```

---

#### `sendLocation(jid, latitude, longitude, options)`

Send a location.

```javascript
await client.sendLocation(jid, latitude, longitude, options)
```

**Example:**

```javascript
await client.sendLocation(jid, -6.2088, 106.8456); // Jakarta
```

---

#### `sendPoll(jid, name, values, options)`

Send a poll.

```javascript
await client.sendPoll(jid, name, values, options)
```

**Example:**

```javascript
await client.sendPoll(
    jid,
    'Favorite color?',
    ['Red', 'Blue', 'Green'],
    { selectableCount: 1 }
);
```

---

#### `sendReact(jid, messageKey, emoji)`

React to a message.

```javascript
await client.sendReact(jid, messageKey, emoji)
```

**Example:**

```javascript
await client.sendReact(jid, message.key, '👍');
```

---

### View Once Methods

#### `readViewOnce(quotedMessage)`

Read and download a view once message.

```javascript
await client.readViewOnce(quotedMessage)
```

**Returns:**

```javascript
{
    buffer: Buffer,                    // Media buffer
    type: 'image' | 'video' | 'audio', // Media type
    caption: string,                   // Original caption
    mimetype?: string,                 // Audio mimetype (for audio only)
    ptt?: boolean                      // Push to talk flag (for audio only)
}
```

**Example:**

```javascript
const { buffer, type, caption } = await client.readViewOnce(m.quoted);

console.log('Type:', type);
console.log('Caption:', caption);
```

---

#### `sendViewOnce(jid, quotedMessage, options)`

Read a view once message and send it to a chat.

```javascript
await client.sendViewOnce(jid, quotedMessage, options)
```

**Example:**

```javascript
// Reveal view once
await client.sendViewOnce(jid, m.quoted);

// With reply
await client.sendViewOnce(jid, m.quoted, { quoted: m });
```

---

### Group Methods

#### `groupMetadata(jid)`

Get group metadata.

```javascript
await client.groupMetadata(jid)
```

**Returns:** Group information (name, participants, admins, etc.)

---

#### `groupParticipantsUpdate(jid, participants, action)`

Update group participants.

```javascript
await client.groupParticipantsUpdate(jid, participants, action)
```

**Actions:** `'add'`, `'remove'`, `'promote'`, `'demote'`

**Example:**

```javascript
// Add members
await client.groupParticipantsUpdate(
    groupJid,
    ['628xxx@s.whatsapp.net'],
    'add'
);

// Remove members
await client.groupParticipantsUpdate(
    groupJid,
    ['628xxx@s.whatsapp.net'],
    'remove'
);

// Promote to admin
await client.groupParticipantsUpdate(
    groupJid,
    ['628xxx@s.whatsapp.net'],
    'promote'
);
```

---

#### `groupUpdateSubject(jid, subject)`

Update group name.

```javascript
await client.groupUpdateSubject(jid, subject)
```

---

#### `groupUpdateDescription(jid, description)`

Update group description.

```javascript
await client.groupUpdateDescription(jid, description)
```

---

### Plugin Methods

#### `loadPlugin(path)`

Load a single plugin.

```javascript
await client.loadPlugin('./plugins/ping.js')
```

---

#### `loadPlugins(directory)`

Load all plugins from a directory.

```javascript
await client.loadPlugins('./plugins')
```

---

## Properties

### `client.sock`

The underlying Baileys socket instance.

```javascript
const socket = client.sock;
```

### `client.user`

Current user information (available after 'ready' event).

```javascript
client.on('ready', (user) => {
    console.log('User ID:', client.user.id);
    console.log('User name:', client.user.name);
});
```

### `client.isReady`

Boolean indicating if the client is ready.

```javascript
if (client.isReady) {
    // Client is connected and ready
}
```

### `client.prefix`

Get or set the command prefix.

```javascript
// Get
console.log(client.prefix); // '!'

// Set
client.prefix = '/';
```

### `client.config`

Client configuration object.

```javascript
console.log(client.config.sessionId);
console.log(client.config.loginMethod);
```

---

## Events

Events are emitted using the EventEmitter pattern.

### Connection Events

#### `ready`

Emitted when the client is connected and ready.

```javascript
client.on('ready', (user) => {
    console.log('Ready!', user.name);
});
```

---

#### `connecting`

Emitted when connection is in progress.

```javascript
client.on('connecting', () => {
    console.log('Connecting...');
});
```

---

#### `reconnecting`

Emitted when reconnecting.

```javascript
client.on('reconnecting', () => {
    console.log('Reconnecting...');
});
```

---

#### `logout`

Emitted when logged out.

```javascript
client.on('logout', () => {
    console.log('Logged out');
});
```

---

### Authentication Events

#### `pairing.code`

Emitted when pairing code is generated (pairing method only).

```javascript
client.on('pairing.code', (code) => {
    console.log('Pairing code:', code);
});
```

---

#### `pairing.error`

Emitted when pairing fails.

```javascript
client.on('pairing.error', (error) => {
    console.error('Pairing error:', error);
});
```

---

### Message Events

#### `message`

Emitted when a new message is received.

```javascript
client.on('message', async (message) => {
    console.log('From:', message.from);
    console.log('Body:', message.body);
});
```

**Message Object:**

```javascript
{
    key: Object,           // Message key
    chat: string,          // Chat JID (remoteJid)
    from: string,          // Sender JID (alias for chat)
    sender: string,        // Sender JID
    body: string,          // Message text
    pushName: string,      // Sender name
    fromMe: boolean,       // From bot
    isGroup: boolean,      // Is group message
    quoted: Object,        // Quoted message
    type: string,          // Message type
    message: Object,       // Raw message object
    caption: string,       // Media caption
    mimetype: string,      // Media mime type
    fileSize: number,      // Media file size
    mentions: Array,       // Mentioned JIDs
    // Helper methods
    reply: Function,       // Reply to message
    react: Function,       // React with emoji
    download: Function,    // Download media
    delete: Function,      // Delete message
    forward: Function      // Forward message
}
```

---

### Group Events

#### `group.update`

Emitted when group participants change.

```javascript
client.on('group.update', (update) => {
    console.log('Group update:', update);
});
```

---

#### `groups.update`

Emitted when group metadata changes.

```javascript
client.on('groups.update', (updates) => {
    console.log('Groups updated:', updates);
});
```

---

#### `call`

Emitted when receiving a call.

```javascript
client.on('call', (calls) => {
    console.log('Incoming call:', calls);
});
```

---

## Static Properties

### `Client.StickerTypes`

Sticker type constants.

```javascript
Client.StickerTypes.DEFAULT
Client.StickerTypes.FULL
Client.StickerTypes.CROPPED
Client.StickerTypes.CIRCLE
Client.StickerTypes.ROUNDED
```

---

## Examples

See the [Examples](/examples/basic-bot) section for complete working examples.

## Next Steps

- [Message Handling Guide](/guide/core/messages)
- [Feature Guides](/guide/features/sending-messages)
- [Examples](/examples/basic-bot)
