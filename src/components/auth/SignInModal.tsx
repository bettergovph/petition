import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SiGoogle, SiFacebook } from '@icons-pack/react-simple-icons'
import { Shield, CheckCircle, Heart, X, Sparkles, Users } from 'lucide-react'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  title?: string
  subtitle?: string
}

export default function SignInModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Sign In Required',
  subtitle = 'Please sign in to continue',
}: SignInModalProps) {
  const { signIn, status } = useAuth()

  // Check if providers are configured (basic check)
  const hasGoogleProvider = true // Always show Google for now since it's configured
  const hasFacebookProvider = false // Hide Facebook since it's not configured

  const handleSignIn = async (provider: 'google' | 'facebook') => {
    try {
      // Store callback info in sessionStorage for after sign-in
      if (onSuccess) {
        sessionStorage.setItem('auth_callback', 'modal_success')
      }

      await signIn(provider)
    } catch (error) {
      console.error('Sign in failed:', error)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg bg-white backdrop-blur-sm shadow-2xl border border-gray-200">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-3">
                <Sparkles className="w-4 h-4" />
                Join BetterGov.ph
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{title}</CardTitle>
              <p className="text-gray-800">{subtitle}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 absolute top-4 right-4"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Benefits */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700">Secure & Trusted</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">Quick Sign-up</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-gray-700">Join Community</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Heart className="w-4 h-4 text-red-600" />
              <span className="text-gray-700">Make Impact</span>
            </div>
          </div>

          {/* Sign In Buttons */}
          <div className="space-y-3">
            {hasGoogleProvider && (
              <Button
                onClick={() => handleSignIn('google')}
                disabled={status === 'loading'}
                className="w-full text-white flex items-center justify-center gap-3 h-12 text-lg font-semibold shadow-lg"
                variant={'default'}
              >
                <SiGoogle className="w-5 h-5" />
                {status === 'loading' ? 'Signing In...' : 'Continue with Google'}
              </Button>
            )}

            {hasFacebookProvider && (
              <Button
                onClick={() => handleSignIn('facebook')}
                disabled={status === 'loading'}
                className="w-full bg-gradient-to-r from-[#1877f2] to-[#166fe5] hover:from-[#166fe5] hover:to-[#1464d6] text-white flex items-center justify-center gap-3 h-12 text-lg font-semibold shadow-lg"
              >
                <SiFacebook className="w-5 h-5" />
                {status === 'loading' ? 'Signing In...' : 'Continue with Facebook'}
              </Button>
            )}

            {!hasGoogleProvider && !hasFacebookProvider && (
              <div className="text-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-yellow-600" />
                </div>
                <p className="text-yellow-800 font-medium mb-1">Authentication Unavailable</p>
                <p className="text-yellow-700 text-sm">
                  No authentication providers are currently configured.
                </p>
              </div>
            )}
          </div>

          {/* Terms and Privacy */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-center text-sm text-gray-600">
              By signing in, you agree to our{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-700 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                Privacy Policy
              </a>
            </p>
          </div>

          {/* Cancel Button */}
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={status === 'loading'}
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
