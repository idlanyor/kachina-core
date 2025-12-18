import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import fs from 'fs';
import path from 'path';

/**
 * @typedef {Object} DatabaseOptions
 * @property {string} [path='./database'] - Path to database directory
 */

/**
 * Simple JSON-based database wrapper using LowDB
 * Provides key-value storage organized by collections
 * Each collection is stored as a separate JSON file
 *
 * @class Database
 * @example
 * const db = new Database({ path: './data' });
 * await db.set('users', 'john', { name: 'John', age: 30 });
 * const user = await db.get('users', 'john');
 */
export class Database {
    /**
     * Creates a new Database instance
     * @param {DatabaseOptions} [options={}] - Database configuration
     */
    constructor(options = {}) {
        this.path = options.path || './database';
        this.collections = new Map();

        // Ensure database directory exists
        if (!fs.existsSync(this.path)) {
            fs.mkdirSync(this.path, { recursive: true });
        }
    }

    /**
     * Get or create a collection (LowDB instance)
     * @async
     * @param {string} name - Collection name (becomes filename)
     * @param {Object} [defaultData={}] - Default data if collection doesn't exist
     * @returns {Promise<Low>} LowDB instance
     * @example
     * const usersDb = await db.collection('users');
     * usersDb.data.john = { name: 'John' };
     * await usersDb.write();
     */
    async collection(name, defaultData = {}) {
        if (this.collections.has(name)) {
            return this.collections.get(name);
        }

        const filePath = path.join(this.path, `${name}.json`);
        const adapter = new JSONFile(filePath);
        const db = new Low(adapter, defaultData);

        await db.read();
        db.data ||= defaultData;
        await db.write();

        this.collections.set(name, db);
        return db;
    }

    /**
     * Get a value from collection
     * @async
     * @template T
     * @param {string} collection - Collection name
     * @param {string} key - Key to retrieve
     * @param {T} [defaultValue=null] - Default value if key doesn't exist
     * @returns {Promise<T>} Value or default value
     * @example
     * const user = await db.get('users', 'john', { name: 'Unknown' });
     */
    async get(collection, key, defaultValue = null) {
        const db = await this.collection(collection, {});
        await db.read();
        return db.data[key] ?? defaultValue;
    }

    /**
     * Set a value in collection
     * @async
     * @template T
     * @param {string} collection - Collection name
     * @param {string} key - Key to set
     * @param {T} value - Value to store
     * @returns {Promise<T>} The value that was set
     * @example
     * await db.set('users', 'john', { name: 'John', age: 30 });
     */
    async set(collection, key, value) {
        const db = await this.collection(collection, {});
        await db.read();
        db.data[key] = value;
        await db.write();
        return value;
    }

    /**
     * Check if key exists in collection
     * @async
     * @param {string} collection - Collection name
     * @param {string} key - Key to check
     * @returns {Promise<boolean>} True if key exists
     * @example
     * if (await db.has('users', 'john')) {
     *   console.log('User exists');
     * }
     */
    async has(collection, key) {
        const db = await this.collection(collection, {});
        await db.read();
        return key in db.data;
    }

    /**
     * Delete a key from collection
     * @async
     * @param {string} collection - Collection name
     * @param {string} key - Key to delete
     * @returns {Promise<boolean>} True if successful
     * @example
     * await db.delete('users', 'john');
     */
    async delete(collection, key) {
        const db = await this.collection(collection, {});
        await db.read();
        delete db.data[key];
        await db.write();
        return true;
    }

    /**
     * Get all data from collection
     * @async
     * @param {string} collection - Collection name
     * @returns {Promise<Object>} All collection data
     * @example
     * const allUsers = await db.all('users');
     * console.log(Object.keys(allUsers)); // ['john', 'jane', ...]
     */
    async all(collection) {
        const db = await this.collection(collection, {});
        await db.read();
        return db.data;
    }

    /**
     * Clear all data from collection
     * @async
     * @param {string} collection - Collection name
     * @returns {Promise<boolean>} True if successful
     * @example
     * await db.clear('users'); // Removes all users
     */
    async clear(collection) {
        const db = await this.collection(collection, {});
        db.data = {};
        await db.write();
        return true;
    }

    /**
     * Update a value in collection
     * @async
     * @param {string} collection - Collection name
     * @param {string} key - Key to update
     * @param {Function|Object} updater - Function that receives old value and returns new value, or object to merge
     * @returns {Promise<*>} Updated value
     * @example
     * // Using function
     * await db.update('users', 'john', (user) => ({ ...user, age: 31 }));
     * // Using object merge
     * await db.update('users', 'john', { age: 31 });
     */
    async update(collection, key, updater) {
        const db = await this.collection(collection, {});
        await db.read();

        if (typeof updater === 'function') {
            db.data[key] = updater(db.data[key]);
        } else {
            db.data[key] = { ...db.data[key], ...updater };
        }

        await db.write();
        return db.data[key];
    }

    /**
     * Increment a numeric field in a stored object
     * @async
     * @param {string} collection - Collection name
     * @param {string} key - Key of object to update
     * @param {string} field - Field name to increment
     * @param {number} [amount=1] - Amount to increment by
     * @returns {Promise<Object>} Updated object
     * @example
     * // Increment user score by 10
     * await db.increment('users', 'john', 'score', 10);
     * // Increment by 1 (default)
     * await db.increment('users', 'john', 'loginCount');
     */
    async increment(collection, key, field, amount = 1) {
        return await this.update(collection, key, (data) => {
            data = data || {};
            data[field] = (data[field] || 0) + amount;
            return data;
        });
    }

    /**
     * Push a value to an array
     * @async
     * @param {string} collection - Collection name
     * @param {string} key - Key of array to update
     * @param {*} value - Value to push
     * @returns {Promise<Array>} Updated array
     * @example
     * await db.push('chats', 'john', 'Hello');
     * await db.push('chats', 'john', 'How are you?');
     * // chats.john = ['Hello', 'How are you?']
     */
    async push(collection, key, value) {
        return await this.update(collection, key, (data) => {
            data = data || [];
            if (Array.isArray(data)) {
                data.push(value);
            }
            return data;
        });
    }

    /**
     * Remove a value from an array
     * @async
     * @param {string} collection - Collection name
     * @param {string} key - Key of array to update
     * @param {*} value - Value to remove
     * @returns {Promise<Array>} Updated array
     * @example
     * await db.pull('chats', 'john', 'Hello');
     * // Removes 'Hello' from the array
     */
    async pull(collection, key, value) {
        return await this.update(collection, key, (data) => {
            if (Array.isArray(data)) {
                return data.filter(item => item !== value);
            }
            return data;
        });
    }
}

export default Database;
