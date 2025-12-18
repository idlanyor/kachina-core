# Media API

Complete API reference for media handling in Kachina-MD.

## Media Sending Methods

All media methods support three input types: Buffer, URL string, or file path.

### sendImage(jid, buffer, caption, options)

Send an image message.

**Signature:**
```javascript
await client.sendImage(jid, buffer, caption?, options?)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jid` | `string` | Yes | Chat JID |
| `buffer` | `Buffer\|string` | Yes | Image buffer, URL, or file path |
| `caption` | `string` | No | Image caption |
| `options` | `Object` | No | Additional options |

**Options:**
```javascript
{
    quoted: MessageObject,     // Reply to message
    mentions: string[],        // Mentioned JIDs
    jpegThumbnail: Buffer,     // Custom thumbnail
    // ... other Baileys options
}
```

**Examples:**

```javascript
// From buffer
const buffer = fs.readFileSync('image.jpg');
await client.sendImage(jid, buffer, 'My photo');

// From URL
await client.sendImage(jid, 'https://example.com/image.jpg', 'Downloaded');

// From file path
await client.sendImage(jid, './photos/pic.jpg', 'Local file');

// With options
await client.sendImage(jid, buffer, 'Caption', {
    quoted: m,
    mentions: ['628xxx@s.whatsapp.net']
});
```

**Returns:** `Promise<Object>` - Sent message object

**Supported formats:** JPG, PNG, GIF, WebP

---

### sendVideo(jid, buffer, caption, options)

Send a video message.

**Signature:**
```javascript
await client.sendVideo(jid, buffer, caption?, options?)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jid` | `string` | Yes | Chat JID |
| `buffer` | `Buffer\|string` | Yes | Video buffer, URL, or file path |
| `caption` | `string` | No | Video caption |
| `options` | `Object` | No | Additional options |

**Options:**
```javascript
{
    quoted: MessageObject,     // Reply to message
    gifPlayback: boolean,      // Play as GIF (default: false)
    jpegThumbnail: Buffer,     // Custom thumbnail
    seconds: number,           // Video duration
    // ... other Baileys options
}
```

**Examples:**

```javascript
// Basic video
await client.sendVideo(jid, buffer, 'My video');

// GIF playback
await client.sendVideo(jid, buffer, 'Animated', {
    gifPlayback: true
});

// From URL
await client.sendVideo(jid, 'https://example.com/video.mp4');
```

**Returns:** `Promise<Object>` - Sent message object

**Supported formats:** MP4, AVI, MKV, MOV, WebM

---

### sendAudio(jid, urlBuffer, options)

Send audio file or voice note.

**Signature:**
```javascript
await client.sendAudio(jid, urlBuffer, options?)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jid` | `string` | Yes | Chat JID |
| `urlBuffer` | `Buffer\|string` | Yes | Audio buffer, URL, or file path |
| `options` | `Object` | No | Audio options |

**Options:**
```javascript
{
    mimetype: string,          // MIME type (default: 'audio/mp4')
    ptt: boolean,              // Push to talk/voice note (default: false)
    seconds: number,           // Duration in seconds
    // ... other Baileys options
}
```

**Examples:**

```javascript
// Regular audio
await client.sendAudio(jid, buffer, {
    mimetype: 'audio/mp3',
    ptt: false
});

// Voice note
await client.sendAudio(jid, buffer, {
    mimetype: 'audio/ogg; codecs=opus',
    ptt: true
});

// From URL
await client.sendAudio(jid, 'https://example.com/song.mp3');
```

**Returns:** `Promise<Object>` - Sent message object

**Supported formats:** MP3, OGG, AAC, M4A, WAV

---

### sendDocument(jid, buffer, filename, mimetype, options)

Send a document file.

**Signature:**
```javascript
await client.sendDocument(jid, buffer, filename, mimetype, options?)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jid` | `string` | Yes | Chat JID |
| `buffer` | `Buffer\|string` | Yes | Document buffer, URL, or file path |
| `filename` | `string` | Yes | File name with extension |
| `mimetype` | `string` | Yes | MIME type |
| `options` | `Object` | No | Additional options |

**Common MIME types:**

| File Type | MIME Type |
|-----------|-----------|
| PDF | `application/pdf` |
| Word | `application/msword` |
| Word (docx) | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| Excel | `application/vnd.ms-excel` |
| Excel (xlsx) | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| ZIP | `application/zip` |
| RAR | `application/x-rar-compressed` |
| Text | `text/plain` |
| CSV | `text/csv` |
| JSON | `application/json` |

**Examples:**

```javascript
// PDF document
await client.sendDocument(
    jid,
    buffer,
    'document.pdf',
    'application/pdf'
);

// From URL
await client.sendDocument(
    jid,
    'https://example.com/file.pdf',
    'remote.pdf',
    'application/pdf'
);

// With options
await client.sendDocument(jid, buffer, 'file.pdf', 'application/pdf', {
    quoted: m,
    caption: 'Important document'
});
```

**Returns:** `Promise<Object>` - Sent message object

