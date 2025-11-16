# View Once Message Handler

Complete example of handling view once messages in Kachina-MD.

## Basic View Once Handler

```javascript
import { Client } from '@roidev/kachina-md';

const client = new Client({
    sessionId: 'viewonce-bot',
    prefix: '!'
});

client.on('message', async (m) => {
    // Check if message quotes a view once message
    if (m.quoted?.message?.viewOnceMessageV2) {
        // Read the view once message
        const { buffer, type, caption } = await client.readViewOnce(m.quoted);
        
        console.log('View once type:', type);
        console.log('Caption:', caption);
        
        // Send back to user
        if (type === 'image') {
            await client.sendImage(m.chat, buffer, `📷 View Once Image\n${caption}`);
        } else if (type === 'video') {
            await client.sendVideo(m.chat, buffer, `🎥 View Once Video\n${caption}`);
        } else if (type === 'audio') {
            await client.sendAudio(m.chat, buffer, {
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            });
        }
    }
});

client.start();
```

## Auto-Save View Once Bot

Automatically save view once messages to a specific chat.

```javascript
import { Client } from '@roidev/kachina-md';
import fs from 'fs';
import path from 'path';

const client = new Client({
    sessionId: 'viewonce-saver',
    owners: ['628xxx@s.whatsapp.net']
});

const SAVE_FOLDER = './viewonce-saves';
const SAVE_CHAT = '628xxx@s.whatsapp.net'; // Your personal number

// Create save folder
if (!fs.existsSync(SAVE_FOLDER)) {
    fs.mkdirSync(SAVE_FOLDER, { recursive: true });
}

client.on('message', async (m) => {
    // Detect view once messages
    if (m.message?.viewOnceMessageV2) {
        try {
            // Download the view once content
            const buffer = await m.download();
            const type = m.message.viewOnceMessageV2.message?.imageMessage ? 'image' :
                        m.message.viewOnceMessageV2.message?.videoMessage ? 'video' : 'audio';
            
            const timestamp = Date.now();
            const sender = m.pushName || m.sender.split('@')[0];
            
            // Save to file
            let filename;
            let ext;
            
            if (type === 'image') {
                ext = 'jpg';
                filename = `viewonce_${sender}_${timestamp}.${ext}`;
            } else if (type === 'video') {
                ext = 'mp4';
                filename = `viewonce_${sender}_${timestamp}.${ext}`;
            } else {
                ext = 'ogg';
                filename = `viewonce_${sender}_${timestamp}.${ext}`;
            }
            
            const filepath = path.join(SAVE_FOLDER, filename);
            fs.writeFileSync(filepath, buffer);
            
            console.log(`✅ Saved view once from ${sender}: ${filename}`);
            
            // Send notification to owner
            const caption = m.caption || 'No caption';
            const info = `
📸 *View Once Detected*

From: ${sender}
Type: ${type}
Time: ${new Date(timestamp).toLocaleString()}
Caption: ${caption}

File saved: ${filename}
            `.trim();
            
            // Send the saved media to owner
            if (type === 'image') {
                await client.sendImage(SAVE_CHAT, buffer, info);
            } else if (type === 'video') {
                await client.sendVideo(SAVE_CHAT, buffer, info);
            } else {
                await client.sendAudio(SAVE_CHAT, buffer);
                await client.sendText(SAVE_CHAT, info);
            }
            
        } catch (error) {
            console.error('Failed to save view once:', error);
        }
    }
});

client.start();
```

## Command-Based View Once Reader

```javascript
import { Client } from '@roidev/kachina-md';

const client = new Client({
    sessionId: 'viewonce-reader',
    prefix: '!'
});

client.on('message', async (m) => {
    // !readvo command - read quoted view once
    if (m.body === '!readvo' || m.body === '!rvo') {
        if (!m.quoted) {
            return await m.reply('❌ Reply to a view once message!');
        }
        
        if (!m.quoted.message?.viewOnceMessageV2) {
            return await m.reply('❌ That is not a view once message!');
        }
        
        try {
            await m.react('⏳');
            
            const result = await client.readViewOnce(m.quoted);
            const { buffer, type, caption } = result;
            
            const info = `
