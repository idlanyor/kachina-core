# Custom Buttons & Interactive Messages

::: info
This feature is powered by `sanka-baileyss`, an enhanced fork of Baileys that provides better support for interactive WhatsApp messages.
:::

Kachina-MD supports various types of interactive messages including buttons, lists, and template messages. These features make your bot more engaging and user-friendly.

## Button Types

Kachina-MD supports four types of interactive messages:

1. **Button Messages** - Simple buttons with custom IDs
2. **List Messages** - Dropdown menus with multiple options
3. **Template Buttons** - Advanced buttons with URL, Call, and Quick Reply
4. **Interactive Messages** - Modern button format with native flow

## Button Messages

Send simple button messages with up to 3 buttons.

### Basic Example

```javascript
await client.sendButtonMessage(
  '628xxx@s.whatsapp.net',
  'Choose an option:',
  [
    { buttonId: 'id1', buttonText: { displayText: 'Button 1' }, type: 1 },
    { buttonId: 'id2', buttonText: { displayText: 'Button 2' }, type: 1 },
    { buttonId: 'id3', buttonText: { displayText: 'Button 3' }, type: 1 }
  ]
);
```

### With Footer and Header

```javascript
await client.sendButtonMessage(
  '628xxx@s.whatsapp.net',
  {
    text: 'Choose an option:',
    footer: 'Powered by Kachina-MD',
    headerType: 1
  },
  [
    { buttonId: 'option1', buttonText: { displayText: 'Option 1' }, type: 1 },
    { buttonId: 'option2', buttonText: { displayText: 'Option 2' }, type: 1 }
  ]
);
```

### Handling Button Responses

```javascript
client.on('message', async (m) => {
  // Button response will be in m.body
  if (m.body === 'option1') {
    await m.reply('You selected Option 1!');
  } else if (m.body === 'option2') {
    await m.reply('You selected Option 2!');
  }
});
```

## List Messages

Send dropdown menu with multiple sections and options.

### Basic Example

```javascript
await client.sendListMessage(
  '628xxx@s.whatsapp.net',
  'Click Here',
  {
    text: 'Select an option from the menu',
    title: 'Main Menu',
    footer: 'Powered by Kachina-MD'
  },
  [
    {
      title: 'Category 1',
      rows: [
        { title: 'Option 1', rowId: 'opt1', description: 'Description for option 1' },
        { title: 'Option 2', rowId: 'opt2', description: 'Description for option 2' }
      ]
    },
    {
      title: 'Category 2',
      rows: [
        { title: 'Option 3', rowId: 'opt3', description: 'Description for option 3' },
        { title: 'Option 4', rowId: 'opt4', description: 'Description for option 4' }
      ]
    }
  ]
);
```

### Multiple Sections

```javascript
await client.sendListMessage(
  m.chat,
  '📋 View Menu',
  {
    text: 'Welcome! Choose what you want to do:',
    title: 'Bot Menu',
    footer: 'Select an option below'
  },
  [
    {
      title: '🎮 Fun Commands',
      rows: [
        { title: 'Play Game', rowId: 'game', description: 'Start a fun game' },
        { title: 'Random Meme', rowId: 'meme', description: 'Get a random meme' },
        { title: 'Joke', rowId: 'joke', description: 'Tell me a joke' }
      ]
    },
    {
      title: '🛠️ Utility',
      rows: [
        { title: 'Weather', rowId: 'weather', description: 'Check weather' },
        { title: 'Calculator', rowId: 'calc', description: 'Calculate numbers' },
        { title: 'Translate', rowId: 'translate', description: 'Translate text' }
      ]
    },
    {
      title: '📱 Info',
      rows: [
        { title: 'About Bot', rowId: 'about', description: 'Information about this bot' },
        { title: 'Help', rowId: 'help', description: 'Get help' }
      ]
    }
  ]
);
```

### Handling List Responses

```javascript
client.on('message', async (m) => {
  switch(m.body) {
    case 'game':
      await m.reply('🎮 Starting game...');
      break;
    case 'meme':
      await m.reply('😂 Here\'s your meme!');
      break;
    case 'weather':
      await m.reply('🌤️ Checking weather...');
      break;
  }
});
```

## Template Buttons

Advanced button format supporting Quick Reply, URL, and Call buttons.

### Quick Reply Buttons

```javascript
await client.sendTemplateButtons(
  '628xxx@s.whatsapp.net',
  [
    { index: 1, quickReplyButton: { displayText: 'Yes ✅', id: 'yes' } },
    { index: 2, quickReplyButton: { displayText: 'No ❌', id: 'no' } },
    { index: 3, quickReplyButton: { displayText: 'Maybe 🤔', id: 'maybe' } }
  ],
  {
    text: 'Do you agree with our terms and conditions?',
    footer: 'Please select an option'
  }
);
```