---

### sendSticker(jid, buffer, options)

Send a sticker (automatically created from image/video).

**Signature:**
```javascript
await client.sendSticker(jid, buffer, options?)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jid` | `string` | Yes | Chat JID |
| `buffer` | `Buffer\|string` | Yes | Image/video buffer, URL, or file path |
| `options` | `StickerOptions` | No | Sticker options |

**Options:**
```javascript
{
    pack: string,              // Sticker pack name (default: 'Sticker')
    author: string,            // Author name (default: 'Kachina Bot')
    type: StickerTypes,        // Sticker type
    quality: number,           // Quality 0-100 (default: 50)
    background: string,        // Background color (default: 'transparent')
    categories: string[],      // Emoji categories
}
```

**Sticker Types:**
- `Client.StickerTypes.DEFAULT` - Default sticker
- `Client.StickerTypes.FULL` - Full image (no crop)
- `Client.StickerTypes.CROPPED` - Cropped to square
- `Client.StickerTypes.CIRCLE` - Circle shaped
- `Client.StickerTypes.ROUNDED` - Rounded corners

**Examples:**

```javascript
// Basic sticker
await client.sendSticker(jid, buffer, {
    pack: 'My Stickers',
    author: 'Bot'
});

// Circle sticker
await client.sendSticker(jid, buffer, {
    type: Client.StickerTypes.CIRCLE,
    pack: 'Profile Pics'
});

// From URL
await client.sendSticker(jid, 'https://example.com/image.jpg', {
    pack: 'Downloaded',
    author: 'Bot'
});
```

**Returns:** `Promise<Object>` - Sent message object

See [Stickers API](/api/stickers) for more sticker methods.

---

## Other Media Methods

### sendContact(jid, contacts, options)

Send contact card(s).

**Parameters:**
- `jid` - Chat JID
- `contacts` - Array of contact objects
- `options` - Optional message options

**Contact format:**
```javascript
{
    displayName: string,
    vcard: string  // VCard format
}
```

**Example:**
```javascript
await client.sendContact(jid, [{
    displayName: 'John Doe',
    vcard: 'BEGIN:VCARD\n' +
           'VERSION:3.0\n' +
           'FN:John Doe\n' +
           'TEL;type=CELL;type=VOICE;waid=628123456789:+62 812-3456-789\n' +
           'END:VCARD'
}]);
```

---

### sendLocation(jid, latitude, longitude, options)

Send location coordinates.

**Parameters:**
- `jid` - Chat JID
- `latitude` - Latitude (number)
- `longitude` - Longitude (number)
- `options` - Optional message options

**Example:**
```javascript
await client.sendLocation(jid, -6.2088, 106.8456);
```

---

### sendPoll(jid, name, values, options)

Send a poll.

**Parameters:**
- `jid` - Chat JID
- `name` - Poll question (string)
- `values` - Poll options (string[])
- `options` - Poll options

**Options:**
```javascript
{
    selectableCount: number  // Number of selectable options (default: 1)
}
```

**Example:**
```javascript
await client.sendPoll(
    jid,
    'Favorite color?',
    ['Red', 'Blue', 'Green', 'Yellow'],
    { selectableCount: 1 }
);
```

---

### sendReact(jid, messageKey, emoji)

React to a message.

**Parameters:**
- `jid` - Chat JID
- `messageKey` - Message key object
- `emoji` - Emoji character (or empty string to remove)

**Example:**
```javascript
await client.sendReact(jid, m.key, '👍');
await client.sendReact(jid, m.key, '');  // Remove reaction
```

---

## Media Download Methods

### Message.download()

Download media from a message object.

**Signature:**
```javascript
const buffer = await message.download()
```

**Returns:** `Promise<Buffer>` - Media buffer

**Example:**
```javascript
client.on('message', async (m) => {
    if (m.message?.imageMessage) {
        const buffer = await m.download();
        console.log('Downloaded:', buffer.length, 'bytes');
    }
});
```

---

### downloadMediaMessage()

Lower-level Baileys method for downloading media.

**Signature:**
```javascript
import { downloadMediaMessage } from 'baileys';

const buffer = await downloadMediaMessage(
    message,
    'buffer',
    {},
    { logger, reuploadRequest }
)
```

**Note:** Use `m.download()` instead for simpler usage.

---

## View Once Methods

### readViewOnce(quotedMessage)

Read and download view once message.

**Signature:**
```javascript
const result = await client.readViewOnce(quotedMessage)
```

**Parameters:**
- `quotedMessage` - Quoted message object (m.quoted)

**Returns:**
```javascript
{
    buffer: Buffer,                    // Media buffer
    type: 'image' | 'video' | 'audio', // Media type
    caption: string,                   // Original caption
    mimetype?: string,                 // Audio MIME type (audio only)
    ptt?: boolean                      // Push to talk flag (audio only)
}
```

