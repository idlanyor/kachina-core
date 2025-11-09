import os from 'os';
import { performance } from 'perf_hooks';
import { formatBytes, formatTime } from '@kachina-md/core';

export default {
    name: 'ping',
    commands: ['ping', 'status'],
    category: 'info',
    description: 'Check bot status and performance',

    async exec({ m }) {
        const start = performance.now();

        await m.react('⏳');

        const totalRAM = os.totalmem();
        const freeRAM = os.freemem();
        const usedRAM = totalRAM - freeRAM;
        const ramUsage = ((usedRAM / totalRAM) * 100).toFixed(1);

        const end = performance.now();
        const responseTime = ((end - start) / 1000).toFixed(3);
        const uptime = formatTime(process.uptime());

        const status = `*🤖 BOT STATUS*\n\n` +
            `📊 Response: ${responseTime}s\n` +
            `⏰ Uptime: ${uptime}\n` +
            `💾 RAM: ${formatBytes(usedRAM)} / ${formatBytes(totalRAM)} (${ramUsage}%)\n` +
            `🖥️ Platform: ${os.platform()} ${os.arch()}\n` +
            `🔧 Node.js: ${process.version}\n\n` +
            `_Bot running smoothly! ✨_`;

        await m.reply(status);

        const emoji = responseTime < 1 ? '🚀' : responseTime < 2 ? '⚡' : '✅';
        await m.react(emoji);
    }
};
