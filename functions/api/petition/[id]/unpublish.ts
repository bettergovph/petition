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
    const db = getDbService(context)
    const petitionId = parseInt(context.params.id as string)

    if (isNaN(petitionId)) {
      return createCachedErrorResponse('Invalid petition ID', context.request, context.env, 400)
    }

    if (context.request.method === 'POST') {
      // Unpublish petition by setting published_at to NULL
      await db.unpublishPetition(petitionId)
      
      // Get updated petition
      const updatedPetition = await db.getPetitionById(petitionId)
      
      if (!updatedPetition) {
        return createCachedErrorResponse('Petition not found', context.request, context.env, 404)
      }
      
      // Invalidate all petition caches when a petition is unpublished
      console.log(`📤 Petition ${petitionId} unpublished - invalidating petition caches`)
      await invalidateCachePattern('petitions:', context.env.CACHE)
      await invalidateCachePattern('petition:', context.env.CACHE)
      
      return createSuccessResponse(updatedPetition)
    }

    return createCachedErrorResponse('Method not allowed', context.request, context.env, 405)
  } catch (error) {
    console.error('Unpublish Petition API Error:', error)
    return createCachedErrorResponse(error, context.request, context.env)
  }
}
