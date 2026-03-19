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
});
