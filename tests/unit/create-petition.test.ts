import { describe, it, expect } from 'vitest'
import { createPetitionSchema, formatZodError } from '../../functions/_shared/schemas'

describe('createPetitionSchema', () => {
  describe('Happy Path - Valid Data', () => {
    it('should accept valid national petition with all fields', () => {
      const validData = {
        title: 'This is a valid petition title',
        description:
          'This is a valid description that meets the minimum character requirement of 100 characters. It contains enough text to pass validation.',
        type: 'national' as const,
        location: 'Philippines',
        target_count: 5000,
        created_by: 'user123',
        category_ids: [1, 2, 3],
        image_url: 'https://example.com/image.jpg',
      }

      const result = createPetitionSchema.safeParse(validData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('should accept valid local petition with location', () => {
      const validData = {
        title: 'Valid local petition title here',
        description:
          'This is a valid description for a local petition that meets the minimum character requirement of 100 characters in total.',
        type: 'local' as const,
        location: 'Manila, Philippines',
        created_by: 'user456',
      }

      const result = createPetitionSchema.safeParse(validData)

      expect(result.success).toBe(true)
    })

    it('should accept valid array of category IDs', () => {
      const validData = {
        title: 'Valid petition title',
        description:
          'This is a valid description that meets the minimum character requirement of 100 characters for testing.',
        type: 'national' as const,
        created_by: 'user123',
        category_ids: [1, 2, 3, 4],
      }

      const result = createPetitionSchema.safeParse(validData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.category_ids).toEqual([1, 2, 3, 4])
      }
    })

    it('should accept empty category_ids array', () => {
      const validData = {
        title: 'Valid petition title',
        description:
          'This is a valid description that meets the minimum character requirement of 100 characters for testing.',
        type: 'national' as const,
        created_by: 'user123',
        category_ids: [],
      }

      const result = createPetitionSchema.safeParse(validData)

      expect(result.success).toBe(true)
    })

    it('should apply default target_count of 1000 when not provided', () => {
      const validData = {
        title: 'Valid petition title',
        description:
          'This description is long enough to meet the minimum requirement of 100 characters for petition descriptions.',
        type: 'national' as const,
        created_by: 'user789',
      }

      const result = createPetitionSchema.safeParse(validData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.target_count).toBe(1000)
      }
    })

    it('should allow national petition without location', () => {
      const validData = {
        title: 'Valid national petition',
        description:
          'This is a valid description that meets the minimum character requirement of 100 characters for testing.',
        type: 'national' as const,
        created_by: 'user123',
      }

      const result = createPetitionSchema.safeParse(validData)

      expect(result.success).toBe(true)
    })
  })

  describe('Sad Path - Invalid Data', () => {
    describe('Title Validation', () => {
      it('should reject title shorter than 10 characters', () => {
        const invalidData = {
          title: 'Too short',
          description:
            'This is a valid description that meets the minimum character requirement of 100 characters for testing.',
          type: 'national' as const,
          created_by: 'user123',
        }

        const result = createPetitionSchema.safeParse(invalidData)

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

      it('should reject title longer than 150 characters', () => {
        const invalidData = {
          title: 'A'.repeat(151),
          description:
            'This is a valid description that meets the minimum character requirement of 100 characters for testing.',
          type: 'national' as const,
          created_by: 'user123',
        }

        const result = createPetitionSchema.safeParse(invalidData)

        expect(result.success).toBe(false)
        if (!result.success) {
          const errors = formatZodError(result.error)
          expect(errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'title',
                message: 'Title must not exceed 150 characters',
              }),
            ])
          )
        }
      })

      it('should reject missing title', () => {
        const invalidData = {
          description:
            'This is a valid description that meets the minimum character requirement of 100 characters for testing.',
          type: 'national' as const,
          created_by: 'user123',
        }

        const result = createPetitionSchema.safeParse(invalidData)

        expect(result.success).toBe(false)
        if (!result.success) {
          const errors = formatZodError(result.error)
          expect(errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'title',
                message: 'Title is required',
              }),
            ])
          )
        }
      })

      it('should reject non-string title', () => {
        const invalidData = {
          title: 12345,
          description:
            'This is a valid description that meets the minimum character requirement of 100 characters for testing.',
          type: 'national' as const,
          created_by: 'user123',
        }

        const result = createPetitionSchema.safeParse(invalidData)

        expect(result.success).toBe(false)
        if (!result.success) {
          const errors = formatZodError(result.error)
          expect(errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'title',
                message: 'Title must be a string',
              }),
            ])
          )
        }
      })
    })

    describe('Description Validation', () => {
      it('should reject description shorter than 100 characters', () => {
        const invalidData = {
          title: 'Valid petition title',
          description: 'This description is too short.',
          type: 'national' as const,
          created_by: 'user123',
        }

        const result = createPetitionSchema.safeParse(invalidData)

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

      it('should reject missing description', () => {
        const invalidData = {
          title: 'Valid petition title',
          type: 'national' as const,
          created_by: 'user123',
        }

        const result = createPetitionSchema.safeParse(invalidData)

        expect(result.success).toBe(false)
        if (!result.success) {
          const errors = formatZodError(result.error)
          expect(errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'description',
                message: 'Description is required',
              }),
            ])
          )
        }
      })
    })

    describe('Type Validation', () => {
      it('should reject invalid petition type', () => {
        const invalidData = {
          title: 'Valid petition title',
          description:
            'This is a valid description that meets the minimum character requirement of 100 characters for testing.',
          type: 'invalid',
          created_by: 'user123',
        }

        const result = createPetitionSchema.safeParse(invalidData)

        expect(result.success).toBe(false)
        if (!result.success) {
          const errors = formatZodError(result.error)
          expect(errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'type',
                message: 'Petition type must be either "local" or "national"',
              }),
            ])
          )
        }
      })

      it('should reject missing type', () => {
        const invalidData = {
          title: 'Valid petition title',
          description:
            'This is a valid description that meets the minimum character requirement of 100 characters for testing.',
          created_by: 'user123',
        }

        const result = createPetitionSchema.safeParse(invalidData)

        expect(result.success).toBe(false)
        if (!result.success) {
          const errors = formatZodError(result.error)
          expect(errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'type',
                message: 'Petition type is required',
              }),
            ])
          )
        }
      })
    })

    describe('Location Validation', () => {
      it('should reject local petition without location', () => {
        const invalidData = {
          title: 'Valid local petition title',
          description:
            'This is a valid description that meets the minimum character requirement of 100 characters for testing.',
          type: 'local' as const,
          created_by: 'user123',
        }

        const result = createPetitionSchema.safeParse(invalidData)

        expect(result.success).toBe(false)
        if (!result.success) {
          const errors = formatZodError(result.error)
          expect(errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'location',
                message: 'Location is required for local petitions',
              }),
            ])
          )
        }
      })

      it('should reject local petition with empty location', () => {
        const invalidData = {
          title: 'Valid local petition title',
          description:
            'This is a valid description that meets the minimum character requirement of 100 characters for testing.',
          type: 'local' as const,
          location: '',
          created_by: 'user123',
        }

        const result = createPetitionSchema.safeParse(invalidData)

        expect(result.success).toBe(false)
        if (!result.success) {
          const errors = formatZodError(result.error)
          expect(errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'location',
                message: 'Location is required for local petitions',
              }),
            ])
          )
        }
      })
    })

    describe('Target Count Validation', () => {
      it('should reject negative target_count', () => {
        const invalidData = {
          title: 'Valid petition title',
          description:
            'This is a valid description that meets the minimum character requirement of 100 characters for testing.',
          type: 'national' as const,
          target_count: -100,
          created_by: 'user123',
        }

        const result = createPetitionSchema.safeParse(invalidData)

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

      it('should reject zero target_count', () => {
        const invalidData = {
          title: 'Valid petition title',
          description:
            'This is a valid description that meets the minimum character requirement of 100 characters for testing.',
          type: 'national' as const,
          target_count: 0,
          created_by: 'user123',
        }

        const result = createPetitionSchema.safeParse(invalidData)

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

      it('should reject target_count exceeding 1,000,000', () => {
        const invalidData = {
          title: 'Valid petition title',
          description:
            'This is a valid description that meets the minimum character requirement of 100 characters for testing.',
          type: 'national' as const,
          target_count: 1000001,
          created_by: 'user123',
        }

        const result = createPetitionSchema.safeParse(invalidData)

        expect(result.success).toBe(false)
        if (!result.success) {
          const errors = formatZodError(result.error)
          expect(errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'target_count',
                message: 'Target count must not exceed 1,000,000',
              }),
            ])
          )
        }
      })

      it('should reject non-integer target_count', () => {
        const invalidData = {
          title: 'Valid petition title',
          description:
            'This is a valid description that meets the minimum character requirement of 100 characters for testing.',
          type: 'national' as const,
          target_count: 1000.5,
          created_by: 'user123',
        }

        const result = createPetitionSchema.safeParse(invalidData)

        expect(result.success).toBe(false)
        if (!result.success) {
          const errors = formatZodError(result.error)
          expect(errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'target_count',
                message: 'Target count must be an integer',
              }),
            ])
          )
        }
      })

      it('should reject non-number target_count', () => {
        const invalidData = {
          title: 'Valid petition title',
          description:
            'This is a valid description that meets the minimum character requirement of 100 characters for testing.',
          type: 'national' as const,
          target_count: '1000' as unknown as number,
          created_by: 'user123',
        }

        const result = createPetitionSchema.safeParse(invalidData)

        expect(result.success).toBe(false)
        if (!result.success) {
          const errors = formatZodError(result.error)
          expect(errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'target_count',
                message: 'Target count must be a number',
              }),
            ])
          )
        }
      })

      it('should reject NaN target_count', () => {
        const invalidData = {
          title: 'Valid petition title',
          description:
            'This is a valid description that meets the minimum character requirement of 100 characters for testing.',
          type: 'national' as const,
          target_count: NaN,
          created_by: 'user123',
        }

        const result = createPetitionSchema.safeParse(invalidData)

        expect(result.success).toBe(false)
      })
    })

    describe('Category IDs Validation', () => {
      it('should reject category_ids with non-number elements', () => {
        const invalidData = {
          title: 'Valid petition title',
          description:
            'This is a valid description that meets the minimum character requirement of 100 characters for testing.',
          type: 'national' as const,
          created_by: 'user123',
          category_ids: [1, '2', 3] as unknown as number[],
        }

        const result = createPetitionSchema.safeParse(invalidData)

        expect(result.success).toBe(false)
        if (!result.success) {
          const errors = formatZodError(result.error)
          expect(errors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'category_ids.1',
                message: 'Category ID must be a number',
              }),
            ])
          )
        }
      })
    })
  })

  describe('Edge Cases', () => {
    it('should trim whitespace from title and description', () => {
      const dataWithWhitespace = {
        title: '  Valid petition title  ',
        description:
          '  This description has leading and trailing whitespace but is still long enough to meet the requirements.  ',
        type: 'national' as const,
        created_by: 'user999',
      }

      const result = createPetitionSchema.safeParse(dataWithWhitespace)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe('Valid petition title')
        expect(result.data.description).not.toMatch(/^\s|\s$/)
      }
    })
  })
})

