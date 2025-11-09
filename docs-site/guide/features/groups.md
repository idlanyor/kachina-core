# Group Management

Comprehensive guide to managing WhatsApp groups with Kachina-MD.

## Overview

Kachina-MD provides complete group management capabilities:

- 📋 Get group information
- 👥 Manage participants (add/remove)
- 👑 Promote/demote admins
- ✏️ Update group name and description
- 🖼️ Change group picture
- ⚙️ Configure group settings
- 🔔 Handle group events

## Group Metadata

### Get Group Info

```javascript
const metadata = await client.groupMetadata(groupJid);

console.log('Group name:', metadata.subject);
console.log('Description:', metadata.desc);
console.log('Owner:', metadata.owner);
console.log('Created:', new Date(metadata.creation * 1000));
console.log('Participants:', metadata.participants.length);
```

### Full Metadata Object

```typescript
{
    id: string,              // Group JID
    subject: string,         // Group name
    subjectOwner: string,    // Who set the name
    subjectTime: number,     // When name was set
    desc: string,            // Group description
    descId: string,          // Description ID
    descOwner: string,       // Who set description
    descTime: number,        // When description was set
    creation: number,        // Group creation timestamp
    owner: string,           // Group owner JID
    participants: [          // Array of participants
        {
            id: string,      // Participant JID
            admin: string,   // 'admin', 'superadmin', or null
            isAdmin: boolean,
            isSuperAdmin: boolean
        }
    ],
    size: number,            // Number of participants
    announce: boolean,       // Only admins can send messages
    restrict: boolean,       // Only admins can edit group info
    ephemeralDuration: number // Disappearing messages duration
}
```

### Check Admin Status

```javascript
const metadata = await client.groupMetadata(groupJid);

// Check if user is admin
function isAdmin(jid) {
    return metadata.participants.some(
        p => p.id === jid && (p.admin === 'admin' || p.admin === 'superadmin')
    );
}

// Check if user is owner
function isOwner(jid) {
    return metadata.owner === jid;
}

// Usage
if (isAdmin(userJid)) {
    console.log('User is admin');
}
```

## Participant Management

### Add Participants

```javascript
// Add single participant
await client.groupParticipantsUpdate(
    groupJid,
    ['628123456789@s.whatsapp.net'],
    'add'
);

// Add multiple participants
await client.groupParticipantsUpdate(
    groupJid,
    [
        '628123456789@s.whatsapp.net',
        '628987654321@s.whatsapp.net'
    ],
    'add'
);
```

### Remove Participants

```javascript
// Remove (kick) participant
await client.groupParticipantsUpdate(
    groupJid,
    ['628123456789@s.whatsapp.net'],
    'remove'
);

// Kick multiple participants
await client.groupParticipantsUpdate(
    groupJid,
    [
        '628123456789@s.whatsapp.net',
        '628987654321@s.whatsapp.net'
    ],
    'remove'
);
```

### Promote to Admin

```javascript
// Promote to admin
await client.groupParticipantsUpdate(
    groupJid,
    ['628123456789@s.whatsapp.net'],
    'promote'
);
```

### Demote Admin

```javascript
// Demote from admin to member
await client.groupParticipantsUpdate(
    groupJid,
    ['628123456789@s.whatsapp.net'],
    'demote'
);
```

## Group Settings

### Update Group Name

```javascript
await client.groupUpdateSubject(groupJid, 'New Group Name');
```

### Update Group Description

```javascript
await client.groupUpdateDescription(
    groupJid,
    'This is the new group description.\n\nRules:\n1. Be respectful\n2. No spam'
);
```

### Group Invite Code

```javascript
// Get group invite code
const inviteCode = await client.sock.groupInviteCode(groupJid);
console.log('Invite link:', `https://chat.whatsapp.com/${inviteCode}`);

