export interface SignInModalOptions {
  title?: string
  subtitle?: string
  onSuccess?: () => void
}

export interface ModalState {
  signIn: {
    isOpen: boolean
    options: SignInModalOptions
  }
}

export interface ModalContextType {
  showSignInModal: (options?: SignInModalOptions) => void
  hideSignInModal: () => void
  isSignInModalOpen: boolean
}
