import type {
  CreatePetitionInput,
  CreateSignatureInput,
  User,
  Petition,
  Signature,
  PetitionWithDetails,
  Category,
} from '@/types/api'

// API base URL - Vite Cloudflare plugin serves functions on same port
const API_BASE_URL = '' // Always use relative URLs - Vite plugin handles routing

// Simple in-memory cache for ETags
interface CacheEntry {
  data: unknown
  etag: string
  timestamp: number
  maxAge: number
}

const cache = new Map<string, CacheEntry>()

// Cache management utilities
export const cacheUtils = {
  clear: () => cache.clear(),
  delete: (key: string) => cache.delete(key),
  invalidatePattern: (pattern: string) => {
    const regex = new RegExp(pattern)
    for (const [key] of cache) {
      if (regex.test(key)) {
        cache.delete(key)
      }
    }
  },
  size: () => cache.size,
}

class ApiError extends Error {
  public status: number
  
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function getCacheKey(endpoint: string, options: RequestInit = {}): string {
  // Create a cache key based on endpoint and relevant options
  const method = options.method || 'GET'
  const body = options.body || ''
  return `${method}:${endpoint}:${body}`
}

function isCacheValid(entry: CacheEntry): boolean {
  const now = Date.now()
  return (now - entry.timestamp) < (entry.maxAge * 1000)
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const cacheKey = getCacheKey(endpoint, options)
  
  // Only use cache for GET requests
  if (!options.method || options.method === 'GET') {
    const cachedEntry = cache.get(cacheKey)
    if (cachedEntry && isCacheValid(cachedEntry)) {
      // Add If-None-Match header for ETag validation
      options.headers = {
        ...options.headers,
        'If-None-Match': cachedEntry.etag,
      }
    }
  }

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  // Handle 304 Not Modified - return cached data
  if (response.status === 304) {
    const cachedEntry = cache.get(cacheKey)
    if (cachedEntry) {
      // Type assertion: we trust that cached data matches the expected return type
      return cachedEntry.data as T
    }
  }

  if (!response.ok) {
    const errorText = await response.text()
    throw new ApiError(response.status, errorText || `HTTP ${response.status}`)
  }

  const data = await response.json()
  
  // Cache successful GET responses with ETag
  if ((!options.method || options.method === 'GET') && response.status === 200) {
    const etag = response.headers.get('ETag')
    const cacheControl = response.headers.get('Cache-Control')
    
    if (etag && cacheControl) {
      // Parse max-age from Cache-Control header
      const maxAgeMatch = cacheControl.match(/max-age=(\d+)/)
      const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1]) : 300 // Default 5 minutes
      
      cache.set(cacheKey, {
        data,
        etag,
        timestamp: Date.now(),
        maxAge,
      })
    }
  }

  return data as T
}

// User API
export const userApi = {
  async getById(id: number): Promise<User> {
    return apiRequest<User>(`/api/users/${id}`)
  },
}

// Petition API
export const petitionApi = {
  async create(petitionData: CreatePetitionInput): Promise<Petition> {
    const result = await apiRequest<Petition>('/api/petitions', {
      method: 'POST',
      body: JSON.stringify(petitionData),
    })
    
    // Invalidate petition list caches after creating a new petition
    cacheUtils.invalidatePattern('GET:/api/petitions')
    
    return result
  },

  async getById(id: number): Promise<PetitionWithDetails> {
    return apiRequest<PetitionWithDetails>(`/api/petitions/${id}`)
  },

  async getBySlug(slug: string): Promise<PetitionWithDetails> {
    return apiRequest<PetitionWithDetails>(`/api/petition/${slug}`)
  },

  async getAll(
    params: {
      limit?: number
      offset?: number
      type?: 'local' | 'national'
    } = {}
  ): Promise<PetitionWithDetails[]> {
    const searchParams = new URLSearchParams()

    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.offset) searchParams.set('offset', params.offset.toString())
    if (params.type) searchParams.set('type', params.type)

    return apiRequest<PetitionWithDetails[]>(`/api/petitions?${searchParams}`)
  },

  async getSignatures(
    petitionId: number,
    params: {
      limit?: number
      offset?: number
    } = {}
  ): Promise<Signature[]> {
    const searchParams = new URLSearchParams()

    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.offset) searchParams.set('offset', params.offset.toString())

    return apiRequest<Signature[]>(`/api/petitions/${petitionId}/signatures?${searchParams}`)
  },

  async getByUser(userId: string): Promise<Petition[]> {
    return apiRequest<Petition[]>(`/api/petitions?userId=${encodeURIComponent(userId)}`)
  },

  async update(id: number, petitionData: Partial<CreatePetitionInput>): Promise<Petition> {
    const result = await apiRequest<Petition>(`/api/petitions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(petitionData),
    })
    
    // Invalidate related caches after updating a petition
    cacheUtils.invalidatePattern('GET:/api/petitions')
    cacheUtils.delete(`GET:/api/petitions/${id}:`)
    
    return result
  },

  async publish(id: number): Promise<Petition> {
    const result = await apiRequest<Petition>(`/api/petition/${id}/publish`, {
      method: 'POST',
    })
    
    // Invalidate related caches after publishing a petition
    cacheUtils.invalidatePattern('GET:/api/petitions')
    cacheUtils.delete(`GET:/api/petitions/${id}:`)
    
    return result
  },

  async unpublish(id: number): Promise<Petition> {
    const result = await apiRequest<Petition>(`/api/petition/${id}/unpublish`, {
      method: 'POST',
    })
    
    // Invalidate related caches after unpublishing a petition
    cacheUtils.invalidatePattern('GET:/api/petitions')
    cacheUtils.delete(`GET:/api/petitions/${id}:`)
    
    return result
  },

  async delete(id: number): Promise<void> {
    await apiRequest<void>(`/api/petitions/${id}`, {
      method: 'DELETE',
    })
    
    // Invalidate all petition caches after deletion
    cacheUtils.invalidatePattern('GET:/api/petitions')
    cacheUtils.delete(`GET:/api/petitions/${id}:`)
  },
}

// Signature API
export const signatureApi = {
  async create(signatureData: CreateSignatureInput): Promise<Signature> {
    const result = await apiRequest<Signature>('/api/signatures', {
      method: 'POST',
      body: JSON.stringify(signatureData),
    })
    
    // Invalidate petition caches since signature count changed
    cacheUtils.invalidatePattern('GET:/api/petitions')
    cacheUtils.invalidatePattern('GET:/api/petition/')
    // Invalidate user signatures cache to refresh signed petition list
    cacheUtils.invalidatePattern('GET:/api/users/.*/signatures')
    
    return result
  },

  async getUserSignatures(): Promise<Signature[]> {
    // This endpoint actually returns petition IDs, not full signatures
    // We need a different endpoint for full signature data
    throw new Error('getUserSignatures not implemented - use getUserSignedPetitionIds instead')
  },

  async getUserSignedPetitionIds(userId: string): Promise<number[]> {
    return apiRequest<number[]>(`/api/users/${encodeURIComponent(userId)}/signatures`)
  },
}

// Category API
export const categoryApi = {
  async getAll(): Promise<Category[]> {
    return apiRequest<Category[]>('/api/categories')
  },

  async create(name: string, description?: string): Promise<Category> {
    return apiRequest<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    })
  },
}

// Report API
export const reportApi = {
  async create(data: {
    reported_item_type: 'petition' | 'signature'
    reported_item_id: number
    report_reason: string
    report_description?: string
  }): Promise<any> {
    return apiRequest('/api/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

export { ApiError }
