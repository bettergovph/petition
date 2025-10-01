import type { Env, EventContext } from '../_shared/types'
import {
  handleCORS,
  createErrorResponseWithCors,
  createSuccessResponseWithCors,
  createCachedResponse,
  getDbService,
} from '../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  const corsResponse = handleCORS(context.request, context.env)
  if (corsResponse) return corsResponse

  try {
    const db = getDbService(context)

    if (context.request.method === 'GET') {
      const categories = await db.getAllCategories()
      // Cache categories for 15 minutes (they rarely change)
      return createCachedResponse(categories, context.request, context.env, 900)
    }

    if (context.request.method === 'POST') {
      const body = (await context.request.json()) as { name: string; description?: string }
      if (!body.name) {
        return createErrorResponseWithCors(
          'Category name is required',
          context.request,
          context.env,
          400
        )
      }
      const category = await db.createCategory(body.name, body.description)
      return createSuccessResponseWithCors(category, context.request, context.env)
    }

    return createErrorResponseWithCors('Method not allowed', context.request, context.env, 405)
  } catch (error) {
    console.error('Categories API Error:', error)
    return createErrorResponseWithCors(error, context.request, context.env)
  }
}
