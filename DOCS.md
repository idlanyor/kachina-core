# Kachina-MD Documentation

## 📚 Documentation Website

Visit our comprehensive documentation website:

**[https://idlanyor.github.io/kachina-core/](https://idlanyor.github.io/kachina-core/)**

The documentation includes:

- 📖 **Getting Started Guide** - Quick setup and first bot
- 🔐 **Authentication Guides** - QR Code and Pairing methods
- 🎯 **Feature Guides** - All framework features
- 📘 **API Reference** - Complete API documentation
- 💡 **Examples** - Real-world code examples
- 🚀 **Deployment Guides** - Docker, VPS, CI/CD

## Quick Links

### Guides
- [Getting Started](https://idlanyor.github.io/kachina-core/guide/getting-started)
- [Authentication Overview](https://idlanyor.github.io/kachina-core/guide/authentication/overview)
- [Pairing Code Method](https://idlanyor.github.io/kachina-core/guide/authentication/pairing-code)
- [Sending Messages](https://idlanyor.github.io/kachina-core/guide/features/sending-messages)
- [Stickers](https://idlanyor.github.io/kachina-core/guide/features/stickers)
- [View Once Messages](https://idlanyor.github.io/kachina-core/guide/features/view-once)

### API Reference
- [Client API](https://idlanyor.github.io/kachina-core/api/client)
- [Messages API](https://idlanyor.github.io/kachina-core/api/messages)
- [Media API](https://idlanyor.github.io/kachina-core/api/media)
- [Groups API](https://idlanyor.github.io/kachina-core/api/groups)

### Examples
- [Basic Bot](https://idlanyor.github.io/kachina-core/examples/basic-bot)
- [Pairing Bot](https://idlanyor.github.io/kachina-core/examples/pairing-bot)
- [View Once Reader](https://idlanyor.github.io/kachina-core/examples/view-once)

## Local Documentation

You can also run the documentation locally:

```bash
# Install dependencies
npm install

# Run docs locally
npm run docs:dev

# Build docs
npm run docs:build

# Preview built docs
npm run docs:preview
```

The documentation will be available at `http://localhost:5173`.

## Documentation Structure

```
docs-site/
├── guide/                    # User guides
│   ├── getting-started.md   # Quick start guide
│   ├── authentication/      # Auth methods
│   ├── core/               # Core concepts
│   ├── features/           # Feature guides
│   └── deployment/         # Deployment guides
├── api/                     # API reference
│   ├── client.md           # Client API
│   ├── messages.md         # Messages API
│   └── ...
├── examples/               # Code examples
│   ├── basic-bot.md       # Basic bot
│   ├── pairing-bot.md     # Pairing example
│   └── ...
└── index.md               # Homepage
```

## Contributing to Docs

Found a typo or want to improve the documentation?

1. Fork the repository
2. Edit files in `docs-site/`
3. Submit a pull request

See our [Contributing Guide](https://idlanyor.github.io/kachina-core/contributing) for details.

## Offline Documentation

Markdown documentation is also available in the `docs/` directory:

- `docs/PAIRING-MODE.md` - Complete pairing guide
- `docs/AUTHENTICATION-METHODS.md` - Auth comparison
- `docs/READ-VIEW-ONCE.md` - View once feature
- `docs/PAIRING-QUICK-REFERENCE.md` - Quick reference

## Need Help?

- 📖 [Documentation](https://idlanyor.github.io/kachina-core/)
- 💬 [Discussions](https://github.com/idlanyor/kachina-core/discussions)
- 🐛 [Issues](https://github.com/idlanyor/kachina-core/issues)
- 📦 [NPM](https://www.npmjs.com/package/@roidev/kachina-md)

## Quick Start

```javascript
import { Client } from '@roidev/kachina-md';

const client = new Client({
    sessionId: 'my-bot'
});

client.on('ready', (user) => {
    console.log('Bot ready!', user.name);
});

client.on('message', async (m) => {
    if (m.body === '!ping') {
        await client.sendText(m.from, 'Pong!');
    }
});

await client.start();
```

For more details, visit the [Getting Started Guide](https://idlanyor.github.io/kachina-core/guide/getting-started).

---

Made with ❤️ by the Kachina-MD community
