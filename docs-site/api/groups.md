# Groups API

Complete API reference for WhatsApp group management in Kachina-MD.

## Group Methods

### groupMetadata(jid)

Get group metadata including name, description, participants, and settings.

**Signature:**
```javascript
const metadata = await client.groupMetadata(jid)
```

**Parameters:**
- `jid` (string) - Group JID (format: `groupId@g.us`)

**Returns:** `Promise<GroupMetadata>`

**GroupMetadata Structure:**
```javascript
{
    id: string,                    // Group JID
    subject: string,               // Group name
    subjectOwner: string,          // JID of who set the subject
    subjectTime: number,           // When subject was last changed
    creation: number,              // Group creation timestamp
    owner: string,                 // Group owner JID
    desc: string,                  // Group description
    descId: string,                // Description ID
    descOwner: string,             // Who set the description
    descTime: number,              // When description was last changed
    restrict: boolean,             // Only admins can change group info
    announce: boolean,             // Only admins can send messages
    size: number,                  // Number of participants
    participants: Participant[],   // Array of participants
    ephemeralDuration: number,     // Disappearing messages duration
    inviteCode: string            // Group invite code
}
```

**Participant Structure:**
```javascript
{
    id: string,                    // Participant JID
    admin: string | null,          // 'admin', 'superadmin', or null
    isAdmin: boolean,              // Helper: is admin
    isSuperAdmin: boolean          // Helper: is super admin
}
```

**Example:**
```javascript
const metadata = await client.groupMetadata('120363xxx@g.us');

console.log('Group name:', metadata.subject);
console.log('Participants:', metadata.size);
console.log('Description:', metadata.desc);
console.log('Created:', new Date(metadata.creation * 1000));

// Get admins
const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id);

console.log('Admins:', admins);
```

---

### groupParticipantsUpdate(jid, participants, action)

Add, remove, promote, or demote group participants.

**Signature:**
```javascript
await client.groupParticipantsUpdate(jid, participants, action)
```

**Parameters:**
- `jid` (string) - Group JID
- `participants` (string[]) - Array of participant JIDs
- `action` (string) - Action to perform: `'add'`, `'remove'`, `'promote'`, `'demote'`

**Returns:** `Promise<Object>` - Update result

**Examples:**

```javascript
// Add members
await client.groupParticipantsUpdate(
    groupJid,
    ['628xxx@s.whatsapp.net', '628yyy@s.whatsapp.net'],
    'add'
);

// Remove members
await client.groupParticipantsUpdate(
    groupJid,
    ['628xxx@s.whatsapp.net'],
    'remove'
);

// Promote to admin
await client.groupParticipantsUpdate(
    groupJid,
    ['628xxx@s.whatsapp.net'],
    'promote'
);

// Demote from admin
await client.groupParticipantsUpdate(
    groupJid,
    ['628xxx@s.whatsapp.net'],
    'demote'
);
```

**Result Structure:**
```javascript
{
    status: number,              // HTTP-like status code
    participants: {
        [jid: string]: {
            code: string,        // Result code
            message: string      // Result message
        }
    }
}
```

---

### groupUpdateSubject(jid, subject)

Update group name.

**Signature:**
```javascript
await client.groupUpdateSubject(jid, subject)
```

**Parameters:**
- `jid` (string) - Group JID
- `subject` (string) - New group name

**Returns:** `Promise<Object>`

**Example:**
```javascript
await client.groupUpdateSubject(groupJid, 'My New Group Name');
```

**Constraints:**
- Maximum 100 characters
- Requires admin permission

---

### groupUpdateDescription(jid, description)

Update group description.

**Signature:**
```javascript
await client.groupUpdateDescription(jid, description)
```

**Parameters:**
- `jid` (string) - Group JID
- `description` (string) - New group description

**Returns:** `Promise<Object>`

**Example:**
```javascript
await client.groupUpdateDescription(
    groupJid,
    'Welcome to our group!\n\nRules:\n1. Be respectful\n2. No spam'
);
```

**Constraints:**
- Maximum 512 characters
- Requires admin permission

---

## Additional Group Methods

### groupCreate(subject, participants)

Create a new group (via Baileys sock).

**Signature:**
```javascript
const result = await client.sock.groupCreate(subject, participants)
```

**Parameters:**
- `subject` (string) - Group name
- `participants` (string[]) - Initial member JIDs

**Returns:** Promise with group metadata

**Example:**
```javascript
const result = await client.sock.groupCreate(
    'My New Group',
    ['628xxx@s.whatsapp.net', '628yyy@s.whatsapp.net']
);

console.log('Group created:', result.id);
console.log('Invite code:', result.gid);
```

---

### groupLeave(jid)

Leave a group (via Baileys sock).

**Signature:**
```javascript
await client.sock.groupLeave(jid)
```

**Parameters:**
- `jid` (string) - Group JID

