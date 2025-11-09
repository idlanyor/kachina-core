import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import fs from 'fs';
import path from 'path';

export class Database {
    constructor(options = {}) {
        this.path = options.path || './database';
        this.collections = new Map();

        // Ensure database directory exists
        if (!fs.existsSync(this.path)) {
            fs.mkdirSync(this.path, { recursive: true });
        }
    }

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

    async get(collection, key, defaultValue = null) {
        const db = await this.collection(collection, {});
        await db.read();
        return db.data[key] ?? defaultValue;
    }

    async set(collection, key, value) {
        const db = await this.collection(collection, {});
        await db.read();
        db.data[key] = value;
        await db.write();
        return value;
    }

    async has(collection, key) {
        const db = await this.collection(collection, {});
        await db.read();
        return key in db.data;
    }

    async delete(collection, key) {
        const db = await this.collection(collection, {});
        await db.read();
        delete db.data[key];
        await db.write();
        return true;
    }

    async all(collection) {
        const db = await this.collection(collection, {});
        await db.read();
        return db.data;
    }

    async clear(collection) {
        const db = await this.collection(collection, {});
        db.data = {};
        await db.write();
        return true;
    }

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

    async increment(collection, key, field, amount = 1) {
        return await this.update(collection, key, (data) => {
            data = data || {};
            data[field] = (data[field] || 0) + amount;
            return data;
        });
    }

    async push(collection, key, value) {
        return await this.update(collection, key, (data) => {
            data = data || [];
            if (Array.isArray(data)) {
                data.push(value);
            }
            return data;
        });
    }

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
