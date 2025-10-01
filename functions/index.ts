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
import { onRequest as reportsHandler } from './api/reports'
import { onRequest as adminReportsHandler } from './api/admin/reports'
import { onRequest as authHandler } from './auth/[...auth]'
import {
  getCorsHeaders,
  handleCORS,
  requireAuthentication,
  requirePetitionOwnership,
} from './_shared/utils'

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
        // Require authentication for user signatures
        const authResult = await requireAuthentication(request, env)
        if (authResult instanceof Response) {
          return authResult
        }
        const context = createContext(request, env, params)
        context.data.user = authResult.user
        return await userSignaturesHandler(context)
      }

      if (path.match(/^\/api\/users\/[^/]+\/petitions$/)) {
        const params = parsePathParams(path, '/api/users/[id]/petitions')
        // Require authentication for user petitions
        const authResult = await requireAuthentication(request, env)
        if (authResult instanceof Response) {
          return authResult
        }
        const context = createContext(request, env, params)
        context.data.user = authResult.user
        return await userPetitionsHandler(context)
      }

      if (path.match(/^\/api\/users\/[^/]+$/)) {
        const params = parsePathParams(path, '/api/users/[id]')
        // Require authentication for user profiles
        const authResult = await requireAuthentication(request, env)
        if (authResult instanceof Response) {
          return authResult
        }
        const context = createContext(request, env, params)
        context.data.user = authResult.user
        return await userByIdHandler(context)
      }

      if (path === '/api/petitions') {
        const url = new URL(request.url)
        const userId = url.searchParams.get('userId')

        // Require authentication for POST (creating petitions) or GET with userId parameter
        if (request.method === 'POST' || userId) {
          const authResult = await requireAuthentication(request, env)
          if (authResult instanceof Response) {
            return authResult
          }
          // Add user to context for the handler
          const context = createContext(request, env)
          context.data.user = authResult.user
          return await petitionsHandler(context)
        }
        return await petitionsHandler(createContext(request, env))
      }

      if (path.match(/^\/api\/petition\/[^/]+$/)) {
        const params = parsePathParams(path, '/api/petition/[slug]')
        return await petitionBySlugHandler(createContext(request, env, params))
      }

      if (path.match(/^\/api\/petition\/\d+\/publish$/)) {
        const params = parsePathParams(path, '/api/petition/[id]/publish')
        // Require petition ownership for publishing
        const petitionId = parseInt(params.id)
        const authResult = await requirePetitionOwnership(request, env, petitionId)
        if (authResult instanceof Response) {
          return authResult
        }
        const context = createContext(request, env, params)
        context.data.user = authResult.user
        return await petitionPublishHandler(context)
      }

      if (path.match(/^\/api\/petition\/\d+\/unpublish$/)) {
        const params = parsePathParams(path, '/api/petition/[id]/unpublish')
        // Require petition ownership for unpublishing
        const petitionId = parseInt(params.id)
        const authResult = await requirePetitionOwnership(request, env, petitionId)
        if (authResult instanceof Response) {
          return authResult
        }
        const context = createContext(request, env, params)
        context.data.user = authResult.user
        return await petitionUnpublishHandler(context)
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
        // Require authentication for POST (creating signatures)
        if (request.method === 'POST') {
          const authResult = await requireAuthentication(request, env)
          if (authResult instanceof Response) {
            return authResult
          }
          const context = createContext(request, env)
          context.data.user = authResult.user
          return await signaturesHandler(context)
        }
        return await signaturesHandler(createContext(request, env))
      }

      if (path === '/api/categories') {
        return await categoriesHandler(createContext(request, env))
      }

      if (path === '/api/reports') {
        // Require authentication for reporting
        const authResult = await requireAuthentication(request, env)
        if (authResult instanceof Response) {
          return authResult
        }
        const context = createContext(request, env)
        context.data.user = authResult.user
        return await reportsHandler(context)
      }

      if (path === '/api/admin/reports') {
        // Require authentication for admin reports
        const authResult = await requireAuthentication(request, env)
        if (authResult instanceof Response) {
          return authResult
        }
        const context = createContext(request, env)
        context.data.user = authResult.user
        return await adminReportsHandler(context)
      }

      if (path.match(/^\/api\/admin\/reports\/\d+$/)) {
        const params = parsePathParams(path, '/api/admin/reports/[id]')
        // Require authentication for admin report updates
        const authResult = await requireAuthentication(request, env)
        if (authResult instanceof Response) {
          return authResult
        }
        const context = createContext(request, env, params)
        context.data.user = authResult.user
        return await adminReportsHandler(context)
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
