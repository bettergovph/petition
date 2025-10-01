import { up } from '@auth/d1-adapter'
import type { Env } from '../_shared/types'

// Run Auth.js D1 migrations
export async function runAuthMigrations(env: Env): Promise<void> {
  try {
    console.log('Running Auth.js D1 migrations...')
    await up(env.DB)
    console.log('Auth.js D1 migrations completed successfully')
  } catch (error) {
    console.error('Auth.js migration error:', error)
    // Don't throw - migrations might have already been run
  }
}