// Revoke invite code (generate new one)
const newCode = await client.sock.groupRevokeInvite(groupJid);
console.log('New invite link:', `https://chat.whatsapp.com/${newCode}`);
```

### Leave Group

```javascript
await client.sock.groupLeave(groupJid);
```

## Group Events

### Participant Updates

Triggered when participants join, leave, or change roles:

```javascript
client.on('group.update', async (update) => {
    console.log('Group update:', update);

    const { id, participants, action } = update;

    if (action === 'add') {
        // New members joined
        console.log('New members:', participants);

        // Send welcome message
        for (const participant of participants) {
            const welcome = `Welcome @${participant.split('@')[0]}! 👋`;

            await client.sendText(id, welcome, {
                mentions: [participant]
            });
        }
    }

    if (action === 'remove') {
        // Members left or were kicked
        console.log('Left:', participants);

        await client.sendText(
            id,
            `Goodbye ${participants.length} member(s) 👋`
        );
    }

    if (action === 'promote') {
        // Promoted to admin
        console.log('Promoted:', participants);

        for (const participant of participants) {
            await client.sendText(
                id,
                `Congratulations @${participant.split('@')[0]}! You are now an admin! 👑`,
                { mentions: [participant] }
            );
        }
    }

    if (action === 'demote') {
        // Demoted from admin
        console.log('Demoted:', participants);
    }
});
```

### Group Settings Updates

Triggered when group settings change:

```javascript
client.on('groups.update', async (updates) => {
    for (const update of updates) {
        console.log('Group settings updated:', update);

        if (update.subject) {
            console.log('New group name:', update.subject);
        }

        if (update.desc) {
            console.log('New description:', update.desc);
        }

        if (update.announce !== undefined) {
            console.log('Announce mode:', update.announce);
        }
    }
});
```

## Command Examples

### Admin-Only Commands

```javascript
client.on('message', async (m) => {
    if (!m.isGroup) return;

    const command = m.body?.toLowerCase();

    // Commands that require admin
    const adminCommands = ['!kick', '!add', '!promote', '!demote'];

    if (adminCommands.includes(command)) {
        // Get group metadata
        const metadata = await client.groupMetadata(m.from);

        // Check if sender is admin
        const senderIsAdmin = metadata.participants.some(
            p => p.id === m.participant &&
                 (p.admin === 'admin' || p.admin === 'superadmin')
        );

        if (!senderIsAdmin) {
            await m.reply('❌ Admin only command!');
            return;
        }

        // Process admin command
        await handleAdminCommand(m, command, metadata);
    }
});
```

### Kick Command

```javascript
client.on('message', async (m) => {
    if (!m.isGroup) return;

    if (m.body === '!kick' || m.body === '!remove') {
        // Verify admin
        const metadata = await client.groupMetadata(m.from);
        const isAdmin = metadata.participants.some(
            p => p.id === m.participant && p.admin
        );

        if (!isAdmin) {
            await m.reply('❌ Admin only!');
            return;
        }

        // Check if message is quoted
        if (!m.quoted) {
            await m.reply('❌ Reply to a message to kick the user!');
            return;
        }

        // Get target user
        const target = m.quoted.participant || m.quoted.from;

        // Don't kick admins
        const targetIsAdmin = metadata.participants.some(
            p => p.id === target && p.admin
        );

        if (targetIsAdmin) {
            await m.reply('❌ Cannot kick admins!');
            return;
        }

        try {
            // Kick user
            await client.groupParticipantsUpdate(m.from, [target], 'remove');

            await m.reply(`✅ @${target.split('@')[0]} has been removed`, {
                mentions: [target]
            });
        } catch (error) {
            await m.reply('❌ Failed to kick user');
        }
    }
});
```

### Add Command

```javascript
client.on('message', async (m) => {
    if (m.body?.startsWith('!add ')) {
        if (!m.isGroup) return;

        // Check admin
        const metadata = await client.groupMetadata(m.from);
        const isAdmin = metadata.participants.some(
            p => p.id === m.participant && p.admin
        );

        if (!isAdmin) {
            await m.reply('❌ Admin only!');
            return;
        }

        // Get phone number from command
        const args = m.body.split(' ');
        const number = args[1]?.replace(/[^0-9]/g, '');

        if (!number) {
            await m.reply('❌ Usage: !add 628123456789');
            return;
        }

        const jid = `${number}@s.whatsapp.net`;

        try {
            await client.groupParticipantsUpdate(m.from, [jid], 'add');
            await m.reply(`✅ Added @${number}`, { mentions: [jid] });
        } catch (error) {
            await m.reply('❌ Failed to add user. They may have privacy settings enabled.');
        }
    }
});
```

### Promote Command

```javascript
client.on('message', async (m) => {
    if (m.body === '!promote') {
        if (!m.isGroup) return;

        const metadata = await client.groupMetadata(m.from);

        // Only owner can promote
        if (metadata.owner !== m.participant) {
            await m.reply('❌ Only group owner can promote!');
            return;
        }

        if (!m.quoted) {
            await m.reply('❌ Reply to a message to promote the user!');
            return;
        }

        const target = m.quoted.participant || m.quoted.from;

        try {
            await client.groupParticipantsUpdate(m.from, [target], 'promote');
            await m.reply(`✅ @${target.split('@')[0]} is now an admin! 👑`, {
                mentions: [target]
            });
        } catch (error) {
            await m.reply('❌ Failed to promote user');
        }
    }
});
```

### Demote Command

```javascript
client.on('message', async (m) => {
    if (m.body === '!demote') {
        if (!m.isGroup) return;

        const metadata = await client.groupMetadata(m.from);

        if (metadata.owner !== m.participant) {
            await m.reply('❌ Only group owner can demote!');
            return;
        }

        if (!m.quoted) {
            await m.reply('❌ Reply to a message to demote the user!');
            return;
        }

        const target = m.quoted.participant || m.quoted.from;

        // Don't demote owner
        if (target === metadata.owner) {
            await m.reply('❌ Cannot demote group owner!');
            return;
        }

        try {
            await client.groupParticipantsUpdate(m.from, [target], 'demote');
            await m.reply(`✅ @${target.split('@')[0]} is no longer an admin`, {
                mentions: [target]
            });
        } catch (error) {
            await m.reply('❌ Failed to demote user');
        }
    }
});
```

### Group Info Command

```javascript
client.on('message', async (m) => {
    if (m.body === '!groupinfo' || m.body === '!ginfo') {
        if (!m.isGroup) {
            await m.reply('❌ This command only works in groups!');
            return;
        }

        const metadata = await client.groupMetadata(m.from);

        const info = `
📋 *Group Information*

*Name:* ${metadata.subject}
*Created:* ${new Date(metadata.creation * 1000).toLocaleDateString()}
*Owner:* @${metadata.owner.split('@')[0]}
*Participants:* ${metadata.participants.length}
*Admins:* ${metadata.participants.filter(p => p.admin).length}
*Description:*
${metadata.desc || 'No description'}
        `.trim();

        await client.sendText(m.from, info, {
            mentions: [metadata.owner]
        });
    }
});
```

### List Admins

```javascript
client.on('message', async (m) => {
    if (m.body === '!admins' || m.body === '!listadmin') {
        if (!m.isGroup) return;

        const metadata = await client.groupMetadata(m.from);

        const admins = metadata.participants.filter(p => p.admin);

        if (admins.length === 0) {
            await m.reply('No admins in this group');
            return;
        }

        let text = '*👑 Group Admins*\n\n';

        admins.forEach((admin, index) => {
            const role = admin.admin === 'superadmin' ? '👑 Owner' : '⭐ Admin';
            text += `${index + 1}. @${admin.id.split('@')[0]} ${role}\n`;
        });

        await client.sendText(m.from, text, {
            mentions: admins.map(a => a.id)
        });
    }
});
```

## Advanced Features

### Tag All Members

```javascript
client.on('message', async (m) => {
    if (m.body === '!tagall') {
        if (!m.isGroup) return;

        // Check admin
        const metadata = await client.groupMetadata(m.from);
        const isAdmin = metadata.participants.some(
            p => p.id === m.participant && p.admin
        );

        if (!isAdmin) {
            await m.reply('❌ Admin only!');
            return;
        }

        // Get all participants
        const participants = metadata.participants.map(p => p.id);

        // Create mention text
        let text = '📢 *Mentioning all members*\n\n';
        participants.forEach((jid, index) => {
            text += `${index + 1}. @${jid.split('@')[0]}\n`;
        });

        await client.sendText(m.from, text, {
            mentions: participants
        });
    }
});
```

### Anti-Link Protection

```javascript
client.on('message', async (m) => {
    if (!m.isGroup) return;
    if (!m.body) return;

    // Check for links
    const hasLink = /https?:\/\/|wa\.me|whatsapp\.com/i.test(m.body);

    if (hasLink) {
        const metadata = await client.groupMetadata(m.from);

        // Check if sender is admin
        const senderIsAdmin = metadata.participants.some(
            p => p.id === m.participant && p.admin
        );

        // Skip if admin
        if (senderIsAdmin) return;

        // Delete message and kick user
        try {
            await client.sock.sendMessage(m.from, {
                delete: m.key
            });

            await m.reply('❌ Links are not allowed in this group!');

            // Optional: Kick user
            // await client.groupParticipantsUpdate(m.from, [m.participant], 'remove');
        } catch (error) {
            console.error('Anti-link error:', error);
        }
    }
});
```

### Welcome & Goodbye Messages

```javascript
client.on('group.update', async (update) => {
    const { id, participants, action } = update;

    if (action === 'add') {
        // Welcome new members
        const metadata = await client.groupMetadata(id);

        for (const participant of participants) {
            const welcome = `
👋 *Welcome to ${metadata.subject}!*

Hello @${participant.split('@')[0]}!

Please read the group rules:
1. Be respectful to all members
2. No spam or advertising
3. Use appropriate language
4. Have fun!

Type !help for bot commands
            `.trim();

            await client.sendText(id, welcome, {
                mentions: [participant]
            });
        }
    }

    if (action === 'remove') {
        // Goodbye message
        for (const participant of participants) {
            await client.sendText(
                id,
                `👋 Goodbye @${participant.split('@')[0]}!`,
                { mentions: [participant] }
            );
        }
    }
});
```

### Auto-Approve Join Requests

```javascript
client.on('group.update', async (update) => {
    if (update.action === 'join_request') {
        const { id, participants } = update;

        // Auto-approve
        for (const participant of participants) {
            try {
                await client.groupParticipantsUpdate(id, [participant], 'approve');
                console.log('Auto-approved:', participant);
            } catch (error) {
                console.error('Failed to approve:', error);
            }
        }
    }
});
```

### Group Rules Command

```javascript
const groupRules = {
    '120xxx@g.us': `
*📜 Group Rules*

1. Be respectful
2. No spam
3. No NSFW content
4. English only
5. Have fun!
    `.trim()
};

