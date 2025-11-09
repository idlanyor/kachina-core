export default {
    name: 'help',
    commands: ['help', 'menu'],
    category: 'info',
    description: 'Show available commands',

    async exec({ client, m }) {
        await m.react('📋');

        const plugins = client.pluginHandler.list();

        // Group by category
        const categories = {};
        for (const plugin of plugins) {
            const category = plugin.category || 'other';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(plugin);
        }

        let helpText = `*📚 HELP MENU*\n\n`;
        helpText += `Total Commands: ${plugins.length}\n\n`;

        const categoryEmojis = {
            info: '📊',
            owner: '👑',
            group: '👥',
            download: '⬇️',
            ai: '🤖',
            fun: '🎮',
            tool: '🔧',
            other: '📦'
        };

        for (const [category, items] of Object.entries(categories)) {
            const emoji = categoryEmojis[category] || '📦';
            helpText += `${emoji} *${category.toUpperCase()}*\n`;

            for (const plugin of items) {
                const commands = plugin.commands.join(', ');
                helpText += `  • ${client.prefix}${commands}\n`;
                if (plugin.description) {
                    helpText += `    _${plugin.description}_\n`;
                }
            }
            helpText += '\n';
        }

        helpText += `_Powered by @kachina-md/core_`;

        await m.reply(helpText);
        await m.react('✅');
    }
};