**Example:**
```javascript
const { buffer, type, caption } = await client.readViewOnce(m.quoted);

if (type === 'image') {
    await client.sendImage(jid, buffer, caption);
} else if (type === 'video') {
    await client.sendVideo(jid, buffer, caption);
} else if (type === 'audio') {
    await client.sendAudio(jid, buffer, {
        mimetype: result.mimetype,
        ptt: result.ptt
    });
}
```

---

### sendViewOnce(jid, quotedMessage, options)

Read view once and send to chat.

**Signature:**
```javascript
await client.sendViewOnce(jid, quotedMessage, options?)
```

**Parameters:**
- `jid` - Target chat JID
- `quotedMessage` - Quoted view once message
- `options` - Optional message options

**Example:**
```javascript
await client.sendViewOnce(jid, m.quoted);
```

See [View Once Guide](/guide/features/view-once) for detailed usage.

---

## Media Utilities

### _normalizeMediaInput(input)

Internal method that normalizes media input.

**Handles:**
- Buffer → Returns as-is
- String (URL) → Wraps in `{ url: string }`
- String (file path) → Wraps in `{ url: string }`
- Object with url → Returns as-is

**Note:** This is an internal method. Media methods call it automatically.

---

## Media Information

### Get Media Metadata

Extract media information from message:

```javascript
client.on('message', async (m) => {
    // Image info
    if (m.message?.imageMessage) {
        const img = m.message.imageMessage;
        console.log('Size:', img.fileLength);
        console.log('Dimensions:', img.width, 'x', img.height);
        console.log('MIME:', img.mimetype);
        console.log('SHA256:', img.fileSha256);
    }
    
    // Video info
    if (m.message?.videoMessage) {
        const vid = m.message.videoMessage;
        console.log('Duration:', vid.seconds, 'seconds');
        console.log('Size:', vid.fileLength);
        console.log('Dimensions:', vid.width, 'x', vid.height);
    }
    
    // Audio info
    if (m.message?.audioMessage) {
        const aud = m.message.audioMessage;
        console.log('Duration:', aud.seconds, 'seconds');
        console.log('MIME:', aud.mimetype);
        console.log('Is voice note:', aud.ptt);
    }
    
    // Document info
    if (m.message?.documentMessage) {
        const doc = m.message.documentMessage;
        console.log('Filename:', doc.fileName);
        console.log('MIME:', doc.mimetype);
        console.log('Size:', doc.fileLength);
        console.log('Pages:', doc.pageCount);
    }
});
```

---

## TypeScript Definitions

```typescript
interface Client {
    // Image
    sendImage(
        jid: string,
        buffer: Buffer | string,
        caption?: string,
        options?: MessageOptions
    ): Promise<any>;
    
    // Video
    sendVideo(
        jid: string,
        buffer: Buffer | string,
        caption?: string,
        options?: MessageOptions & { gifPlayback?: boolean }
    ): Promise<any>;
    
    // Audio
    sendAudio(
        jid: string,
        urlBuffer: Buffer | string,
        options?: MessageOptions & {
            mimetype?: string;
            ptt?: boolean;
        }
    ): Promise<any>;
    
    // Document
    sendDocument(
        jid: string,
        buffer: Buffer | string,
        filename: string,
        mimetype: string,
        options?: MessageOptions
    ): Promise<any>;
    
    // Sticker
    sendSticker(
        jid: string,
        buffer: Buffer | string,
        options?: StickerOptions
    ): Promise<any>;
    
    // View Once
    readViewOnce(quotedMessage: any): Promise<{
        buffer: Buffer;
        type: 'image' | 'video' | 'audio';
        caption: string;
        mimetype?: string;
        ptt?: boolean;
    }>;
    
    sendViewOnce(
        jid: string,
        quotedMessage: any,
        options?: MessageOptions
    ): Promise<any>;
}

interface StickerOptions {
    pack?: string;
    author?: string;
    type?: StickerTypes;
    quality?: number;
    background?: string;
    categories?: string[];
}
```

---

## Best Practices

### 1. Validate File Size

```javascript
const MAX_SIZE = 16 * 1024 * 1024; // 16MB

if (buffer.length > MAX_SIZE) {
    throw new Error('File too large');
}
```

### 2. Handle Errors

```javascript
try {
    await client.sendImage(jid, buffer, 'Caption');
} catch (error) {
    console.error('Failed to send:', error);
    await m.reply('Failed to send image');
}
```

### 3. Use Appropriate MIME Types

```javascript
// Correct
await client.sendDocument(jid, buffer, 'file.pdf', 'application/pdf');

// Wrong
await client.sendDocument(jid, buffer, 'file.pdf', 'text/plain');
```

### 4. Check Media Before Download

```javascript
if (m.message?.imageMessage) {
    const size = m.message.imageMessage.fileLength;
    if (size > MAX_SIZE) {
        return await m.reply('Image too large!');
    }
    const buffer = await m.download();
}
```

---

## See Also

- [Sending Messages Guide](/guide/features/sending-messages) - Usage guide
- [Media Handling Guide](/guide/features/media) - Detailed guide
- [Stickers API](/api/stickers) - Sticker methods
- [Client API](/api/client) - Client methods
