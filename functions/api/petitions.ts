import type { CreatePetitionInput } from '../../src/db/schemas/types'
import type { Env, EventContext } from '../_shared/types'
import {
  handleCORS,
  createSuccessResponse,
  createCachedResponse,
  createCachedErrorResponse,
  getDbService,
  generateCacheKey,
  getOrSetCache,
  invalidateCachePattern,
  type AuthenticatedUser,
} from '../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  const corsResponse = handleCORS(context.request, context.env)
  if (corsResponse) return corsResponse

  try {
    const db = getDbService(context)
    const url = new URL(context.request.url)

    if (context.request.method === 'POST') {
      // Get authenticated user from context (set by router)
      const user = context.data.user as AuthenticatedUser
      if (!user) {
        return createCachedErrorResponse(
          'Authentication required',
          context.request,
          context.env,
          401
        )
      }

      // Check if this is a multipart form (with image) or JSON
      const contentType = context.request.headers.get('content-type') || ''

      let petitionData: CreatePetitionInput
      let imageFile: File | null = null

      if (contentType.includes('multipart/form-data')) {
        // Handle form data with potential image
        const formData = await context.request.formData()

        // Extract petition data from form
        petitionData = {
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          type: formData.get('type') as 'local' | 'national',
          location: (formData.get('location') as string) || undefined,
          target_count: parseInt(formData.get('target_count') as string),
          created_by: user.id, // Use authenticated user's ID
          category_ids: JSON.parse((formData.get('category_ids') as string) || '[]'),
          image_url: '', // Will be set after upload
        }

        // Get image file if provided
        imageFile = formData.get('image') as File | null
      } else {
        // Handle JSON data (no image)
        petitionData = await context.request.json()
        // Ensure the petition is created by the authenticated user
        petitionData.created_by = user.id
      }

      // Step 1: Create petition record first (without image_url)
      const petition = await db.createPetition({
        ...petitionData,
        image_url: '', // Start with empty image_url
      })

      // Step 2: If image provided, upload to R2 and update petition
      if (imageFile && imageFile.size > 0) {
        try {
          // Generate organized file path: petitions/{petition_id}/image.{extension}
          const extension = imageFile.name.split('.').pop() || 'jpg'
          const filename = `petitions/${petition.id}/image.${extension}`

          // Upload to R2
          const arrayBuffer = await imageFile.arrayBuffer()
          await context.env.IMAGES.put(filename, arrayBuffer, {
            httpMetadata: {
              contentType: imageFile.type,
              cacheControl: 'public, max-age=31536000', // 1 year cache
            },
            customMetadata: {
              petitionId: petition.id.toString(),
              originalName: imageFile.name,
              uploadedAt: new Date().toISOString(),
              size: imageFile.size.toString(),
            },
          })

          // Generate public URL - for now using a placeholder
          // TODO: Configure custom domain or get proper R2 public URL
          const imageUrl = `https://images.petition.ph/${filename}`

          // Step 3: Update petition with image URL
          await db.updatePetition(petition.id, { image_url: imageUrl })

          // Update the petition object to return
          petition.image_url = imageUrl

          console.log(`✅ Image uploaded for petition ${petition.id}: ${filename}`)
        } catch (error) {
          console.error(`❌ Failed to upload image for petition ${petition.id}:`, error)
          // Don't fail the petition creation if image upload fails
          // The petition is already created, just without an image
        }
      }

      // Invalidate petition caches when a new petition is created
      console.log(`🆕 New petition created - invalidating all petition caches`)
      await invalidateCachePattern('petitions:', context.env.CACHE)

      return createSuccessResponse(petition)
    }

    if (context.request.method === 'GET') {
      const type = url.searchParams.get('type') as 'local' | 'national' | undefined
      const limit = parseInt(url.searchParams.get('limit') || '50')
      const offset = parseInt(url.searchParams.get('offset') || '0')
      const userId = url.searchParams.get('userId')

      // Generate cache key for this request
      const cacheKey = generateCacheKey(context.request, 'petitions')

      // If userId is provided, get petitions for specific user
      if (userId) {
        // Get authenticated user from context (set by router when userId param is present)
        const authenticatedUser = context.data.user as AuthenticatedUser
        if (!authenticatedUser) {
          return createCachedErrorResponse(
            'Authentication required for user-specific petitions',
            context.request,
            context.env,
            401
          )
        }

        const petitions = await getOrSetCache(
          cacheKey,
          context.env.CACHE,
          () => db.getUserPetitions(userId),
          5 * 60 // Cache for 5 minutes
        )
        return createCachedResponse(petitions, context.request, context.env, 5 * 60)
      }

      // Otherwise get all petitions
      const petitions = await getOrSetCache(
        cacheKey,
        context.env.CACHE,
        () => db.getAllPetitions(limit, offset, type),
        5 * 60 // Cache for 5 minutes
      )
      return createCachedResponse(petitions, context.request, context.env, 5 * 60)
    }

    return createCachedErrorResponse('Method not allowed', context.request, context.env, 405)
  } catch (error) {
    console.error('Petitions API Error:', error)
    return createCachedErrorResponse(error, context.request, context.env)
  }
}
