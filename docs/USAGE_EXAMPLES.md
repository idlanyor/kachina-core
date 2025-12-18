# Usage Examples - @kachina-md/core

Kumpulan contoh penggunaan library @kachina-md/core

## 📚 Table of Contents

- [Basic Bot](#basic-bot)
- [Plugin Examples](#plugin-examples)
- [Database Usage](#database-usage)
- [Advanced Features](#advanced-features)

## Basic Bot

### Simple Bot

```javascript
import { Client } from '@kachina-md/core';

const bot = new Client({
    sessionId: 'my-session',
    prefix: '!',
    owner: ['628xxx']
});

bot.on('ready', (user) => {
    console.log('✅ Bot ready!', user.id);
});

bot.on('message', async (m) => {
    if (m.body === '!ping') {
        await m.reply('Pong! 🏓');
    }
});

await bot.start();
```

### Bot with Pairing Code

```javascript
const bot = new Client({
    sessionId: 'my-session',
    phoneNumber: '628xxxxxxxxx',
    loginMethod: 'pairing',
    prefix: '!',
    owner: ['628xxx']
});

bot.on('pairing.code', (code) => {
    console.log('📱 Pairing Code:', code);
});

await bot.start();
```

## Plugin Examples

### 1. Simple Command Plugin

```javascript
// plugins/hello.js

export default {
    name: 'hello',
    commands: ['hello', 'hi', 'hai'],
    category: 'fun',
    description: 'Say hello',

    async exec({ m }) {
        await m.reply(`Hello ${m.pushName}! 👋\nHow can I help you?`);
    }
};
```

### 2. Plugin with Arguments

```javascript
// plugins/calculate.js

export default {
    name: 'calculate',
    commands: ['calc', 'calculate'],
    category: 'tool',
    description: 'Simple calculator',

    async exec({ m, args }) {
        if (args.length === 0) {
            return await m.reply('Usage: !calc 5 + 3');
        }

        try {
            const expression = args.join(' ');
            const result = eval(expression);
            await m.reply(`📊 Result: ${result}`);
        } catch (error) {
            await m.reply('❌ Invalid expression!');
        }
    }
};
```

### 3. Owner Only Plugin

```javascript
// plugins/broadcast.js

export default {
    name: 'broadcast',
    commands: ['bc', 'broadcast'],
    category: 'owner',
    description: 'Broadcast message to all chats',
    owner: true,

    async exec({ client, m, args }) {
        const text = args.join(' ');

        if (!text) {
            return await m.reply('Usage: !bc <message>');
        }

        await m.react('⏳');

        const store = client.store;
        if (!store) {
            return await m.reply('❌ Store not enabled!');
        }

        const chats = Object.keys(store.chats);
        let sent = 0;

        for (const jid of chats) {
            try {
                await client.sendText(jid, text);
                sent++;
            } catch (error) {
                console.error('Broadcast error:', error);
            }
        }

        await m.react('✅');
        await m.reply(`✅ Broadcasted to ${sent} chats`);
    }
};
```

### 4. Group Only Plugin

```javascript
// plugins/kick.js

export default {
    name: 'kick',
    commands: ['kick', 'remove'],
    category: 'group',
    description: 'Kick member from group',
    group: true,
    admin: true,
    botAdmin: true,

    async exec({ client, m }) {
        if (!m.quoted && m.mentions.length === 0) {
            return await m.reply('⚠️ Reply or mention a user to kick!');
        }

        const target = m.quoted ? m.quoted.sender : m.mentions[0];

        try {
            await client.groupParticipantsUpdate(m.chat, [target], 'remove');
            await m.reply(`✅ Successfully kicked @${target.split('@')[0]}`);
        } catch (error) {
            await m.reply('❌ Failed to kick: ' + error.message);
        }
    }
};
```

### 5. Plugin with Media

```javascript
// plugins/sticker.js

import { Sticker, StickerTypes } from 'wa-sticker-formatter';

export default {
    name: 'sticker',
    commands: ['sticker', 's'],
    category: 'converter',
    description: 'Create sticker from image/video',

    async exec({ client, m }) {
        const quoted = m.quoted;

        if (!quoted || !['imageMessage', 'videoMessage'].includes(quoted.type)) {
            return await m.reply('⚠️ Reply to an image or video!');
        }

        await m.react('⏳');

        try {
            const buffer = await quoted.download();

            const sticker = new Sticker(buffer, {
                pack: 'Created with',
                author: 'Kachina Bot',
                type: StickerTypes.FULL,
                quality: 50
            });

            const stickerBuffer = await sticker.toBuffer();

            await client.sendMessage(m.chat, {
                sticker: stickerBuffer
            });

            await m.react('✅');
        } catch (error) {
            await m.react('❌');
            await m.reply('❌ Failed to create sticker: ' + error.message);
        }
    }
};
```

## Database Usage

### User Profile System

```javascript
// plugins/profile.js

import { Database } from '@kachina-md/core';
const db = new Database();

export default {
    name: 'profile',
    commands: ['profile', 'me'],
    category: 'user',
    description: 'View your profile',

    async exec({ m }) {
        const userId = m.sender;

        // Get or create user
        const user = await db.get('users', userId, {
            name: m.pushName,
            level: 1,
            xp: 0,
            balance: 0,
            registered: Date.now()
        });

        const profile = `*👤 YOUR PROFILE*\n\n` +
            `Name: ${user.name}\n` +
            `Level: ${user.level}\n` +
            `XP: ${user.xp}\n` +
            `Balance: $${user.balance}\n` +
            `Registered: ${new Date(user.registered).toLocaleDateString()}`;

        await m.reply(profile);
    }
};
```

### Economy System

```javascript
// plugins/daily.js

import { Database } from '@kachina-md/core';
const db = new Database();

export default {
    name: 'daily',
    commands: ['daily', 'claim'],
    category: 'economy',
    description: 'Claim daily reward',

    async exec({ m }) {
        const userId = m.sender;
        const user = await db.get('users', userId, { balance: 0, lastDaily: 0 });

        const now = Date.now();
        const cooldown = 86400000; // 24 hours

        if (user.lastDaily && (now - user.lastDaily) < cooldown) {
            const timeLeft = cooldown - (now - user.lastDaily);
            const hours = Math.floor(timeLeft / 3600000);
            const minutes = Math.floor((timeLeft % 3600000) / 60000);

            return await m.reply(`⏰ Daily claimed! Come back in ${hours}h ${minutes}m`);
        }

        const reward = 1000;

        await db.update('users', userId, {
            balance: user.balance + reward,
            lastDaily: now
        });

        await m.reply(`✅ You claimed $${reward}!\nNew balance: $${user.balance + reward}`);
    }
};
```

### Group Settings

```javascript
// plugins/welcome.js

import { Database } from '@kachina-md/core';
const db = new Database();

export default {
    name: 'welcome',
    commands: ['welcome'],
    category: 'group',
    description: 'Toggle welcome message',
    group: true,
    admin: true,

    async exec({ m, args }) {
        const groupId = m.chat;
        const settings = await db.get('groups', groupId, { welcome: false });

        if (args[0] === 'on') {
            await db.update('groups', groupId, { welcome: true });
            await m.reply('✅ Welcome message enabled!');
        } else if (args[0] === 'off') {
            await db.update('groups', groupId, { welcome: false });
            await m.reply('✅ Welcome message disabled!');
        } else {
            await m.reply(`Welcome: ${settings.welcome ? 'ON' : 'OFF'}\n\nUsage: !welcome on|off`);
        }
    }
};
```

## Advanced Features

### Auto Reply

```javascript
bot.on('message', async (m) => {
    // Skip commands
    if (m.body?.startsWith(bot.prefix)) return;

    // Auto reply keywords
    const keywords = {
        'hello': 'Hello! How can I help you?',
        'thanks': 'You\'re welcome! 😊',
        'bot': 'Yes, I\'m a bot. How can I assist you?'
    };

    const text = m.body?.toLowerCase();

    for (const [keyword, reply] of Object.entries(keywords)) {
        if (text?.includes(keyword)) {
            await m.reply(reply);
            break;
        }
    }
});
```

### Group Welcome/Leave

```javascript
bot.on('group.update', async (update) => {
    const { id, participants, action } = update;
    const settings = await db.get('groups', id, { welcome: false, leave: false });

    if (action === 'add' && settings.welcome) {
        const metadata = await bot.groupMetadata(id);

        for (const participant of participants) {
            const text = `Welcome @${participant.split('@')[0]} to ${metadata.subject}! 👋\n\n` +
                `Enjoy your stay and follow the rules! 📜`;

            await bot.sendMessage(id, {
                text,
                mentions: [participant]
            });
        }
    }

    if (action === 'remove' && settings.leave) {
        for (const participant of participants) {
            const text = `Goodbye @${participant.split('@')[0]}! 👋`;

            await bot.sendMessage(id, {
                text,
                mentions: [participant]
            });
        }
    }
});
```

### Cooldown System

```javascript
// cooldown.js

const cooldowns = new Map();

export function checkCooldown(userId, commandName, seconds) {
    const key = `${userId}_${commandName}`;
    const now = Date.now();
    const cooldownEnd = cooldowns.get(key);

    if (cooldownEnd && now < cooldownEnd) {
        const timeLeft = Math.ceil((cooldownEnd - now) / 1000);
        return { onCooldown: true, timeLeft };
    }

    cooldowns.set(key, now + (seconds * 1000));
    return { onCooldown: false };
}

// In plugin
import { checkCooldown } from './cooldown.js';

export default {
    name: 'game',
    commands: ['game'],
    category: 'fun',

    async exec({ m }) {
        const cd = checkCooldown(m.sender, 'game', 60);

        if (cd.onCooldown) {
            return await m.reply(`⏰ Cooldown! Wait ${cd.timeLeft}s`);
        }

        // Play game...
    }
};
```

---

Made with ❤️ using @kachina-md/core
