import { Elysia, t } from 'elysia';
import db from '../db/database';
import { Status, NewStatus } from '../db/schema';

export const statusRoutes = new Elysia({ prefix: '/api/status' })
  // GET /api/status - 获取所有状态
  .get('/', () => {
    const query = db.prepare('SELECT * FROM status ORDER BY updated_at DESC');
    return query.all() as Status[];
  })

  // GET /api/status/:id - 获取单个状态
  .get('/:id', ({ params }) => {
    const { id } = params;
    const query = db.prepare('SELECT * FROM status WHERE id = ?');
    const result = query.get(Number(id)) as Status | undefined;
    if (!result) {
      return { error: 'Status not found' };
    }
    return result;
  })

  // POST /api/status - 创建新状态
  .post(
    '/',
    ({ body }) => {
      const data = body as NewStatus;
      const stmt = db.prepare(`
      INSERT INTO status (name, avatar_url, title, status, working, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
      const result = stmt.run(
        data.name,
        data.avatar_url ?? null,
        data.title ?? null,
        data.status,
        data.working ?? null
      );
      return { id: result.lastInsertRowid, ...data };
    },
    {
      body: t.Object({
        name: t.String(),
        avatar_url: t.Optional(t.String()),
        title: t.Optional(t.String()),
        status: t.Union([t.Literal('working'), t.Literal('resting')]),
        working: t.Optional(t.String()),
      }),
    }
  )

  // PUT /api/status/:id - 更新状态
  .put(
    '/:id',
    ({ params, body }) => {
      const { id } = params;
      const data = body as Partial<NewStatus>;
      const fields: string[] = [];
      const values: (string | number | null)[] = [];

      if (data.name !== undefined) {
        fields.push('name = ?');
        values.push(data.name);
      }
      if (data.avatar_url !== undefined) {
        fields.push('avatar_url = ?');
        values.push(data.avatar_url);
      }
      if (data.title !== undefined) {
        fields.push('title = ?');
        values.push(data.title);
      }
      if (data.status !== undefined) {
        fields.push('status = ?');
        values.push(data.status);
      }
      if (data.working !== undefined) {
        fields.push('working = ?');
        values.push(data.working);
      }

      if (fields.length === 0) {
        return { error: 'No fields to update' };
      }

      fields.push("updated_at = datetime('now')");
      values.push(Number(id));

      const query = db.prepare(`UPDATE status SET ${fields.join(', ')} WHERE id = ?`);
      const result = query.run(...values);

      if (result.changes === 0) {
        return { error: 'Status not found' };
      }

      const selectQuery = db.prepare('SELECT * FROM status WHERE id = ?');
      return selectQuery.get(Number(id)) as Status;
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        avatar_url: t.Optional(t.String()),
        title: t.Optional(t.String()),
        status: t.Optional(t.Union([t.Literal('working'), t.Literal('resting')])),
        working: t.Optional(t.String()),
      }),
    }
  )

  // DELETE /api/status/:id - 删除状态
  .delete('/:id', ({ params }) => {
    const { id } = params;
    const query = db.prepare('DELETE FROM status WHERE id = ?');
    const result = query.run(Number(id));

    if (result.changes === 0) {
      return { error: 'Status not found' };
    }

    return { success: true };
  });
