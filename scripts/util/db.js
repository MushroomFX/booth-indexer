const fs = require('fs');
const path = require('path');

const dbFile = path.join(__dirname, '../../data/index.db');
console.log(dbFile)
let indexDB = [];


let writing = false;
let pendingWrite = false;

async function safeWrite() {
    if (writing) {
        pendingWrite = true;
        return;
    }
    writing = true;

    try {
        await fs.promises.writeFile(dbFile, JSON.stringify(indexDB, null, 4), 'utf-8');
        console.log('Database saved');
    } catch (err) {
        console.error('Failed to write database:', err);
    } finally {
        writing = false;
        if (pendingWrite) {
            pendingWrite = false;
            safeWrite(); // run another write if queued
        }
    }
}

const db = {
    backup: ()=>{
        const timestamp = Date.now();
        const backupFile = path.join(
            path.dirname(dbFile),
            `backup_${timestamp}_index.db`
        );

        fs.copyFileSync(dbFile, backupFile);
        console.log(`Backup created: ${backupFile}`);
    },
    load: async () => {
        try {
            const data = await fs.promises.readFile(dbFile, 'utf-8');
            indexDB = JSON.parse(data);
            console.log('Database loaded:', indexDB.length, 'items');
            Object.entries(indexDB.reduce((a, { id }) => (a[id] = (a[id] || 0) + 1, a), {})).filter(([_, c]) => c > 1).forEach(([id, c]) => console.log(id, "x", c));
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

    write: safeWrite,

    get: (id) => indexDB.find(item => item.id === id),

    all: () => indexDB,
};

module.exports = db;
