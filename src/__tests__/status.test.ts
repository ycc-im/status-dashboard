import { describe, it, expect, beforeEach } from 'bun:test';
import { Elysia } from 'elysia';
import { statusRoutes } from '../routes';
import db from '../db/database';

describe('Status API', () => {
  let app: Elysia;

  beforeEach(() => {
    // Clean up database before each test
    db.run('DELETE FROM status');

    app = new Elysia().use(statusRoutes);
  });

  const createStatus = async (payload: Record<string, unknown> = {}) => {
    const response = await app.handle(
      new Request('http://localhost/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          status: 'working',
          ...payload,
        }),
      })
    );
    expect(response.status).toBe(200);
    return response.json();
  };

  it('should get empty list', async () => {
    const response = await app.handle(new Request('http://localhost/api/status'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });

  it('should create a status', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          status: 'working',
        }),
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty('id');
    expect(body.name).toBe('Test User');
    expect(body.status).toBe('working');
  });

  it('should get a status by id', async () => {
    // First create a status
    const createResponse = await app.handle(
      new Request('http://localhost/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          status: 'working',
        }),
      })
    );
    const { id } = await createResponse.json();

    // Then get it
    const getResponse = await app.handle(new Request(`http://localhost/api/status/${id}`));
    const body = await getResponse.json();

    expect(getResponse.status).toBe(200);
    expect(body.name).toBe('Test User');
  });

  it('should update a status', async () => {
    // First create a status
    const createResponse = await app.handle(
      new Request('http://localhost/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          status: 'working',
        }),
      })
    );
    const { id } = await createResponse.json();

    // Then update it
    const updateResponse = await app.handle(
      new Request(`http://localhost/api/status/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Updated User',
          status: 'resting',
        }),
      })
    );
    const body = await updateResponse.json();

    expect(updateResponse.status).toBe(200);
    expect(body.name).toBe('Updated User');
    expect(body.status).toBe('resting');
  });

  it('should delete a status', async () => {
    // First create a status
    const { id } = await createStatus();

    // Then delete it
    const deleteResponse = await app.handle(
      new Request(`http://localhost/api/status/${id}`, {
        method: 'DELETE',
      })
    );
    const body = await deleteResponse.json();

    expect(deleteResponse.status).toBe(200);
    expect(body.success).toBe(true);

    // Verify it's gone
    const getResponse = await app.handle(new Request(`http://localhost/api/status/${id}`));
    const getBody = await getResponse.json();
    expect(getBody.error).toBe('Status not found');
  });

  it('should create a status with optional fields', async () => {
    const body = await createStatus({
      avatar_url: 'https://example.com/avatar.png',
      title: 'QA Engineer',
      working: 'Writing tests',
    });

    expect(body.avatar_url).toBe('https://example.com/avatar.png');
    expect(body.title).toBe('QA Engineer');
    expect(body.working).toBe('Writing tests');
  });

  it('should return error when status id is not found', async () => {
    const response = await app.handle(new Request('http://localhost/api/status/9999'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ error: 'Status not found' });
  });

  it('should keep existing fields when applying partial update', async () => {
    const created = await createStatus({
      avatar_url: 'https://example.com/avatar.png',
      title: 'QA Engineer',
      working: 'Writing tests',
    });

    const updateResponse = await app.handle(
      new Request(`http://localhost/api/status/${created.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'resting',
          working: 'Planning tests',
        }),
      })
    );
    const updateBody = await updateResponse.json();

    expect(updateResponse.status).toBe(200);
    expect(updateBody.name).toBe('Test User');
    expect(updateBody.avatar_url).toBe('https://example.com/avatar.png');
    expect(updateBody.title).toBe('QA Engineer');
    expect(updateBody.status).toBe('resting');
    expect(updateBody.working).toBe('Planning tests');
  });

  it('should return error when updating with no fields', async () => {
    const created = await createStatus();

    const updateResponse = await app.handle(
      new Request(`http://localhost/api/status/${created.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
    );
    const updateBody = await updateResponse.json();

    expect(updateResponse.status).toBe(200);
    expect(updateBody).toEqual({ error: 'No fields to update' });

    const verifyResponse = await app.handle(
      new Request(`http://localhost/api/status/${created.id}`)
    );
    const verifyBody = await verifyResponse.json();
    expect(verifyBody.name).toBe('Test User');
  });

  it('should return error when updating a non-existent status', async () => {
    const updateResponse = await app.handle(
      new Request('http://localhost/api/status/9999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Ghost' }),
      })
    );
    const updateBody = await updateResponse.json();

    expect(updateResponse.status).toBe(200);
    expect(updateBody).toEqual({ error: 'Status not found' });
  });

  it('should return error when deleting a non-existent status', async () => {
    const deleteResponse = await app.handle(
      new Request('http://localhost/api/status/9999', {
        method: 'DELETE',
      })
    );
    const body = await deleteResponse.json();

    expect(deleteResponse.status).toBe(200);
    expect(body).toEqual({ error: 'Status not found' });
  });
});
