# Messages API

Complete reference for message objects and message-related methods in Kachina-MD.

## Message Object

When you receive a message via the `message` event, you get a serialized message object with the following structure:

### Properties

#### Basic Properties

| Property | Type | Description |
|----------|------|-------------|
| `key` | `Object` | Unique message identifier |
| `chat` | `string` | Chat JID (remoteJid) |
| `sender` | `string` | Sender JID |
| `pushName` | `string` | Sender's display name |
| `fromMe` | `boolean` | Whether message is from bot |
| `isGroup` | `boolean` | Whether chat is a group |

#### Content Properties

| Property | Type | Description |
|----------|------|-------------|
| `body` | `string` | Message text content |
| `type` | `string` | Message type (e.g., 'conversation', 'imageMessage') |
| `message` | `Object` | Raw Baileys message object |

#### Media Properties

| Property | Type | Description |
|----------|------|-------------|
| `caption` | `string` | Media caption |
| `mimetype` | `string` | Media MIME type |
| `fileSize` | `number` | Media file size in bytes |

#### Interaction Properties

| Property | Type | Description |
|----------|------|-------------|
| `quoted` | `Message` | Quoted/replied message object |
| `mentions` | `string[]` | Array of mentioned JIDs |

### Methods

#### reply(text, options)

Reply to the message.

```javascript
await m.reply('Hello!');

// With options
await m.reply('Hello!', {
    mentions: [jid1, jid2]
});
```

**Parameters:**
- `text` (string) - Reply text
- `options` (Object) - Optional Baileys message options

**Returns:** `Promise<Object>` - Sent message object

---

#### react(emoji)

React to the message with an emoji.

```javascript
await m.react('👍');
await m.react('❤️');
await m.react('');  // Remove reaction
```

**Parameters:**
- `emoji` (string) - Emoji character or empty string to remove

**Returns:** `Promise<Object>` - Reaction object

---

#### download()

Download media from the message.

```javascript
if (m.message?.imageMessage) {
    const buffer = await m.download();
    // buffer is a Node.js Buffer
}
```

**Returns:** `Promise<Buffer>` - Media buffer

**Throws:** Error if message has no media

---

#### delete()

Delete the message.

```javascript
await m.delete();
```

**Returns:** `Promise<Object>` - Delete result

---

#### forward(jid, options)

Forward the message to another chat.

```javascript
await m.forward('628xxx@s.whatsapp.net');

// With options
await m.forward(jid, {
    quoted: anotherMessage
});
```

**Parameters:**
- `jid` (string) - Target chat JID
- `options` (Object) - Optional message options

**Returns:** `Promise<Object>` - Forwarded message

---

#### copyNForward(jid, options)

Copy and forward message (alternative forwarding method).

```javascript
await m.copyNForward('628xxx@s.whatsapp.net');
```

**Parameters:**
- `jid` (string) - Target chat JID
- `options` (Object) - Optional message options

**Returns:** `Promise<Object>` - Forwarded message

---

## Message Types

### Text Message

```javascript
{
    type: 'conversation',
    body: 'Hello, world!',
    message: {
        conversation: 'Hello, world!'
    }
}
```

### Extended Text (with links, mentions, etc.)

```javascript
{
    type: 'extendedTextMessage',
    body: 'Check this @user',
    mentions: ['628xxx@s.whatsapp.net'],
    message: {
        extendedTextMessage: {
            text: 'Check this @user',
            contextInfo: {
                mentionedJid: ['628xxx@s.whatsapp.net']
            }
        }
    }
}
```

### Image Message

```javascript
{
    type: 'imageMessage',
    caption: 'My photo',
    mimetype: 'image/jpeg',
    fileSize: 123456,
    message: {
        imageMessage: {
            caption: 'My photo',
            mimetype: 'image/jpeg',
            fileLength: 123456,
            width: 1920,
            height: 1080,
            mediaKey: '...',
            // ... other properties
        }
    }
}
```

### Video Message

```javascript
{
    type: 'videoMessage',
    caption: 'My video',
    mimetype: 'video/mp4',
    fileSize: 1234567,
    message: {
        videoMessage: {
            caption: 'My video',
            mimetype: 'video/mp4',
            fileLength: 1234567,
            seconds: 30,
            width: 1920,
            height: 1080,
            // ... other properties
        }
    }
}
```

### Audio Message

