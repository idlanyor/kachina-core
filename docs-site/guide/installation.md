# Installation

This guide will help you install Kachina-MD and set up your development environment.

## Prerequisites

Before installing Kachina-MD, make sure you have:

### Required

- **Node.js** 16.0.0 or higher ([Download](https://nodejs.org/))
- **npm**, **yarn**, or **pnpm** package manager (comes with Node.js)
- A **WhatsApp account** for bot authentication

### Recommended

- **Code editor** (VS Code, WebStorm, etc.)
- **Git** for version control
- **Terminal/Command line** knowledge

## Check Node.js Version

Verify your Node.js installation:

```bash
node --version
# Should output v16.x.x or higher
```

If you need to update Node.js:
- [Download from nodejs.org](https://nodejs.org/)
- Or use [nvm](https://github.com/nvm-sh/nvm) (recommended)

```bash
# Using nvm
nvm install 20
nvm use 20
```

## Installation Methods

### Method 1: NPM (Recommended)

```bash
npm install @roidev/kachina-md
```

### Method 2: Yarn

```bash
yarn add @roidev/kachina-md
```

### Method 3: PNPM

```bash
pnpm add @roidev/kachina-md
```

## Project Setup

### Option 1: Start from Scratch

Create a new project:

```bash
# Create project directory
mkdir my-whatsapp-bot
cd my-whatsapp-bot

# Initialize npm project
npm init -y

# Install Kachina-MD
npm install @roidev/kachina-md
```

### Option 2: Add to Existing Project

```bash
# In your existing project
npm install @roidev/kachina-md
```

## Configure ES Modules

Kachina-MD uses ES modules. Update your `package.json`:

```json {3}
{
  "name": "my-whatsapp-bot",
  "type": "module",
  "dependencies": {
    "@roidev/kachina-md": "^2.0.5"
  }
}
```

::: warning Important
Make sure to add `"type": "module"` to your `package.json`!
:::

## Create Your First Bot

Create `bot.js`:

```javascript
import { Client } from '@roidev/kachina-md';

const client = new Client({
    sessionId: 'my-bot'
});

client.on('ready', (user) => {
    console.log('Bot is ready!');
    console.log('Logged in as:', user.name);
});

client.on('message', async (message) => {
    if (message.body === '!ping') {
        await client.sendText(message.from, 'Pong!');
    }
});

client.start().catch(console.error);
```

## Run Your Bot

```bash
node bot.js
```

A QR code will appear in your terminal. Scan it with WhatsApp to connect!

## Verify Installation

Test if everything is working:

```javascript
import { Client } from '@roidev/kachina-md';

console.log('Kachina-MD imported successfully!');
console.log('Client:', typeof Client); // Should output 'function'
```

Run it:

```bash
node test.js
# Output:
# Kachina-MD imported successfully!
# Client: function
```

## Project Structure

Recommended project structure:

```
my-whatsapp-bot/
├── node_modules/          # Dependencies
├── sessions/              # Bot sessions (auto-created)
│   └── my-bot/           # Session data
├── plugins/               # Your plugins
│   ├── ping.js
│   └── help.js
├── handlers/              # Event handlers
│   └── message.js
├── utils/                 # Utility functions
│   └── logger.js
├── .env                   # Environment variables
├── .gitignore            # Git ignore file
├── bot.js                # Main bot file
├── package.json          # Project config
└── README.md             # Project docs
```

## Environment Setup

### Create .env File

```bash
# .env
SESSION_ID=my-production-bot
LOGIN_METHOD=qr
PREFIX=!
```

### Install dotenv

```bash
npm install dotenv
```

### Use Environment Variables

```javascript
import 'dotenv/config';
import { Client } from '@roidev/kachina-md';

const client = new Client({
    sessionId: process.env.SESSION_ID,
    loginMethod: process.env.LOGIN_METHOD,
    prefix: process.env.PREFIX
});
```

## .gitignore Setup

Create `.gitignore`:

```gitignore
# Dependencies
node_modules/

# Sessions (sensitive!)
sessions/
*.session/

# Environment
.env
.env.local

# Logs
*.log
logs/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
```

::: danger Never Commit Sessions
Session files contain sensitive authentication data. Always add them to `.gitignore`!
:::

## Optional Dependencies

### Development Tools

```bash
# TypeScript (if you prefer TypeScript)
npm install -D typescript @types/node

# Nodemon (auto-restart on file changes)
npm install -D nodemon

# ESLint (code linting)
npm install -D eslint
```

### Utility Libraries

```bash
# dotenv (environment variables)
npm install dotenv

# axios (HTTP requests)
npm install axios

# moment (date/time handling)
npm install moment
```

## TypeScript Setup

If you want to use TypeScript:

### Install TypeScript

```bash
npm install -D typescript @types/node
```

### Create tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Create bot.ts

```typescript
import { Client } from '@roidev/kachina-md';

const client = new Client({
    sessionId: 'my-bot'
});

client.on('ready', (user) => {
    console.log('Bot ready:', user.name);
});

client.on('message', async (message) => {
    if (message.body === '!ping') {
        await client.sendText(message.from, 'Pong!');
    }
});

client.start().catch(console.error);
```

### Compile and Run

```bash
# Compile
npx tsc

# Run
node dist/bot.js
```

## Development Scripts

Add scripts to `package.json`:

```json
{
  "scripts": {
    "start": "node bot.js",
    "dev": "nodemon bot.js",
    "build": "tsc",
    "lint": "eslint ."
  }
}
```

Usage:

```bash
# Run in production
npm start

# Run with auto-restart (development)
npm run dev

# Build TypeScript
npm run build

# Lint code
npm run lint
```

## Docker Installation

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create sessions directory
RUN mkdir -p sessions

CMD ["node", "bot.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  whatsapp-bot:
    build: .
    volumes:
      - ./sessions:/app/sessions
    environment:
      - SESSION_ID=docker-bot
      - LOGIN_METHOD=pairing
      - PHONE_NUMBER=628123456789
    restart: unless-stopped
```

### Build and Run

```bash
# Build image
docker build -t my-whatsapp-bot .

# Run container
docker-compose up -d

# View logs
docker-compose logs -f
```

## Troubleshooting

### Error: Cannot find module

```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Error: Unexpected token 'export'

```bash
# Solution: Add "type": "module" to package.json
```

```json
{
  "type": "module"
}
```

### QR Code Not Showing

1. Check your terminal supports unicode
2. Try a different terminal
3. Use [pairing code method](/guide/authentication/pairing-code) instead

### Port Already in Use

```bash
# Find process using port
lsof -i :PORT

# Kill process
kill -9 PID
```

### Permission Denied

```bash
# Linux/Mac: Give execute permission
chmod +x bot.js

# Run with sudo (not recommended)
sudo node bot.js
```

## Updating Kachina-MD

### Check Current Version

```bash
npm list @roidev/kachina-md
```

### Update to Latest

```bash
npm update @roidev/kachina-md
```

### Update to Specific Version

```bash
npm install @roidev/kachina-md@2.0.5
```

### Check for Outdated Packages

```bash
npm outdated
```

## Platform-Specific Notes

### Windows

- Use **PowerShell** or **CMD** as terminal
- May need to enable developer mode for symlinks
- Use `\` instead of `/` in paths (or use forward slashes in Node.js)

### macOS

- May need to install **Xcode Command Line Tools**:
  ```bash
  xcode-select --install
  ```

### Linux

- May need build tools for native dependencies:
  ```bash
  sudo apt-get install build-essential
  ```

## Next Steps

Now that Kachina-MD is installed:

1. ✅ [Get started with your first bot](/guide/getting-started)
2. ✅ [Learn about authentication methods](/guide/authentication/overview)
3. ✅ [Explore core concepts](/guide/core/client)
4. ✅ [Build features](/guide/features/sending-messages)

## Getting Help

If you're stuck:

- 📖 Check the [Getting Started Guide](/guide/getting-started)
- 💬 [Ask in Discussions](https://github.com/idlanyor/kachina-core/discussions)
- 🐛 [Report issues](https://github.com/idlanyor/kachina-core/issues)
- 📚 Browse [examples](/examples/basic-bot)

Happy coding! 🚀
