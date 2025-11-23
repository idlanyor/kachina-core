# Interactive Buttons Example

This example demonstrates how to use interactive buttons, lists, and template messages in your WhatsApp bot.

## Basic Button Bot

```javascript
import { Client } from '@roidev/kachina-md';

const bot = new Client({
  sessionId: 'button-bot',
  prefix: '!',
  owners: ['628xxx']
});

bot.on('ready', (user) => {
  console.log('Button bot is ready!', user.id);
});

bot.on('message', async (m) => {
  // Don't respond to own messages
  if (m.fromMe) return;

  // Main menu with button message
  if (m.body === '!menu') {
    await bot.sendButtonMessage(
      m.chat,
      {
        text: '🤖 *Welcome to Button Bot!*\n\nChoose a category to explore:',
        footer: 'Powered by Kachina-MD',
        headerType: 1
      },
      [
        {
          buttonId: 'category_fun',
          buttonText: { displayText: '🎮 Fun & Games' },
          type: 1
        },
        {
          buttonId: 'category_tools',
          buttonText: { displayText: '🛠️ Tools' },
          type: 1
        },
        {
          buttonId: 'category_info',
          buttonText: { displayText: 'ℹ️ Information' },
          type: 1
        }
      ]
    );
  }

  // Handle button responses
  if (m.body === 'category_fun') {
    await bot.sendListMessage(
      m.chat,
      '🎮 Fun Menu',
      {
        text: 'Select a fun command:',
        title: 'Fun & Games',
        footer: 'Have fun!'
      },
      [
        {
          title: '🎲 Games',
          rows: [
            {
              title: 'Roll Dice',
              rowId: 'game_dice',
              description: 'Roll a random dice (1-6)'
            },
            {
              title: 'Flip Coin',
              rowId: 'game_coin',
              description: 'Heads or tails?'
            },
            {
              title: 'Random Number',
              rowId: 'game_random',
              description: 'Generate random number'
            }
          ]
        },
        {
          title: '😂 Entertainment',
          rows: [
            {
              title: 'Tell a Joke',
              rowId: 'fun_joke',
              description: 'Get a random joke'
            },
            {
              title: 'Fun Fact',
              rowId: 'fun_fact',
              description: 'Learn something new'
            }
          ]
        }
      ]
    );
  }

  if (m.body === 'category_tools') {
    await bot.sendTemplateButtons(
      m.chat,
      [
        {
          index: 1,
          quickReplyButton: {
            displayText: '🧮 Calculator',
            id: 'tool_calc'
          }
        },
        {
          index: 2,
          quickReplyButton: {
            displayText: '🌍 Translate',
            id: 'tool_translate'
          }
        },
        {
          index: 3,
          urlButton: {
            displayText: '📚 More Tools',
            url: 'https://kachina-core.antidonasi.web.id'
          }
        }
      ],
      {
        text: '🛠️ *Available Tools*\n\nChoose a tool or visit our website:',
        footer: 'Tools powered by Kachina-MD'
      }
    );
  }

  if (m.body === 'category_info') {
    await bot.sendTemplateButtons(
      m.chat,
      [
        {
          index: 1,
          quickReplyButton: {
            displayText: 'About Bot',
            id: 'info_about'
          }
        },
        {
          index: 2,
          quickReplyButton: {
            displayText: 'Bot Stats',
            id: 'info_stats'
          }
        },
        {
          index: 3,
          urlButton: {
            displayText: '⭐ Star on GitHub',
            url: 'https://github.com/idlanyor/kachina-core'
          }
        }
      ],
      {
        text: 'ℹ️ *Bot Information*\n\nGet details about this bot:',
        footer: 'Kachina-MD Framework'
      }
    );
  }

  // Handle game commands
  if (m.body === 'game_dice') {
    const result = Math.floor(Math.random() * 6) + 1;
    await m.reply(`🎲 You rolled: *${result}*`);
  }

  if (m.body === 'game_coin') {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    await m.reply(`🪙 Result: *${result}*`);
  }

  if (m.body === 'game_random') {
    const result = Math.floor(Math.random() * 100) + 1;
    await m.reply(`🔢 Random number: *${result}*`);
  }

  // Handle fun commands
  if (m.body === 'fun_joke') {
    const jokes = [
      'Why do programmers prefer dark mode? Because light attracts bugs!',
      'How many programmers does it take to change a light bulb? None, that\'s a hardware problem.',
      'Why do Java developers wear glasses? Because they don\'t C#!'
    ];
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    await m.reply(`😂 ${joke}`);
  }

  if (m.body === 'fun_fact') {
    const facts = [
      'Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible!',
      'Octopuses have three hearts and blue blood!',
      'Bananas are berries, but strawberries aren\'t!'
    ];
    const fact = facts[Math.floor(Math.random() * facts.length)];
    await m.reply(`💡 *Fun Fact:*\n${fact}`);
  }

  // Handle tool commands
  if (m.body === 'tool_calc') {
    await m.reply(
      '🧮 *Calculator*\n\n' +
      'Usage: !calc <expression>\n' +
      'Example: !calc 2 + 2\n\n' +
      'Try it now!'
    );
  }

  if (m.body === 'tool_translate') {
    await m.reply(
      '🌍 *Translator*\n\n' +
      'Usage: !translate <text>\n' +
      'Example: !translate Hello\n\n' +
      'Try it now!'
    );
  }

  // Handle info commands
  if (m.body === 'info_about') {
    await m.reply(
      '🤖 *About This Bot*\n\n' +
      '• Name: Interactive Button Bot\n' +
      '• Framework: Kachina-MD v2.0\n' +
      '• Engine: sanka-baileyss\n' +
      '• Features: Interactive buttons, lists, templates\n\n' +
      'Built with ❤️ using Kachina-MD'
    );
  }

  if (m.body === 'info_stats') {
    await m.reply(
      '📊 *Bot Statistics*\n\n' +
      '• Uptime: ' + process.uptime().toFixed(0) + 's\n' +
      '• Memory: ' + (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + ' MB\n' +
      '• Platform: ' + process.platform + '\n' +
      '• Node: ' + process.version
    );
  }
});

await bot.start();
```

