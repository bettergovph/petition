import { requireAuth, requirePetitionOwnership } from './auth-middleware'
import type { EventContext, Env } from '../_shared/types'
import type { AuthenticatedUser } from '../_shared/utils'

// Higher-order function to enforce authentication
export function withAuth<T extends EventContext<Env>>(
  handler: (context: T & { data: { user: AuthenticatedUser } }) => Promise<Response>
) {
  return async (context: T): Promise<Response> => {
    const authResult = await requireAuth(context)
    if (!authResult.success) return authResult.response
    
    return handler({
      ...context,
      data: { ...context.data, user: authResult.user }
    })
  }
}

// Higher-order function to enforce petition ownership
export function withPetitionOwnership<T extends EventContext<Env>>(
  petitionIdExtractor: (context: T) => number,
  handler: (context: T & { data: { user: AuthenticatedUser } }) => Promise<Response>
) {
  return async (context: T): Promise<Response> => {
    const petitionId = petitionIdExtractor(context)
    const authResult = await requirePetitionOwnership(context, petitionId)
    if (!authResult.success) return authResult.response
    
    return handler({
      ...context,
      data: { ...context.data, user: authResult.user }
    })
  }
}

// Higher-order function for public endpoints (no auth required)
export function withPublic<T extends EventContext<Env>>(
  handler: (context: T) => Promise<Response>
) {
  return async (context: T): Promise<Response> => {
    return handler(context)
  }
}
