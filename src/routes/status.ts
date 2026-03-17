import { Elysia, t } from 'elysia'
import { authMiddleware } from '../middleware/auth'
import db from '../db/database'
import type { Status } from '../db/schema'

export const statusPostRoute = new Elysia()
  .use(authMiddleware)
  .post('/status', ({ body, error }) => {
    const { id, status, working } = body as { id: number; status: 'working' | 'resting'; working: string }
    
    try {
      const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Status | undefined
      
      if (existing) {
        db.prepare(`
          UPDATE users 
          SET status = ?, working = ?, updated_at = datetime('now')
          WHERE id = ?
        `).run(status, working || null, id)
      } else {
        return error(404, { success: false, message: 'User not found' })
      }
      
      return { success: true }
    } catch (e) {
      return error(500, { success: false, message: 'Database error' })
    }
  }, {
    body: t.Object({
      id: t.Number(),
      status: t.Union([t.Literal('working'), t.Literal('resting')]),
      working: t.String()
    })
  })

export const statusGetRoute = new Elysia()
  .get('/status', () => {
    const users = db.prepare('SELECT * FROM users').all() as Status[]
    return users
  })
