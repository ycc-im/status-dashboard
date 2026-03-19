import { Elysia } from 'elysia';

const AUTH_TOKEN = process.env.AUTH_TOKEN;

export const authMiddleware = new Elysia({ name: 'auth' }).onBeforeHandle(({ request, set }) => {
  const authPath = ['/api/status'];

  // Only apply to API routes
  const path = request.url;
  if (!authPath.some((p) => path.includes(p))) {
    return;
  }

  const authorization = request.headers.get('Authorization');

  if (!authorization) {
    set.status = 401;
    return {
      error: 'Unauthorized',
      message: 'Missing Authorization header',
    };
  }

  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    set.status = 401;
    return {
      error: 'Unauthorized',
      message: 'Invalid Authorization header format',
    };
  }

  if (token !== AUTH_TOKEN) {
    set.status = 401;
    return { error: 'Unauthorized', message: 'Invalid token' };
  }
});

export const requireAuth = <T extends Elysia>(app: T) => app.use(authMiddleware);
