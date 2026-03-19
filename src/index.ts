import { Elysia } from 'elysia';
import { statusRoutes } from './routes';
import { authMiddleware } from './middleware/auth';

const app = new Elysia()
  .use(authMiddleware)
  .use(statusRoutes)
  .get('/', () => 'Hello Elysia')
  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
