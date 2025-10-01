import type { CreateUserReportInput } from '../../src/db/schemas/types'
import type { Env, EventContext } from '../_shared/types'
import {
  handleCORS,
  createErrorResponse,
  createSuccessResponse,
  getDbService,
  type AuthenticatedUser,
} from '../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  const corsResponse = handleCORS(context.request, context.env)
  if (corsResponse) return corsResponse

  try {
    const db = getDbService(context)

    if (context.request.method === 'POST') {
      // Get authenticated user from context (set by router)
      const user = context.data.user as AuthenticatedUser
      if (!user) {
        return createErrorResponse('Authentication required', 401)
      }

      const reportData = (await context.request.json()) as Omit<
        CreateUserReportInput,
        'reporter_user_id'
      >

      // Validate required fields
      if (
        !reportData.reported_item_type ||
        !reportData.reported_item_id ||
        !reportData.report_reason
      ) {
        return createErrorResponse(
          'Missing required fields: reported_item_type, reported_item_id, report_reason',
          400
        )
      }

      // Validate reported_item_type
      if (!['petition', 'signature'].includes(reportData.reported_item_type)) {
        return createErrorResponse(
          'Invalid reported_item_type. Must be "petition" or "signature"',
          400
        )
      }

      // Validate report_reason
      const validReasons = [
        'spam',
        'inappropriate_content',
        'harassment',
        'misinformation',
        'hate_speech',
        'violence',
        'copyright_violation',
        'other',
      ]
      if (!validReasons.includes(reportData.report_reason)) {
        return createErrorResponse(
          `Invalid report_reason. Must be one of: ${validReasons.join(', ')}`,
          400
        )
      }

      // Verify the reported item exists
      if (reportData.reported_item_type === 'petition') {
        const petition = await db.getPetitionById(reportData.reported_item_id)
        if (!petition) {
          return createErrorResponse('Petition not found', 404)
        }
      } else if (reportData.reported_item_type === 'signature') {
        const signature = await db.getSignatureById(reportData.reported_item_id)
        if (!signature) {
          return createErrorResponse('Signature not found', 404)
        }
      }

      // Create the report with the authenticated user's ID
      const reportWithUser: CreateUserReportInput = {
        ...reportData,
        reporter_user_id: user.id,
      }

      try {
        const report = await db.createUserReport(reportWithUser)
        return createSuccessResponse(report)
      } catch (error) {
        // Handle duplicate report error
        if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
          return createErrorResponse('You have already reported this item', 409)
        }
        throw error
      }
    }

    return createErrorResponse('Method not allowed', 405)
  } catch (error) {
    console.error('Reports API Error:', error)
    return createErrorResponse(error)
  }
}
