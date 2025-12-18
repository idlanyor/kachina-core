import { Client } from '../src/client/Client.js';
import fs from 'fs';

/**
 * Advanced Pairing Mode Example
 *
 * This example shows:
 * - Custom pairing code handling
 * - Saving pairing code to file
 * - Sending pairing code via webhook/API
 * - Multiple device support
 * - Error handling and retry logic
 */

class PairingBotManager {
    constructor(phoneNumber, sessionId = 'pairing-session') {
        this.phoneNumber = phoneNumber;
        this.sessionId = sessionId;
        this.client = null;
        this.pairingCode = null;
        this.maxRetries = 3;
        this.retryCount = 0;
    }

    async savePairingCodeToFile(code) {
        const data = {
            code,
            phoneNumber: this.phoneNumber,
            timestamp: new Date().toISOString(),
            expiresIn: '60 seconds'
        };

        try {
            await fs.promises.writeFile(
                'pairing-code.json',
                JSON.stringify(data, null, 2)
            );
            console.log('✓ Pairing code saved to pairing-code.json');
        } catch (error) {
            console.error('Failed to save pairing code:', error);
        }
    }

    async sendPairingCodeViaWebhook(code) {
        // Example: Send to your webhook endpoint
        // Uncomment and modify the URL to use
        /*
        try {
            const response = await fetch('https://your-webhook-url.com/pairing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    phoneNumber: this.phoneNumber,
                    sessionId: this.sessionId,
                    timestamp: new Date().toISOString()
                })
            });

            if (response.ok) {
                console.log('✓ Pairing code sent to webhook');
            }
        } catch (error) {
            console.error('Failed to send to webhook:', error);
        }
        */
        console.log('ℹ️  Webhook sending disabled (uncomment code to enable)');
    }

    async sendPairingCodeViaSMS(code) {
        // Example: Send via SMS API (Twilio, etc.)
        console.log('ℹ️  SMS sending not implemented (integrate your SMS provider)');
        console.log(`Would send: "Your WhatsApp pairing code is: ${code}"`);
    }

    setupClient() {
        this.client = new Client({
            sessionId: this.sessionId,
            loginMethod: 'pairing',
            phoneNumber: this.phoneNumber,
            browser: ['Kachina-MD-Pairing', 'Chrome', '1.0.0']
        });

        // Handle pairing code event
        this.client.on('pairing.code', async (code) => {
            this.pairingCode = code;
            console.log('\n🔐 Pairing Code Generated:', code);

            // Save to multiple destinations
            await this.savePairingCodeToFile(code);
            await this.sendPairingCodeViaWebhook(code);
            await this.sendPairingCodeViaSMS(code);

            console.log('\n⏰ Code expires in 60 seconds!');
            console.log('Enter this code in WhatsApp to continue...\n');
        });

        // Handle pairing errors
        this.client.on('pairing.error', async (error) => {
            console.error('❌ Pairing Error:', error.message);

            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`🔄 Retrying... (${this.retryCount}/${this.maxRetries})`);

                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 5000));
                await this.start();
            } else {
                console.error('Max retries reached. Please check your phone number and try again.');
                process.exit(1);
            }
        });

        // Connection events
        this.client.on('connecting', () => {
            console.log('⏳ Connecting to WhatsApp...');
        });

        this.client.on('ready', (user) => {
            console.log('\n✅ Successfully Connected!');
            console.log('═══════════════════════════════════');
            console.log('User ID:', user.id);
            console.log('Name:', user.name);
            console.log('Login Method: Pairing Code');
            console.log('═══════════════════════════════════\n');

            // Clean up pairing code file after success
            if (fs.existsSync('pairing-code.json')) {
                fs.unlinkSync('pairing-code.json');
                console.log('✓ Pairing code file cleaned up');
            }
        });

        this.client.on('reconnecting', () => {
            console.log('🔄 Reconnecting...');
        });

        this.client.on('logout', () => {
            console.log('👋 Logged out');
        });

        // Message handling
        this.client.on('message', async (msg) => {
            if (!msg.body) return;

            console.log(`[${msg.pushName}]: ${msg.body}`);

            // Command: Check connection status
            if (msg.body === '!status') {
                await this.client.sendText(
                    msg.from,
                    `✅ Bot Status\n\n` +
                    `Login: Pairing Code\n` +
                    `Ready: ${this.client.isReady}\n` +
                    `Session: ${this.sessionId}\n` +
                    `User: ${this.client.user?.name || 'Unknown'}`
                );
            }

            // Command: Get device info
            if (msg.body === '!device') {
                await this.client.sendText(
                    msg.from,
                    `📱 Device Info\n\n` +
                    `Browser: ${this.client.config.browser.join(', ')}\n` +
                    `Method: ${this.client.config.loginMethod}\n` +
                    `Phone: ${this.phoneNumber}`
                );
            }
        });
    }

    async start() {
        try {
            console.log('🚀 Starting Kachina-MD with Pairing Method');
            console.log('═══════════════════════════════════════════');
            console.log('Phone Number:', this.phoneNumber);
            console.log('Session ID:', this.sessionId);
            console.log('═══════════════════════════════════════════\n');

            if (!this.client) {
                this.setupClient();
            }

            await this.client.start();
        } catch (error) {
            console.error('Failed to start bot:', error.message);

            if (error.message.includes('Phone number')) {
                console.log('\nℹ️  Please set a valid phone number in the code');
                console.log('Example: const bot = new PairingBotManager("628123456789")');
            }

            process.exit(1);
        }
    }

    async stop() {
        if (this.client?.sock) {
            await this.client.sock.logout();
        }
        console.log('Bot stopped');
    }
}

// ============================================
// Usage Example
// ============================================

// IMPORTANT: Replace with your phone number!
// Format: Country code + number (no + sign)
// Example: 628123456789 for Indonesia
const PHONE_NUMBER = process.env.PHONE_NUMBER || '628123456789';

// Create and start bot
const bot = new PairingBotManager(PHONE_NUMBER, 'my-pairing-session');

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\n\nShutting down gracefully...');
    await bot.stop();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n\nShutting down gracefully...');
    await bot.stop();
    process.exit(0);
});

// Handle errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
});

// Start the bot
bot.start().catch(console.error);

// ============================================
// Environment Variable Usage
// ============================================
/*
You can also run with environment variable:

PHONE_NUMBER=628123456789 node examples/pairing-advanced.js

Or create a .env file:
PHONE_NUMBER=628123456789
*/
