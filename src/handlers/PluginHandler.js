import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export class PluginHandler {
    constructor(client) {
        this.client = client;
        this.plugins = new Map();
        this.commands = new Map();
        this.isLoaded = false;
    }

    async load(pluginPath) {
        try {
            const module = await import(`file://${pluginPath}?update=${Date.now()}`);

            if (!module.default && !module.handler) {
                throw new Error('Plugin must export default or handler');
            }

            const plugin = module.default || module.handler;

            // Validate plugin
            if (!plugin.name) {
                plugin.name = path.basename(pluginPath, '.js');
            }

            if (!plugin.exec && !plugin.execute) {
                throw new Error('Plugin must have exec or execute function');
            }

            // Normalize commands
            const commands = Array.isArray(plugin.command)
                ? plugin.command
                : plugin.commands
                    ? Array.isArray(plugin.commands)
                        ? plugin.commands
                        : [plugin.commands]
                    : [plugin.name];

            plugin.commands = commands.map(cmd => cmd.toLowerCase());

            // Store plugin
            this.plugins.set(plugin.name, plugin);

            // Map commands to plugin
            for (const cmd of plugin.commands) {
                this.commands.set(cmd, plugin);
            }

            return plugin;
        } catch (error) {
            console.error(`Failed to load plugin ${pluginPath}:`, error.message);
            return null;
        }
    }

    async loadAll(directory) {
        if (!fs.existsSync(directory)) {
            console.warn(`Plugin directory not found: ${directory}`);
            return;
        }

        const files = this.findFiles(directory, '.js');

        let loaded = 0;
        for (const file of files) {
            const plugin = await this.load(file);
            if (plugin) loaded++;
        }

        this.isLoaded = true;
        console.log(`Loaded ${loaded}/${files.length} plugins`);

        return loaded;
    }

    findFiles(dir, ext) {
        let results = [];
        const list = fs.readdirSync(dir);

        for (const file of list) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat && stat.isDirectory()) {
                results = results.concat(this.findFiles(filePath, ext));
            } else if (file.endsWith(ext)) {
                results.push(filePath);
            }
        }

        return results;
    }

    async execute(m) {
        if (!m.body) return;

        // Parse command
        const prefix = this.client.config.prefix || '!';
        if (!m.body.startsWith(prefix)) return;

        const [cmdName, ...args] = m.body.slice(prefix.length).trim().split(/\s+/);
        const command = cmdName.toLowerCase();

        // Find plugin
        const plugin = this.commands.get(command);
        if (!plugin) return;

        // Check conditions
        if (plugin.owner && !this.isOwner(m.sender)) {
            return await m.reply('⚠️ This command is for owner only!');
        }

        if (plugin.group && !m.isGroup) {
            return await m.reply('⚠️ This command can only be used in groups!');
        }

        if (plugin.private && m.isGroup) {
            return await m.reply('⚠️ This command can only be used in private chat!');
        }

        if (plugin.admin && m.isGroup) {
            const groupMetadata = await this.client.groupMetadata(m.chat);
            const participants = groupMetadata.participants;
            const admins = participants.filter(p => p.admin).map(p => p.id);

            if (!admins.includes(m.sender)) {
                return await m.reply('⚠️ This command is for group admins only!');
            }
        }

        if (plugin.botAdmin && m.isGroup) {
            const groupMetadata = await this.client.groupMetadata(m.chat);
            const participants = groupMetadata.participants;
            const admins = participants.filter(p => p.admin).map(p => p.id);
            const botNumber = this.client.user.id.split(':')[0] + '@s.whatsapp.net';

            if (!admins.includes(botNumber)) {
                return await m.reply('⚠️ Bot must be admin to use this command!');
            }
        }

        // Execute plugin
        try {
            const exec = plugin.exec || plugin.execute;
            await exec({
                client: this.client,
                m,
                args,
                command,
                prefix,
                sock: this.client.sock
            });
        } catch (error) {
            console.error(`Error executing ${command}:`, error);
            await m.reply(`❌ Error: ${error.message}`);
        }
    }

    isOwner(jid) {
        const owners = this.client.config.owners || this.client.config.owner || [];
        const ownerList = Array.isArray(owners) ? owners : [owners];
        const number = jid.split('@')[0];
        return ownerList.includes(number) || ownerList.includes(jid);
    }

    reload(pluginName) {
        const plugin = this.plugins.get(pluginName);
        if (!plugin) return false;

        // Remove from maps
        for (const cmd of plugin.commands) {
            this.commands.delete(cmd);
        }
        this.plugins.delete(pluginName);

        return true;
    }

    list() {
        return Array.from(this.plugins.values());
    }

    get(name) {
        return this.plugins.get(name);
    }
}

export default PluginHandler;
