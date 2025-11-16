# Group Management Bot

Complete example of a WhatsApp group management bot with admin commands.

## Basic Group Admin Bot

```javascript
import { Client } from '@roidev/kachina-md';

const client = new Client({
    sessionId: 'group-admin',
    prefix: '!',
    owners: ['628xxx@s.whatsapp.net']
});

// Helper: Check if user is group admin
async function isUserAdmin(groupJid, userJid) {
    const metadata = await client.groupMetadata(groupJid);
    const participant = metadata.participants.find(p => p.id === userJid);
    return participant?.admin !== null;
}

// Helper: Check if bot is group admin
async function isBotAdmin(groupJid) {
    const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net';
    return await isUserAdmin(groupJid, botJid);
}

client.on('message', async (m) => {
    // Only process group messages
    if (!m.isGroup) return;
    
    // Kick command
    if (m.body === '!kick' || m.body === '!remove') {
        // Check if sender is admin
        if (!await isUserAdmin(m.chat, m.sender)) {
            return await m.reply('⚠️ Admin only command!');
        }
        
        // Check if bot is admin
        if (!await isBotAdmin(m.chat)) {
            return await m.reply('⚠️ Bot must be admin!');
        }
        
        // Check if message quotes someone
        if (!m.quoted) {
            return await m.reply('❌ Reply to the user you want to kick!');
        }
        
        try {
            await client.groupParticipantsUpdate(
                m.chat,
                [m.quoted.sender],
                'remove'
            );
            await m.reply('✅ User removed from group');
        } catch (error) {
            await m.reply('❌ Failed to remove user');
            console.error(error);
        }
    }
    
    // Add command
    if (m.body?.startsWith('!add ')) {
        if (!await isUserAdmin(m.chat, m.sender)) {
            return await m.reply('⚠️ Admin only command!');
        }
        
        if (!await isBotAdmin(m.chat)) {
            return await m.reply('⚠️ Bot must be admin!');
        }
        
        const number = m.body.slice(5).trim().replace(/[^0-9]/g, '');
        
        if (!number) {
            return await m.reply('❌ Usage: !add 628xxx');
        }
        
        const jid = `${number}@s.whatsapp.net`;
        
        try {
            await client.groupParticipantsUpdate(m.chat, [jid], 'add');
            await m.reply(`✅ Added @${number}`, { mentions: [jid] });
        } catch (error) {
            await m.reply('❌ Failed to add user');
        }
    }
    
    // Promote command
    if (m.body === '!promote') {
        if (!await isUserAdmin(m.chat, m.sender)) {
            return await m.reply('⚠️ Admin only command!');
        }
        
        if (!await isBotAdmin(m.chat)) {
            return await m.reply('⚠️ Bot must be admin!');
        }
        
        if (!m.quoted) {
            return await m.reply('❌ Reply to the user you want to promote!');
        }
        
        try {
            await client.groupParticipantsUpdate(
                m.chat,
                [m.quoted.sender],
                'promote'
            );
            await m.reply('✅ User promoted to admin');
        } catch (error) {
            await m.reply('❌ Failed to promote user');
        }
    }
    
    // Demote command
    if (m.body === '!demote') {
        if (!await isUserAdmin(m.chat, m.sender)) {
            return await m.reply('⚠️ Admin only command!');
        }
        
        if (!await isBotAdmin(m.chat)) {
            return await m.reply('⚠️ Bot must be admin!');
        }
        
        if (!m.quoted) {
            return await m.reply('❌ Reply to the admin you want to demote!');
        }
        
        try {
            await client.groupParticipantsUpdate(
                m.chat,
                [m.quoted.sender],
                'demote'
            );
            await m.reply('✅ User demoted from admin');
        } catch (error) {
            await m.reply('❌ Failed to demote user');
        }
    }
});

client.start();
```

## Advanced Group Manager

With welcome messages, anti-link, and more features.

```javascript
import { Client, Database } from '@roidev/kachina-md';

const client = new Client({
    sessionId: 'advanced-group',
    prefix: '!'
});

const db = new Database();

// Helper functions
async function isUserAdmin(groupJid, userJid) {
    const metadata = await client.groupMetadata(groupJid);
    const participant = metadata.participants.find(p => p.id === userJid);
    return participant?.admin !== null;
}

async function isBotAdmin(groupJid) {
    const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net';
    return await isUserAdmin(groupJid, botJid);
}

// Welcome/Goodbye Messages
client.on('group.update', async (update) => {
    const { id, participants, action } = update;
    
    // Check if welcome is enabled
    const settings = await db.get('group-settings', id, { welcome: true });
    if (!settings.welcome) return;
    
    try {
        const metadata = await client.groupMetadata(id);
        
        if (action === 'add') {
            for (const participant of participants) {
                const welcome = `
👋 Welcome @${participant.split('@')[0]}!

Welcome to *${metadata.subject}*

Please read the group description and follow the rules.
Enjoy your stay! 🎉
                `.trim();
                
                await client.sendMessage(id, {
                    text: welcome,
                    mentions: [participant]
                });
            }
        }
        
        if (action === 'remove') {
            for (const participant of participants) {
                const goodbye = `
