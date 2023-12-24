import { db } from './sqlite.js';

export function insertVideo({ file_key, status }) {
    const stmt = db.prepare(`INSERT INTO videos (file_key, status, created_at) VALUES (?, ?, ?)`);
    stmt.run(file_key, status, Date.now());
}

export function getVideo({ file_key }) {
    const stmt = db.prepare(`SELECT * FROM videos WHERE file_key = ?`);
    const info = stmt.get(file_key);
    return info;
}

export function getVideoByPrefix(prefix) {
    const stmt = db.prepare(`SELECT * FROM videos WHERE videos.file_key LIKE ? LIMIT 1`);
    const info = stmt.get(`${prefix}%`);
    return info;
}

export function getVideoByStatus(status) {
    const stmt = db.prepare(`SELECT * FROM videos WHERE videos.status = ? LIMIT 1`);
    const info = stmt.get(status);
    return info;
}

// status = unprocessed, processing, completed, corrupted
export function updateVideoByFileKey({ file_key, status }) {
    const stmt = db.prepare(`UPDATE videos SET status = ? WHERE file_key = ?`);
    stmt.run(status, file_key);
}

export function updateVideoById({ id, status }) {
    const stmt = db.prepare(`UPDATE videos SET status = ? WHERE id = ?`);
    stmt.run(status, id);
}