/**
 * Custom D1 Adapter with Email Encryption
 *
 * Extends the standard Auth.js D1 adapter to automatically encrypt
 * email addresses before storing them in the database.
 */

import { D1Adapter } from '@auth/d1-adapter'
import type { Adapter, AdapterUser } from '@auth/core/adapters'
import { emailUtils } from '../../src/utils/encryption'
import type { Env } from '../_shared/types'

export function EncryptedD1Adapter(database: D1Database, env?: Env): Adapter {
  // Get the base D1 adapter
  const baseAdapter = D1Adapter(database)

  // Override methods to encrypt emails before storage
  const originalCreateUser = baseAdapter.createUser
  const originalUpdateUser = baseAdapter.updateUser

  return {
    ...baseAdapter,

    async createUser(user) {
      console.log('🔐 Creating user with encrypted email')

      // Encrypt email before creating user
      const encryptedEmail = await emailUtils.encryptForStorage(user.email, env)

      const userWithEncryptedEmail = {
        ...user,
        email: encryptedEmail,
      }

      return await originalCreateUser!(userWithEncryptedEmail)
    },

    async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, 'id'>): Promise<AdapterUser> {
      if (!originalUpdateUser) return user as AdapterUser

      // If email is being updated, encrypt it
      let userToUpdate = user
      if (user.email) {
        console.log('🔐 Updating user with encrypted email')
        const encryptedEmail = await emailUtils.encryptForStorage(user.email, env)
        userToUpdate = {
          ...user,
          email: encryptedEmail,
        }
      }

      return await originalUpdateUser(userToUpdate)
    },
  }
}
