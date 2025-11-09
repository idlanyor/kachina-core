import chalk from 'chalk';

export class Logger {
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

    shouldLog(level) {
        return this.levels[level] >= this.levels[this.level];
    }

    format(level, ...args) {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = this.prefix ? `[${this.prefix}] ` : '';
        return `${chalk.gray(timestamp)} ${prefix}${args.join(' ')}`;
    }

    debug(...args) {
        if (this.shouldLog('debug')) {
            console.log(chalk.gray('[DEBUG]'), this.format('debug', ...args));
        }
    }

    info(...args) {
        if (this.shouldLog('info')) {
            console.log(chalk.blue('[INFO]'), this.format('info', ...args));
        }
    }

    success(...args) {
        if (this.shouldLog('success')) {
            console.log(chalk.green('[SUCCESS]'), this.format('success', ...args));
        }
    }

    warn(...args) {
        if (this.shouldLog('warn')) {
            console.log(chalk.yellow('[WARN]'), this.format('warn', ...args));
        }
    }

    error(...args) {
        if (this.shouldLog('error')) {
            console.error(chalk.red('[ERROR]'), this.format('error', ...args));
        }
    }

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