### URL and Call Buttons

```javascript
await client.sendTemplateButtons(
  '628xxx@s.whatsapp.net',
  [
    {
      index: 1,
      urlButton: {
        displayText: '🌐 Visit Website',
        url: 'https://github.com/idlanyor/kachina-core'
      }
    },
    {
      index: 2,
      callButton: {
        displayText: '📞 Call Support',
        phoneNumber: '+1234567890'
      }
    },
    {
      index: 3,
      quickReplyButton: {
        displayText: '💬 Contact',
        id: 'contact'
      }
    }
  ],
  {
    text: 'Get in touch with us!',
    footer: 'Support Team Available 24/7'
  }
);
```

### Mixed Button Types

```javascript
await client.sendTemplateButtons(
  m.chat,
  [
    {
      index: 1,
      urlButton: {
        displayText: '📖 Documentation',
        url: 'https://kachina-core.antidonasi.web.id'
      }
    },
    {
      index: 2,
      urlButton: {
        displayText: '⭐ Star on GitHub',
        url: 'https://github.com/idlanyor/kachina-core'
      }
    },
    {
      index: 3,
      quickReplyButton: {
        displayText: '✅ I understand',
        id: 'understood'
      }
    }
  ],
  {
    text: 'Welcome to Kachina-MD! 🎉\n\nCheck out our documentation and star us on GitHub!',
    footer: 'Thank you for using Kachina-MD'
  }
);
```

## Interactive Messages

Modern button format using the native flow message structure.

### Basic Interactive Buttons

```javascript
await client.sendInteractiveMessage(
  '628xxx@s.whatsapp.net',
  {
    body: { text: 'Choose your preferred language:' },
    footer: { text: 'Settings' }
  },
  {
    buttonParamsJson: JSON.stringify({
      buttons: [
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({
            display_text: 'English 🇬🇧',
            id: 'lang_en'
          })
        },
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({
            display_text: 'Indonesia 🇮🇩',
            id: 'lang_id'
          })
        },
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({
            display_text: 'Español 🇪🇸',
            id: 'lang_es'
          })
        }
      ]
    })
  }
);
```

## Complete Plugin Example

Here's a complete plugin that demonstrates all button types:

```javascript
// plugins/menu.js
export default {
  name: 'menu',
  commands: ['menu', 'help'],
  category: 'general',
  description: 'Show interactive menu',

  async exec({ client, m }) {
    // Button Message Example
    if (m.body === '!menu buttons') {
      await client.sendButtonMessage(
        m.chat,
        {
          text: '🤖 *Bot Menu*\n\nChoose a category:',
          footer: 'Kachina-MD v2.0'
        },
        [
          { buttonId: 'fun', buttonText: { displayText: '🎮 Fun' }, type: 1 },
          { buttonId: 'utility', buttonText: { displayText: '🛠️ Utility' }, type: 1 },
          { buttonId: 'info', buttonText: { displayText: 'ℹ️ Info' }, type: 1 }
        ]
      );
      return;
    }

    // List Message Example
    if (m.body === '!menu list') {
      await client.sendListMessage(
        m.chat,
        '📋 Open Menu',
        {
          text: '*Available Commands*\n\nSelect a category to see commands:',
          title: 'Bot Command Menu',
          footer: 'Powered by Kachina-MD'
        },
        [
          {
            title: '🎮 Fun & Games',
            rows: [
              { title: 'Dice Roll', rowId: 'cmd_dice', description: 'Roll a random dice' },
              { title: 'Coin Flip', rowId: 'cmd_coin', description: 'Flip a coin' },
              { title: 'Random Meme', rowId: 'cmd_meme', description: 'Get a random meme' }
            ]
          },
          {
            title: '🛠️ Utilities',
            rows: [
              { title: 'Sticker Maker', rowId: 'cmd_sticker', description: 'Create stickers' },
              { title: 'Weather', rowId: 'cmd_weather', description: 'Check weather' },
              { title: 'Calculator', rowId: 'cmd_calc', description: 'Calculate expressions' }
            ]
          },
          {
            title: 'ℹ️ Information',
            rows: [
              { title: 'Bot Info', rowId: 'cmd_botinfo', description: 'About this bot' },
              { title: 'Ping', rowId: 'cmd_ping', description: 'Check bot latency' },
              { title: 'Stats', rowId: 'cmd_stats', description: 'Bot statistics' }
            ]
          }
        ]
      );
      return;
    }

    // Template Buttons Example
    if (m.body === '!menu template') {
      await client.sendTemplateButtons(
        m.chat,
        [
          {
            index: 1,
            urlButton: {
              displayText: '📖 Documentation',
              url: 'https://kachina-core.antidonasi.web.id'
            }
          },
          {
            index: 2,
            urlButton: {
              displayText: '⭐ GitHub',
              url: 'https://github.com/idlanyor/kachina-core'
            }
          },
          {
            index: 3,
            quickReplyButton: {
              displayText: '✨ Get Started',
              id: 'get_started'
            }
          }
        ],
        {
          text: '*Welcome to Kachina-MD!* 🎉\n\n' +
                'A powerful WhatsApp bot framework built with Baileys.\n\n' +
                '• Easy to use\n' +
                '• Plugin system\n' +
                '• TypeScript support\n' +
                '• Active development',
          footer: 'Choose an option below'
        }
      );
      return;
    }

    // Default menu
    await m.reply(
      '*Menu Types:*\n\n' +
      '!menu buttons - Button menu\n' +
      '!menu list - List menu\n' +
      '!menu template - Template buttons'
    );
  }
};
```

