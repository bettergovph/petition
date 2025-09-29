import type { Env, EventContext } from '../../../_shared/types'
import { handleCORS, createErrorResponse, createSuccessResponse, getDbService, type AuthenticatedUser } from '../../../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  const corsResponse = handleCORS(context.request, context.env)
  if (corsResponse) return corsResponse

  try {
    const db = getDbService(context)
    const userId = context.params.id as string

    if (context.request.method === 'GET') {
      // Get authenticated user from context (set by router)
      const authenticatedUser = context.data.user as AuthenticatedUser
      if (!authenticatedUser) {
        return createErrorResponse('Authentication required', 401)
      }
      
      const petitions = await db.getUserPetitions(userId)
      return createSuccessResponse(petitions)
    }

    return createErrorResponse('Method not allowed', 405)
  } catch (error) {
    console.error('User Petitions API Error:', error)
    return createErrorResponse(error)
  }
}