```javascript
{
    type: 'audioMessage',
    mimetype: 'audio/ogg; codecs=opus',
    fileSize: 12345,
    message: {
        audioMessage: {
            mimetype: 'audio/ogg; codecs=opus',
            fileLength: 12345,
            seconds: 10,
            ptt: true,  // Push to talk (voice note)
            // ... other properties
        }
    }
}
```

### Document Message

```javascript
{
    type: 'documentMessage',
    caption: 'Important file',
    mimetype: 'application/pdf',
    fileSize: 234567,
    message: {
        documentMessage: {
            fileName: 'document.pdf',
            mimetype: 'application/pdf',
            fileLength: 234567,
            pageCount: 10,
            // ... other properties
        }
    }
}
```

### Sticker Message

```javascript
{
    type: 'stickerMessage',
    mimetype: 'image/webp',
    fileSize: 23456,
    message: {
        stickerMessage: {
            mimetype: 'image/webp',
            fileLength: 23456,
            width: 512,
            height: 512,
            // ... other properties
        }
    }
}
```

### Contact Message

```javascript
{
    type: 'contactMessage',
    message: {
        contactMessage: {
            displayName: 'John Doe',
            vcard: 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\n...'
        }
    }
}
```

### Location Message

```javascript
{
    type: 'locationMessage',
    message: {
        locationMessage: {
            degreesLatitude: -6.2088,
            degreesLongitude: 106.8456,
            name: 'Jakarta',
            address: 'Indonesia'
        }
    }
}
```

### Poll Message

```javascript
{
    type: 'pollCreationMessage',
    message: {
        pollCreationMessage: {
            name: 'Favorite color?',
            options: [
                { optionName: 'Red' },
                { optionName: 'Blue' },
                { optionName: 'Green' }
            ],
            selectableOptionsCount: 1
        }
    }
}
```

### Button Response Message

```javascript
{
    type: 'buttonsResponseMessage',
    body: 'button_id',  // The button ID that was clicked
    message: {
        buttonsResponseMessage: {
            selectedButtonId: 'button_id',
            selectedDisplayText: 'Button Text'
        }
    }
}
```

### List Response Message

```javascript
{
    type: 'listResponseMessage',
    body: 'row_id',  // The row ID that was selected
    message: {
        listResponseMessage: {
            singleSelectReply: {
                selectedRowId: 'row_id'
            },
            title: 'Selected Option',
            description: 'Option description'
        }
    }
}
```

### Template Button Reply

```javascript
{
    type: 'templateButtonReplyMessage',
    body: 'button_id',  // The quick reply button ID
    message: {
        templateButtonReplyMessage: {
            selectedId: 'button_id',
            selectedDisplayText: 'Button Text'
        }
    }
}
```

### Interactive Response Message

```javascript
{
    type: 'interactiveResponseMessage',
    body: 'button_id',  // Parsed from nativeFlowResponseMessage
    message: {
        interactiveResponseMessage: {
            nativeFlowResponseMessage: {
                paramsJson: '{"id":"button_id","display_text":"Button Text"}'
            }
        }
    }
}
```

## Quoted Messages

When a message is a reply to another message:

```javascript
{
    // ... message properties
    quoted: {
        key: Object,
        chat: string,
        sender: string,
        pushName: string,
        body: string,
        type: string,
        message: Object,
        
        // Quoted message also has methods
        download: Function,
        // ... other methods
    }
}
```

### Access Quoted Message

```javascript
client.on('message', async (m) => {
    if (m.quoted) {
        console.log('Reply to:', m.quoted.body);
        console.log('Original sender:', m.quoted.pushName);
        
        // Download media from quoted message
        if (m.quoted.message?.imageMessage) {
            const buffer = await m.quoted.download();
        }
    }
});
```

## Message Key

The `key` object uniquely identifies a message:

```javascript
{
    remoteJid: '628xxx@s.whatsapp.net',  // Chat ID
    fromMe: false,                        // From bot
    id: '3EB0XXXXX',                      // Message ID
    participant: '628yyy@s.whatsapp.net'  // Sender (in groups)
}
```

### Use Cases

```javascript
// React to specific message
await client.sendReact(jid, m.key, '👍');

// Delete specific message
await client.sock.sendMessage(jid, { delete: m.key });

// Forward specific message
await client.sock.sendMessage(jid, { forward: { key: m.key } });
```

## Checking Message Types

### Check for Media

