import db from './database'

const createTableSQL = `
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

const createUpdatedAtTriggerSQL = `
CREATE TRIGGER IF NOT EXISTS update_status_timestamp
AFTER UPDATE ON status
FOR EACH ROW
BEGIN
  UPDATE status SET updated_at = datetime('now') WHERE id = OLD.id;
END
`

export function initDatabase() {
  db.run(createTableSQL)
  db.run(createUpdatedAtTriggerSQL)
  console.log('✅ Database initialized successfully')
}

if (import.meta.main) {
  initDatabase()
}
