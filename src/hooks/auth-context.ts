import { createContext } from 'react'
import type { AuthContextType } from './auth-types'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
