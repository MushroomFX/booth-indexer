const fs = require('fs');
const path = require('path');

const dbFile = path.join(__dirname, '../../data/index.db');
console.log(dbFile)
let indexDB = [];

const db = {
    load: async () => {
        try {
            const data = await fs.promises.readFile(dbFile, 'utf-8');
            indexDB = JSON.parse(data);
            console.log('Database loaded:', indexDB.length, 'items');
        } catch (err) {
            if (err.code === 'ENOENT') {
                indexDB = [];
                console.log('No database file found, starting empty');
            } else {
                throw err;
            }
        }
    },

    update: (id, newData) => {
        const index = indexDB.findIndex(item => item.id === id);
        if (index !== -1) {
            indexDB[index] = { ...indexDB[index], ...newData };
        } else {
            indexDB.push({ id, ...newData });
        }
    },

    write: async () => {
        try {
            await fs.promises.writeFile(dbFile, JSON.stringify(indexDB, null, 4), 'utf-8');
            console.log('Database saved');
        } catch (err) {
            console.error('Failed to write database:', err);
        }
    },

    get: (id) => indexDB.find(item => item.id === id),

    all: () => indexDB,
};

module.exports = db;
