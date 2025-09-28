// Main Cloudflare Worker entry point - routes to individual functions
import type { Env, EventContext } from './_shared/types'

// Import individual function handlers
import { onRequest as uptimeHandler } from './api/uptime'
import { onRequest as userByIdHandler } from './api/users/[id]'
import { onRequest as userSignaturesHandler } from './api/users/[id]/signatures'
import { onRequest as userPetitionsHandler } from './api/users/[id]/petitions'
import { onRequest as petitionsHandler } from './api/petitions'
import { onRequest as petitionByIdHandler } from './api/petitions/[id]'
import { onRequest as petitionBySlugHandler } from './api/petition/[slug]'
import { onRequest as petitionSignaturesHandler } from './api/petitions/[id]/signatures'
import { onRequest as petitionPublishHandler } from './api/petition/[id]/publish'
import { onRequest as petitionUnpublishHandler } from './api/petition/[id]/unpublish'
import { onRequest as signaturesHandler } from './api/signatures'
import { onRequest as categoriesHandler } from './api/categories'
import { onRequest as authHandler } from './auth/[...auth]'
import { getCorsHeaders, handleCORS } from './_shared/utils'

function createContext(
  request: Request,
  env: Env,
  params: Record<string, string> = {}
): EventContext<Env> {
  return {
    request,
    env,
    params,
    waitUntil: () => {}, // Simplified for now
    next: async () => new Response('Not implemented', { status: 501 }),
    data: {},
  }
}

function parsePathParams(path: string, pattern: string): Record<string, string> {
  const pathParts = path.split('/').filter(p => p)
  const patternParts = pattern.split('/').filter(p => p)
  const params: Record<string, string> = {}

  for (let i = 0; i < patternParts.length; i++) {
    const part = patternParts[i]
    if (part.startsWith('[') && part.endsWith(']')) {
      const paramName = part.slice(1, -1)
      params[paramName] = pathParts[i] || ''
    }
  }

  return params
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    // Handle preflight OPTIONS requests
    const corsResponse = handleCORS(request, env)
    if (corsResponse) {
      return corsResponse
    }

    try {
      // Route to appropriate function handler

      // Auth routes - handle all /auth/* paths
      if (path.startsWith('/auth/')) {
        const response = await authHandler(createContext(request, env))
        // Add CORS headers to auth responses
        const corsHeaders = getCorsHeaders(request, env)
        Object.entries(corsHeaders).forEach(([key, value]) => {
          response.headers.set(key, value)
        })
        return response
      }

      if (path === '/api/uptime') {
        return await uptimeHandler(createContext(request, env))
      }


      if (path.match(/^\/api\/users\/[^/]+\/signatures$/)) {
        const params = parsePathParams(path, '/api/users/[id]/signatures')
        return await userSignaturesHandler(createContext(request, env, params))
      }

      if (path.match(/^\/api\/users\/[^/]+\/petitions$/)) {
        const params = parsePathParams(path, '/api/users/[id]/petitions')
        return await userPetitionsHandler(createContext(request, env, params))
      }

      if (path.match(/^\/api\/users\/[^/]+$/)) {
        const params = parsePathParams(path, '/api/users/[id]')
        return await userByIdHandler(createContext(request, env, params))
      }

      if (path === '/api/petitions') {
        return await petitionsHandler(createContext(request, env))
      }

      if (path.match(/^\/api\/petition\/[^/]+$/)) {
        const params = parsePathParams(path, '/api/petition/[slug]')
        return await petitionBySlugHandler(createContext(request, env, params))
      }

      if (path.match(/^\/api\/petition\/\d+\/publish$/)) {
        const params = parsePathParams(path, '/api/petition/[id]/publish')
        return await petitionPublishHandler(createContext(request, env, params))
      }

      if (path.match(/^\/api\/petition\/\d+\/unpublish$/)) {
        const params = parsePathParams(path, '/api/petition/[id]/unpublish')
        return await petitionUnpublishHandler(createContext(request, env, params))
      }

      if (path.match(/^\/api\/petitions\/\d+\/signatures$/)) {
        const params = parsePathParams(path, '/api/petitions/[id]/signatures')
        return await petitionSignaturesHandler(createContext(request, env, params))
      }

      if (path.match(/^\/api\/petitions\/\d+$/)) {
        const params = parsePathParams(path, '/api/petitions/[id]')
        return await petitionByIdHandler(createContext(request, env, params))
      }

      if (path === '/api/signatures') {
        return await signaturesHandler(createContext(request, env))
      }

      if (path === '/api/categories') {
        return await categoriesHandler(createContext(request, env))
      }

      // 404 for unmatched routes
      const corsHeaders = getCorsHeaders(request, env)
      return new Response('Not Found', {
        status: 404,
        headers: corsHeaders,
      })
    } catch (error: unknown) {
      console.error('Router Error:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      const corsHeaders = getCorsHeaders(request, env)
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      })
    }
  },
}
