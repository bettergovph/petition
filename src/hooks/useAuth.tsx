import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from './auth-types'
import { AuthContext } from './auth-context'

export type { User, Session }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')

  useEffect(() => {
    // Check for existing session on mount
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/auth/session')
      if (response.ok) {
        const sessionData = (await response.json()) as Session | null
        if (sessionData?.user) {
          setSession(sessionData)
          setStatus('authenticated')
        } else {
          setStatus('unauthenticated')
        }
      } else {
        setStatus('unauthenticated')
      }
    } catch (error) {
      console.error('Session check failed:', error)
      setStatus('unauthenticated')
    }
  }

  const signIn = async (provider: 'google' | 'facebook') => {
    try {
      // First get the CSRF token
      const csrfResponse = await fetch('/auth/csrf')
      const csrfData = (await csrfResponse.json()) as { csrfToken: string }
      const { csrfToken } = csrfData

      // Create a form to POST to signin with CSRF protection
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = `/auth/signin/${provider}`

      // Add CSRF token
      const csrfInput = document.createElement('input')
      csrfInput.type = 'hidden'
      csrfInput.name = 'csrfToken'
      csrfInput.value = csrfToken
      form.appendChild(csrfInput)

      // Add callback URL - avoid redirect loops by never redirecting back to auth pages
      const callbackInput = document.createElement('input')
      callbackInput.type = 'hidden'
      callbackInput.name = 'callbackUrl'

      // If current page is an auth page, redirect to home, otherwise stay on current page
      const currentPath = window.location.pathname
      const isAuthPage = currentPath.startsWith('/auth/')
      callbackInput.value = isAuthPage ? window.location.origin : window.location.href

      form.appendChild(callbackInput)

      // Submit the form
      document.body.appendChild(form)
      form.submit()
    } catch (error) {
      console.error('Sign in failed:', error)
    }
  }

  const signOut = async () => {
    try {
      // Get CSRF token for sign out
      const csrfResponse = await fetch('/auth/csrf')
      const csrfData = (await csrfResponse.json()) as { csrfToken: string }
      const { csrfToken } = csrfData

      // Create a form to POST to signout with CSRF protection
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = '/auth/signout'

      // Add CSRF token
      const csrfInput = document.createElement('input')
      csrfInput.type = 'hidden'
      csrfInput.name = 'csrfToken'
      csrfInput.value = csrfToken
      form.appendChild(csrfInput)

      // Add callback URL to redirect after sign out
      const callbackInput = document.createElement('input')
      callbackInput.type = 'hidden'
      callbackInput.name = 'callbackUrl'
      callbackInput.value = window.location.origin
      form.appendChild(callbackInput)

      // Submit the form
      document.body.appendChild(form)
      form.submit()
    } catch (error) {
      console.error('Sign out failed:', error)
      // Fallback: clear local state and redirect
      setSession(null)
      setStatus('unauthenticated')
      window.location.href = '/'
    }
  }

  return (
    <AuthContext.Provider value={{ session, status, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