client.on('message', async (m) => {
    if (m.body === '!rules') {
        if (!m.isGroup) return;

        const rules = groupRules[m.from] || 'No rules set for this group';
        await m.reply(rules);
    }
});
```

## Complete Group Management Bot

```javascript
class GroupManager {
    constructor(client) {
        this.client = client;
        this.setupHandlers();
    }

    async isAdmin(groupJid, userJid) {
        const metadata = await this.client.groupMetadata(groupJid);
        return metadata.participants.some(
            p => p.id === userJid && (p.admin === 'admin' || p.admin === 'superadmin')
        );
    }

    async isOwner(groupJid, userJid) {
        const metadata = await this.client.groupMetadata(groupJid);
        return metadata.owner === userJid;
    }

    setupHandlers() {
        this.client.on('message', async (m) => {
            if (!m.isGroup) return;

            const command = m.body?.toLowerCase();

            // Admin commands
            if (command === '!kick') {
                await this.handleKick(m);
            }
            else if (command?.startsWith('!add ')) {
                await this.handleAdd(m);
            }
            else if (command === '!promote') {
                await this.handlePromote(m);
            }
            else if (command === '!demote') {
                await this.handleDemote(m);
            }
            else if (command === '!admins') {
                await this.handleListAdmins(m);
            }
            else if (command === '!tagall') {
                await this.handleTagAll(m);
            }
            else if (command === '!groupinfo') {
                await this.handleGroupInfo(m);
            }
        });
    }

