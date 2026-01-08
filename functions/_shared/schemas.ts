import { z } from 'zod'

const basePetitionFields = {
  title: z
    .string({
      error: iss => (iss.input === undefined ? 'Title is required' : 'Title must be a string'),
    })
    .min(10, 'Title must be at least 10 characters')
    .max(150, 'Title must not exceed 150 characters')
    .trim(),

  description: z
    .string({
      error: iss =>
        iss.input === undefined ? 'Description is required' : 'Description must be a string',
    })
    .min(100, 'Description must be at least 100 characters')
    .trim(),

  type: z.enum(['local', 'national'], {
    error: iss =>
      iss.input === undefined
        ? 'Petition type is required'
        : 'Petition type must be either "local" or "national"',
  }),

  location: z
    .string({
      error: 'Location must be a string',
    })
    .trim()
    .optional(),

  target_count: z
    .number({
      error: 'Target count must be a number',
    })
    .int('Target count must be an integer')
    .min(1, 'Target count must be at least 1')
    .max(1000000, 'Target count must not exceed 1,000,000'),

  category_ids: z
    .array(
      z.number({
        error: 'Category ID must be a number',
      })
    )
    .optional(),

  image_url: z.string().optional(),
}

export const createPetitionSchema = z
  .object({
    ...basePetitionFields,
    target_count: basePetitionFields.target_count.default(1000),
    created_by: z.string(),
  })
  // validate location is required when type is 'local'
  .refine(
    data => {
      if (data.type === 'local') {
        return data.location !== undefined && data.location.length > 0
      }
      return true
    },
    {
      message: 'Location is required for local petitions',
      path: ['location'],
    }
  )

export type CreatePetitionRequest = z.input<typeof createPetitionSchema>
export type ValidatedPetitionData = z.output<typeof createPetitionSchema>

export const updatePetitionSchema = z
  .object({
    ...basePetitionFields,
    status: z
      .enum(['active', 'completed', 'closed'], {
        error: 'Status must be one of: active, completed, closed',
      })
      .optional(),
  })
  .partial()
  .refine(
    data => {
      if (data.type === 'local') {
        return data.location !== undefined && data.location.length > 0
      }
      return true
    },
    {
      message: 'Location is required when changing petition type to local',
      path: ['location'],
    }
  )

export type UpdatePetitionRequest = z.input<typeof updatePetitionSchema>
export type ValidatedUpdateData = z.output<typeof updatePetitionSchema>

export function formatZodError(error: z.ZodError): { field: string; message: string }[] {
  return error.issues.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message,
  }))
}
