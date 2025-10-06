import { useState } from 'react'
import type { ReactNode } from 'react'
import SignInModal from '@/components/auth/SignInModal'
import { ModalContext } from './modal-context'
import type { SignInModalOptions, ModalState } from './modal-types'

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<ModalState>({
    signIn: {
      isOpen: false,
      options: {},
    },
  })

  const showSignInModal = (options: SignInModalOptions = {}) => {
    setModalState(prev => ({
      ...prev,
      signIn: {
        isOpen: true,
        options: {
          title: 'Please sign in or register',
          subtitle: 'It only takes a moment',
          ...options,
        },
      },
    }))
  }

  const hideSignInModal = () => {
    setModalState(prev => ({
      ...prev,
      signIn: {
        isOpen: false,
        options: {},
      },
    }))
  }

  const handleSignInSuccess = () => {
    // Call the custom onSuccess callback if provided
    if (modalState.signIn.options.onSuccess) {
      modalState.signIn.options.onSuccess()
    }
    hideSignInModal()
  }

  return (
    <ModalContext.Provider
      value={{
        showSignInModal,
        hideSignInModal,
        isSignInModalOpen: modalState.signIn.isOpen,
      }}
    >
      {children}

      {/* Global Modals */}
      <SignInModal
        isOpen={modalState.signIn.isOpen}
        onClose={hideSignInModal}
        onSuccess={handleSignInSuccess}
        title={modalState.signIn.options.title}
        subtitle={modalState.signIn.options.subtitle}
      />
    </ModalContext.Provider>
  )
}
