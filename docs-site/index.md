---
layout: home

hero:
  name: Kachina-MD
  text: WhatsApp Bot Framework
  tagline: Simple, Fast, and Modular framework for building WhatsApp bots
  image:
    src: /logo.svg
    alt: Kachina-MD
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/idlanyor/kachina-core
    - theme: alt
      text: API Reference
      link: /api/client

features:
  - icon: <i class="fa-solid fa-rocket"></i>
    title: Easy to Use
    details: Simple and intuitive API designed for beginners and experts alike. Get started in minutes with just a few lines of code.

  - icon: <i class="fa-solid fa-bolt"></i>
    title: Lightning Fast
    details: Built on top of Baileys with optimized performance. Handle thousands of messages efficiently.

  - icon: <i class="fa-solid fa-plug"></i>
    title: Plugin System
    details: Extend functionality with a powerful plugin system. Create and share custom commands easily.

  - icon: <i class="fa-solid fa-lock"></i>
    title: Dual Authentication
    details: Support for both QR Code and Pairing Code methods. Perfect for headless servers and Docker deployments.

  - icon: <i class="fa-solid fa-box-open"></i>
    title: Rich Features
    details: Send text, images, videos, stickers, documents, polls, and more. Full WhatsApp feature support.

  - icon: <i class="fa-solid fa-palette"></i>
    title: Sticker Creation
    details: Built-in sticker maker with support for multiple formats - full, cropped, circle, and rounded.

  - icon: <i class="fa-solid fa-eye"></i>
    title: View Once Reader
    details: Read and download view once messages. Extract media from temporary messages.

  - icon: <i class="fa-solid fa-people-group"></i>
    title: Group Management
    details: Complete group management API. Create groups, manage participants, update settings, and more.

  - icon: <i class="fa-solid fa-docker"></i>
    title: Docker Ready
    details: Production-ready with Docker support. Deploy anywhere with containerization.

  - icon: <i class="fa-solid fa-file-code"></i>
    title: TypeScript Support
    details: Full TypeScript definitions included for better IDE support and type safety.

  - icon: <i class="fa-solid fa-arrows-rotate"></i>
    title: Auto Reconnect
    details: Automatic reconnection handling. Your bot stays online even during network issues.

  - icon: <i class="fa-solid fa-book"></i>
    title: Comprehensive Docs
    details: Detailed documentation with examples, tutorials, and API references. Everything you need to get started.
---

## Quick Start

### Installation

::: code-group

```bash [npm]
npm install @roidev/kachina-md
```

```bash [yarn]
yarn add @roidev/kachina-md
```

```bash [pnpm]
pnpm add @roidev/kachina-md
```

:::

### Basic Usage

```javascript
import { Client } from '@roidev/kachina-md';

const client = new Client({
    sessionId: 'my-session',
    loginMethod: 'qr' // or 'pairing'
});

client.on('ready', (user) => {
    console.log('Bot is ready!', user.name);
});

client.on('message', async (message) => {
    if (message.body === '!ping') {
        await client.sendText(message.from, 'Pong! 🏓');
    }
});

await client.start();
```

## Why Kachina-MD?

<div class="tip custom-block" style="margin-top: 2rem">

### 🎯 Built for Developers

Kachina-MD provides a clean, modern API that makes building WhatsApp bots enjoyable. No more struggling with complex configurations or boilerplate code.

</div>

<div class="tip custom-block">

### 🚀 Production Ready

Used in production by multiple projects. Handles thousands of messages daily with automatic reconnection and error recovery.

</div>

<div class="tip custom-block">

### 🌟 Active Development

Regularly updated with new features, bug fixes, and improvements. Community-driven with responsive maintainers.

</div>

## What's Included?

- ✅ **Simple Setup** - Get started in under 5 minutes
- ✅ **QR & Pairing Auth** - Choose your preferred login method
- ✅ **Message Handling** - Receive and send all message types
- ✅ **Media Support** - Images, videos, audio, documents
- ✅ **Stickers** - Create and send custom stickers
- ✅ **Groups** - Full group management capabilities
- ✅ **Events** - Rich event system for all WhatsApp events
- ✅ **Plugins** - Extensible plugin architecture
- ✅ **TypeScript** - Full type definitions included
- ✅ **Docker** - Container-ready for easy deployment

## Community

Join our growing community:

- 🌟 [Star on GitHub](https://github.com/idlanyor/kachina-core)
- 📦 [NPM Package](https://www.npmjs.com/package/@roidev/kachina-md)
- 🐛 [Report Issues](https://github.com/idlanyor/kachina-core/issues)
- 💬 [Discussions](https://github.com/idlanyor/kachina-core/discussions)

## License

[MIT License](https://github.com/idlanyor/kachina-core/blob/main/LICENSE)

Copyright © 2024-present Roynaldi
