# Plugin System Examples

Complete examples of creating plugins for Kachina-MD.

## Basic Plugin Structure

```javascript
export default {
    name: 'ping',
    description: 'Check bot response time',
    commands: ['ping'],
    
    async exec({ client, m }) {
        const start = Date.now();
        const sent = await m.reply('Pinging...');
        const latency = Date.now() - start;
        
        await client.sock.sendMessage(m.chat, {
            text: `🏓 Pong! ${latency}ms`,
            edit: sent.key
        });
    }
};
```

## Command Variations

```javascript
export default {
    name: 'greet',
    description: 'Greeting commands',
    commands: ['hello', 'hi', 'hey'],
    
    async exec({ client, m }) {
        const greetings = {
            hello: 'Hello there! 👋',
            hi: 'Hi! How can I help? 😊',
            hey: 'Hey! What\'s up? 🎉'
        };
        
        const cmd = m.body.slice(1).toLowerCase();
        await m.reply(greetings[cmd] || 'Hello!');
    }
};
```

## Owner-Only Plugin

```javascript
export default {
    name: 'broadcast',
    description: 'Send message to all chats',
    commands: ['bc', 'broadcast'],
    ownerOnly: true,
    
    async exec({ client, m, args }) {
        if (!args[0]) {
            return await m.reply('Usage: !bc <message>');
        }
        
        const message = args.join(' ');
        const chats = Object.keys(await client.store.chats);
        
        let sent = 0;
        let failed = 0;
        
        for (const chat of chats) {
            try {
                await client.sendText(chat, message);
                sent++;
            } catch {
                failed++;
            }
        }
        
        await m.reply(`✅ Broadcast complete\nSent: ${sent}\nFailed: ${failed}`);
    }
};
```

## Group-Only Plugin

```javascript
export default {
    name: 'tagall',
    description: 'Tag all group members',
    commands: ['tagall', 'everyone'],
    groupOnly: true,
    adminOnly: true,
    
    async exec({ client, m }) {
        const metadata = await client.groupMetadata(m.chat);
        
        const text = '📢 *Attention!*\n\n' +
            metadata.participants
                .map(p => `@${p.id.split('@')[0]}`)
                .join('\n');
        
        await client.sendMessage(m.chat, {
            text,
            mentions: metadata.participants.map(p => p.id)
        });
    }
};
```

## Private Chat Only Plugin

```javascript
export default {
    name: 'profile',
    description: 'View your profile',
    commands: ['profile', 'me'],
    privateOnly: true,
    
    async exec({ client, m, db }) {
        const userId = m.sender;
        const user = await db.get('users', userId, {
            name: m.pushName,
            balance: 0,
            level: 1,
            exp: 0,
            registered: Date.now()
        });
        
        const profile = `
*👤 YOUR PROFILE*

Name: ${user.name}
Balance: $${user.balance}
Level: ${user.level}
EXP: ${user.exp}
Registered: ${new Date(user.registered).toLocaleDateString()}
        `.trim();
        
        await m.reply(profile);
    }
};
```

## Plugin with Database

```javascript
export default {
    name: 'balance',
    description: 'Economy commands',
    commands: ['balance', 'bal', 'daily', 'work'],
    
    async exec({ client, m, db, args, command }) {
        const userId = m.sender;
        
        // Balance command
        if (command === 'balance' || command === 'bal') {
            const user = await db.get('users', userId, { balance: 0 });
            await m.reply(`💰 Balance: $${user.balance}`);
        }
        
        // Daily command
        if (command === 'daily') {
            const user = await db.get('users', userId, {
                balance: 0,
                lastDaily: 0
            });
            
            const now = Date.now();
            const cooldown = 24 * 60 * 60 * 1000; // 24 hours
            
            if (now - user.lastDaily < cooldown) {
                const remaining = cooldown - (now - user.lastDaily);
                const hours = Math.floor(remaining / (60 * 60 * 1000));
                return await m.reply(`⏰ Claim again in ${hours} hours`);
            }
            
            const reward = 1000;
            await db.increment('users', userId, 'balance', reward);
            await db.update('users', userId, { lastDaily: now });
            
            await m.reply(`✅ Daily reward claimed!\n💰 +$${reward}`);
        }
        
        // Work command
        if (command === 'work') {
            const user = await db.get('users', userId, {
                balance: 0,
                lastWork: 0
            });
            
            const now = Date.now();
            const cooldown = 60 * 60 * 1000; // 1 hour
            
            if (now - user.lastWork < cooldown) {
                const remaining = cooldown - (now - user.lastWork);
                const minutes = Math.floor(remaining / (60 * 1000));
                return await m.reply(`⏰ Work again in ${minutes} minutes`);
            }
            
            const jobs = [
                { name: 'Programmer', min: 200, max: 500 },
                { name: 'Designer', min: 150, max: 400 },
                { name: 'Writer', min: 100, max: 300 },
                { name: 'Delivery', min: 50, max: 200 }
            ];
            
            const job = jobs[Math.floor(Math.random() * jobs.length)];
            const earned = Math.floor(
                Math.random() * (job.max - job.min + 1) + job.min
            );
            
            await db.increment('users', userId, 'balance', earned);
            await db.update('users', userId, { lastWork: now });
            
            await m.reply(`💼 You worked as ${job.name}\n💰 Earned: $${earned}`);
        }
    }
};
```

