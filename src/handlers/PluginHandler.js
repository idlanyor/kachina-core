import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * @typedef {Object} Plugin
 * @property {string} name - Plugin name
 * @property {Array<string>} commands - Command aliases
 * @property {string} [category] - Plugin category
 * @property {string} [description] - Plugin description
 * @property {boolean} [owner=false] - Owner only command
 * @property {boolean} [group=false] - Group only command
 * @property {boolean} [private=false] - Private chat only command
 * @property {boolean} [admin=false] - Admin only command
 * @property {boolean} [botAdmin=false] - Requires bot to be admin
 * @property {Function} exec - Plugin execution function
 */

/**
 * @typedef {Object} PluginContext
 * @property {import('../client/Client.js').Client} client - Bot client instance
 * @property {Object} m - Serialized message object
 * @property {Array<string>} args - Command arguments
 * @property {string} command - Command name that was used
 * @property {string} prefix - Command prefix
 * @property {Object} sock - Raw WhatsApp socket
 */

/**
 * Plugin handler for loading and executing bot plugins
 * @class PluginHandler
 * @example
 * const handler = new PluginHandler(client);
 * await handler.loadAll('./plugins');
 */
export class PluginHandler {
    /**
     * Creates a new PluginHandler instance
     * @param {import('../client/Client.js').Client} client - Bot client instance
     */
    constructor(client) {
        this.client = client;
        this.plugins = new Map();
        this.commands = new Map();
        this.isLoaded = false;
    }

    /**
     * Load a single plugin from file path
     * @async
     * @param {string} pluginPath - Absolute path to plugin file
     * @returns {Promise<Plugin|null>} Loaded plugin object or null if failed
     * @throws {Error} If plugin is invalid
     * @example
     * const plugin = await handler.load('/path/to/plugin.js');
     * if (plugin) {
     *   console.log('Loaded:', plugin.name);
     * }
     */
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

    /**
     * Load all plugins from a directory recursively
     * @async
     * @param {string} directory - Path to plugins directory
     * @returns {Promise<number>} Number of successfully loaded plugins
     * @example
     * const count = await handler.loadAll('./plugins');
     * console.log(`Loaded ${count} plugins`);
     */
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

    /**
     * Find all files with specific extension in directory recursively
     * @private
     * @param {string} dir - Directory to search
     * @param {string} ext - File extension (e.g., '.js')
     * @returns {Array<string>} Array of absolute file paths
     */
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

    /**
     * Execute plugin command from message
     * @async
     * @param {Object} m - Serialized message object
     * @returns {Promise<void>}
     * @example
     * // This is automatically called by Client when message starts with prefix
     * client.on('message', async (m) => {
     *   await handler.execute(m);
     * });
     */
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

    /**
     * Check if user is bot owner
     * @param {string} jid - User JID to check
     * @returns {boolean} True if user is owner
     * @example
     * if (handler.isOwner(m.sender)) {
     *   // Owner-only logic
     * }
     */
    isOwner(jid) {
        const owners = this.client.config.owners || this.client.config.owner || [];
        const ownerList = Array.isArray(owners) ? owners : [owners];
        const number = jid.split('@')[0];
        return ownerList.includes(number) || ownerList.includes(jid);
    }

    /**
     * Reload/unload a plugin by name
     * @param {string} pluginName - Name of plugin to reload
     * @returns {boolean} True if plugin was found and reloaded
     * @example
     * if (handler.reload('ping')) {
     *   await handler.load('./plugins/ping.js');
     *   console.log('Plugin reloaded');
     * }
     */
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

    /**
     * Get list of all loaded plugins
     * @returns {Array<Plugin>} Array of plugin objects
     * @example
     * const plugins = handler.list();
     * plugins.forEach(p => console.log(p.name));
     */
    list() {
        return Array.from(this.plugins.values());
    }

    /**
     * Get a specific plugin by name
     * @param {string} name - Plugin name
     * @returns {Plugin|undefined} Plugin object or undefined if not found
     * @example
     * const pingPlugin = handler.get('ping');
     * if (pingPlugin) {
     *   console.log('Commands:', pingPlugin.commands);
     * }
     */
    get(name) {
        return this.plugins.get(name);
    }
}

export default PluginHandler;
