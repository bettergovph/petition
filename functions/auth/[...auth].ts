import { Auth } from '@auth/core'
import { createAuthConfig } from './config'
import { getCorsHeaders } from '../_shared/utils'
import type { EventContext } from '../_shared/types'
import type { Env } from '../_shared/types'

export async function onRequest(context: EventContext<Env>): Promise<Response> {
  const { request, env } = context

  try {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(request, env),
      })
    }

    const response = await Auth(request, createAuthConfig(env))

    // Clone response and add CORS headers
    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...responseHeaders,
        ...getCorsHeaders(request, env),
      },
    })

    return newResponse
  } catch (error) {
    console.error('Auth error:', error)

    const url = new URL(request.url)
    const action = url.pathname.split('/').pop()

    // Log specific error details
    if (error instanceof Error) {
      console.error('Auth error details:', {
        message: error.message,
        action: action,
        method: request.method,
        pathname: url.pathname,
      })

      // Handle specific error cases
      if (error.message.includes('UnknownAction')) {
        console.error('Auth UnknownAction error for action:', action)
        return new Response(
          JSON.stringify({
            error: `Unknown auth action: ${action}`,
            supportedActions: ['signin', 'signout', 'session', 'csrf', 'callback'],
          }),
          {
            status: 405,
            headers: {
              'Content-Type': 'application/json',
              ...getCorsHeaders(request, env),
            },
          }
        )
      }
    }

    return new Response(
      JSON.stringify({
        error: 'Authentication error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(request, env),
        },
      }
    )
  }
}
