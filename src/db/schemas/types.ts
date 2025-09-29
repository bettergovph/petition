// SERVER-ONLY TYPES - DO NOT IMPORT IN CLIENT CODE
// Use types from src/types/api.ts for client-side code

export interface User {
  id: string // Auth.js compatible TEXT PRIMARY KEY
  name?: string // Auth.js user name field
  email: string
  emailVerified?: string // Auth.js field
  image?: string // Auth.js user image field
  createdAt: string // Auth.js standard timestamp field
  updatedAt: string // Auth.js standard timestamp field
}

export interface Petition {
  id: number
  title: string
  description: string
  type: 'local' | 'national'
  image_url?: string
  target_count: number
  current_count: number
  status: 'active' | 'completed' | 'closed'
  location?: string // for local petitions
  slug: string
  due_date: string
  published_at?: string // NULL if unpublished, timestamp if published
  created_by: string // Changed from number to string
  created_at: string
  updated_at: string
}

export interface Signature {
  id: number
  petition_id: number
  user_id: string // Changed from number to string
  comment?: string
  anonymous: boolean
  ip_address?: string
  created_at: string
}

export interface Category {
  id: number
  name: string
  description?: string
  created_at: string
}

export interface PetitionCategory {
  petition_id: number
  category_id: number
}


export interface CreatePetitionInput {
  title: string
  description: string
  type: 'local' | 'national'
  image_url?: string
  target_count?: number
  location?: string
  due_date?: string // Optional, will default to 60 days from now
  created_by: string // Changed from number to string
  category_ids?: number[]
  status?: 'active' | 'completed' | 'closed' // Optional, defaults to 'active'
}

export interface CreateSignatureInput {
  petition_id: number
  user_id: string // Changed from number to string
  comment?: string
  anonymous?: boolean
  ip_address?: string
}

export interface PetitionWithDetails extends Petition {
  creator: Pick<User, 'name'>
  categories: Category[]
}

export interface UserReport {
  id: number
  reporter_user_id: string
  reported_item_type: 'petition' | 'signature'
  reported_item_id: number
  report_reason: 'spam' | 'inappropriate_content' | 'harassment' | 'misinformation' | 'hate_speech' | 'violence' | 'copyright_violation' | 'other'
  report_description?: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  admin_notes?: string
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
  updated_at: string
}

export interface CreateUserReportInput {
  reported_item_type: 'petition' | 'signature'
  reported_item_id: number
  report_reason: 'spam' | 'inappropriate_content' | 'harassment' | 'misinformation' | 'hate_speech' | 'violence' | 'copyright_violation' | 'other'
  report_description?: string
  reporter_user_id: string
}

export interface UpdateUserReportInput {
  status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  admin_notes?: string
  reviewed_by?: string
}
