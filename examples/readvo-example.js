import { Client } from '../src/client/Client.js';

/**
 * View Once Message Reader Example
 *
 * This example shows how to use the readViewOnce and sendViewOnce methods
 * to read and forward view once messages
 */

const client = new Client({
    sessionId: 'readvo-session',
    loginMethod: 'qr', // or 'pairing'
});

client.on('ready', (user) => {
    console.log('✅ Bot ready!');
    console.log('User:', user.name);
    console.log('\nCommands:');
    console.log('  !readvo - Reply to a view once message to reveal it');
    console.log('  !rvo    - Alias for !readvo\n');
});

client.on('message', async (m) => {
    if (!m.body) return;

    const command = m.body.toLowerCase().trim();

    // Command: Read view once
    if (command === '!readvo' || command === '!rvo') {
        try {
            // Check if message is quoted (replied)
            if (!m.quoted) {
                await client.sendText(m.from, '❌ Reply pesan view once yang ingin dibuka!');
                return;
            }

            // Add waiting reaction
            await client.sendReact(m.from, m.key, '⏳');

            // Method 1: Read and send directly
            await client.sendViewOnce(m.from, m.quoted, {
                quoted: m // Reply to the command message
            });

            // Add success reaction
            await client.sendReact(m.from, m.key, '✅');

            console.log(`✓ View once revealed for ${m.pushName}`);
        } catch (error) {
            console.error('Error reading view once:', error.message);

            // Send error message
            await client.sendText(
                m.from,
                `❌ Gagal membuka view once:\n${error.message}`
            );

            // Add error reaction
            await client.sendReact(m.from, m.key, '❌');
        }
    }

    // Command: Read view once and get buffer (advanced)
    if (command === '!readvo-advanced') {
        try {
            if (!m.quoted) {
                await client.sendText(m.from, '❌ Reply pesan view once!');
                return;
            }

            // Method 2: Read and get buffer for custom processing
            const { buffer, type, caption } = await client.readViewOnce(m.quoted);

            console.log('View Once Details:');
            console.log('  Type:', type);
            console.log('  Caption:', caption || '(no caption)');
            console.log('  Buffer size:', buffer.length, 'bytes');

            // You can now:
            // - Save to file
            // - Process the image/video
            // - Send to multiple chats
            // - Upload to cloud storage
            // - etc.

            // Example: Send with custom caption
            if (type === 'image') {
                await client.sendImage(m.from, buffer,
                    `📸 View Once Image\n` +
                    `Original caption: ${caption || 'none'}\n` +
                    `Size: ${(buffer.length / 1024).toFixed(2)} KB`
                );
            } else {
                await client.sendVideo(m.from, buffer,
                    `🎥 View Once Video\n` +
                    `Original caption: ${caption || 'none'}\n` +
                    `Size: ${(buffer.length / 1024).toFixed(2)} KB`
                );
            }

            await client.sendReact(m.from, m.key, '✅');
        } catch (error) {
            console.error('Error:', error.message);
            await client.sendText(m.from, `❌ Error: ${error.message}`);
        }
    }

    // Command: Read view once and forward to multiple chats
    if (command === '!readvo-forward') {
        try {
            if (!m.quoted) {
                await client.sendText(m.from, '❌ Reply pesan view once!');
                return;
            }

            // Read once, send to multiple destinations
            const { buffer, type, caption } = await client.readViewOnce(m.quoted);

            // Example: Send to saved messages (your own number)
            // You would get the user's JID from somewhere
            const myJid = client.user.id;

            if (type === 'image') {
                await client.sendImage(myJid, buffer,
                    `📸 Forwarded View Once\n${caption}`
                );
            } else {
                await client.sendVideo(myJid, buffer,
                    `🎥 Forwarded View Once\n${caption}`
                );
            }

            await client.sendText(m.from, '✅ View once forwarded to your saved messages!');
        } catch (error) {
            console.error('Error:', error.message);
            await client.sendText(m.from, `❌ Error: ${error.message}`);
        }
    }

    // Command: Help
    if (command === '!help' || command === '!menu') {
        const helpText = `
📖 *View Once Reader Bot*

*Basic Commands:*
!readvo - Reply to view once to reveal
!rvo    - Alias for !readvo

*Advanced Commands:*
!readvo-advanced - Show detailed info
!readvo-forward  - Forward to saved messages

*How to use:*
1. Reply to a view once message
2. Type !readvo
3. Bot will reveal the media

*Note:*
- Works with both images and videos
- Preserves original caption
- Only works on quoted messages
        `.trim();

        await client.sendText(m.from, helpText);
    }
});

// Error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
});

// Start bot
console.log('🚀 Starting View Once Reader Bot...\n');
client.start().catch(console.error);
