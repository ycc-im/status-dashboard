import { Elysia, t } from 'elysia'
import db from '../db/database'
import type { User, NewUser } from '../db/schema'
import { authMiddleware } from '../middleware/auth'

export const connectRoute = new Elysia()
  .use(authMiddleware)
  .post('/connect', ({ body, error }) => {
    const { name, avatar_url, title, id } = body

    if (id) {
      const existingUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined
      
      if (!existingUser) {
        return error(404, { error: 'Not Found', message: 'User not found' })
      }

      db.prepare(`
        UPDATE users 
        SET name = ?, avatar_url = ?, title = ?
        WHERE id = ?
      `).run(name, avatar_url ?? null, title ?? null, id)

      return { id }
    }

    const result = db.prepare(`
      INSERT INTO users (name, avatar_url, title)
      VALUES (?, ?, ?)
    `).run(name, avatar_url ?? null, title ?? null)

    return { id: result.lastInsertRowid }
  }, {
    body: t.Object({
      name: t.String(),
      avatar_url: t.Optional(t.String()),
      title: t.Optional(t.String()),
      id: t.Optional(t.Number())
    })
  })
