/**
 * Email Encryption Utility
 *
 * Uses AES-256-GCM encryption to securely encrypt/decrypt email addresses
 * before storing them in the database. This provides an additional layer
 * of security for user privacy.
 */

export class EmailEncryption {
  private static readonly ALGORITHM = 'AES-GCM'
  private static readonly KEY_LENGTH = 256
  private static readonly IV_LENGTH = 12 // 96 bits for GCM

  /**
   * Derives an encryption key from the environment secret
   */
  private static async deriveKey(secret: string): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    )

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('petition-email-salt'), // Static salt for consistency
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    )
  }

  /**
   * Encrypts an email address
   */
  static async encrypt(email: string, encryptionKey: string): Promise<string> {
    try {
      const key = await this.deriveKey(encryptionKey)
      const encoder = new TextEncoder()
      const data = encoder.encode(email)

      // Generate random IV for each encryption
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH))

      const encrypted = await crypto.subtle.encrypt({ name: this.ALGORITHM, iv }, key, data)

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength)
      combined.set(iv)
      combined.set(new Uint8Array(encrypted), iv.length)

      // Return as base64 string
      return btoa(String.fromCharCode(...combined))
    } catch (error) {
      console.error('Email encryption failed:', error)
      throw new Error('Failed to encrypt email')
    }
  }

  /**
   * Decrypts an email address
   */
  static async decrypt(encryptedEmail: string, encryptionKey: string): Promise<string> {
    try {
      const key = await this.deriveKey(encryptionKey)

      // Decode from base64
      const combined = new Uint8Array(
        atob(encryptedEmail)
          .split('')
          .map(char => char.charCodeAt(0))
      )

      // Extract IV and encrypted data
      const iv = combined.slice(0, this.IV_LENGTH)
      const encrypted = combined.slice(this.IV_LENGTH)

      const decrypted = await crypto.subtle.decrypt({ name: this.ALGORITHM, iv }, key, encrypted)

      const decoder = new TextDecoder()
      return decoder.decode(decrypted)
    } catch (error) {
      console.error('Email decryption failed:', error)
      throw new Error('Failed to decrypt email')
    }
  }

  /**
   * Validates if a string is a valid encrypted email format
   */
  static isEncrypted(value: string): boolean {
    try {
      // Check if it's a valid base64 string with minimum length
      const decoded = atob(value)
      return decoded.length > this.IV_LENGTH
    } catch {
      return false
    }
  }

  /**
   * Safely encrypts email if encryption key is available
   * Falls back to original email if encryption fails or key is missing
   */
  static async safeEncrypt(email: string, encryptionKey?: string): Promise<string> {
    if (!encryptionKey) {
      console.warn('No encryption key provided, storing email in plaintext')
      return email
    }

    try {
      return await this.encrypt(email, encryptionKey)
    } catch (error) {
      console.error('Email encryption failed, falling back to plaintext:', error)
      return email
    }
  }

  /**
   * Safely decrypts email if it appears to be encrypted
   * Returns original value if decryption fails or value is not encrypted
   */
  static async safeDecrypt(emailValue: string, encryptionKey?: string): Promise<string> {
    if (!encryptionKey || !this.isEncrypted(emailValue)) {
      return emailValue
    }

    try {
      return await this.decrypt(emailValue, encryptionKey)
    } catch (error) {
      console.error('Email decryption failed, returning encrypted value:', error)
      return emailValue
    }
  }
}

/**
 * Utility functions for common email encryption operations
 */
export const emailUtils = {
  /**
   * Encrypts an email for database storage
   */
  encryptForStorage: async (
    email: string,
    env?: { EMAIL_ENCRYPTION_KEY?: string }
  ): Promise<string> => {
    return EmailEncryption.safeEncrypt(email, env?.EMAIL_ENCRYPTION_KEY)
  },

  /**
   * Decrypts an email from database storage
   */
  decryptFromStorage: async (
    encryptedEmail: string,
    env?: { EMAIL_ENCRYPTION_KEY?: string }
  ): Promise<string> => {
    return EmailEncryption.safeDecrypt(encryptedEmail, env?.EMAIL_ENCRYPTION_KEY)
  },

  /**
   * Checks if an email appears to be encrypted
   */
  isEncrypted: (email: string): boolean => {
    return EmailEncryption.isEncrypted(email)
  },
}
