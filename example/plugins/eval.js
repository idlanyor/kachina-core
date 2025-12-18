import util from 'util';

export default {
    name: 'eval',
    commands: ['eval', 'ev', '>'],
    category: 'owner',
    description: 'Execute JavaScript code (owner only)',
    owner: true,

    async exec({ client, m, args }) {
        if (args.length === 0) {
            return await m.reply('⚠️ Provide code to execute!');
        }

        await m.react('⏳');

        try {
            const code = args.join(' ');
            let result = await eval(`(async () => { ${code} })()`);

            if (typeof result !== 'string') {
                result = util.inspect(result, { depth: 0 });
            }

            await m.reply(`*📤 Result:*\n\`\`\`${result}\`\`\``);
            await m.react('✅');

        } catch (error) {
            await m.react('❌');
            await m.reply(`*❌ Error:*\n\`\`\`${error.message}\`\`\``);
        }
    }
};
