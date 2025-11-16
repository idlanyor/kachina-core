# Plugins

Kachina-MD features a powerful plugin system that allows you to extend your bot's functionality with modular, reusable commands.

## Overview

Plugins are JavaScript modules that export a configuration object with command metadata and an execution function. They are automatically loaded from a directory and can be easily managed.

```javascript
// plugins/ping.js
export default {
    name: 'ping',
    commands: ['ping', 'pong'],
    description: 'Check bot latency',
    
    async exec({ m }) {
        await m.reply('Pong! 🏓');
    }
};
```

## Plugin Structure

### Basic Plugin

```javascript
export default {
    // Required
    name: 'plugin-name',
    commands: ['cmd1', 'cmd2'],  // Command aliases
    exec: async (context) => {
        // Command logic
    },
    
    // Optional
    description: 'Command description',
    category: 'category-name',
    owner: false,
    group: false,
    private: false,
    admin: false,
    botAdmin: false
};
```

### Plugin Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | Unique plugin identifier |
| `commands` | `string\|string[]` | Yes | Command trigger(s) |
| `exec` | `Function` | Yes | Execution function |
| `description` | `string` | No | Command description |
| `category` | `string` | No | Command category |
| `owner` | `boolean` | No | Owner-only command |
| `group` | `boolean` | No | Group-only command |
| `private` | `boolean` | No | Private chat only |
| `admin` | `boolean` | No | Requires group admin |
| `botAdmin` | `boolean` | No | Requires bot to be admin |

### Execution Context

The `exec` function receives a context object:

```javascript
{
    client: Client,       // Bot client instance
    m: Message,           // Serialized message
    args: string[],       // Command arguments
    command: string,      // Command used
    prefix: string,       // Command prefix
    sock: WASocket        // Baileys socket
}
```

## Creating Plugins

### Simple Plugin

```javascript
// plugins/hello.js
export default {
    name: 'hello',
    commands: ['hello', 'hi'],
    category: 'fun',
    description: 'Greet users',
    
    async exec({ m }) {
        await m.reply(`Hello ${m.pushName}! 👋`);
    }
};
```

### Plugin with Arguments

```javascript
// plugins/say.js
export default {
    name: 'say',
    commands: ['say', 'echo'],
    category: 'fun',
    description: 'Repeat your message',
    
    async exec({ m, args }) {
        if (args.length === 0) {
            return await m.reply('⚠️ Usage: !say <text>');
        }
        
        const text = args.join(' ');
        await m.reply(text);
    }
};
```

### Owner-Only Plugin

```javascript
// plugins/eval.js
import util from 'util';

export default {
    name: 'eval',
    commands: ['eval', 'ev', '>'],
    category: 'owner',
    description: 'Execute JavaScript code',
    owner: true,  // ⚠️ Owner only
    
    async exec({ client, m, args }) {
        if (args.length === 0) {
            return await m.reply('⚠️ Provide code to execute!');
        }
        
        await m.react('⏳');
        
        try {
            const code = args.join(' ');
            let result = await eval(`(async () => { ${code} })()`);
            
            if (typeof result !== 'string') {
                result = util.inspect(result, { depth: 0 });
            }
            
            await m.reply(`*📤 Result:*\n\`\`\`${result}\`\`\``);
            await m.react('✅');
        } catch (error) {
            await m.react('❌');
            await m.reply(`*❌ Error:*\n\`\`\`${error.message}\`\`\``);
        }
    }
};
```

### Group-Only Plugin

```javascript
// plugins/tagall.js
export default {
    name: 'tagall',
    commands: ['tagall', 'everyone'],
    category: 'group',
    description: 'Mention all group members',
    group: true,      // ✅ Group only
    admin: true,      // ✅ Admin only
    
    async exec({ client, m }) {
        const metadata = await client.groupMetadata(m.chat);
        const participants = metadata.participants.map(p => p.id);
        
        const text = '📢 *Attention Everyone!*\n\n' +
            participants.map(p => `@${p.split('@')[0]}`).join('\n');
        
        await client.sendMessage(m.chat, {
            text,
            mentions: participants
        });
    }
};
```

### Media Plugin

```javascript
// plugins/sticker.js
export default {
    name: 'sticker',
    commands: ['sticker', 's', 'stiker'],
    category: 'convert',
    description: 'Create sticker from image/video',
    
    async exec({ client, m }) {
        // Check if message has quoted media
        if (!m.quoted?.message?.imageMessage && 
            !m.quoted?.message?.videoMessage) {
            return await m.reply('⚠️ Reply to an image or video!');
        }
        
        await m.react('⏳');
        
        try {
            const buffer = await m.quoted.download();
            
            await client.sendSticker(m.chat, buffer, {
                pack: 'Kachina Bot',
                author: m.pushName
            });
            
            await m.react('✅');
        } catch (error) {
            await m.react('❌');
            await m.reply('❌ Failed to create sticker!');
        }
    }
};
```

### Plugin with Database

```javascript
// plugins/balance.js
import { Database } from '@roidev/kachina-md';