📸 *View Once Revealed*

Type: ${type}
From: ${m.quoted.pushName}
Caption: ${caption || 'No caption'}
            `.trim();
            
            // Send based on type
            if (type === 'image') {
                await client.sendImage(m.chat, buffer, info);
            } else if (type === 'video') {
                await client.sendVideo(m.chat, buffer, info);
            } else if (type === 'audio') {
                await client.sendAudio(m.chat, buffer, {
                    mimetype: result.mimetype,
                    ptt: result.ptt
                });
                await m.reply(info);
            }
            
            await m.react('✅');
            
        } catch (error) {
            await m.react('❌');
            await m.reply('❌ Failed to read view once message');
            console.error(error);
        }
    }
    
    // !sendvo command - forward view once to another chat
    if (m.body?.startsWith('!sendvo ')) {
        if (!m.quoted?.message?.viewOnceMessageV2) {
            return await m.reply('❌ Reply to a view once message!');
        }
        
        const target = m.body.slice(8).trim();
        
        if (!target) {
            return await m.reply('❌ Usage: !sendvo <number>\nExample: !sendvo 628xxx');
        }
        
        const targetJid = target.includes('@') ? target : `${target}@s.whatsapp.net`;
        
        try {
            await client.sendViewOnce(targetJid, m.quoted);
            await m.reply(`✅ View once sent to ${target}`);
        } catch (error) {
            await m.reply('❌ Failed to send view once');
            console.error(error);
        }
    }
});

client.start();
```

## Advanced View Once Manager

With database tracking and statistics.

```javascript
import { Client, Database } from '@roidev/kachina-md';
import fs from 'fs';

const client = new Client({
    sessionId: 'viewonce-manager',
    owners: ['628xxx@s.whatsapp.net']
});

const db = new Database();
const SAVE_DIR = './viewonce-archive';

if (!fs.existsSync(SAVE_DIR)) {
    fs.mkdirSync(SAVE_DIR, { recursive: true });
}

// Track view once messages
client.on('message', async (m) => {
    if (m.message?.viewOnceMessageV2) {
        const viewOnceId = m.key.id;
        const sender = m.sender;
        const type = m.message.viewOnceMessageV2.message?.imageMessage ? 'image' :
                    m.message.viewOnceMessageV2.message?.videoMessage ? 'video' : 'audio';
        
        // Save metadata
        await db.set('viewonce', viewOnceId, {
            id: viewOnceId,
            sender: sender,
            senderName: m.pushName,
            chat: m.chat,
            type: type,
            caption: m.caption || '',
            timestamp: Date.now(),
            saved: false
        });
        
        // Increment sender stats
        await db.increment('viewonce-stats', sender, 'sent', 1);
        await db.increment('viewonce-stats', sender, type, 1);
        
        console.log(`📸 View once tracked: ${type} from ${m.pushName}`);
    }
});

// Commands
client.on('message', async (m) => {
    const userId = m.sender;
    
    // !savevo - save quoted view once
    if (m.body === '!savevo') {
        if (!m.quoted?.message?.viewOnceMessageV2) {
            return await m.reply('❌ Reply to a view once message!');
        }
        
        try {
            const buffer = await m.quoted.download();
            const metadata = await db.get('viewonce', m.quoted.key.id);
            
            if (!metadata) {
                return await m.reply('❌ View once metadata not found');
            }
            
            const filename = `${metadata.type}_${metadata.id}.${
                metadata.type === 'image' ? 'jpg' :
                metadata.type === 'video' ? 'mp4' : 'ogg'
            }`;
            
            const filepath = `${SAVE_DIR}/${filename}`;
            fs.writeFileSync(filepath, buffer);
            
            // Update database
            await db.update('viewonce', m.quoted.key.id, { saved: true, filepath });
            
            await m.reply(`✅ Saved: ${filename}`);
            
        } catch (error) {
            await m.reply('❌ Failed to save');
            console.error(error);
        }
    }
    
    // !vostats - view once statistics
    if (m.body === '!vostats') {
        const allViewOnce = await db.all('viewonce') || {};
        const stats = await db.get('viewonce-stats', userId, {
            sent: 0,
            image: 0,
            video: 0,
            audio: 0
        });
        
        const total = Object.keys(allViewOnce).length;
        const saved = Object.values(allViewOnce).filter(v => v.saved).length;
        
        const reply = `