👋 Goodbye @${participant.split('@')[0]}!

Thanks for being part of *${metadata.subject}*
                `.trim();
                
                await client.sendMessage(id, {
                    text: goodbye,
                    mentions: [participant]
                });
            }
        }
        
    } catch (error) {
        console.error('Welcome/Goodbye error:', error);
    }
});

// Anti-Link System
client.on('message', async (m) => {
    if (!m.isGroup) return;
    
    // Check if anti-link is enabled
    const settings = await db.get('group-settings', m.chat, { antilink: false });
    
    if (settings.antilink && m.body?.includes('chat.whatsapp.com/')) {
        // Don't remove if sender is admin
        if (await isUserAdmin(m.chat, m.sender)) return;
        
        // Check if bot is admin
        if (!await isBotAdmin(m.chat)) {
            return await m.reply('⚠️ Link detected but bot is not admin!');
        }
        
        try {
            // Delete message
            await m.delete();
            
            // Warn user
            await m.reply('⚠️ Links are not allowed in this group!');
            
            // Optional: Remove user
            // await client.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
            
        } catch (error) {
            console.error('Anti-link error:', error);
        }
    }
});

// Group Commands
client.on('message', async (m) => {
    if (!m.isGroup) return;
    
    const userId = m.sender;
    
    // Group info
    if (m.body === '!groupinfo' || m.body === '!ginfo') {
        const metadata = await client.groupMetadata(m.chat);
        
        const admins = metadata.participants
            .filter(p => p.admin)
            .map(p => `@${p.id.split('@')[0]}`);
        
        const info = `
*📊 GROUP INFO*

*Name:* ${metadata.subject}
*Created:* ${new Date(metadata.creation * 1000).toLocaleDateString()}
*Owner:* @${metadata.owner.split('@')[0]}
*Members:* ${metadata.size}
*Admins:* ${admins.length}

*Description:*
${metadata.desc || 'No description'}

*Settings:*
• Messages: ${metadata.announce ? 'Admins only' : 'All members'}
• Edit info: ${metadata.restrict ? 'Admins only' : 'All members'}

*Admins:*
${admins.join('\n')}
        `.trim();
        
        const mentions = metadata.participants
            .filter(p => p.admin || p.id === metadata.owner)
            .map(p => p.id);
        
        await client.sendMessage(m.chat, {
            text: info,
            mentions
        });
    }
    
    // Tag all members
    if (m.body === '!tagall' || m.body === '!everyone') {
        if (!await isUserAdmin(m.chat, userId)) {
            return await m.reply('⚠️ Admin only command!');
        }
        
        const metadata = await client.groupMetadata(m.chat);
        const text = '📢 *Attention Everyone!*\n\n' +
            metadata.participants
                .map(p => `@${p.id.split('@')[0]}`)
                .join('\n');
        
        await client.sendMessage(m.chat, {
            text,
            mentions: metadata.participants.map(p => p.id)
        });
    }
    
    // Admins list
    if (m.body === '!admins' || m.body === '!adminlist') {
        const metadata = await client.groupMetadata(m.chat);
        const admins = metadata.participants.filter(p => p.admin);
        
        const text = `
*👑 GROUP ADMINS*

${admins.map(p => `@${p.id.split('@')[0]}`).join('\n')}

