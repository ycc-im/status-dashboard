import { Elysia } from 'elysia'

const AUTH_TOKEN = process.env.AUTH_TOKEN

export const authMiddleware = new Elysia({ name: 'auth' })
  .derive({ as: 'global' }, ({ request, error }) => {
    const authorization = request.headers.get('Authorization')
    
    if (!authorization) {
      return error(401, { error: 'Unauthorized', message: 'Missing Authorization header' })
    }
    
    const [scheme, token] = authorization.split(' ')
    
    if (scheme !== 'Bearer' || !token) {
      return error(401, { error: 'Unauthorized', message: 'Invalid Authorization header format' })
    }
    
    if (token !== AUTH_TOKEN) {
      return error(401, { error: 'Unauthorized', message: 'Invalid token' })
    }
    
    return { authenticated: true }
  })

export const requireAuth = <T extends Elysia>(app: T) => app.use(authMiddleware)
