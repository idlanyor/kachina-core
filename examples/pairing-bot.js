import { Client } from '../src/client/Client.js';

// Create client with pairing method
const client = new Client({
    sessionId: 'pairing-session',
    loginMethod: 'pairing',
    phoneNumber: '628123456789', // Replace with your phone number (with country code, no +)
    browser: ['Kachina-MD', 'Chrome', '1.0.0']
});

// Event: When pairing code is generated
client.on('pairing.code', (code) => {
    console.log('📱 Pairing code received:', code);
    console.log('You can also handle this event to send code via API, email, etc.');
});

// Event: When pairing fails
client.on('pairing.error', (error) => {
    console.error('❌ Pairing error:', error.message);
});

// Event: When connecting
client.on('connecting', () => {
    console.log('⏳ Connecting to WhatsApp...');
});

// Event: When connected and ready
client.on('ready', (user) => {
    console.log('✅ Bot is ready!');
    console.log('User info:', user);
});

// Event: When reconnecting
client.on('reconnecting', () => {
    console.log('🔄 Reconnecting...');
});

// Event: When logged out
client.on('logout', () => {
    console.log('👋 Logged out');
});

// Event: When message received
client.on('message', async (message) => {
    console.log('📩 New message from:', message.pushName);
    console.log('Message:', message.body);

    // Auto reply example
    if (message.body === '!ping') {
        await client.sendText(message.from, 'Pong! 🏓');
    }

    if (message.body === '!info') {
        await client.sendText(
            message.from,
            `Bot Info:\n` +
            `Login Method: Pairing Code\n` +
            `Status: Online ✅\n` +
            `Phone: ${client.user.id.split(':')[0]}`
        );
    }

    // Send sticker example
    if (message.body === '!sticker' && message.hasMedia) {
        try {
            const media = await message.download();
            await client.sendSticker(message.from, media, {
                pack: 'Kachina Bot',
                author: 'Pairing Mode'
            });
        } catch (error) {
            console.error('Failed to create sticker:', error);
            await client.sendText(message.from, 'Failed to create sticker!');
        }
    }
});

// Handle errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
});

// Start the bot
console.log('🚀 Starting bot with pairing method...');
console.log('Make sure to replace the phone number with your own!\n');

client.start().catch((error) => {
    console.error('Failed to start bot:', error.message);
    process.exit(1);
});