**Example:**
```javascript
await client.sock.groupLeave(groupJid);
```

---

### groupInviteCode(jid)

Get group invite code (via Baileys sock).

**Signature:**
```javascript
const code = await client.sock.groupInviteCode(jid)
```

**Parameters:**
- `jid` (string) - Group JID

**Returns:** `Promise<string>` - Invite code

**Example:**
```javascript
const code = await client.sock.groupInviteCode(groupJid);
const link = `https://chat.whatsapp.com/${code}`;

console.log('Invite link:', link);
```

---

### groupRevokeInvite(jid)

Revoke and regenerate group invite code (via Baileys sock).

**Signature:**
```javascript
const newCode = await client.sock.groupRevokeInvite(jid)
```

**Parameters:**
- `jid` (string) - Group JID

**Returns:** `Promise<string>` - New invite code

**Example:**
```javascript
const newCode = await client.sock.groupRevokeInvite(groupJid);
console.log('New invite code:', newCode);
```

---

### groupAcceptInvite(code)

Join group via invite code (via Baileys sock).

**Signature:**
```javascript
const groupId = await client.sock.groupAcceptInvite(code)
```

**Parameters:**
- `code` (string) - Group invite code

**Returns:** `Promise<string>` - Group JID

**Example:**
```javascript
const code = 'ABC123DEF456'; // From invite link
const groupId = await client.sock.groupAcceptInvite(code);

console.log('Joined group:', groupId);
```

---

### groupSettingUpdate(jid, setting)

Update group settings (via Baileys sock).

**Signature:**
```javascript
await client.sock.groupSettingUpdate(jid, setting)
```

**Parameters:**
- `jid` (string) - Group JID
- `setting` (string) - Setting to update

**Settings:**
- `'announcement'` - Only admins can send messages
- `'not_announcement'` - All members can send messages
- `'locked'` - Only admins can edit group info
- `'unlocked'` - All members can edit group info

**Example:**
```javascript
// Only admins can send messages
await client.sock.groupSettingUpdate(groupJid, 'announcement');

// All members can send messages
await client.sock.groupSettingUpdate(groupJid, 'not_announcement');

// Only admins can edit group info
await client.sock.groupSettingUpdate(groupJid, 'locked');

// All members can edit group info
await client.sock.groupSettingUpdate(groupJid, 'unlocked');
```

---

## Group Events

### group.update

Emitted when group participants change.

**Event Data:**
```javascript
{
    id: string,              // Group JID
    participants: string[],  // Affected participant JIDs
    action: string          // 'add', 'remove', 'promote', 'demote'
}
```

**Example:**
```javascript
client.on('group.update', async (update) => {
    const { id, participants, action } = update;
    const metadata = await client.groupMetadata(id);
    
    for (const participant of participants) {
        const name = `@${participant.split('@')[0]}`;
        
        if (action === 'add') {
            await client.sendMessage(id, {
                text: `Welcome ${name} to ${metadata.subject}!`,
                mentions: [participant]
            });
        }
        
        if (action === 'remove') {
            await client.sendText(id, `${name} left the group`);
        }
    }
});
```

---

### groups.update

Emitted when group metadata changes.

**Event Data:** Array of group updates

**Example:**
```javascript
client.on('groups.update', (updates) => {
    updates.forEach(update => {
        console.log('Group:', update.id);
        
        if (update.subject) {
            console.log('New name:', update.subject);
        }
        
        if (update.desc) {
            console.log('New description:', update.desc);
        }
        
        if (update.announce !== undefined) {
            console.log('Announce mode:', update.announce);
        }
    });
});
```

---

## Helper Functions

### Check if User is Admin

```javascript
async function isAdmin(groupJid, userJid) {
    const metadata = await client.groupMetadata(groupJid);
    const participant = metadata.participants.find(p => p.id === userJid);
    return participant?.admin !== null;
}

// Usage
const userIsAdmin = await isAdmin(groupJid, userJid);
```

---

### Check if Bot is Admin

```javascript
async function isBotAdmin(groupJid) {
    const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net';
    return await isAdmin(groupJid, botJid);
}

// Usage
const botIsAdmin = await isBotAdmin(groupJid);
```

---

### Get All Admins

```javascript
async function getAdmins(groupJid) {
    const metadata = await client.groupMetadata(groupJid);
    return metadata.participants
        .filter(p => p.admin)
        .map(p => p.id);
}

// Usage
const admins = await getAdmins(groupJid);
```

---

### Get All Members

```javascript
async function getMembers(groupJid) {
    const metadata = await client.groupMetadata(groupJid);
    return metadata.participants.map(p => p.id);
}

