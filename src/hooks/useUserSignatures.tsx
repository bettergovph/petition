import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './useAuth'
import { signatureApi } from '../services/api'

// Cookie utilities for caching signatures
const SIGNATURES_COOKIE_KEY = 'user_signatures'
const COOKIE_EXPIRY_DAYS = 1 // Cache for 1 day

const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

const getCookie = (name: string): string | null => {
  const nameEQ = name + "="
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}

export function useUserSignatures() {
  const { session, status } = useAuth()
  const [signedPetitionIds, setSignedPetitionIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize from cookie cache immediately when user ID is available
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      const userId = session.user.id
      const userCookieKey = `${SIGNATURES_COOKIE_KEY}_${userId}`
      const cachedData = getCookie(userCookieKey)
      
      if (cachedData) {
        try {
          const petitionIds = JSON.parse(cachedData) as number[]
          setSignedPetitionIds(new Set(petitionIds))
          console.log('🚀 Instantly loaded user signatures from cookie cache')
        } catch (err) {
          console.warn('Failed to parse cached signatures on init')
        }
      }
    }
  }, [session?.user?.id, status])

  const loadUserSignatures = useCallback(async (forceRefresh = false) => {
    if (status !== 'authenticated' || !session?.user?.id) {
      setSignedPetitionIds(new Set())
      deleteCookie(SIGNATURES_COOKIE_KEY)
      return
    }

    const userId = session.user.id
    if (!userId || typeof userId !== 'string') {
      setError('Invalid user ID')
      return
    }

    // Create a unique cookie key for this user
    const userCookieKey = `${SIGNATURES_COOKIE_KEY}_${userId}`

    // Try to load from cookie first (unless forcing refresh)
    if (!forceRefresh) {
      const cachedData = getCookie(userCookieKey)
      if (cachedData) {
        try {
          const petitionIds = JSON.parse(cachedData) as number[]
          setSignedPetitionIds(new Set(petitionIds))
          console.log('✅ Loaded user signatures from cookie cache')
          return
        } catch (err) {
          console.warn('Failed to parse cached signatures, fetching fresh data')
        }
      }
    }

    // Fetch from API if no cache or forcing refresh
    try {
      setLoading(true)
      setError(null)
      
      const petitionIds = await signatureApi.getUserSignedPetitionIds(userId)
      setSignedPetitionIds(new Set(petitionIds))
      
      // Cache the result in cookie
      setCookie(userCookieKey, JSON.stringify(petitionIds), COOKIE_EXPIRY_DAYS)
      console.log('✅ Fetched and cached user signatures from API')
    } catch (err) {
      console.error('Failed to load user signatures:', err)
      setError(err instanceof Error ? err.message : 'Failed to load signatures')
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id, status])

  // Load signatures when user authentication status changes
  // Use a ref to prevent duplicate calls during rapid re-renders
  const lastLoadedUserIdRef = useRef<string | null>(null)
  
  useEffect(() => {
    const currentUserId = session?.user?.id || null
    
    // If user logged out, clear the signatures and cookies
    if (status !== 'authenticated' || !currentUserId) {
      setSignedPetitionIds(new Set())
      // Clean up any old cookies
      if (lastLoadedUserIdRef.current) {
        const oldUserCookieKey = `${SIGNATURES_COOKIE_KEY}_${lastLoadedUserIdRef.current}`
        deleteCookie(oldUserCookieKey)
      }
      lastLoadedUserIdRef.current = null
      return
    }
    
    // If user changed or first load, fetch signatures
    if (currentUserId !== lastLoadedUserIdRef.current) {
      lastLoadedUserIdRef.current = currentUserId
      loadUserSignatures()
    }
  }, [session?.user?.id, status, loadUserSignatures])

  // Check if user has signed a specific petition
  const hasSignedPetition = useCallback((petitionId: number): boolean => {
    return signedPetitionIds.has(petitionId)
  }, [signedPetitionIds])

  // Add a petition to the signed list (for optimistic updates)
  const addSignedPetition = useCallback((petitionId: number) => {
    setSignedPetitionIds(prev => {
      const newSet = new Set([...prev, petitionId])
      
      // Update cookie cache immediately for optimistic updates
      if (session?.user?.id) {
        const userCookieKey = `${SIGNATURES_COOKIE_KEY}_${session.user.id}`
        setCookie(userCookieKey, JSON.stringify(Array.from(newSet)), COOKIE_EXPIRY_DAYS)
      }
      
      return newSet
    })
  }, [session?.user?.id])

  // Remove a petition from the signed list (if unsigning is implemented)
  const removeSignedPetition = useCallback((petitionId: number) => {
    setSignedPetitionIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(petitionId)
      
      // Update cookie cache immediately
      if (session?.user?.id) {
        const userCookieKey = `${SIGNATURES_COOKIE_KEY}_${session.user.id}`
        setCookie(userCookieKey, JSON.stringify(Array.from(newSet)), COOKIE_EXPIRY_DAYS)
      }
      
      return newSet
    })
  }, [session?.user?.id])

  // Refresh signatures (useful after signing a petition)
  // Force refresh from API and update cache
  const refreshSignatures = useCallback(() => {
    // Only refresh if not currently loading to prevent duplicate calls
    if (!loading) {
      loadUserSignatures(true) // Force refresh from API
    }
  }, [loadUserSignatures, loading])

  return {
    signedPetitionIds: Array.from(signedPetitionIds),
    hasSignedPetition,
    addSignedPetition,
    removeSignedPetition,
    refreshSignatures,
    loading,
    error,
    isAuthenticated: status === 'authenticated'
  }
}
