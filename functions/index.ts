// Main Cloudflare Worker entry point with itty-router
import { AutoRouter } from 'itty-router'
import { withParams } from 'itty-router-extras'
import type { Env } from './_shared/types'
import { createContext } from './helpers/context'
import {
  wrapHandler,
  wrapHandlerWithAuth,
  wrapHandlerWithConditionalAuth,
  wrapHandlerWithOwnership,
} from './helpers/wrappers'

// Extend Request type to include params
declare global {
  interface Request {
    params?: Record<string, string>
  }
}

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
} from './_shared/utils'
// auth middleware used inside helpers/wrappers

// moved to ./helpers/context

// Create router with params middleware
const router = AutoRouter()

// Apply withParams middleware to all routes
router.all('*', withParams)

// wrappers moved to ./helpers/wrappers

// Auth routes - handle all /auth/* paths
router.all('/auth/*', async (request, env: Env) => {
  const response = await authHandler(createContext(request, env))
  // Add CORS headers to auth responses
  const corsHeaders = getCorsHeaders(request, env)
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
})

// Public routes (no authentication required)
router
  .get('/api/uptime', wrapHandler(uptimeHandler))
  .get('/api/petitions', wrapHandlerWithConditionalAuth(petitionsHandler))
  .get('/api/petition/:slug', wrapHandler(petitionBySlugHandler))
  .get('/api/petitions/:id', wrapHandler(petitionByIdHandler))
  .get('/api/petitions/:id/signatures', wrapHandler(petitionSignaturesHandler))
  .get('/api/categories', wrapHandler(categoriesHandler))

// Protected routes (authentication required)
router
  .post('/api/petitions', wrapHandlerWithAuth(petitionsHandler))
  .post('/api/signatures', wrapHandlerWithAuth(signaturesHandler))
  .post('/api/reports', wrapHandlerWithAuth(reportsHandler))
  .get('/api/users/:id', wrapHandlerWithAuth(userByIdHandler))
  .get('/api/users/:id/signatures', wrapHandlerWithAuth(userSignaturesHandler))
  .get('/api/users/:id/petitions', wrapHandlerWithAuth(userPetitionsHandler))

// Petition ownership routes (require petition ownership)
router
  .put('/api/petitions/:id', wrapHandlerWithOwnership(petitionByIdHandler))
  .delete('/api/petitions/:id', wrapHandlerWithOwnership(petitionByIdHandler))
  .post('/api/petition/:id/publish', wrapHandlerWithOwnership(petitionPublishHandler))
  .post('/api/petition/:id/unpublish', wrapHandlerWithOwnership(petitionUnpublishHandler))

// Admin routes
router
  .get('/api/admin/reports', wrapHandlerWithAuth(adminReportsHandler))
  .put('/api/admin/reports/:id', wrapHandlerWithAuth(adminReportsHandler))

// 404 handler
router.all('*', (request, env: Env) => {
  const corsHeaders = getCorsHeaders(request, env)
  return new Response('Not Found', {
    status: 404,
    headers: corsHeaders,
  })
})

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle preflight OPTIONS requests
    const corsResponse = handleCORS(request, env)
    if (corsResponse) {
      return corsResponse
    }

    try {
      return await router.fetch(request, env)
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