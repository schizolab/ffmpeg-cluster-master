import Database from 'better-sqlite3';

import fs from 'fs';
const schema = fs.readFileSync('./src/db/tasking/temp_db.sql', 'utf8');

// if db were to be deleted, the video status is rebuilt from s3
export const db = new Database('./temp/db.sqlite');
db.exec(schema);
