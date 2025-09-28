import { DatabaseService } from '../../src/db/service'
import type { Env, EventContext } from './types'

// CORS configuration with environment-aware origin validation
export function getCorsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin')

  // Define allowed origins based on environment
  const productionOrigins = ['https://petition.ph', 'https://www.petition.ph']

  const developmentOrigins = [
    'http://localhost:3000',
    'http://localhost:5173', // Vite default
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8080',
  ]

  // Determine if we're in production (check for production environment variable)
  const isProduction =
    env.ENVIRONMENT === 'production' || env.NODE_ENV === 'production' ? true : false

  // In production, only allow production origins
  // In development, allow both production and development origins
  const allowedOrigins = isProduction
    ? productionOrigins
    : [...productionOrigins, ...developmentOrigins]

  // Check if the origin is allowed
  const allowedOrigin = allowedOrigins.includes(origin || '') ? origin : null

  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': allowedOrigin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  }

  return headers
}

// Legacy corsHeaders for backward compatibility (deprecated)
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export function handleCORS(request: Request, env: Env): Response | null {
  if (request.method === 'OPTIONS') {
    const corsHeaders = getCorsHeaders(request, env)
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }
  return null
}

// New CORS-aware response functions
export function createErrorResponseWithCors(
  error: unknown,
  request: Request,
  env: Env,
  status: number = 500
): Response {
  const message = error instanceof Error ? error.message : 'Unknown error'
  const corsHeaders = getCorsHeaders(request, env)
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export function createSuccessResponseWithCors(data: unknown, request: Request, env: Env): Response {
  const corsHeaders = getCorsHeaders(request, env)
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export function createNotFoundResponseWithCors(
  request: Request,
  env: Env,
  message: string = 'Not found'
): Response {
  const corsHeaders = getCorsHeaders(request, env)
  return new Response(message, {
    status: 404,
    headers: corsHeaders,
  })
}

// Backward-compatible functions (deprecated - use WithCors versions)
export function createErrorResponse(error: unknown, status: number = 500): Response {
  const message = error instanceof Error ? error.message : 'Unknown error'
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export function createSuccessResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export function createNotFoundResponse(message: string = 'Not found'): Response {
  return new Response(message, {
    status: 404,
    headers: corsHeaders,
  })
}

export function getDbService(context: EventContext<Env>): DatabaseService {
  return new DatabaseService(context.env.DB)
}

// ETag and caching utilities
export function generateETag(data: unknown): string {
  // Simple hash function for ETag generation
  const str = JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return `"${Math.abs(hash).toString(36)}"`
}

export function createCachedResponse(
  data: unknown,
  request: Request,
  env: Env,
  cacheMaxAge: number = 300 // 5 minutes default
): Response {
  const corsHeaders = getCorsHeaders(request, env)
  const etag = generateETag(data)

  // Check if client has matching ETag
  const clientETag = request.headers.get('If-None-Match')
  if (clientETag === etag) {
    return new Response(null, {
      status: 304, // Not Modified
      headers: {
        ...corsHeaders,
        ETag: etag,
        'Cache-Control': `public, max-age=${cacheMaxAge}`,
      },
    })
  }

  return new Response(JSON.stringify(data), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      ETag: etag,
      'Cache-Control': `public, max-age=${cacheMaxAge}`,
      'Last-Modified': new Date().toUTCString(),
    },
  })
}

export function createCachedErrorResponse(
  error: unknown,
  request: Request,
  env: Env,
  status: number = 500
): Response {
  const message = error instanceof Error ? error.message : 'Unknown error'
  const corsHeaders = getCorsHeaders(request, env)

  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}

// KV Cache utilities
export function generateCacheKey(request: Request, prefix: string = 'api'): string {
  const url = new URL(request.url)
  const path = url.pathname
  const searchParams = url.searchParams
  
  // Sort search params for consistent cache keys
  const params: [string, string][] = []
  searchParams.forEach((value, key) => {
    params.push([key, value])
  })
  
  const sortedParams = params
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
  
  const cacheKey = `${prefix}:${path}${sortedParams ? `?${sortedParams}` : ''}`
  return cacheKey
}

export async function getCachedData<T>(
  cacheKey: string,
  kv: KVNamespace
): Promise<T | null> {
  try {
    console.log(`🔍 Checking KV for key: ${cacheKey}`)
    if (!kv) {
      console.error(`🚨 KV namespace is undefined for key: ${cacheKey}`)
      return null
    }
    
    const cached = await kv.get(cacheKey, 'json')
    if (cached !== null) {
      console.log(`🎯 Cache HIT for key: ${cacheKey}`)
      return cached as T | null
    } else {
      console.log(`❌ Cache MISS for key: ${cacheKey}`)
      return null
    }
  } catch (error) {
    console.error(`🚨 KV Cache get error for key ${cacheKey}:`, error)
    if (error instanceof Error) {
      console.error(`🚨 Error details:`, error.message, error.stack)
    }
    return null
  }
}

export async function setCachedData<T>(
  cacheKey: string,
  data: T,
  kv: KVNamespace,
  ttlSeconds: number = 300 // 5 minutes default
): Promise<void> {
  try {
    console.log(`🔄 Attempting to serialize data for key: ${cacheKey}`)
    const serializedData = JSON.stringify(data)
    const dataSize = new Blob([serializedData]).size
    console.log(`📏 Data size: ${dataSize} bytes for key: ${cacheKey}`)
    
    if (dataSize > 25 * 1024 * 1024) { // 25MB limit
      console.warn(`⚠️ Data too large for KV storage: ${dataSize} bytes for key: ${cacheKey}`)
      return
    }
    
    console.log(`🔄 Putting data in KV for key: ${cacheKey}`)
    await kv.put(cacheKey, serializedData, {
      expirationTtl: ttlSeconds,
    })
    console.log(`💾 Cache SET for key: ${cacheKey} (TTL: ${ttlSeconds}s, Size: ${dataSize} bytes)`)
  } catch (error) {
    console.error(`🚨 KV Cache set error for key ${cacheKey}:`, error)
    if (error instanceof Error) {
      console.error(`🚨 Error details:`, error.message, error.stack)
    }
    // Don't throw - caching failures shouldn't break the API
  }
}

export async function invalidateCachePattern(
  pattern: string,
  kv: KVNamespace
): Promise<void> {
  try {
    // List keys matching the pattern
    const keys = await kv.list({ prefix: pattern })
    
    if (keys.keys.length > 0) {
      console.log(`🗑️ Cache INVALIDATE: Found ${keys.keys.length} keys matching pattern "${pattern}"`)
      
      // Delete all matching keys
      const deletePromises = keys.keys.map(key => {
        console.log(`🗑️ Deleting cache key: ${key.name}`)
        return kv.delete(key.name)
      })
      await Promise.all(deletePromises)
      
      console.log(`✅ Cache INVALIDATE: Successfully deleted ${keys.keys.length} keys`)
    } else {
      console.log(`ℹ️ Cache INVALIDATE: No keys found matching pattern "${pattern}"`)
    }
  } catch (error) {
    console.error(`🚨 KV Cache invalidation error for pattern ${pattern}:`, error)
    // Don't throw - cache invalidation failures shouldn't break the API
  }
}

export async function getOrSetCache<T>(
  cacheKey: string,
  kv: KVNamespace,
  dataFetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  
  // Try to get from cache first
  const cached = await getCachedData<T>(cacheKey, kv)
  if (cached !== null) {
    return cached
  }
  
  // If not in cache, fetch the data
  const startTime = Date.now()
  const data = await dataFetcher()
  const fetchTime = Date.now() - startTime
  console.log(`📊 Database query completed in ${fetchTime}ms for key: ${cacheKey}`)
  
  // Store in cache for next time (temporarily await to debug issues)
  console.log(`🔄 Attempting to cache data for key: ${cacheKey}`)
  try {
    await setCachedData(cacheKey, data, kv, ttlSeconds)
    console.log(`✅ Successfully cached data for key: ${cacheKey}`)
  } catch (error) {
    console.error(`❌ Failed to cache data for key ${cacheKey}:`, error)
  }
  
  return data
}
