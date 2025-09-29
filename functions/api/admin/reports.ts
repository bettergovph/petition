import type { UpdateUserReportInput } from '../../../src/db/schemas/types'
import type { Env, EventContext } from '../../_shared/types'
import { 
  handleCORS, 
  createSuccessResponse, 
  createCachedResponse,
  createCachedErrorResponse,
  getDbService,
  type AuthenticatedUser
} from '../../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  const corsResponse = handleCORS(context.request, context.env)
  if (corsResponse) return corsResponse

  try {
    const db = getDbService(context)
    
    // Get authenticated user from context (set by router)
    const user = context.data.user as AuthenticatedUser
    if (!user) {
      return createCachedErrorResponse('Authentication required', context.request, context.env, 401)
    }
    
    // TODO: Add admin role check here when roles are implemented
    // For now, any authenticated user can access (you may want to restrict this)
    
    if (context.request.method === 'GET') {
      const url = new URL(context.request.url)
      const status = url.searchParams.get('status') as 'pending' | 'reviewed' | 'resolved' | 'dismissed' | null
      const limit = parseInt(url.searchParams.get('limit') || '50')
      const offset = parseInt(url.searchParams.get('offset') || '0')
      
      const reports = await db.getAllUserReports(limit, offset, status || undefined)
      
      // Enhance reports with additional context
      const enhancedReports = await Promise.all(reports.map(async (report) => {
        let reportedItem = null
        
        if (report.reported_item_type === 'petition') {
          const petition = await db.getPetitionById(report.reported_item_id)
          if (petition) {
            reportedItem = {
              type: 'petition',
              title: petition.title,
              slug: petition.slug,
              created_by: petition.created_by
            }
          }
        } else if (report.reported_item_type === 'signature') {
          const signature = await db.getSignatureById(report.reported_item_id)
          if (signature) {
            const petition = await db.getPetitionById(signature.petition_id)
            reportedItem = {
              type: 'signature',
              comment: signature.comment,
              petition_title: petition?.title,
              petition_slug: petition?.slug,
              user_id: signature.user_id
            }
          }
        }
        
        return {
          ...report,
          reported_item: reportedItem
        }
      }))
      
      // Cache for 2 minutes since reports don't change frequently
      return createCachedResponse(enhancedReports, context.request, context.env, 120)
    }
    
    if (context.request.method === 'PUT') {
      const reportId = parseInt(context.params.id as string)
      if (isNaN(reportId)) {
        return createCachedErrorResponse('Invalid report ID', context.request, context.env, 400)
      }
      
      const updateData = await context.request.json() as UpdateUserReportInput
      
      // Validate status if provided
      if (updateData.status && !['pending', 'reviewed', 'resolved', 'dismissed'].includes(updateData.status)) {
        return createCachedErrorResponse('Invalid status. Must be one of: pending, reviewed, resolved, dismissed', context.request, context.env, 400)
      }
      
      // Add the reviewing user's ID
      const updateWithReviewer: UpdateUserReportInput = {
        ...updateData,
        reviewed_by: user.id
      }
      
      const updatedReport = await db.updateUserReport(reportId, updateWithReviewer)
      
      if (!updatedReport) {
        return createCachedErrorResponse('Report not found', context.request, context.env, 404)
      }
      
      return createSuccessResponse(updatedReport)
    }

    return createCachedErrorResponse('Method not allowed', context.request, context.env, 405)
  } catch (error) {
    console.error('Admin Reports API Error:', error)
    return createCachedErrorResponse(error, context.request, context.env)
  }
}
