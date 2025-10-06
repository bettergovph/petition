import type { Env, EventContext } from '../../../_shared/types'
import {
  handleCORS,
  createErrorResponse,
  createSuccessResponse,
  getDbService,
} from '../../../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  const corsResponse = handleCORS(context.request, context.env)
  if (corsResponse) return corsResponse

  try {
    const db = getDbService(context)
    const petitionId = parseInt(context.params.id)
    const url = new URL(context.request.url)

    if (isNaN(petitionId)) {
      return createErrorResponse('Invalid petition ID', 400)
    }

    if (context.request.method === 'GET') {
      const limit = parseInt(url.searchParams.get('limit') || '50')
      const offset = parseInt(url.searchParams.get('offset') || '0')

      const signatures = await db.getPetitionSignatures(petitionId, limit, offset)
      return createSuccessResponse(signatures)
    }

    return createErrorResponse('Method not allowed', 405)
  } catch (error) {
    console.error('Petition Signatures API Error:', error)
    return createErrorResponse(error)
  }
}
