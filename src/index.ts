import { Elysia } from 'elysia'
import { connectRoute } from './routes'

const app = new Elysia()
  .get('/', () => 'Hello Elysia')
  .use(connectRoute)
  .listen(3000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
