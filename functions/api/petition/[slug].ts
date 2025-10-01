import type { Env, EventContext } from '../../_shared/types'
import {
  handleCORS,
  createCachedResponse,
  createCachedErrorResponse,
  getDbService,
} from '../../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  const corsResponse = handleCORS(context.request, context.env)
  if (corsResponse) return corsResponse

  try {
    const db = getDbService(context)
    const slug = context.params.slug

    if (!slug || slug.trim() === '') {
      return createCachedErrorResponse('Invalid petition slug', context.request, context.env, 400)
    }

    if (context.request.method === 'GET') {
      const petition = await db.getPetitionBySlug(slug)
      if (!petition) {
        return createCachedErrorResponse('Petition not found', context.request, context.env, 404)
      }
      // Cache petition by slug for 10 minutes (accessed frequently)
      return createCachedResponse(petition, context.request, context.env, 600)
    }

    return createCachedErrorResponse('Method not allowed', context.request, context.env, 405)
  } catch (error) {
    console.error('Petition by slug API Error:', error)
    return createCachedErrorResponse(error, context.request, context.env)
  }
}
