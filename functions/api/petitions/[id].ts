import type { Env, EventContext } from '../../_shared/types'
import {
  handleCORS,
  createSuccessResponse,
  createCachedResponse,
  createCachedErrorResponse,
  createValidationErrorResponse,
  getDbService,
  invalidateCachePattern,
  generateCacheKey,
  getOrSetCache,
} from '../../_shared/utils'
import {
  getStringField,
  getIntegerField,
  getJsonArrayField,
  getFileField,
} from '../../_shared/form-data-parser'
import {
  updatePetitionSchema,
  formatZodError,
  type UpdatePetitionRequest,
  type ValidatedUpdateData,
} from '../../_shared/schemas'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  const corsResponse = handleCORS(context.request, context.env)
  if (corsResponse) return corsResponse

  try {
    const db = getDbService(context)
    const petitionId = parseInt(context.params.id as string)

    if (isNaN(petitionId)) {
      return createCachedErrorResponse('Invalid petition ID', context.request, context.env, 400)
    }

    if (context.request.method === 'GET') {
      // Generate cache key for this specific petition
      const cacheKey = generateCacheKey(context.request, 'petition')

      const petition = await getOrSetCache(
        cacheKey,
        context.env.CACHE,
        async () => {
          const result = await db.getPetitionById(petitionId)
          if (!result) {
            throw new Error('Petition not found')
          }
          return result
        },
        10 * 60 // Cache for 10 minutes
      )

      return createCachedResponse(petition, context.request, context.env, 10 * 60)
    }

    if (context.request.method === 'PUT') {
      // Check if this is a multipart form (with image) or JSON
      const contentType = context.request.headers.get('content-type') || ''

      let petitionData: UpdatePetitionRequest
      let imageFile: File | undefined = undefined

      if (contentType.includes('multipart/form-data')) {
        // Handle form data with potential image
        const formData = await context.request.formData()

        const title = getStringField(formData, 'title')
        const description = getStringField(formData, 'description')
        const type = getStringField(formData, 'type')
        const location = getStringField(formData, 'location')
        const targetCount = getIntegerField(formData, 'target_count')
        const categoryIds = getJsonArrayField<number>(formData, 'category_ids')
        const status = getStringField(formData, 'status')

        // Construct and only include fields that were provided
        petitionData = {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(type !== undefined && { type: type as 'local' | 'national' }),
          ...(location !== undefined && { location }),
          ...(targetCount !== undefined && { target_count: targetCount }),
          ...(categoryIds !== undefined && { category_ids: categoryIds }),
          ...(status !== undefined && { status: status as 'active' | 'completed' | 'closed' }),
        }

        // Get image file if provided
        imageFile = getFileField(formData, 'image')
      } else {
        // Handle JSON data (no image)
        petitionData = await context.request.json()
      }

      const validationResult = updatePetitionSchema.safeParse(petitionData)
      if (!validationResult.success) {
        const formattedErrors = formatZodError(validationResult.error)
        return createValidationErrorResponse(formattedErrors, context.request, context.env)
      }

      // Use validated data
      const validatedData: ValidatedUpdateData = validationResult.data

      // Step 1: Update petition record first
      const updatedPetition = await db.updatePetition(petitionId, validatedData)

      // Step 2: If image provided, upload to R2 and update petition
      if (imageFile && imageFile.size > 0) {
        try {
          // Generate organized file path: petitions/{petition_id}/image.{extension}
          const extension = imageFile.name.split('.').pop() || 'jpg'
          const filename = `petitions/${petitionId}/image.${extension}`

          // Upload to R2
          const arrayBuffer = await imageFile.arrayBuffer()
          await context.env.IMAGES.put(filename, arrayBuffer, {
            httpMetadata: {
              contentType: imageFile.type,
              cacheControl: 'public, max-age=31536000', // 1 year cache
            },
            customMetadata: {
              petitionId: petitionId.toString(),
              originalName: imageFile.name,
              uploadedAt: new Date().toISOString(),
              size: imageFile.size.toString(),
            },
          })

          // Generate public URL - for now using a placeholder
          // TODO: Configure custom domain or get proper R2 public URL
          const imageUrl = `https://images.petition.ph/${filename}`

          // Step 3: Update petition with image URL
          await db.updatePetition(petitionId, { image_url: imageUrl })

          // Update the petition object to return
          updatedPetition.image_url = imageUrl

          console.log(`✅ Image uploaded for petition ${petitionId}: ${filename}`)
        } catch (error) {
          console.error(`❌ Failed to upload image for petition ${petitionId}:`, error)
          // Don't fail the petition update if image upload fails
        }
      }

      // Invalidate all petition caches when a petition is updated
      console.log(`📝 Petition ${petitionId} updated - invalidating petition caches`)
      await invalidateCachePattern('petitions:', context.env.CACHE)
      await invalidateCachePattern('petition:', context.env.CACHE)

      return createSuccessResponse(updatedPetition)
    }

    if (context.request.method === 'DELETE') {
      // Delete petition
      await db.deletePetition(petitionId)

      // Invalidate all petition caches when a petition is deleted
      console.log(`🗑️ Petition ${petitionId} deleted - invalidating petition caches`)
      await invalidateCachePattern('petitions:', context.env.CACHE)
      await invalidateCachePattern('petition:', context.env.CACHE)

      return createSuccessResponse({ message: 'Petition deleted successfully' })
    }

    return createCachedErrorResponse('Method not allowed', context.request, context.env, 405)
  } catch (error) {
    console.error('Petition API Error:', error)
    return createCachedErrorResponse(error, context.request, context.env)
  }
}
