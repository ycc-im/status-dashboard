import { Elysia } from 'elysia'
import { statusPostRoute, statusGetRoute } from './routes'

const app = new Elysia()
  .use(statusPostRoute)
  .use(statusGetRoute)
  .get('/', () => 'Hello Elysia')
  .listen(3000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
