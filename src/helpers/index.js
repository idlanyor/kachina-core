export { serialize } from './serialize.js';
export { Database } from './database.js';
export { Logger } from './logger.js';
export * from './sticker.js';

// Utility functions

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 * @example
 * await sleep(1000); // Sleep for 1 second
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format seconds into human-readable time string
 * @param {number} seconds - Seconds to format
 * @returns {string} Formatted time string (e.g., "1d 2h 30m" or "5m 30s")
 * @example
 * formatTime(90); // "1m 30s"
 * formatTime(3661); // "1h 1m 1s"
 * formatTime(90000); // "1d 1h 0m"
 */
export function formatTime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
}

/**
 * Format bytes into human-readable size string
 * @param {number} bytes - Bytes to format
 * @returns {string} Formatted size string (e.g., "1.5 MB", "500 KB")
 * @example
 * formatBytes(1024); // "1 KB"
 * formatBytes(1536000); // "1.46 MB"
 * formatBytes(0); // "0 B"
 */
export function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Parse command from text message
 * @param {string} text - Text to parse
 * @param {string} [prefix='!'] - Command prefix
 * @returns {{command: string, args: Array<string>, text: string}|null} Parsed command object or null if no command
 * @example
 * parseCommand('!help me', '!');
 * // { command: 'help', args: ['me'], text: 'me' }
 * parseCommand('hello'); // null
 */
export function parseCommand(text, prefix = '!') {
    if (!text.startsWith(prefix)) return null;

    const [command, ...args] = text.slice(prefix.length).trim().split(/\s+/);
    return {
        command: command.toLowerCase(),
        args,
        text: args.join(' ')
    };
}

/**
 * Check if text is a URL
 * @param {string} text - Text to check
 * @returns {boolean} True if text is a URL
 * @example
 * isUrl('https://example.com'); // true
 * isUrl('hello world'); // false
 */
export function isUrl(text) {
    return /^https?:\/\//i.test(text);
}

/**
 * Extract all URLs from text
 * @param {string} text - Text to extract URLs from
 * @returns {Array<string>} Array of URLs found
 * @example
 * extractUrls('Visit https://example.com and http://test.com');
 * // ['https://example.com', 'http://test.com']
 */
export function extractUrls(text) {
    const urlRegex = /https?:\/\/[^\s]+/gi;
    return text.match(urlRegex) || [];
}

/**
 * Generate random alphanumeric string
 * @param {number} [length=10] - Length of string
 * @returns {string} Random string
 * @example
 * randomString(5); // "aB3xZ"
 * randomString(); // "a1B2c3D4e5" (10 chars)
 */
export function randomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Generate random number in range
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random number
 * @example
 * randomNumber(1, 10); // Random number between 1 and 10
 */
export function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick random element from array
 * @template T
 * @param {Array<T>} array - Array to pick from
 * @returns {T} Random element
 * @example
 * pickRandom(['red', 'blue', 'green']); // One of the colors
 */
export function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Split array into chunks of specified size
 * @template T
 * @param {Array<T>} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array<Array<T>>} Array of chunks
 * @example
 * chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
 */
export function chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}