Total: ${admins.length}
        `.trim();
        
        await client.sendMessage(m.chat, {
            text,
            mentions: admins.map(p => p.id)
        });
    }
    
    // Change group name
    if (m.body?.startsWith('!setname ')) {
        if (!await isUserAdmin(m.chat, userId)) {
            return await m.reply('⚠️ Admin only command!');
        }
        
        if (!await isBotAdmin(m.chat)) {
            return await m.reply('⚠️ Bot must be admin!');
        }
        
        const newName = m.body.slice(9).trim();
        
        if (!newName) {
            return await m.reply('❌ Usage: !setname <new name>');
        }
        
        try {
            await client.groupUpdateSubject(m.chat, newName);
            await m.reply(`✅ Group name changed to: ${newName}`);
        } catch (error) {
            await m.reply('❌ Failed to change group name');
        }
    }
    
    // Change group description
    if (m.body?.startsWith('!setdesc ')) {
        if (!await isUserAdmin(m.chat, userId)) {
            return await m.reply('⚠️ Admin only command!');
        }
        
        if (!await isBotAdmin(m.chat)) {
            return await m.reply('⚠️ Bot must be admin!');
        }
        
        const newDesc = m.body.slice(9).trim();
        
        if (!newDesc) {
            return await m.reply('❌ Usage: !setdesc <new description>');
        }
        
        try {
            await client.groupUpdateDescription(m.chat, newDesc);
            await m.reply('✅ Group description updated');
        } catch (error) {
            await m.reply('❌ Failed to update description');
        }
    }
    
    // Get invite link
    if (m.body === '!link' || m.body === '!invitelink') {
        if (!await isUserAdmin(m.chat, userId)) {
            return await m.reply('⚠️ Admin only command!');
        }
        
        if (!await isBotAdmin(m.chat)) {
            return await m.reply('⚠️ Bot must be admin!');
        }
        
        try {
            const code = await client.sock.groupInviteCode(m.chat);
            const link = `https://chat.whatsapp.com/${code}`;
            
            await m.reply(`🔗 *Invite Link*\n\n${link}`);
        } catch (error) {
            await m.reply('❌ Failed to get invite link');
        }
    }
    
    // Revoke invite link
    if (m.body === '!revoke' || m.body === '!resetlink') {
        if (!await isUserAdmin(m.chat, userId)) {
            return await m.reply('⚠️ Admin only command!');
        }
        
        if (!await isBotAdmin(m.chat)) {
            return await m.reply('⚠️ Bot must be admin!');
        }
        
        try {
            await client.sock.groupRevokeInvite(m.chat);
            await m.reply('✅ Invite link revoked and regenerated');
        } catch (error) {
            await m.reply('❌ Failed to revoke link');
        }
    }
    
    // Lock group (only admins can send)
    if (m.body === '!lock' || m.body === '!close') {
        if (!await isUserAdmin(m.chat, userId)) {
            return await m.reply('⚠️ Admin only command!');
        }
        
        if (!await isBotAdmin(m.chat)) {
            return await m.reply('⚠️ Bot must be admin!');
        }
        
        try {
            await client.sock.groupSettingUpdate(m.chat, 'announcement');
            await m.reply('🔒 Group locked - Only admins can send messages');
        } catch (error) {
            await m.reply('❌ Failed to lock group');
        }
    }
    
    // Unlock group (all can send)
    if (m.body === '!unlock' || m.body === '!open') {
        if (!await isUserAdmin(m.chat, userId)) {
            return await m.reply('⚠️ Admin only command!');
        }
        
        if (!await isBotAdmin(m.chat)) {
            return await m.reply('⚠️ Bot must be admin!');
        }
        
        try {
            await client.sock.groupSettingUpdate(m.chat, 'not_announcement');
            await m.reply('🔓 Group unlocked - All members can send messages');
        } catch (error) {
            await m.reply('❌ Failed to unlock group');
        }
    }
    
    // Enable/Disable welcome
    if (m.body === '!welcome on' || m.body === '!welcome off') {
        if (!await isUserAdmin(m.chat, userId)) {
            return await m.reply('⚠️ Admin only command!');
        }
        
        const enable = m.body.endsWith('on');
        await db.update('group-settings', m.chat, { welcome: enable });
        
        await m.reply(enable ? '✅ Welcome messages enabled' : '❌ Welcome messages disabled');
    }
    
    // Enable/Disable anti-link
    if (m.body === '!antilink on' || m.body === '!antilink off') {
        if (!await isUserAdmin(m.chat, userId)) {
            return await m.reply('⚠️ Admin only command!');
        }
        
        const enable = m.body.endsWith('on');
        await db.update('group-settings', m.chat, { antilink: enable });
        
        await m.reply(enable ? '✅ Anti-link enabled' : '❌ Anti-link disabled');
    }
    
    // Group settings
    if (m.body === '!settings') {
        if (!await isUserAdmin(m.chat, userId)) {
            return await m.reply('⚠️ Admin only command!');
        }
        
        const settings = await db.get('group-settings', m.chat, {
            welcome: true,
            antilink: false
        });
        
        const text = `
*⚙️ GROUP SETTINGS*

Welcome Messages: ${settings.welcome ? '✅ Enabled' : '❌ Disabled'}
Anti-Link: ${settings.antilink ? '✅ Enabled' : '❌ Disabled'}

Use:
• !welcome on/off
• !antilink on/off
        `.trim();
        
        await m.reply(text);
    }
});

client.start();
```

## Features

✅ Member management (add, kick, promote, demote)  
✅ Welcome and goodbye messages  
✅ Anti-link protection  
✅ Group info and statistics  
✅ Tag all members  
✅ Change group name and description  
✅ Invite link management  
✅ Lock/unlock group  
✅ Configurable settings per group  
✅ Admin-only commands  

## Commands

| Command | Description | Admin Only |
|---------|-------------|------------|
| `!kick` | Remove user (reply to message) | ✅ |
| `!add <number>` | Add user to group | ✅ |
| `!promote` | Promote user to admin | ✅ |
| `!demote` | Demote admin | ✅ |
| `!groupinfo` | Show group information | ❌ |
| `!tagall` | Mention all members | ✅ |
| `!admins` | List all admins | ❌ |
| `!setname <name>` | Change group name | ✅ |
| `!setdesc <desc>` | Change description | ✅ |
| `!link` | Get invite link | ✅ |
| `!revoke` | Revoke invite link | ✅ |
| `!lock` | Only admins can send | ✅ |
| `!unlock` | All members can send | ✅ |
| `!welcome on/off` | Toggle welcome messages | ✅ |
| `!antilink on/off` | Toggle anti-link | ✅ |
| `!settings` | Show group settings | ✅ |

## See Also

- [Groups API](/api/groups)
- [Database API](/api/helpers#database)
- [Client API](/api/client)
