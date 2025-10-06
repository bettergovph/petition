import { createContext } from 'react'
import type { ModalContextType } from './modal-types'

export const ModalContext = createContext<ModalContextType | undefined>(undefined)