    async handleKick(m) {
        if (!await this.isAdmin(m.from, m.participant)) {
            await m.reply('❌ Admin only!');
            return;
        }

        if (!m.quoted) {
            await m.reply('❌ Reply to a message!');
            return;
        }

        const target = m.quoted.participant || m.quoted.from;

        try {
            await this.client.groupParticipantsUpdate(m.from, [target], 'remove');
            await m.reply(`✅ Kicked @${target.split('@')[0]}`, {
                mentions: [target]
            });
        } catch (error) {
            await m.reply('❌ Failed to kick');
        }
    }

    async handleAdd(m) {
        if (!await this.isAdmin(m.from, m.participant)) {
            await m.reply('❌ Admin only!');
            return;
        }

        const number = m.body.split(' ')[1]?.replace(/[^0-9]/g, '');

        if (!number) {
            await m.reply('❌ Usage: !add 628123456789');
            return;
        }

        const jid = `${number}@s.whatsapp.net`;

        try {
            await this.client.groupParticipantsUpdate(m.from, [jid], 'add');
            await m.reply(`✅ Added @${number}`, { mentions: [jid] });
        } catch (error) {
            await m.reply('❌ Failed to add user');
        }
    }

    async handlePromote(m) {
        if (!await this.isOwner(m.from, m.participant)) {
            await m.reply('❌ Owner only!');
            return;
        }

        if (!m.quoted) {
            await m.reply('❌ Reply to a message!');
            return;
        }

        const target = m.quoted.participant || m.quoted.from;

        try {
            await this.client.groupParticipantsUpdate(m.from, [target], 'promote');
            await m.reply(`✅ Promoted @${target.split('@')[0]} 👑`, {
                mentions: [target]
            });
        } catch (error) {
            await m.reply('❌ Failed to promote');
        }
    }

