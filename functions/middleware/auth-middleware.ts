// functions/_shared/auth-middleware.ts
import { getAuthenticatedUser, createErrorResponseWithCors, getDbService } from '../_shared/utils'
import type { EventContext, Env } from '../_shared/types'
import type { AuthResult } from '../_shared/types'



export async function requireAuth(
  context: EventContext<Env>
): Promise<AuthResult> {
  const user = await getAuthenticatedUser(context.request, context.env)
  
  if (!user) {
    return {
      success: false,
      response: createErrorResponseWithCors(
        'Authentication required',
        context.request,
        context.env,
        401
      )
    }
  }
  
  return { success: true, user }
}

export async function requirePetitionOwnership(
  context: EventContext<Env>,
  petitionId: number
): Promise<AuthResult> {
  const authResult = await requireAuth(context)
  if (!authResult.success) {
    return authResult
  }
  
  const db = getDbService(context)
  const petition = await db.getPetitionById(petitionId)
  
  if (!petition) {
    return {
      success: false,
      response: createErrorResponseWithCors(
        'Petition not found',
        context.request,
        context.env,
        404
      )
    }
  }
  
  if (petition.created_by !== authResult.user.id) {
    return {
      success: false,
      response: createErrorResponseWithCors(
        'You can only modify petitions you created',
        context.request,
        context.env,
        403
      )
    }
  }
  
  return authResult
}