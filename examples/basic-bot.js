import { Client, Database, Logger } from '../src/index.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
    sessionId: 'kachina-session',
    phoneNumber: '',  // For pairing code
    prefix: '!',
    owner: ['628xxx'], // Your WhatsApp number
    loginMethod: 'qr' // 'qr' or 'pairing'
};

// Initialize
const bot = new Client(config);
const db = new Database({ path: './database' });
const logger = new Logger({ prefix: 'BOT' });

// Load plugins
await bot.loadPlugins(path.join(__dirname, 'plugins'));

// Event: Bot ready
bot.on('ready', (user) => {
    logger.success('Bot is ready!');
    logger.info('Bot Number:', user.id.split(':')[0]);
});

// Event: Pairing code
bot.on('pairing.code', (code) => {
    console.log('\n📱 Pairing Code:', code);
    console.log('Enter this code in WhatsApp\n');
});

// Event: New message
bot.on('message', async (m) => {
    // Skip if from bot itself
    if (m.fromMe) return;

    // Log message
    logger.info(`Message from ${m.pushName}: ${m.body}`);

    // Custom message handler (non-command)
    if (!m.body?.startsWith(bot.prefix)) {
        // Handle non-command messages here
        // Example: AI chat, word filters, etc.
    }
});

// Event: Group update
bot.on('group.update', async (update) => {
    const { id, participants, action } = update;

    try {
        const settings = await db.get('groups', id, { welcome: false, leave: false });
        const metadata = await bot.groupMetadata(id);

        for (const participant of participants) {
            if (action === 'add' && settings.welcome) {
                const text = `Welcome @${participant.split('@')[0]} to ${metadata.subject}! 👋`;
                await bot.sendMessage(id, {
                    text,
                    mentions: [participant]
                });
            } else if (action === 'remove' && settings.leave) {
                const text = `Goodbye @${participant.split('@')[0]}! 👋`;
                await bot.sendMessage(id, {
                    text,
                    mentions: [participant]
                });
            }
        }
    } catch (error) {
        logger.error('Group update error:', error.message);
    }
});

// Event: Reconnecting
bot.on('reconnecting', () => {
    logger.warn('Reconnecting...');
});

// Event: Logout
bot.on('logout', () => {
    logger.error('Bot logged out!');
    process.exit(0);
});

// Start bot
logger.info('Starting bot...');
await bot.start();