## Advanced Survey Bot

```javascript
import { Client } from '@roidev/kachina-md';

const bot = new Client({
  sessionId: 'survey-bot',
  prefix: '!',
  owners: ['628xxx']
});

// Store survey responses (use Database in production)
const responses = new Map();

bot.on('message', async (m) => {
  if (m.fromMe) return;

  // Start survey
  if (m.body === '!survey') {
    await bot.sendButtonMessage(
      m.chat,
      {
        text: '📋 *Customer Satisfaction Survey*\n\n' +
              'Help us improve our service!\n' +
              'This will only take a minute.',
        footer: 'Survey by Kachina-MD'
      },
      [
        {
          buttonId: 'survey_start',
          buttonText: { displayText: '▶️ Start Survey' },
          type: 1
        },
        {
          buttonId: 'survey_cancel',
          buttonText: { displayText: '❌ Maybe Later' },
          type: 1
        }
      ]
    );
  }

  // Start survey
  if (m.body === 'survey_start') {
    responses.set(m.sender, { started: Date.now() });

    await bot.sendButtonMessage(
      m.chat,
      {
        text: '❓ *Question 1/3*\n\n' +
              'How satisfied are you with our service?',
        footer: 'Customer Satisfaction Survey'
      },
      [
        {
          buttonId: 'q1_very_satisfied',
          buttonText: { displayText: '😄 Very Satisfied' },
          type: 1
        },
        {
          buttonId: 'q1_satisfied',
          buttonText: { displayText: '🙂 Satisfied' },
          type: 1
        },
        {
          buttonId: 'q1_neutral',
          buttonText: { displayText: '😐 Neutral' },
          type: 1
        }
      ]
    );
  }

  // Question 1 responses
  if (m.body.startsWith('q1_')) {
    const response = responses.get(m.sender) || {};
    response.q1 = m.body.replace('q1_', '');
    responses.set(m.sender, response);

    await bot.sendListMessage(
      m.chat,
      '📋 Select Option',
      {
        text: '*Question 2/3*\n\nWhich feature do you use most?',
        title: 'Customer Satisfaction Survey',
        footer: 'Question 2 of 3'
      },
      [
        {
          title: '🎯 Main Features',
          rows: [
            {
              title: 'Message Automation',
              rowId: 'q2_automation',
              description: 'Auto-replies and scheduled messages'
            },
            {
              title: 'Group Management',
              rowId: 'q2_groups',
              description: 'Admin tools and group features'
            },
            {
              title: 'Media Processing',
              rowId: 'q2_media',
              description: 'Stickers, images, videos'
            }
          ]
        },
        {
          title: '🛠️ Other Features',
          rows: [
            {
              title: 'Custom Commands',
              rowId: 'q2_commands',
              description: 'Plugin system'
            },
            {
              title: 'Database',
              rowId: 'q2_database',
              description: 'Data storage'
            }
          ]
        }
      ]
    );
  }

  // Question 2 responses
  if (m.body.startsWith('q2_')) {
    const response = responses.get(m.sender) || {};
    response.q2 = m.body.replace('q2_', '');
    responses.set(m.sender, response);

    await bot.sendButtonMessage(
      m.chat,
      {
        text: '❓ *Question 3/3*\n\n' +
              'Would you recommend us to others?',
        footer: 'Last question!'
      },
      [
        {
          buttonId: 'q3_definitely',
          buttonText: { displayText: '💯 Definitely!' },
          type: 1
        },
        {
          buttonId: 'q3_probably',
          buttonText: { displayText: '👍 Probably' },
          type: 1
        },
        {
          buttonId: 'q3_not_sure',
          buttonText: { displayText: '🤔 Not Sure' },
          type: 1
        }
      ]
    );
  }

  // Question 3 responses (finish)
  if (m.body.startsWith('q3_')) {
    const response = responses.get(m.sender) || {};
    response.q3 = m.body.replace('q3_', '');
    response.completed = Date.now();
    responses.set(m.sender, response);

    await bot.sendTemplateButtons(
      m.chat,
      [
        {
          index: 1,
          quickReplyButton: {
            displayText: '📊 View My Responses',
            id: 'survey_view'
          }
        },
        {
          index: 2,
          urlButton: {
            displayText: '🌐 Visit Website',
            url: 'https://kachina-core.antidonasi.web.id'
          }
        }
      ],
      {
        text: '✅ *Survey Completed!*\n\n' +
              'Thank you for your valuable feedback!\n' +
              'Your responses help us improve our service.',
        footer: 'We appreciate your time!'
      }
    );
  }

  // View responses
  if (m.body === 'survey_view') {
    const response = responses.get(m.sender);
    if (!response) {
      await m.reply('No survey responses found. Start with !survey');
      return;
    }

    const duration = Math.round((response.completed - response.started) / 1000);

    await m.reply(
      '📊 *Your Survey Responses*\n\n' +
      `*Q1 - Satisfaction:* ${response.q1}\n` +
      `*Q2 - Most Used Feature:* ${response.q2}\n` +
      `*Q3 - Recommendation:* ${response.q3}\n\n` +
      `⏱️ Completed in ${duration} seconds\n\n` +
      'Thank you for participating!'
    );
  }

  // Cancel survey
  if (m.body === 'survey_cancel') {
    await m.reply('No problem! Feel free to start the survey anytime with !survey');
  }
});

await bot.start();
```

