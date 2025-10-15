import type { Env, EventContext } from '../_shared/types'
import { createContext } from './context'
import { requireAuth, requirePetitionOwnership } from '../middleware/auth-middleware'

export function wrapHandler(handler: (context: EventContext<Env>) => Promise<Response>) {
  return async (request: Request, env: Env) => {
    const context = createContext(request, env, request.params || {})
    return await handler(context)
  }
}

export function wrapHandlerWithAuth(handler: (context: EventContext<Env>) => Promise<Response>) {
  return async (request: Request, env: Env) => {
    const context = createContext(request, env, request.params || {})
    const authResult = await requireAuth(context)
    if (!authResult.success) {
      return authResult.response
    }
    context.data.user = authResult.user
    return await handler(context)
  }
}

export function wrapHandlerWithConditionalAuth(handler: (context: EventContext<Env>) => Promise<Response>) {
  return async (request: Request, env: Env) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    const context = createContext(request, env, request.params || {})

    if (userId) {
      const authResult = await requireAuth(context)
      if (!authResult.success) {
        return authResult.response
      }
      context.data.user = authResult.user
      return await handler(context)
    }

    return await handler(context)
  }
}

export function wrapHandlerWithOwnership(handler: (context: EventContext<Env>) => Promise<Response>) {
  return async (request: Request, env: Env) => {
    const petitionId = parseInt(request.params?.id || '0')
    const context = createContext(request, env, request.params || {})
    const authResult = await requirePetitionOwnership(context, petitionId)
    if (!authResult.success) {
      return authResult.response
    }
    context.data.user = authResult.user
    return await handler(context)
  }
}


