# Installation

This guide will help you install Kachina-MD and set up your development environment.

## Prerequisites

Before installing Kachina-MD, ensure you have the following:

### Required

- **Node.js** version 16.0.0 or higher
  - Check version: `node --version`
  - Download from: [nodejs.org](https://nodejs.org/)

- **npm**, **yarn**, or **pnpm** package manager
  - npm comes with Node.js
  - Yarn: `npm install -g yarn`
  - pnpm: `npm install -g pnpm`

- **WhatsApp Account**
  - Active WhatsApp account on your mobile device
  - For bot authentication

### Recommended

- **Git** for version control
- **Code editor** (VS Code, Sublime Text, etc.)
- **Terminal** with unicode support (for QR codes)

## Installation Methods

### Using npm

```bash
npm install @roidev/kachina-md
```

### Using yarn

```bash
yarn add @roidev/kachina-md
```

### Using pnpm

```bash
pnpm add @roidev/kachina-md
```

## Project Setup

### 1. Create Project Directory

```bash
mkdir my-whatsapp-bot
cd my-whatsapp-bot
```

### 2. Initialize Package

```bash
npm init -y
```

### 3. Update package.json

Add `"type": "module"` to use ES modules:

```json
{
  "name": "my-whatsapp-bot",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  },
  "dependencies": {
    "@roidev/kachina-md": "^2.0.4"
  }
}
```

### 4. Install Kachina-MD

```bash
npm install @roidev/kachina-md
```

### 5. Create Bot File

Create `index.js`:

```javascript
import { Client } from '@roidev/kachina-md';

const client = new Client({
    sessionId: 'my-bot',
    prefix: '!'
});

client.on('ready', (user) => {
    console.log('Bot ready!', user.name);
});

client.on('message', async (m) => {
    if (m.body === '!ping') {
        await m.reply('Pong! 🏓');
    }
});

await client.start();
```

### 6. Run Your Bot

```bash
npm start
```

## Verification

After installation, verify everything works:

```javascript
import { Client, Database, Logger } from '@roidev/kachina-md';

console.log('✅ Kachina-MD installed successfully!');
console.log('📦 Version:', require('@roidev/kachina-md/package.json').version);
```

## Project Structure

Recommended project structure:

```
my-whatsapp-bot/
├── node_modules/          # Dependencies
├── sessions/              # Bot session data
│   └── my-bot/           # Session folder
├── plugins/              # Bot plugins
│   ├── ping.js
│   ├── help.js
│   └── ...
├── database/             # Database files
│   ├── users.json
│   └── groups.json
├── .env                  # Environment variables
├── .gitignore           # Git ignore file
├── index.js             # Main bot file
├── package.json         # Package configuration
└── README.md            # Project documentation
```

### Create .gitignore

```gitignore
# Dependencies
node_modules/

# Session data (contains auth credentials)
sessions/
*-session/
*.data.json

# Database
database/
*.db

# Environment variables
.env
.env.local

# Logs
*.log
logs/

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
```

## Optional Dependencies

### For Enhanced Features

```bash
# Image processing
npm install sharp

# Advanced stickers
npm install wa-sticker-formatter

# Environment variables
npm install dotenv

# HTTP requests
npm install axios
```

### Development Tools

```bash
# TypeScript support
npm install -D typescript @types/node

# Code formatting
npm install -D prettier

# Linting
npm install -D eslint
```

## Environment Variables

Create `.env` file:

```env
# Bot Configuration
SESSION_ID=my-bot
PREFIX=!
LOGIN_METHOD=qr

# Owner Configuration
OWNER_NUMBER=628123456789

# Pairing Method (if using pairing)
PHONE_NUMBER=628123456789

# Optional
LOG_LEVEL=info
DATABASE_PATH=./database
```

Load in your bot:

```javascript
import 'dotenv/config';
import { Client } from '@roidev/kachina-md';

const client = new Client({
    sessionId: process.env.SESSION_ID || 'my-bot',
    prefix: process.env.PREFIX || '!',
    loginMethod: process.env.LOGIN_METHOD || 'qr',
    phoneNumber: process.env.PHONE_NUMBER,
    owners: [process.env.OWNER_NUMBER]
});
```

## Troubleshooting

### Module Not Found

If you get "Cannot find module" errors:

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### ERR_REQUIRE_ESM

If you get this error, ensure:

1. `package.json` has `"type": "module"`
2. Using `import` instead of `require`
3. File extensions are `.js` or `.mjs`

### Permission Errors

On Linux/Mac, you might need:

```bash
sudo npm install -g npm
```

Or use nvm (Node Version Manager):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### Network Issues

If installation fails due to network:

```bash
# Use different registry
npm config set registry https://registry.npmjs.org/

# Or use a mirror
npm config set registry https://registry.npmmirror.com
```

## Updating

### Check for Updates

```bash
npm outdated @roidev/kachina-md
```

### Update to Latest

```bash
npm update @roidev/kachina-md
```

### Update to Specific Version

```bash
npm install @roidev/kachina-md@2.0.4
```

## Next Steps

Now that you have Kachina-MD installed:

1. [Create your first bot](/guide/getting-started)
2. [Choose authentication method](/guide/authentication/overview)
3. [Learn about the Client](/guide/core/client)
4. [Explore examples](/examples/basic-bot)

## Getting Help

If you encounter issues:

- 📖 Check the [documentation](/guide/getting-started)
- 💬 [Open a discussion](https://github.com/idlanyor/kachina-core/discussions)
- 🐛 [Report a bug](https://github.com/idlanyor/kachina-core/issues)
- 📦 [View on npm](https://www.npmjs.com/package/@roidev/kachina-md)
