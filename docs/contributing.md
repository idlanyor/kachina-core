# Contributing to Kachina-MD

Thank you for your interest in contributing to Kachina-MD! We welcome contributions from everyone.

## Ways to Contribute

- 🐛 **Report bugs** - Found a bug? Let us know!
- ✨ **Suggest features** - Have an idea? Share it!
- 📝 **Improve documentation** - Help make docs better
- 💻 **Submit code** - Fix bugs or add features
- 🧪 **Write tests** - Help improve test coverage
- 🌐 **Translate** - Help translate documentation

## Getting Started

### 1. Fork the Repository

Click the "Fork" button on the [GitHub repository](https://github.com/idlanyor/kachina-core).

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/kachina-core.git
cd kachina-core
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

## Development Workflow

### Project Structure

```
kachina-core/
├── src/                    # Source code
│   ├── client/            # Client implementation
│   ├── structures/        # Core structures
│   ├── utils/             # Utility functions
│   └── plugins/           # Plugin system
├── example/               # Example bots
├── docs/                  # Markdown documentation & VitePress site
├── lib/                   # Built output
└── tests/                 # Tests (coming soon)
```

### Building

```bash
npm run build
```

This compiles `src/` to `lib/`.

### Testing

```bash
# Run example bot
npm test

# Or run specific example
node example/basic-bot.js
```

### Documentation

```bash
# Run documentation site locally
npm run docs:dev

# Build documentation
npm run docs:build
```

## Code Guidelines

### JavaScript Style

We use ES6+ JavaScript with ESM modules.

**Good practices:**

```javascript
// Use async/await
async function sendMessage(jid, text) {
    await this.sock.sendMessage(jid, { text });
}

// Use destructuring
const { from, body } = message;

// Use arrow functions for callbacks
client.on('message', async (m) => {
    // Handle message
});

// Use template literals
console.log(`Message from ${m.pushName}: ${m.body}`);
```

### Code Formatting

- Use 4 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Add comments for complex logic
- Keep functions small and focused

### Naming Conventions

```javascript
// Classes: PascalCase
class MessageHandler {}

// Functions/Methods: camelCase
async function sendMessage() {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;

// Private methods: prefix with _
_privateMethod() {}
```

## Making Changes

### 1. Make Your Changes

Edit files in the `src/` directory. The most common files:

- `src/client/Client.js` - Main client class
- `src/utils/` - Utility functions
- `src/structures/` - Core structures and handlers

### 2. Test Your Changes

```bash
# Build the project
npm run build

# Test with example
node example/basic-bot.js
```

### 3. Update Documentation

If you added a feature or changed behavior:

- Update JSDoc comments in code
- Update relevant markdown files in `docs/`
- Add examples if applicable

### 4. Commit Your Changes

Use clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add view once reader functionality"

# or
git commit -m "fix: resolve pairing code timeout issue"

# or
git commit -m "docs: improve authentication guide"
```

**Commit message format:**

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

1. Go to your fork on GitHub
2. Click "Pull Request"
3. Select your branch
4. Fill in the PR template
5. Submit!

## Pull Request Guidelines

### Before Submitting

- ✅ Code builds without errors
- ✅ Examples run successfully
- ✅ Documentation is updated
- ✅ Commit messages are clear
- ✅ No unnecessary files included

### PR Description

Include:

1. **What** - What does this PR do?
2. **Why** - Why is this change needed?
3. **How** - How does it work?
4. **Testing** - How was it tested?

**Example:**

```markdown
## What
Adds support for reading view once messages

## Why
Users need a way to access view once media in their bots

## How
- Added `readViewOnce()` method to Client
- Integrated downloadMediaMessage from Baileys
- Added type detection for images and videos

## Testing
- Tested with view once images
- Tested with view once videos
- Added example in `example/readvo-example.js`
```

### Code Review

We may ask you to make changes. Don't worry - it's normal!

- Be open to feedback
- Ask questions if unclear
- Make requested changes
- Push updates to your branch

## Documentation Contributions

### Improving Docs

Documentation is in `docs/` using VitePress.

```bash
# Edit markdown files
docs/
├── guide/              # Guides
├── api/                # API docs
└── examples/           # Examples

# Preview changes
npm run docs:dev
```

### Writing Style

- Use clear, simple language
- Include code examples
- Add notes/tips/warnings when helpful
- Use proper markdown formatting

**Example:**

```markdown
## Sending Messages

You can send text messages using the `sendText()` method:

\`\`\`javascript
await client.sendText(jid, 'Hello!');
\`\`\`

::: tip
Make sure the client is connected before sending messages!
:::
```

## Reporting Bugs

### Before Reporting

1. Check [existing issues](https://github.com/idlanyor/kachina-core/issues)
2. Try with the latest version
3. Reproduce the bug consistently

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Create client with...
2. Call method...
3. See error

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened.

**Code**
\`\`\`javascript
// Your code here
\`\`\`

**Error message**
\`\`\`
// Error output
\`\`\`

**Environment:**
- OS: [e.g. Ubuntu 22.04]
- Node version: [e.g. 20.0.0]
- Kachina-MD version: [e.g. 2.0.5]
```

## Feature Requests

We love new ideas! Open an issue with:

1. **Description** - What feature do you want?
2. **Use case** - Why is it useful?
3. **Example** - How would it work?

```markdown
**Feature description**
Add support for WhatsApp Status/Stories

**Use case**
Bots could monitor and respond to status updates

**Example usage**
\`\`\`javascript
client.on('status.update', async (status) => {
    console.log('New status from', status.from);
});
\`\`\`
```

## Questions?

- 💬 [Discussions](https://github.com/idlanyor/kachina-core/discussions)
- 🐛 [Issues](https://github.com/idlanyor/kachina-core/issues)
- 📧 Contact maintainers

## Code of Conduct

- Be respectful and constructive
- Welcome newcomers
- Help others learn
- Focus on the code, not the person

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Kachina-MD! 🎉