## Handling Button Responses

Button responses are automatically parsed and available in `m.body`:

```javascript
client.on('message', async (m) => {
  // Handle button message responses
  if (m.body === 'fun') {
    await m.reply('🎮 Fun category selected!');
  }

  // Handle list message responses
  if (m.body === 'cmd_dice') {
    const result = Math.floor(Math.random() * 6) + 1;
    await m.reply(`🎲 You rolled: ${result}`);
  }

  // Handle template button responses
  if (m.body === 'get_started') {
    await m.reply('Great! Let\'s get started...');
  }

  // Handle interactive message responses
  if (m.body === 'lang_en') {
    await m.reply('Language set to English 🇬🇧');
  }
});
```

## Best Practices

### 1. Button Limits

- **Button Messages**: Maximum 3 buttons
- **List Messages**: Maximum 10 sections, each with maximum 10 rows
- **Template Buttons**: Maximum 3 buttons (can mix types)

### 2. Button Text Length

Keep button text short and clear:
- Button displayText: 20 characters max recommended
- List row title: 24 characters max recommended
- List row description: 72 characters max recommended

### 3. Button IDs

Use clear, descriptive IDs:

```javascript
// ✅ Good
{ buttonId: 'confirm_delete', buttonText: { displayText: 'Confirm' }, type: 1 }
{ rowId: 'settings_language', title: 'Language' }

// ❌ Bad
{ buttonId: 'btn1', buttonText: { displayText: 'OK' }, type: 1 }
{ rowId: 'opt1', title: 'Option' }
```

### 4. Error Handling

Always wrap button sending in try-catch:

```javascript
try {
  await client.sendButtonMessage(jid, text, buttons);
} catch (error) {
  console.error('Failed to send button:', error);
  // Fallback to text message
  await client.sendText(jid, 'Please choose an option:\n1. Option 1\n2. Option 2');
}
```

### 5. User Experience

- Provide clear instructions
- Use emojis for better visual appeal
- Add footer text for additional context
- Test buttons on different WhatsApp versions

## Migration from @whiskeysockets/baileys

If you're migrating from the original Baileys, the button methods remain compatible. The main difference is that `sanka-baileyss` provides better stability and support for interactive messages.

No code changes are required for existing button implementations! 🎉

## API Reference

### sendButtonMessage(jid, text, buttons, options?)

Send a button message with up to 3 buttons.

**Parameters:**
- `jid` (string): Chat ID
- `text` (string | object): Message text or content object
- `buttons` (array): Array of button objects
- `options` (object, optional): Additional options

### sendListMessage(jid, buttonText, content, sections, options?)

Send a list message with selectable options.

**Parameters:**
- `jid` (string): Chat ID
- `buttonText` (string): Text on the list button
- `content` (object): Message content (text, title, footer)
- `sections` (array): Array of section objects
- `options` (object, optional): Additional options

### sendTemplateButtons(jid, buttons, content, options?)

Send a template button message.

**Parameters:**
- `jid` (string): Chat ID
- `buttons` (array): Array of template button objects
- `content` (object): Message content (text, footer)
- `options` (object, optional): Additional options

### sendInteractiveMessage(jid, content, interactive, options?)

Send an interactive message (modern format).

**Parameters:**
- `jid` (string): Chat ID
- `content` (object): Message content (body, footer, header)
- `interactive` (object): Interactive content
- `options` (object, optional): Additional options

## See Also

- [Sending Messages](/guide/features/sending-messages)
- [Client API](/api/client)
- [Plugin System](/guide/core/plugins)