// Usage
const members = await getMembers(groupJid);
```

---

## Common Patterns

### Welcome Message Bot

```javascript
client.on('group.update', async (update) => {
    if (update.action === 'add') {
        const metadata = await client.groupMetadata(update.id);
        
        for (const participant of update.participants) {
            const welcome = `
Welcome @${participant.split('@')[0]}! 🎉

*${metadata.subject}*

Please read the group description and follow the rules.
            `.trim();
            
            await client.sendMessage(update.id, {
                text: welcome,
                mentions: [participant]
            });
        }
    }
});
```

---

### Auto Admin Commands

```javascript
client.on('message', async (m) => {
    if (!m.isGroup) return;
    
    // Check if user is admin
    const metadata = await client.groupMetadata(m.chat);
    const sender = metadata.participants.find(p => p.id === m.sender);
    const isAdmin = sender?.admin !== null;
    
    if (!isAdmin) {
        return await m.reply('⚠️ Admin only command!');
    }
    
    // Kick command
    if (m.body === '!kick' && m.quoted) {
        await client.groupParticipantsUpdate(
            m.chat,
            [m.quoted.sender],
            'remove'
        );
        await m.reply('✅ User removed');
    }
    
    // Promote command
    if (m.body === '!promote' && m.quoted) {
        await client.groupParticipantsUpdate(
            m.chat,
            [m.quoted.sender],
            'promote'
        );
        await m.reply('✅ User promoted to admin');
    }
});
```

---

### Group Info Command

```javascript
client.on('message', async (m) => {
    if (m.body === '!groupinfo' && m.isGroup) {
        const metadata = await client.groupMetadata(m.chat);
        
        const admins = metadata.participants
            .filter(p => p.admin)
            .map(p => `@${p.id.split('@')[0]}`);
        
        const info = `
*📊 GROUP INFO*

Name: ${metadata.subject}
Created: ${new Date(metadata.creation * 1000).toLocaleDateString()}
Members: ${metadata.size}
Admins: ${admins.length}

Description:
${metadata.desc || 'No description'}

Admins:
${admins.join('\n')}
        `.trim();
        
        await client.sendMessage(m.chat, {
            text: info,
            mentions: metadata.participants
                .filter(p => p.admin)
                .map(p => p.id)
        });
    }
});
```

---

### Tag All Command

```javascript
client.on('message', async (m) => {
    if (m.body === '!tagall' && m.isGroup) {
        // Check if sender is admin
        const metadata = await client.groupMetadata(m.chat);
        const sender = metadata.participants.find(p => p.id === m.sender);
        
        if (!sender?.admin) {
            return await m.reply('⚠️ Admin only!');
        }
        
        const text = '📢 *Attention Everyone!*\n\n' +
            metadata.participants
                .map(p => `@${p.id.split('@')[0]}`)
                .join('\n');
        
        await client.sendMessage(m.chat, {
            text,
            mentions: metadata.participants.map(p => p.id)
        });
    }
});
```

---

## TypeScript Definitions

```typescript
interface GroupMetadata {
    id: string;
    subject: string;
    subjectOwner: string;
    subjectTime: number;
    creation: number;
    owner: string;
    desc: string;
    descId: string;
    descOwner: string;
    descTime: number;
    restrict: boolean;
    announce: boolean;
    size: number;
    participants: GroupParticipant[];
    ephemeralDuration: number;
    inviteCode: string;
}

interface GroupParticipant {
    id: string;
    admin: 'admin' | 'superadmin' | null;
    isAdmin: boolean;
    isSuperAdmin: boolean;
}

interface Client {
    groupMetadata(jid: string): Promise<GroupMetadata>;
    
    groupParticipantsUpdate(
        jid: string,
        participants: string[],
        action: 'add' | 'remove' | 'promote' | 'demote'
    ): Promise<any>;
    
    groupUpdateSubject(jid: string, subject: string): Promise<any>;
    groupUpdateDescription(jid: string, description: string): Promise<any>;
}
```

---

## Best Practices

### 1. Always Check Permissions

```javascript
const metadata = await client.groupMetadata(groupJid);
const sender = metadata.participants.find(p => p.id === userJid);

if (!sender?.admin) {
    return await m.reply('Admin only!');
}
```

### 2. Check if Bot is Admin

```javascript
const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net';
const bot = metadata.participants.find(p => p.id === botJid);

if (!bot?.admin) {
    return await m.reply('Bot must be admin!');
}
```

### 3. Handle Errors

```javascript
try {
    await client.groupParticipantsUpdate(groupJid, [userJid], 'remove');
} catch (error) {
    console.error('Failed to remove:', error);
    await m.reply('Failed to remove user');
}
```

### 4. Validate Group JID

```javascript
function isGroupJid(jid) {
    return jid.endsWith('@g.us');
}

if (!isGroupJid(m.chat)) {
    return await m.reply('Group only command!');
}
```

---

## See Also

- [Groups Guide](/guide/features/groups) - Detailed group management guide
- [Events API](/guide/core/events) - Group events documentation
- [Client API](/api/client) - Client methods
- [Examples](/examples/group-management) - Group management examples