## Interactive Settings Bot

```javascript
import { Client } from '@roidev/kachina-md';

const bot = new Client({
  sessionId: 'settings-bot',
  prefix: '!',
  owners: ['628xxx']
});

// User settings (use Database in production)
const settings = new Map();

bot.on('message', async (m) => {
  if (m.fromMe) return;

  // Settings menu
  if (m.body === '!settings') {
    const userSettings = settings.get(m.sender) || {
      language: 'en',
      notifications: true,
      theme: 'light'
    };

    await bot.sendListMessage(
      m.chat,
      '⚙️ Open Settings',
      {
        text: '*Bot Settings*\n\n' +
              `Language: ${userSettings.language}\n` +
              `Notifications: ${userSettings.notifications ? 'On' : 'Off'}\n` +
              `Theme: ${userSettings.theme}\n\n` +
              'Select a setting to change:',
        title: 'Settings',
        footer: 'Configure your bot experience'
      },
      [
        {
          title: '🌍 Preferences',
          rows: [
            {
              title: 'Language',
              rowId: 'setting_language',
              description: 'Change bot language'
            },
            {
              title: 'Notifications',
              rowId: 'setting_notifications',
              description: 'Enable/disable notifications'
            },
            {
              title: 'Theme',
              rowId: 'setting_theme',
              description: 'Light or dark theme'
            }
          ]
        },
        {
          title: '🔧 Advanced',
          rows: [
            {
              title: 'Reset Settings',
              rowId: 'setting_reset',
              description: 'Reset to default'
            },
            {
              title: 'Export Settings',
              rowId: 'setting_export',
              description: 'Download your settings'
            }
          ]
        }
      ]
    );
  }

  // Language setting
  if (m.body === 'setting_language') {
    await bot.sendButtonMessage(
      m.chat,
      {
        text: '🌍 *Choose Your Language*\n\nSelect preferred language:',
        footer: 'Settings > Language'
      },
      [
        {
          buttonId: 'lang_en',
          buttonText: { displayText: '🇬🇧 English' },
          type: 1
        },
        {
          buttonId: 'lang_id',
          buttonText: { displayText: '🇮🇩 Indonesia' },
          type: 1
        },
        {
          buttonId: 'lang_es',
          buttonText: { displayText: '🇪🇸 Español' },
          type: 1
        }
      ]
    );
  }

  // Save language
  if (m.body.startsWith('lang_')) {
    const lang = m.body.replace('lang_', '');
    const userSettings = settings.get(m.sender) || {};
    userSettings.language = lang;
    settings.set(m.sender, userSettings);

    await m.reply(`✅ Language changed to: ${lang}`);
  }

  // Notification setting
  if (m.body === 'setting_notifications') {
    const userSettings = settings.get(m.sender) || { notifications: true };
    const current = userSettings.notifications;

    await bot.sendButtonMessage(
      m.chat,
      {
        text: '🔔 *Notifications*\n\n' +
              `Current: ${current ? 'Enabled' : 'Disabled'}\n\n` +
              'Choose an option:',
        footer: 'Settings > Notifications'
      },
      [
        {
          buttonId: 'notif_on',
          buttonText: { displayText: '✅ Enable' },
          type: 1
        },
        {
          buttonId: 'notif_off',
          buttonText: { displayText: '❌ Disable' },
          type: 1
        }
      ]
    );
  }

  // Save notification setting
  if (m.body === 'notif_on' || m.body === 'notif_off') {
    const userSettings = settings.get(m.sender) || {};
    userSettings.notifications = m.body === 'notif_on';
    settings.set(m.sender, userSettings);

    await m.reply(
      `✅ Notifications ${userSettings.notifications ? 'enabled' : 'disabled'}`
    );
  }

  // Theme setting
  if (m.body === 'setting_theme') {
    await bot.sendButtonMessage(
      m.chat,
      {
        text: '🎨 *Choose Theme*\n\nSelect your preferred theme:',
        footer: 'Settings > Theme'
      },
      [
        {
          buttonId: 'theme_light',
          buttonText: { displayText: '☀️ Light' },
          type: 1
        },
        {
          buttonId: 'theme_dark',
          buttonText: { displayText: '🌙 Dark' },
          type: 1
        },
        {
          buttonId: 'theme_auto',
          buttonText: { displayText: '🔄 Auto' },
          type: 1
        }
      ]
    );
  }

  // Save theme
  if (m.body.startsWith('theme_')) {
    const theme = m.body.replace('theme_', '');
    const userSettings = settings.get(m.sender) || {};
    userSettings.theme = theme;
    settings.set(m.sender, userSettings);

    await m.reply(`✅ Theme changed to: ${theme}`);
  }

  // Reset settings
  if (m.body === 'setting_reset') {
    settings.delete(m.sender);
    await m.reply('✅ Settings reset to default');
  }

  // Export settings
  if (m.body === 'setting_export') {
    const userSettings = settings.get(m.sender) || {
      language: 'en',
      notifications: true,
      theme: 'light'
    };

    await m.reply(
      '📤 *Your Settings*\n\n' +
      '```json\n' +
      JSON.stringify(userSettings, null, 2) +
      '\n```'
    );
  }
});

await bot.start();
```

## See Also

- [Buttons Guide](/guide/features/buttons) - Complete buttons documentation
- [Client API](/api/client) - All client methods
- [Messages API](/api/messages) - Message handling
