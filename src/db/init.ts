import db from './database'

const createStatusTableSQL = `
CREATE TABLE IF NOT EXISTS status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  avatar_url TEXT,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'resting' CHECK(status IN ('working', 'resting')),
  working TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
)
`

const createUsersTableSQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  avatar_url TEXT,
  title TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
)
`

const createStatusUpdatedAtTriggerSQL = `
CREATE TRIGGER IF NOT EXISTS update_status_timestamp
AFTER UPDATE ON status
FOR EACH ROW
BEGIN
  UPDATE status SET updated_at = datetime('now') WHERE id = OLD.id;
END
`

const createUsersUpdatedAtTriggerSQL = `
CREATE TRIGGER IF NOT EXISTS update_users_timestamp
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  UPDATE users SET updated_at = datetime('now') WHERE id = OLD.id;
END
`

export function initDatabase() {
  db.run(createStatusTableSQL)
  db.run(createStatusUpdatedAtTriggerSQL)
  db.run(createUsersTableSQL)
  db.run(createUsersUpdatedAtTriggerSQL)
  console.log('✅ Database initialized successfully')
}

if (import.meta.main) {
  initDatabase()
}