describe('formatZodError', () => {
  it('should format single error correctly', () => {
    const invalidData = {
      type: 'national' as const,
      created_by: 'user123',
    }

    const result = createPetitionSchema.safeParse(invalidData)

    if (!result.success) {
      const formatted = formatZodError(result.error)
      expect(formatted).toBeInstanceOf(Array)
      expect(formatted.length).toBeGreaterThan(0)
      expect(formatted[0]).toHaveProperty('field')
      expect(formatted[0]).toHaveProperty('message')
    }
  })

  it('should format multiple errors correctly', () => {
    const invalidData = {
      type: 'invalid',
      target_count: -1,
    }

    const result = createPetitionSchema.safeParse(invalidData)

    if (!result.success) {
      const formatted = formatZodError(result.error)
      expect(formatted.length).toBeGreaterThan(1)
      formatted.forEach(error => {
        expect(error).toHaveProperty('field')
        expect(error).toHaveProperty('message')
        expect(typeof error.field).toBe('string')
        expect(typeof error.message).toBe('string')
      })
    }
  })

  it('should handle nested field paths', () => {
    const invalidData = {
      title: 'Valid petition title',
      description:
        'This is a valid description that meets the minimum character requirement of 100 characters for testing.',
      type: 'national' as const,
      created_by: 'user123',
      category_ids: [1, 'invalid', 3] as unknown as number[],
    }

    const result = createPetitionSchema.safeParse(invalidData)

    if (!result.success) {
      const formatted = formatZodError(result.error)
      const categoryError = formatted.find(e => e.field.startsWith('category_ids'))
      expect(categoryError).toBeDefined()
      expect(categoryError?.field).toBe('category_ids.1')
    }
  })
})