📊 *View Once Statistics*

*Global:*
Total tracked: ${total}
Saved: ${saved}
Unsaved: ${total - saved}

*Your stats:*
Sent: ${stats.sent}
- Images: ${stats.image}
- Videos: ${stats.video}
- Audio: ${stats.audio}
        `.trim();
        
        await m.reply(reply);
    }
    
    // !volist - list recent view once
    if (m.body === '!volist') {
        const allViewOnce = await db.all('viewonce') || {};
        const recent = Object.values(allViewOnce)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 10);
        
        if (recent.length === 0) {
            return await m.reply('📪 No view once messages tracked');
        }
        
        let text = '*📸 Recent View Once Messages*\n\n';
        
        recent.forEach((vo, i) => {
            const time = new Date(vo.timestamp).toLocaleString();
            const saved = vo.saved ? '✅' : '❌';
            text += `${i + 1}. ${vo.type} from ${vo.senderName}\n`;
            text += `   ${time} ${saved}\n\n`;
        });
        
        await m.reply(text);
    }
});

client.start();
```

## View Once to Sticker

Convert view once images to stickers.

```javascript
import { Client } from '@roidev/kachina-md';

const client = new Client({
    sessionId: 'vo-sticker',
    prefix: '!'
});

client.on('message', async (m) => {
    if (m.body === '!vosticker' || m.body === '!vos') {
        if (!m.quoted?.message?.viewOnceMessageV2) {
            return await m.reply('❌ Reply to a view once image!');
        }
        
        try {
            const result = await client.readViewOnce(m.quoted);
            
            if (result.type !== 'image') {
                return await m.reply('❌ Only images can be converted to stickers!');
            }
            
            await m.react('⏳');
            
            await client.sendSticker(m.chat, result.buffer, {
                pack: 'View Once',
                author: m.quoted.pushName,
                type: Client.StickerTypes.CROPPED
            });
            
            await m.react('✅');
            
        } catch (error) {
            await m.react('❌');
            await m.reply('❌ Failed to create sticker');
            console.error(error);
        }
    }
});

client.start();
```

## Owner-Only View Once Forwarder

```javascript
import { Client } from '@roidev/kachina-md';

const OWNER = '628xxx@s.whatsapp.net';

const client = new Client({
    sessionId: 'vo-forwarder',
    owners: [OWNER]
});

// Auto-forward all view once to owner
client.on('message', async (m) => {
    if (m.message?.viewOnceMessageV2 && m.chat !== OWNER) {
        try {
            const { buffer, type, caption } = await client.readViewOnce(m);
            
            const info = `
🔔 *View Once Received*

From: ${m.pushName} (${m.sender})
Chat: ${m.chat}
Time: ${new Date().toLocaleString()}
Caption: ${caption || 'No caption'}
            `.trim();
            
            if (type === 'image') {
                await client.sendImage(OWNER, buffer, info);
            } else if (type === 'video') {
                await client.sendVideo(OWNER, buffer, info);
            } else if (type === 'audio') {
                await client.sendAudio(OWNER, buffer);
                await client.sendText(OWNER, info);
            }
            
            console.log(`✅ Forwarded view once from ${m.pushName}`);
            
        } catch (error) {
            console.error('Failed to forward view once:', error);
        }
    }
});

client.start();
```

## Features

✅ Read view once images, videos, and audio  
✅ Auto-save view once messages  
✅ Forward view once to other chats  
✅ Convert view once images to stickers  
✅ Track view once statistics with database  
✅ Owner notification system  
✅ Command-based interface  

## See Also

- [View Once Guide](/guide/features/view-once)
- [Media API](/api/media)
- [Client API](/api/client)
