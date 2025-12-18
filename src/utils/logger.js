import chalk from 'chalk';

/**
 * @typedef {Object} LoggerOptions
 * @property {'debug'|'info'|'success'|'warn'|'error'} [level='info'] - Minimum log level to display
 * @property {string} [prefix=''] - Prefix for all log messages
 */

/**
 * Colored console logger with different log levels
 * @class Logger
 * @example
 * const logger = new Logger({ prefix: 'MyBot', level: 'debug' });
 * logger.info('Bot started');
 * logger.success('Connected successfully');
 * logger.error('Connection failed');
 */
export class Logger {
    /**
     * Creates a new Logger instance
     * @param {LoggerOptions} [options={}] - Logger configuration
     */
    constructor(options = {}) {
        this.level = options.level || 'info';
        this.prefix = options.prefix || '';
        this.levels = {
            debug: 0,
            info: 1,
            success: 1,
            warn: 2,
            error: 3
        };
    }

    /**
     * Check if message should be logged based on log level
     * @private
     * @param {string} level - Log level to check
     * @returns {boolean} True if should log
     */
    shouldLog(level) {
        return this.levels[level] >= this.levels[this.level];
    }

    /**
     * Format log message with timestamp and prefix
     * @private
     * @param {string} level - Log level
     * @param {...*} args - Arguments to format
     * @returns {string} Formatted message
     */
    format(level, ...args) {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = this.prefix ? `[${this.prefix}] ` : '';
        return `${chalk.gray(timestamp)} ${prefix}${args.join(' ')}`;
    }

    /**
     * Log debug message (gray)
     * @param {...*} args - Values to log
     * @example
     * logger.debug('Debugging info', { data: 'value' });
     */
    debug(...args) {
        if (this.shouldLog('debug')) {
            console.log(chalk.gray('[DEBUG]'), this.format('debug', ...args));
        }
    }

    /**
     * Log info message (blue)
     * @param {...*} args - Values to log
     * @example
     * logger.info('Bot started successfully');
     */
    info(...args) {
        if (this.shouldLog('info')) {
            console.log(chalk.blue('[INFO]'), this.format('info', ...args));
        }
    }

    /**
     * Log success message (green)
     * @param {...*} args - Values to log
     * @example
     * logger.success('Connected to WhatsApp');
     */
    success(...args) {
        if (this.shouldLog('success')) {
            console.log(chalk.green('[SUCCESS]'), this.format('success', ...args));
        }
    }

    /**
     * Log warning message (yellow)
     * @param {...*} args - Values to log
     * @example
     * logger.warn('Rate limit approaching');
     */
    warn(...args) {
        if (this.shouldLog('warn')) {
            console.log(chalk.yellow('[WARN]'), this.format('warn', ...args));
        }
    }

    /**
     * Log error message (red)
     * @param {...*} args - Values to log
     * @example
     * logger.error('Connection failed:', error);
     */
    error(...args) {
        if (this.shouldLog('error')) {
            console.error(chalk.red('[ERROR]'), this.format('error', ...args));
        }
    }

    /**
     * Log command execution (cyan)
     * @param {string} command - Command name
     * @param {string} from - Sender information
     * @example
     * logger.command('!ping', 'User@s.whatsapp.net');
     */
    command(command, from) {
        console.log(
            chalk.cyan('[CMD]'),
            chalk.yellow(command),
            chalk.gray('from'),
            chalk.green(from)
        );
    }
}

export default Logger;
