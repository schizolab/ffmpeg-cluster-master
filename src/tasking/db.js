import Database from 'better-sqlite3';

import fs from 'fs';
const schema = fs.readFileSync('./src/tasking/temp_db.sql', 'utf8');

export const db = new Database('./temp/db.sqlite');
db.exec(schema);

export function insertVideo({ file_key }) {
    const stmt = db.prepare(`INSERT INTO videos (status, file_key, created_at, modified_at) VALUES (?, ?, ?, ?)`);
    stmt.run('unprocessed', file_key, Date.now(), Date.now());
}

export function getVideo({ file_key }) {
    const stmt = db.prepare(`SELECT * FROM videos WHERE file_key = ?`);
    const info = stmt.get(file_key);
    return info;
}

export function markVideoStatus({ file_key, status }) {
    const stmt = db.prepare(`UPDATE videos SET status = ?, modified_at = ? WHERE file_key = ?`);
    stmt.run(status, Date.now(), file_key);
}