import type { Env, EventContext } from '../../../_shared/types'
import { 
  handleCORS, 
  createCachedResponse,
  createCachedErrorResponse,
  getDbService,
  type AuthenticatedUser
} from '../../../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  const corsResponse = handleCORS(context.request, context.env)
  if (corsResponse) return corsResponse

  try {
    const db = getDbService(context)
    const userId = context.params.id as string
    
    if (!userId || userId.trim() === '') {
      return createCachedErrorResponse('Invalid user ID', context.request, context.env, 400)
    }

    if (context.request.method === 'GET') {
      // Get authenticated user from context (set by router)
      const authenticatedUser = context.data.user as AuthenticatedUser
      if (!authenticatedUser) {
        return createCachedErrorResponse('Authentication required', context.request, context.env, 401)
      }
      
      // Get all signatures for this user
      const signatures = await db.getUserSignatures(userId)
      
      // Extract just the petition IDs for privacy and performance
      const petitionIds = signatures.map(signature => signature.petition_id)
      
      // Cache user signatures for 2 minutes (they change when user signs new petitions)
      return createCachedResponse(petitionIds, context.request, context.env, 120)
    }

    return createCachedErrorResponse('Method not allowed', context.request, context.env, 405)
  } catch (error) {
    console.error('User signatures API Error:', error)
    return createCachedErrorResponse(error, context.request, context.env)
  }
}
