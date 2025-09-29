import type { CreateSignatureInput } from '../../src/db/schemas/types'
import type { Env, EventContext } from '../_shared/types'
import { 
  handleCORS, 
  createErrorResponse, 
  createSuccessResponse, 
  getDbService,
  invalidateCachePattern,
  type AuthenticatedUser
} from '../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  const corsResponse = handleCORS(context.request, context.env)
  if (corsResponse) return corsResponse

  try {
    const db = getDbService(context)
    
    if (context.request.method === 'POST') {
      const signatureData: CreateSignatureInput = await context.request.json()
      
      // Get authenticated user from context (set by router)
      const user = context.data.user as AuthenticatedUser
      if (!user) {
        return createErrorResponse('Authentication required', 401)
      }
      
      // Ensure the signature is created for the authenticated user
      const signatureWithUser: CreateSignatureInput = {
        ...signatureData,
        user_id: user.id
      }
      
      const signature = await db.createSignature(signatureWithUser)
      
      // Invalidate petition caches when a new signature is created
      // This ensures petition counts are updated immediately
      console.log(`✍️ New signature created for petition ${signatureData.petition_id} - invalidating petition caches`)
      await invalidateCachePattern('petitions:', context.env.CACHE)
      
      return createSuccessResponse(signature)
    }

    return createErrorResponse('Method not allowed', 405)
  } catch (error) {
    console.error('Signatures API Error:', error)
    return createErrorResponse(error)
  }
}