## Plugin with External API

```javascript
import axios from 'axios';

export default {
    name: 'weather',
    description: 'Get weather information',
    commands: ['weather'],
    
    async exec({ client, m, args }) {
        if (!args[0]) {
            return await m.reply('Usage: !weather <city>');
        }
        
        const city = args.join(' ');
        
        try {
            await m.react('⏳');
            
            const apiKey = process.env.WEATHER_API_KEY;
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
            
            const response = await axios.get(url);
            const data = response.data;
            
            const weather = `
*🌤️ Weather in ${data.name}, ${data.sys.country}*

Condition: ${data.weather[0].main}
Description: ${data.weather[0].description}
Temperature: ${data.main.temp}°C
Feels like: ${data.main.feels_like}°C
Humidity: ${data.main.humidity}%
Wind speed: ${data.wind.speed} m/s
            `.trim();
            
            await m.reply(weather);
            await m.react('✅');
            
        } catch (error) {
            await m.react('❌');
            if (error.response?.status === 404) {
                await m.reply('❌ City not found');
            } else {
                await m.reply('❌ Failed to get weather data');
            }
        }
    }
};
```

## Media Processing Plugin

```javascript
import sharp from 'sharp';

export default {
    name: 'image-tools',
    description: 'Image processing tools',
    commands: ['blur', 'grayscale', 'flip', 'rotate'],
    
    async exec({ client, m, command, args }) {
        // Check if message has image or quotes image
        const hasImage = m.message?.imageMessage || m.quoted?.message?.imageMessage;
        
        if (!hasImage) {
            return await m.reply('❌ Send or reply to an image!');
        }
        
        try {
            await m.react('⏳');
            
            const buffer = m.message?.imageMessage 
                ? await m.download()
                : await m.quoted.download();
            
            let processed;
            
            switch (command) {
                case 'blur':
                    const level = parseInt(args[0]) || 10;
                    processed = await sharp(buffer).blur(level).toBuffer();
                    break;
                    
                case 'grayscale':
                    processed = await sharp(buffer).grayscale().toBuffer();
                    break;
                    
                case 'flip':
                    processed = await sharp(buffer).flip().toBuffer();
                    break;
                    
                case 'rotate':
                    const degrees = parseInt(args[0]) || 90;
                    processed = await sharp(buffer).rotate(degrees).toBuffer();
                    break;
            }
            
            await client.sendImage(m.chat, processed, `✨ ${command} applied`);
            await m.react('✅');
            
        } catch (error) {
            await m.react('❌');
            await m.reply('❌ Failed to process image');
            console.error(error);
        }
    }
};
```

## Game Plugin

```javascript
export default {
    name: 'game',
    description: 'Number guessing game',
    commands: ['guess', 'hint', 'giveup'],
    
    games: new Map(),
    
    async exec({ client, m, command, args }) {
        const chatId = m.chat;
        
        // Start game
        if (command === 'guess') {
            if (!args[0]) {
                // Initialize game
                if (!this.games.has(chatId)) {
                    const number = Math.floor(Math.random() * 100) + 1;
                    this.games.set(chatId, {
                        number,
                        attempts: 0,
                        hints: 3
                    });
                    
                    return await m.reply(`
🎮 *Number Guessing Game*

I'm thinking of a number between 1 and 100.
Try to guess it!

