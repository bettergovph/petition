import { describe, it, expect } from 'vitest'
import { updatePetitionSchema, formatZodError } from '../../functions/_shared/schemas'

describe('updatePetitionSchema', () => {
  describe('Happy Path - Valid Partial Updates', () => {
    it('should accept update with only title', () => {
      const validData = {
        title: 'Updated petition title here',
      }

      const result = updatePetitionSchema.safeParse(validData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({ title: 'Updated petition title here' })
      }
    })

    it('should accept update with only description', () => {
      const validData = {
        description:
          'This is an updated description that meets the minimum character requirement of 100 characters for validation.',
      }

      const result = updatePetitionSchema.safeParse(validData)

      expect(result.success).toBe(true)
    })

    it('should accept update with only status', () => {
      const validData = {
        status: 'completed' as const,
      }

      const result = updatePetitionSchema.safeParse(validData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({ status: 'completed' })
      }
    })

    it('should accept update with multiple fields', () => {
      const validData = {
        title: 'Updated petition title',
        target_count: 2000,
        status: 'active' as const,
      }

      const result = updatePetitionSchema.safeParse(validData)

      expect(result.success).toBe(true)
    })

    it('should accept empty update object', () => {
      const validData = {}

      const result = updatePetitionSchema.safeParse(validData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({})
      }
    })

    it('should accept update to local type with location', () => {
      const validData = {
        type: 'local' as const,
        location: 'Manila, Philippines',
      }

      const result = updatePetitionSchema.safeParse(validData)

      expect(result.success).toBe(true)
    })

    it('should allow updating to national type without location', () => {
      const validData = {
        type: 'national' as const,
      }

      const result = updatePetitionSchema.safeParse(validData)

      expect(result.success).toBe(true)
    })

    it('should accept all valid status values', () => {
      const statuses: Array<'active' | 'completed' | 'closed'> = ['active', 'completed', 'closed']

      statuses.forEach(status => {
        const result = updatePetitionSchema.safeParse({ status })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('Sad Path - Invalid Updates', () => {
    describe('Location Validation', () => {
      it('should reject update to local type without location', () => {
        const invalidData = {
          type: 'local' as const,
        }

        const result = updatePetitionSchema.safeParse(invalidData)

        expect(result.success).toBe(false)
        if (!result.success) {
          const errors = formatZodError(result.error)
          expect(errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'location',
                message: 'Location is required when changing petition type to local',
              }),
            ])
          )
        }
      })
    })

    describe('Status Validation', () => {
      it('should reject invalid status value', () => {
        const invalidData = {
          status: 'invalid',
        }

        const result = updatePetitionSchema.safeParse(invalidData)

        expect(result.success).toBe(false)
        if (!result.success) {
          const errors = formatZodError(result.error)
          expect(errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'status',
                message: 'Status must be one of: active, completed, closed',
              }),
            ])
          )
        }
      })
    })

    describe('Field Validation (Same Rules as Create)', () => {
      it('should reject title shorter than 10 characters', () => {
        const invalidData = {
          title: 'Too short',
        }

        const result = updatePetitionSchema.safeParse(invalidData)

        expect(result.success).toBe(false)
        if (!result.success) {
          const errors = formatZodError(result.error)
          expect(errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'title',
                message: 'Title must be at least 10 characters',
              }),
            ])
          )
        }
      })

      it('should reject description shorter than 100 characters', () => {
        const invalidData = {
          description: 'Too short',
        }

        const result = updatePetitionSchema.safeParse(invalidData)

        expect(result.success).toBe(false)
        if (!result.success) {
          const errors = formatZodError(result.error)
          expect(errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'description',
                message: 'Description must be at least 100 characters',
              }),
            ])
          )
        }
      })

      it('should reject invalid target_count', () => {
        const invalidData = {
          target_count: 0,
        }

        const result = updatePetitionSchema.safeParse(invalidData)

        expect(result.success).toBe(false)
        if (!result.success) {
          const errors = formatZodError(result.error)
          expect(errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'target_count',
                message: 'Target count must be at least 1',
              }),
            ])
          )
        }
      })
    })
  })
})
