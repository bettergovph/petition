// Client-side API types - these mirror the database types but are separate
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
  location?: string
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

export interface PetitionWithDetails extends Petition {
  creator: Pick<User, 'name' | 'email'>
  categories: Category[]
  signature_count: number
}

// Input types for API requests
export interface CreateUserInput {
  name?: string
  email: string
  emailVerified?: string
  image?: string
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
}

export interface CreateSignatureInput {
  petition_id: number
  user_id: string // Changed from number to string
  comment?: string
  anonymous?: boolean
  ip_address?: string
}
