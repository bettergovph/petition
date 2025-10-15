import type { Env, EventContext } from '../_shared/types'

export function createContext(
  request: Request,
  env: Env,
  params: Record<string, string> = {}
): EventContext<Env> {
  return {
    request,
    env,
    params,
    waitUntil: () => {},
    next: async () => new Response('Not implemented', { status: 501 }),
    data: {},
  }
}


