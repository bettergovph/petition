import type { Env, EventContext } from '../../../_shared/types'
import { 
  handleCORS, 
  createSuccessResponse, 
  createCachedErrorResponse,
  getDbService,
  invalidateCachePattern
} from '../../../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  const corsResponse = handleCORS(context.request, context.env)
  if (corsResponse) return corsResponse

  try {
    if (context.request.method !== 'POST') {
      return createCachedErrorResponse('Method not allowed', context.request, context.env, 405)
    }

    const db = getDbService(context)
    const petitionId = parseInt(context.params.id as string)

    if (isNaN(petitionId)) {
      return createCachedErrorResponse('Invalid petition ID', context.request, context.env, 400)
    }

    // Publish the petition
    const petition = await db.publishPetition(petitionId)
    
    // Invalidate petition caches when a petition is published
    console.log(`📢 Petition ${petitionId} published - invalidating petition caches`)
    await invalidateCachePattern('petitions:', context.env.CACHE)
    await invalidateCachePattern('petition:', context.env.CACHE)
    
    return createSuccessResponse(petition)
  } catch (error) {
    console.error('Publish petition API Error:', error)
    return createCachedErrorResponse(error, context.request, context.env)
  }
}
