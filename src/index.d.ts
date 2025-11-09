// Type definitions for @roidev/kachina-md
// Project: https://github.com/idlanyor/kachina-core
// Definitions by: Roynaldi <https://github.com/idlanyor>

/// <reference types="node" />

import { WASocket, proto } from 'baileys';
import EventEmitter from 'events';

// ============================================================================
// Main Client
// ============================================================================

export interface ClientOptions {
    sessionId?: string;
    phoneNumber?: string;
    loginMethod?: 'qr' | 'pairing';
    browser?: [string, string, string];
    logger?: any;
    prefix?: string;
    store?: any;
    owners?: string[] | string;
    owner?: string[] | string;
}

export class Client extends EventEmitter {
    static StickerTypes: typeof StickerTypes;

    config: ClientOptions;
    sock: WASocket | null;
    store: any;
    isReady: boolean;
    user: any;
    pluginHandler: PluginHandler;

    constructor(options?: ClientOptions);

    start(): Promise<WASocket>;

    // Message sending methods
    sendMessage(jid: string, content: any, options?: any): Promise<any>;
    sendText(jid: string, text: string, options?: any): Promise<any>;
    sendImage(jid: string, buffer: Buffer | string, caption?: string, options?: any): Promise<any>;
    sendVideo(jid: string, buffer: Buffer | string, caption?: string, options?: any): Promise<any>;
    sendAudio(jid: string, buffer: Buffer | string, options?: any): Promise<any>;
    sendDocument(jid: string, buffer: Buffer | string, filename: string, mimetype: string, options?: any): Promise<any>;
    sendSticker(jid: string, buffer: Buffer | string, options?: any): Promise<any>;
    sendContact(jid: string, contacts: Contact[], options?: any): Promise<any>;
    sendLocation(jid: string, latitude: number, longitude: number, options?: any): Promise<any>;
    sendPoll(jid: string, name: string, values: string[], options?: any): Promise<any>;
    sendReact(jid: string, messageKey: any, emoji: string): Promise<any>;

    // View once methods
    readViewOnce(quotedMessage: any): Promise<{
        buffer: Buffer;
        type: 'image' | 'video' | 'audio';
        caption: string;
        mimetype?: string;
        ptt?: boolean;
    }>;
    sendViewOnce(jid: string, quotedMessage: any, options?: any): Promise<any>;

    // Group methods
    groupMetadata(jid: string): Promise<any>;
    groupParticipantsUpdate(jid: string, participants: string[], action: 'add' | 'remove' | 'promote' | 'demote'): Promise<any>;
    groupUpdateSubject(jid: string, subject: string): Promise<any>;
    groupUpdateDescription(jid: string, description: string): Promise<any>;

    // Plugin methods
    loadPlugin(path: string): Promise<void>;
    loadPlugins(directory: string): Promise<void>;

    // Getters/Setters
    get prefix(): string;
    set prefix(prefix: string);

    // Events
    on(event: 'ready', listener: (user: any) => void): this;
    on(event: 'message', listener: (message: SerializedMessage) => void): this;
    on(event: 'group.update', listener: (update: any) => void): this;
    on(event: 'groups.update', listener: (updates: any[]) => void): this;
    on(event: 'call', listener: (calls: any) => void): this;
    on(event: 'pairing.code', listener: (code: string) => void): this;
    on(event: 'pairing.error', listener: (error: Error) => void): this;
    on(event: 'reconnecting', listener: () => void): this;
    on(event: 'connecting', listener: () => void): this;
    on(event: 'logout', listener: () => void): this;
}

// ============================================================================
// Plugin System
// ============================================================================

export interface Plugin {
    name: string;
    commands: string[];
    category?: string;
    description?: string;
    owner?: boolean;
    group?: boolean;
    private?: boolean;
    admin?: boolean;
    botAdmin?: boolean;
    exec: (context: PluginContext) => Promise<void>;
}

export interface PluginContext {
    client: Client;
    m: SerializedMessage;
    args: string[];
    command: string;
    prefix: string;
    sock: WASocket;
}

export class PluginHandler {
    client: Client;
    plugins: Map<string, Plugin>;
    commands: Map<string, Plugin>;
    isLoaded: boolean;

