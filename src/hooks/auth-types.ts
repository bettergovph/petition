export interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

export interface Session {
  user: User
  expires: string
}

export interface AuthContextType {
  session: Session | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  signIn: (provider: 'google' | 'facebook') => Promise<void>
  signOut: () => Promise<void>
}
