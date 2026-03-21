import { describe, it, expect, beforeEach } from 'bun:test';
import { Elysia } from 'elysia';
import { statusRoutes } from '../routes';
import { authMiddleware } from '../middleware/auth';
import db from '../db/database';

// Set AUTH_TOKEN before importing modules that depend on it
const AUTH_TOKEN = 'test-auth-token';

describe('Auth Middleware Integration', () => {
  let app: Elysia;

  beforeEach(() => {
    db.run('DELETE FROM status');
    // Note: AUTH_TOKEN in authMiddleware is cached at module load time
    // These tests verify integration behavior with valid tokens
    app = new Elysia().use(authMiddleware).use(statusRoutes);
  });

  describe('Authenticated requests', () => {
    it('should allow POST with valid token', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
          body: JSON.stringify({ name: 'Test User', status: 'working' }),
        })
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toHaveProperty('id');
      expect(body.name).toBe('Test User');
      expect(body.status).toBe('working');
    });

    it('should allow GET list with valid token', async () => {
      // Create a status first
      await app.handle(
        new Request('http://localhost/api/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
          body: JSON.stringify({ name: 'Test User', status: 'working' }),
        })
      );

      const response = await app.handle(
        new Request('http://localhost/api/status', {
          method: 'GET',
          headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
        })
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });

    it('should allow GET single status with valid token', async () => {
      // Create a status first
      const createResponse = await app.handle(
        new Request('http://localhost/api/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
          body: JSON.stringify({ name: 'Test User', status: 'working' }),
        })
      );
      const { id } = await createResponse.json();

      // Then get it
      const response = await app.handle(
        new Request(`http://localhost/api/status/${id}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
        })
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.name).toBe('Test User');
    });

    it('should allow PUT with valid token', async () => {
      // Create a status first
      const createResponse = await app.handle(
        new Request('http://localhost/api/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
          body: JSON.stringify({ name: 'Test User', status: 'working' }),
        })
      );
      const { id } = await createResponse.json();

      // Then update it
      const response = await app.handle(
        new Request(`http://localhost/api/status/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
          body: JSON.stringify({ name: 'Updated User', status: 'resting' }),
        })
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.name).toBe('Updated User');
      expect(body.status).toBe('resting');
    });

    it('should allow DELETE with valid token', async () => {
      // Create a status first
      const createResponse = await app.handle(
        new Request('http://localhost/api/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
          body: JSON.stringify({ name: 'Test User', status: 'working' }),
        })
      );
      const { id } = await createResponse.json();

      // Then delete it
      const response = await app.handle(
        new Request(`http://localhost/api/status/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
        })
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
    });
  });
});
