BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "videos" (
	"id"	INTEGER NOT NULL,
	"file_key"	TEXT NOT NULL UNIQUE,
	"status"	TEXT NOT NULL,
	"created_at"	INTEGER NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "tasks" (
	"task_id"	TEXT NOT NULL UNIQUE,
	"video_id"	INTEGER NOT NULL,
	"slave_name"	TEXT NOT NULL,
	"status"	TEXT NOT NULL,
	"action"	TEXT NOT NULL,
	"progress_percentage"	INTEGER NOT NULL,
	"last_progress_at"	INTEGER NOT NULL,
	"created_at"	INTEGER NOT NULL,
	FOREIGN KEY("video_id") REFERENCES "videos"("id") ON DELETE CASCADE,
	PRIMARY KEY("task_id")
);
CREATE INDEX IF NOT EXISTS "by_videos_status" ON "videos" (
	"status"	ASC
);
CREATE INDEX IF NOT EXISTS "by_tasks_status" ON "tasks" (
	"status"	ASC
);
CREATE INDEX IF NOT EXISTS "by_task_created_at" ON "tasks" (
	"created_at"	DESC
);
COMMIT;