Commands:
• !guess <number> - Make a guess
• !hint - Get a hint (${this.games.get(chatId).hints} left)
• !giveup - Give up
                    `.trim());
                }
                
                return await m.reply('Usage: !guess <number>');
            }
            
            if (!this.games.has(chatId)) {
                return await m.reply('❌ No active game! Use !guess to start');
            }
            
            const guess = parseInt(args[0]);
            if (isNaN(guess) || guess < 1 || guess > 100) {
                return await m.reply('❌ Invalid number! (1-100)');
            }
            
            const game = this.games.get(chatId);
            game.attempts++;
            
            if (guess === game.number) {
                this.games.delete(chatId);
                return await m.reply(`
🎉 *Correct!*

The number was ${game.number}
Attempts: ${game.attempts}

Play again with !guess
                `.trim());
            }
            
            const hint = guess > game.number ? 'lower' : 'higher';
            await m.reply(`❌ Wrong! Try ${hint}\nAttempts: ${game.attempts}`);
        }
        
        // Get hint
        if (command === 'hint') {
            if (!this.games.has(chatId)) {
                return await m.reply('❌ No active game!');
            }
            
            const game = this.games.get(chatId);
            
            if (game.hints === 0) {
                return await m.reply('❌ No hints left!');
            }
            
            game.hints--;
            
            const ranges = [
                [1, 25],
                [26, 50],
                [51, 75],
                [76, 100]
            ];
            
            const range = ranges.find(r => 
                game.number >= r[0] && game.number <= r[1]
            );
            
            await m.reply(`💡 Hint: The number is between ${range[0]} and ${range[1]}\nHints left: ${game.hints}`);
        }
        
        // Give up
        if (command === 'giveup') {
            if (!this.games.has(chatId)) {
                return await m.reply('❌ No active game!');
            }
            
            const game = this.games.get(chatId);
            this.games.delete(chatId);
            
            await m.reply(`😔 Game over!\nThe number was ${game.number}\nAttempts: ${game.attempts}`);
        }
    }
};
```

## Multi-Feature Plugin

```javascript
export default {
    name: 'tools',
    description: 'Various utility tools',
    commands: ['calc', 'reverse', 'upper', 'lower', 'random'],
    
    async exec({ client, m, command, args }) {
        // Calculator
        if (command === 'calc') {
            if (!args[0]) {
                return await m.reply('Usage: !calc <expression>\nExample: !calc 5 + 3 * 2');
            }
            
            try {
                const expression = args.join(' ');
                // Safe eval alternative
                const result = Function(`'use strict'; return (${expression})`)();
                await m.reply(`🧮 ${expression} = ${result}`);
            } catch {
                await m.reply('❌ Invalid expression');
            }
        }
        
        // Reverse text
        if (command === 'reverse') {
            if (!args[0]) {
                return await m.reply('Usage: !reverse <text>');
            }
            
            const reversed = args.join(' ').split('').reverse().join('');
            await m.reply(reversed);
        }
        
        // Uppercase
        if (command === 'upper') {
            if (!args[0]) {
                return await m.reply('Usage: !upper <text>');
            }
            
            await m.reply(args.join(' ').toUpperCase());
        }
        
        // Lowercase
        if (command === 'lower') {
            if (!args[0]) {
                return await m.reply('Usage: !lower <text>');
            }
            
            await m.reply(args.join(' ').toLowerCase());
        }
        
        // Random number
        if (command === 'random') {
            const min = parseInt(args[0]) || 1;
            const max = parseInt(args[1]) || 100;
            const random = Math.floor(Math.random() * (max - min + 1)) + min;
            
            await m.reply(`🎲 Random (${min}-${max}): ${random}`);
        }
    }
};
```

## Features

✅ Basic plugin structure  
✅ Command variations  
✅ Access control (owner, group, private, admin)  
✅ Database integration  
✅ External API usage  
✅ Media processing  
✅ Game mechanics  
✅ Multi-feature plugins  
✅ Error handling  

## Plugin Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Plugin name (unique) |
| `description` | `string` | Plugin description |
| `commands` | `string[]` | Command triggers |
| `ownerOnly` | `boolean` | Owner only (optional) |
| `groupOnly` | `boolean` | Group only (optional) |
| `privateOnly` | `boolean` | Private only (optional) |
| `adminOnly` | `boolean` | Admin only (optional) |
| `botAdminOnly` | `boolean` | Bot admin required (optional) |

## Exec Context

```javascript
{
    client,      // Client instance
    m,          // Message object
    args,       // Command arguments
    command,    // Triggered command
    db,         // Database instance
    Logger      // Logger class
}
```

## See Also

- [Plugin Guide](/guide/core/plugins)
- [Client API](/api/client)
- [Database API](/api/helpers#database)
- [Messages API](/api/messages)