```javascript
const hasImage = m.message?.imageMessage;
const hasVideo = m.message?.videoMessage;
const hasAudio = m.message?.audioMessage;
const hasDocument = m.message?.documentMessage;
const hasSticker = m.message?.stickerMessage;
```

### Check for Specific Features

```javascript
// Has quoted message
if (m.quoted) {
    console.log('Is a reply');
}

// Has mentions
if (m.mentions.length > 0) {
    console.log('Has mentions');
}

// Has caption
if (m.caption) {
    console.log('Has caption:', m.caption);
}

// Is from group
if (m.isGroup) {
    console.log('From group');
}

// Is from bot
if (m.fromMe) {
    console.log('From bot itself');
}
```

## Message Processing Examples

### Auto-Reply Bot

```javascript
client.on('message', async (m) => {
    if (m.fromMe) return;
    
    const text = m.body?.toLowerCase();
    
    if (text === 'hello') {
        await m.reply('Hi there! 👋');
    }
    
    if (text === 'help') {
        await m.reply('Available commands:\n!ping\n!help\n!info');
    }
});
```

### Media Processor

```javascript
client.on('message', async (m) => {
    // Process images
    if (m.message?.imageMessage) {
        await m.react('📷');
        const buffer = await m.download();
        
        // Process image
        console.log('Image size:', buffer.length);
    }
    
    // Process videos
    if (m.message?.videoMessage) {
        await m.react('🎥');
        const duration = m.message.videoMessage.seconds;
        console.log('Video duration:', duration, 'seconds');
    }
});
```

### Quote Reply Handler

```javascript
client.on('message', async (m) => {
    if (m.quoted && m.body === '!quote') {
        const quotedText = m.quoted.body || 'Media message';
        await m.reply(`You quoted: "${quotedText}"`);
    }
});
```

### Mention Handler

```javascript
client.on('message', async (m) => {
    if (m.mentions.length > 0) {
        const mentionedNames = m.mentions.map(jid => 
            `@${jid.split('@')[0]}`
        ).join(', ');
        
        await m.reply(`You mentioned: ${mentionedNames}`, {
            mentions: m.mentions
        });
    }
});
```

### Download and Forward

```javascript
client.on('message', async (m) => {
    if (m.body === '!forward' && m.quoted) {
        // Forward to another chat
        await m.quoted.forward('628xxx@s.whatsapp.net');
        await m.react('✅');
    }
    
    if (m.body === '!save' && m.message?.imageMessage) {
        // Download and save
        const buffer = await m.download();
        fs.writeFileSync('saved.jpg', buffer);
        await m.reply('Image saved!');
    }
});
```

## Raw Message Access

Access the raw Baileys message object:

```javascript
client.on('message', async (m) => {
    // Raw message
    console.log(m.message);
    
    // Specific message types
    const imageMsg = m.message.imageMessage;
    const videoMsg = m.message.videoMessage;
    const textMsg = m.message.conversation || 
                   m.message.extendedTextMessage?.text;
    
    // Context info
    const contextInfo = m.message.extendedTextMessage?.contextInfo;
    if (contextInfo) {
        console.log('Quoted:', contextInfo.quotedMessage);
        console.log('Mentions:', contextInfo.mentionedJid);
        console.log('Forwarded:', contextInfo.isForwarded);
    }
});
```

## TypeScript Definitions

```typescript
interface Message {
    // Identifiers
    key: MessageKey;
    chat: string;
    sender: string;
    
    // Content
    body: string;
    type: string;
    message: WAMessage;
    
    // Metadata
    pushName: string;
    fromMe: boolean;
    isGroup: boolean;
    
    // Media
    caption?: string;
    mimetype?: string;
    fileSize?: number;
    
    // Interactions
    quoted?: Message;
    mentions: string[];
    
    // Methods
    reply(text: string, options?: MessageOptions): Promise<any>;
    react(emoji: string): Promise<any>;
    download(): Promise<Buffer>;
    delete(): Promise<any>;
    forward(jid: string, options?: MessageOptions): Promise<any>;
    copyNForward(jid: string, options?: MessageOptions): Promise<any>;
}

interface MessageKey {
    remoteJid: string;
    fromMe: boolean;
    id: string;
    participant?: string;
}
```

## See Also

- [Messages Guide](/guide/core/messages) - Message handling guide
- [Client API](/api/client) - Client methods
- [Media API](/api/media) - Media handling
- [Examples](/examples/basic-bot) - Usage examples
