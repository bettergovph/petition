import type { Env, EventContext } from '../../_shared/types'
import {
  handleCORS,
  createErrorResponse,
  createSuccessResponse,
  createNotFoundResponse,
  getDbService,
  type AuthenticatedUser,
} from '../../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  const corsResponse = handleCORS(context.request, context.env)
  if (corsResponse) return corsResponse

  try {
    const db = getDbService(context)
    const userId = context.params.id

    if (!userId) {
      return createErrorResponse('Invalid user ID', 400)
    }

    if (context.request.method === 'GET') {
      // Get authenticated user from context (set by router)
      const authenticatedUser = context.data.user as AuthenticatedUser
      if (!authenticatedUser) {
        return createErrorResponse('Authentication required', 401)
      }

      // Users can only access their own profile or any profile if authenticated
      // Since you don't have public profiles, we'll allow authenticated users to view any profile
      const user = await db.getUserById(userId)
      if (!user) {
        return createNotFoundResponse('User not found')
      }
      return createSuccessResponse(user)
    }

    return createErrorResponse('Method not allowed', 405)
  } catch (error) {
    console.error('User by ID API Error:', error)
    return createErrorResponse(error)
  }
}
