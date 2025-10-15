// Centralized validation schemas
import { z } from 'zod'

// Base schemas
export const IdParamSchema = z.string().regex(/^\d+$/, 'Invalid ID format').transform(Number)
export const SlugSchema = z.string().min(1, 'Slug is required').max(100, 'Slug too long')
export const PaginationSchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1).max(100)), 
  offset: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(0))
})

// Petition schemas
export const CreatePetitionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description too long'),
  type: z.enum(['local', 'national'], { errorMap: () => ({ message: 'Type must be "local" or "national"' }) }),
  image_url: z.string().url().optional(),
  target_count: z.number().min(1, 'Target count must be at least 1').max(1000000, 'Target count too high').optional(),
  location: z.string().max(100, 'Location too long').optional(),
  due_date: z.string().datetime().optional(),
  category_ids: z.array(z.number()).max(5, 'Maximum 5 categories allowed').optional()
})

export const UpdatePetitionSchema = CreatePetitionSchema.partial()

// Signature schemas
export const CreateSignatureSchema = z.object({
  petition_id: z.number().positive('Invalid petition ID'),
  comment: z.string().max(1000, 'Comment too long').optional(),
  anonymous: z.boolean().optional()
})

// Report schemas
export const CreateReportSchema = z.object({
  reported_item_type: z.enum(['petition', 'signature'], { 
    errorMap: () => ({ message: 'Reported item type must be "petition" or "signature"' }) 
  }),
  reported_item_id: z.number().positive('Invalid reported item ID'),
  report_reason: z.enum([
    'spam', 'inappropriate_content', 'harassment', 'misinformation', 
    'hate_speech', 'violence', 'copyright_violation', 'other'
  ], { errorMap: () => ({ message: 'Invalid report reason' }) }),
  report_description: z.string().max(1000, 'Description too long').optional()
})

export const UpdateReportSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'resolved', 'dismissed']).optional(),
  admin_notes: z.string().max(1000, 'Admin notes too long').optional()
})

// Category schemas
export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name too long'),
  description: z.string().max(200, 'Description too long').optional()
})

// Query parameter schemas
export const PetitionQuerySchema = z.object({
  type: z.enum(['local', 'national']).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1).max(100)).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(0)).optional(),
  userId: z.string().optional()
})

export const ReportQuerySchema = z.object({
  status: z.enum(['pending', 'reviewed', 'resolved', 'dismissed']).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1).max(100)).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(0)).optional()
})