const db = new Database();

export default {
    name: 'balance',
    commands: ['balance', 'bal', 'money'],
    category: 'economy',
    description: 'Check your balance',
    
    async exec({ m }) {
        const userId = m.sender;
        const user = await db.get('users', userId, { 
            balance: 1000,
            name: m.pushName
        });
        
        const text = `*💰 Your Balance*\n\n` +
            `Name: ${user.name}\n` +
            `Balance: $${user.balance.toLocaleString()}\n\n` +
            `_Use !daily to claim daily reward_`;
        
        await m.reply(text);
    }
};
```

## Loading Plugins

### Load All Plugins

```javascript
import { Client } from '@roidev/kachina-md';
import path from 'path';

const client = new Client({
    sessionId: 'my-bot',
    prefix: '!'
});

// Load all plugins from directory
await client.loadPlugins(path.join(process.cwd(), 'plugins'));

await client.start();
```

### Load Single Plugin

```javascript
// Load specific plugin
await client.loadPlugin('./plugins/ping.js');
await client.loadPlugin('./plugins/help.js');
```

### Dynamic Loading

```javascript
// Load plugins based on config
const enabledPlugins = ['ping', 'help', 'sticker'];

for (const plugin of enabledPlugins) {
    await client.loadPlugin(`./plugins/${plugin}.js`);
}
```

## Plugin Categories

Organize plugins by category for better help menu:

```javascript
// plugins/ping.js
export default {
    name: 'ping',
    commands: ['ping'],
    category: 'info',  // 📊 Info category
    // ...
};

// plugins/tagall.js
export default {
    name: 'tagall',
    commands: ['tagall'],
    category: 'group',  // 👥 Group category
    // ...
};

// plugins/download.js
export default {
    name: 'download',
    commands: ['download'],
    category: 'download',  // ⬇️ Download category
    // ...
};
```

Common categories:
- `info` - Information commands
- `owner` - Owner-only commands
- `group` - Group management
- `download` - Download features
- `ai` - AI-powered features
- `fun` - Entertainment
- `tool` - Utility tools
- `convert` - Media conversion

## Access Control

### Owner Only

```javascript
export default {
    name: 'broadcast',
    commands: ['bc'],
    owner: true,  // ⚠️ Only bot owners can use
    
    async exec({ client, args }) {
        // Owner-only logic
    }
};
```

### Group Only

```javascript
export default {
    name: 'kick',
    commands: ['kick'],
    group: true,  // ✅ Only works in groups
    
    async exec({ client, m }) {
        if (!m.isGroup) {
            return await m.reply('⚠️ Group only command!');
        }
        // Group-only logic
    }
};
```

### Private Only

```javascript
export default {
    name: 'register',
    commands: ['register'],
    private: true,  // ✅ Only works in private chat
    
    async exec({ m }) {
        // Private chat only logic
    }
};
```

### Admin Only

```javascript
export default {
    name: 'warn',
    commands: ['warn'],
    group: true,
    admin: true,  // ✅ Requires group admin
    
    async exec({ m }) {
        // Admin-only logic
    }
};
```

### Bot Admin Required

```javascript
export default {
    name: 'kick',
    commands: ['kick'],
    group: true,
    admin: true,
    botAdmin: true,  // ✅ Bot must be admin
    
    async exec({ client, m }) {
        // Kick logic (requires bot admin)
    }
};
```

## Advanced Patterns

### Plugin with Subcommands

```javascript
// plugins/admin.js
export default {
    name: 'admin',
    commands: ['admin'],
    category: 'group',
    group: true,
    admin: true,
    
    async exec({ client, m, args }) {
        const subcommand = args[0]?.toLowerCase();
        
        switch (subcommand) {
            case 'kick':
                if (!m.quoted) {
                    return await m.reply('⚠️ Reply to user to kick!');
                }
                await client.groupParticipantsUpdate(
                    m.chat,
                    [m.quoted.sender],
                    'remove'
                );
                break;
                
            case 'promote':
                if (!m.quoted) {
                    return await m.reply('⚠️ Reply to user to promote!');
                }
                await client.groupParticipantsUpdate(
                    m.chat,
                    [m.quoted.sender],
                    'promote'
                );
                break;
                
            default:
                await m.reply(
                    '*Admin Commands*\n\n' +
                    '• !admin kick - Kick user\n' +
                    '• !admin promote - Promote user\n' +
                    '• !admin demote - Demote user'
                );
        }
    }
};
```

### Plugin with Cooldown

```javascript
// plugins/daily.js
import { Database } from '@roidev/kachina-md';

