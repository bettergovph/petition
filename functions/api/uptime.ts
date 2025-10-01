import type { Env, EventContext } from '../_shared/types'
import { createSuccessResponse, createErrorResponse } from '../_shared/utils'

export const onRequest = async (context: EventContext<Env>): Promise<Response> => {
  try {
    const testKey = 'test:uptime'
    const testValue = { timestamp: Date.now(), message: 'KV test' }

    console.log('🧪 Testing KV namespace...')

    // Test KV write
    await context.env.CACHE.put(testKey, JSON.stringify(testValue), { expirationTtl: 60 })
    console.log('✅ KV write successful')

    // Test KV read
    const retrieved = await context.env.CACHE.get(testKey, 'json')
    console.log('✅ KV read successful:', retrieved)

    // Clean up
    await context.env.CACHE.delete(testKey)
    console.log('✅ KV delete successful')

    return createSuccessResponse({
      message: 'Functions and KV are working!',
      kvTest: 'passed',
      testData: retrieved,
    })
  } catch (error) {
    console.error('❌ KV test failed:', error)
    return createErrorResponse({
      message: 'Functions working but KV failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      kvTest: 'failed',
    })
  }
}
