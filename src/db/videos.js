import { db } from './sqlite.js';

export function insertVideo({ file_key }) {
    const stmt = db.prepare(`INSERT INTO videos (file_key, status, created_at) VALUES (?, ?)`);
    stmt.run(file_key, 'processing', Date.now());
}

export function getVideo({ file_key }) {
    const stmt = db.prepare(`SELECT * FROM videos WHERE file_key = ?`);
    const info = stmt.get(file_key);
    return info;
}

// status = unprocessed, processing, complete, corrupted
export function getVideoByStatus(status) {
    const stmt = db.prepare(`SELECT * FROM videos WHERE videos.status = ? LIMIT 1`);
    const info = stmt.get(status);
    return info;
}

export function updateVideo({ file_key, status }) {
    const stmt = db.prepare(`UPDATE videos SET status = ? WHERE file_key = ?`);
    stmt.run(status, file_key);
}