const db = new Database();
const COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours

export default {
    name: 'daily',
    commands: ['daily'],
    category: 'economy',
    
    async exec({ m }) {
        const userId = m.sender;
        const user = await db.get('users', userId, {
            balance: 0,
            lastDaily: 0
        });
        
        const now = Date.now();
        const timePassed = now - user.lastDaily;
        
        if (timePassed < COOLDOWN) {
            const remaining = COOLDOWN - timePassed;
            const hours = Math.floor(remaining / (60 * 60 * 1000));
            const mins = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
            
            return await m.reply(
                `⏰ Daily reward claimed!\n\n` +
                `Come back in ${hours}h ${mins}m`
            );
        }
        
        const reward = 1000;
        user.balance += reward;
        user.lastDaily = now;
        
        await db.set('users', userId, user);
        
        await m.reply(
            `✅ Daily reward claimed!\n\n` +
            `+$${reward}\n` +
            `Balance: $${user.balance.toLocaleString()}`
        );
    }
};
```

### Plugin with External API

```javascript
// plugins/weather.js
import axios from 'axios';

export default {
    name: 'weather',
    commands: ['weather', 'cuaca'],
    category: 'tool',
    description: 'Check weather',
    
    async exec({ m, args }) {
        if (args.length === 0) {
            return await m.reply('⚠️ Usage: !weather <city>');
        }
        
        const city = args.join(' ');
        await m.react('⏳');
        
        try {
            const apiKey = process.env.WEATHER_API_KEY;
            const url = `https://api.openweathermap.org/data/2.5/weather`;
            
            const { data } = await axios.get(url, {
                params: {
                    q: city,
                    appid: apiKey,
                    units: 'metric'
                }
            });
            
            const text = `*🌤️ Weather in ${data.name}*\n\n` +
                `🌡️ Temperature: ${data.main.temp}°C\n` +
                `💧 Humidity: ${data.main.humidity}%\n` +
                `☁️ Condition: ${data.weather[0].description}\n` +
                `💨 Wind: ${data.wind.speed} m/s`;
            
            await m.reply(text);
            await m.react('✅');
        } catch (error) {
            await m.react('❌');
            await m.reply('❌ City not found!');
        }
    }
};
```

## Plugin Management

### List Loaded Plugins

```javascript
const plugins = client.pluginHandler.list();

console.log('Loaded plugins:');
plugins.forEach(plugin => {
    console.log(`- ${plugin.name} (${plugin.commands.join(', ')})`);
});
```

### Get Specific Plugin

```javascript
const pingPlugin = client.pluginHandler.get('ping');

if (pingPlugin) {
    console.log('Commands:', pingPlugin.commands);
    console.log('Description:', pingPlugin.description);
}
```

### Reload Plugin

```javascript
// Unload plugin
client.pluginHandler.reload('ping');

// Load updated version
await client.loadPlugin('./plugins/ping.js');
```

## Best Practices

### 1. Error Handling

Always wrap plugin logic in try-catch:

```javascript
async exec({ m }) {
    try {
        // Plugin logic
    } catch (error) {
        console.error('Plugin error:', error);
        await m.reply('❌ An error occurred!');
    }
}
```

### 2. Input Validation

Validate user input:

```javascript
async exec({ m, args }) {
    if (args.length === 0) {
        return await m.reply('⚠️ Please provide required arguments!');
    }
    
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1) {
        return await m.reply('⚠️ Invalid amount!');
    }
    
    // Process valid input
}
```

### 3. User Feedback

Provide feedback with reactions:

```javascript
async exec({ m }) {
    await m.react('⏳');  // Processing
    
    try {
        // Do something
        await m.react('✅');  // Success
    } catch (error) {
        await m.react('❌');  // Error
    }
}
```

### 4. Clear Help Text

Provide usage examples:

```javascript
export default {
    name: 'calculate',
    commands: ['calc', 'calculate'],
    description: 'Calculate math expression\nUsage: !calc <expression>\nExample: !calc 2 + 2',
    // ...
};
```

## Example Plugin Directory

```
plugins/
├── info/
│   ├── ping.js
│   └── help.js
├── owner/
│   ├── eval.js
│   └── broadcast.js
├── group/
│   ├── tagall.js
│   └── kick.js
├── convert/
│   ├── sticker.js
│   └── toimage.js
└── economy/
    ├── balance.js
    └── daily.js
```

## See Also

- [PluginHandler API](/api/plugins) - Plugin handler reference
- [Examples](/examples/plugins) - Complete plugin examples
- [Messages Guide](/guide/core/messages) - Message handling in plugins
- [Database Guide](/api/helpers#database) - Using database in plugins
