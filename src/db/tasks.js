import { db } from './sqlite.js';

export function insertTask({ task_id, video_id, slave_name, action, status }) {
    const stmt = db.prepare(`INSERT INTO tasks 
    (
        task_id, 
        video_id, 
        slave_name, 
        action,
        status, 
        progress_percentage,
        last_progress_at, 
        created_at
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    stmt.run(task_id, video_id, slave_name, action, status, 0, Date.now(), Date.now());
}

export function updateTask({ task_id, status, progress_percentage }) {
    const stmt = db.prepare(`UPDATE tasks SET status = ?, progress_percentage = ?, last_progress_at = ? WHERE task_id = ?`);
    stmt.run(status, progress_percentage, Date.now(), task_id);
}

export function getTasksByVideoId(video_id) {
    const stmt = db.prepare(`SELECT * FROM tasks WHERE tasks.video_id = ?`);
    const rows = stmt.all(video_id);
    return rows;
}

export function getTasksByStatus(status) {
    const stmt = db.prepare(`SELECT * FROM tasks WHERE tasks.status = ?`);
    const rows = stmt.all(status);
    return rows;
}