    constructor(client: Client);

    load(pluginPath: string): Promise<Plugin | null>;
    loadAll(directory: string): Promise<number>;
    execute(m: SerializedMessage): Promise<void>;
    isOwner(jid: string): boolean;
    reload(pluginName: string): boolean;
    list(): Plugin[];
    get(name: string): Plugin | undefined;
}

// ============================================================================
// Message Serialization
// ============================================================================

export interface SerializedMessage {
    key: any;
    chat: string;
    fromMe: boolean;
    id: string;
    isGroup: boolean;
    sender: string;
    pushName: string;
    type: string;
    message: any;
    body: string;
    quoted?: SerializedMessage;
    caption: string;
    mimetype: string;
    fileSize: number;
    mentions: string[];

    // Helper methods
    reply(text: string, options?: any): Promise<any>;
    react(emoji: string): Promise<any>;
    download(): Promise<Buffer | null>;
    delete(): Promise<any>;
    forward(jid: string, options?: any): Promise<any>;
    copyNForward(jid: string, options?: any): Promise<any>;
}

export function serialize(msg: any, sock: WASocket): Promise<SerializedMessage>;

// ============================================================================
// Database
// ============================================================================

export interface DatabaseOptions {
    path?: string;
}

export class Database {
    path: string;
    collections: Map<string, any>;

    constructor(options?: DatabaseOptions);

    collection(name: string, defaultData?: any): Promise<any>;
    get<T = any>(collection: string, key: string, defaultValue?: T): Promise<T>;
    set<T = any>(collection: string, key: string, value: T): Promise<T>;
    has(collection: string, key: string): Promise<boolean>;
    delete(collection: string, key: string): Promise<boolean>;
    all(collection: string): Promise<any>;
    clear(collection: string): Promise<boolean>;
    update(collection: string, key: string, updater: Function | object): Promise<any>;
    increment(collection: string, key: string, field: string, amount?: number): Promise<any>;
    push(collection: string, key: string, value: any): Promise<any[]>;
    pull(collection: string, key: string, value: any): Promise<any[]>;
}

// ============================================================================
// Logger
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'success' | 'warn' | 'error';

export interface LoggerOptions {
    level?: LogLevel;
    prefix?: string;
}

export class Logger {
    level: LogLevel;
    prefix: string;
    levels: Record<LogLevel, number>;

    constructor(options?: LoggerOptions);

    debug(...args: any[]): void;
    info(...args: any[]): void;
    success(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    command(command: string, from: string): void;
}

// ============================================================================
// Sticker
// ============================================================================

export enum StickerTypes {
    DEFAULT = 'default',
    CROPPED = 'crop',
    FULL = 'full',
    CIRCLE = 'circle',
    ROUNDED = 'rounded'
}

export interface StickerOptions {
    pack?: string;
    author?: string;
    type?: StickerTypes;
    categories?: string[];
    id?: string;
    quality?: number;
    background?: string;
}

export function createSticker(buffer: Buffer | string, options?: StickerOptions): Promise<Buffer>;
export function createFullSticker(buffer: Buffer | string, options?: StickerOptions): Promise<Buffer>;
export function createCroppedSticker(buffer: Buffer | string, options?: StickerOptions): Promise<Buffer>;
export function createCircleSticker(buffer: Buffer | string, options?: StickerOptions): Promise<Buffer>;
export function createRoundedSticker(buffer: Buffer | string, options?: StickerOptions): Promise<Buffer>;

// ============================================================================
// Utility Functions
// ============================================================================

export function sleep(ms: number): Promise<void>;
export function formatTime(seconds: number): string;
export function formatBytes(bytes: number): string;
export function parseCommand(text: string, prefix?: string): { command: string; args: string[]; text: string } | null;
export function isUrl(text: string): boolean;
export function extractUrls(text: string): string[];
export function randomString(length?: number): string;
export function randomNumber(min: number, max: number): number;
export function pickRandom<T>(array: T[]): T;
export function chunk<T>(array: T[], size: number): T[][];

// ============================================================================
// Additional Types
// ============================================================================

export interface Contact {
    displayName: string;
    vcard: string;
}

// Default export
export default Client;
