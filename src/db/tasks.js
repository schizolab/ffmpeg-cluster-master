import { db } from './sqlite.js';

export function insertTask({ video_id, slave_name, status }) {
    const stmt = db.prepare(`INSERT INTO tasks 
    (
        task_id, 
        video_id, 
        slave_name, 
        status, 
        progress_percentage,
        last_progress_at, 
        created_at
    ) 
    VALUES (?, ?, ?, ?, ?)`);
    stmt.run(task_id, video_id, slave_name, status, 0, Date.now(), Date.now());
}

export function updateTask({ task_id, status, progress_percentage }) {
    const stmt = db.prepare(`UPDATE tasks SET status = ?, progress_percentage = ?, last_progress_at = ? WHERE task_id = ?`);
    stmt.run(status, progress_percentage, Date.now(), task_id);
}

export function getTasksByVideoFileKey({ file_key }) {
    const stmt = db.prepare(`SELECT tasks.* FROM tasks INNER JOIN tasks ON tasks.video_id = video.id WHERE videos.file_key = ?`);
    const rows = stmt.all(file_key);
    return rows;
}