    async handleDemote(m) {
        if (!await this.isOwner(m.from, m.participant)) {
            await m.reply('❌ Owner only!');
            return;
        }

        if (!m.quoted) {
            await m.reply('❌ Reply to a message!');
            return;
        }

        const target = m.quoted.participant || m.quoted.from;

        try {
            await this.client.groupParticipantsUpdate(m.from, [target], 'demote');
            await m.reply(`✅ Demoted @${target.split('@')[0]}`, {
                mentions: [target]
            });
        } catch (error) {
            await m.reply('❌ Failed to demote');
        }
    }

    async handleListAdmins(m) {
        const metadata = await this.client.groupMetadata(m.from);
        const admins = metadata.participants.filter(p => p.admin);

        let text = '*👑 Group Admins*\n\n';
        admins.forEach((admin, i) => {
            const role = admin.admin === 'superadmin' ? '👑' : '⭐';
            text += `${i + 1}. @${admin.id.split('@')[0]} ${role}\n`;
        });

        await this.client.sendText(m.from, text, {
            mentions: admins.map(a => a.id)
        });
    }

    async handleTagAll(m) {
        if (!await this.isAdmin(m.from, m.participant)) {
            await m.reply('❌ Admin only!');
            return;
        }

        const metadata = await this.client.groupMetadata(m.from);
        const participants = metadata.participants.map(p => p.id);

        let text = '📢 *Tag All*\n\n';
        participants.forEach((jid, i) => {
            text += `${i + 1}. @${jid.split('@')[0]}\n`;
        });

        await this.client.sendText(m.from, text, {
            mentions: participants
        });
    }

    async handleGroupInfo(m) {
        const metadata = await this.client.groupMetadata(m.from);

        const info = `
📋 *Group Info*

*Name:* ${metadata.subject}
*Created:* ${new Date(metadata.creation * 1000).toLocaleDateString()}
*Owner:* @${metadata.owner.split('@')[0]}
*Members:* ${metadata.participants.length}
*Admins:* ${metadata.participants.filter(p => p.admin).length}

*Description:*
${metadata.desc || 'No description'}
        `.trim();

        await this.client.sendText(m.from, info, {
            mentions: [metadata.owner]
        });
    }
}

// Usage
const groupManager = new GroupManager(client);
```

## Best Practices

### 1. Always Check Admin Status

```javascript
// ✅ Good
const isAdmin = await checkAdmin(m.from, m.participant);
if (!isAdmin) {
    await m.reply('❌ Admin only!');
    return;
}

// ❌ Bad - anyone can use command
await client.groupParticipantsUpdate(...);
```

### 2. Validate Target Users

```javascript
// ✅ Good
if (!m.quoted) {
    await m.reply('❌ Reply to a message!');
    return;
}

const target = m.quoted.participant || m.quoted.from;

// Don't kick admins
const targetIsAdmin = await checkAdmin(m.from, target);
if (targetIsAdmin) {
    await m.reply('❌ Cannot kick admins!');
    return;
}
```

### 3. Handle Errors Gracefully

```javascript
try {
    await client.groupParticipantsUpdate(groupJid, [userJid], 'add');
    await m.reply('✅ User added');
} catch (error) {
    console.error('Add error:', error);
    await m.reply('❌ Failed to add user. They may have privacy settings enabled.');
}
```

### 4. Use Mentions

```javascript
// ✅ Good - tag users
await client.sendText(groupJid, `Welcome @${jid.split('@')[0]}!`, {
    mentions: [jid]
});

// ❌ Bad - no mention
await client.sendText(groupJid, `Welcome ${jid}!`);
```

## Next Steps

- [Send messages](/guide/features/sending-messages)
- [Handle events](/guide/core/events)
- [Create stickers](/guide/features/stickers)
- [See examples](/examples/group-management)

## Reference

- [Client API](/api/client)
- [Groups API](/api/groups)
- [Examples](/examples/group-management)
