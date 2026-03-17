import { Database } from 'bun:sqlite'

const db = new Database('status.db')

db.run('PRAGMA journal_mode = WAL')

export default db
