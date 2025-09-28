import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/useAuth'
import { useUserSignatures } from '@/hooks/useUserSignatures'
import { signatureApi, ApiError } from '@/services/api'
import type { PetitionWithDetails } from '@/types/api'
import { 
  Users, 
  Shield, 
  CheckCircle, 
  Heart,
  X,
  Sparkles
} from 'lucide-react'
import { SiGoogle } from '@icons-pack/react-simple-icons'

interface SignPetitionModalProps {
  petition: PetitionWithDetails
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function SignPetitionModal({
  petition,
  isOpen,
  onClose,
  onSuccess,
}: SignPetitionModalProps) {
  const { session, status, signIn } = useAuth()
  const { hasSignedPetition, addSignedPetition } = useUserSignatures()
  const [signing, setSigning] = useState(false)
  const [signErrors, setSignErrors] = useState<string>('')
  const [comment, setComment] = useState('')

  // Check if user has already signed this petition
  const alreadySigned = hasSignedPetition(petition.id)

  const handleSignIn = async (provider: 'google') => {
    try {
      // Store callback info for after sign-in
      sessionStorage.setItem('auth_callback', 'petition_sign')
      sessionStorage.setItem('petition_id', petition.id.toString())
      
      await signIn(provider)
      // The actual signing will happen after successful authentication
    } catch (error) {
      console.error('Sign in failed:', error)
      setSignErrors('Failed to sign in. Please try again.')
    }
  }

  const handleDirectSign = async () => {
    if (alreadySigned) {
      setSignErrors('You have already signed this petition')
      return
    }

    setSigning(true)
    setSignErrors('')

    try {
      if (!session?.user?.id) {
        setSignErrors('Please sign in to sign this petition')
        return
      }

      await signatureApi.create({
        petition_id: petition.id,
        user_id: session.user.id,
        comment: comment.trim() || undefined,
        anonymous: false,   // Always public signature
      })

      // Optimistically add to signed petitions
      addSignedPetition(petition.id)

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to sign petition:', error)
      if (error instanceof ApiError) {
        if (error.message.includes('already signed')) {
          setSignErrors('You have already signed this petition')
        } else {
          setSignErrors(error.message)
        }
      } else {
        setSignErrors('Failed to sign petition. Please try again.')
      }
    } finally {
      setSigning(false)
    }
  }

  if (!isOpen) {
    return null
  }

  // If user is authenticated and hasn't signed, show direct sign option
  if (status === 'authenticated' && session && !alreadySigned) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl bg-white backdrop-blur-sm shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
          <CardHeader className="text-center pb-4 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 absolute top-4 right-4"
            >
              <X className="w-5 h-5" />
            </Button>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2 pr-12">
              Sign This Petition
            </CardTitle>
            <p className="text-gray-800">
              Add your voice and share why this matters to you
            </p>
          </CardHeader>
          
          <CardContent className="pt-0">
            {signErrors && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {signErrors}
              </div>
            )}

            {/* Petition Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                {petition.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {petition.current_count} signatures
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {petition.type === 'local' ? petition.location : 'National'}
                </span>
              </div>
            </div>

            {/* Comment Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Why are you signing this petition? (Optional)
              </label>
              <Textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts on why this petition is important to you and your community..."
                maxLength={500}
                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Your comment will be public and help build support for this cause
                </p>
                <p className="text-xs text-gray-500">
                  {comment.length}/500
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={signing}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDirectSign}
                disabled={signing}
                className="flex-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white flex items-center justify-center gap-2 h-12 font-semibold shadow-lg"
              >
                {signing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Signing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Sign This Petition
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If user already signed, show confirmation
  if (status === 'authenticated' && alreadySigned) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md bg-white shadow-2xl border border-gray-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Already Signed!
            </h3>
            <p className="text-gray-600 mb-6">
              Thank you for supporting this petition. Your voice has been added to the cause.
            </p>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If user is not authenticated, show sign-in focused modal
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg bg-white backdrop-blur-sm shadow-2xl border border-gray-200">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-3">
                <Sparkles className="w-4 h-4" />
                Join the Movement
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Sign In to Support This Cause
              </CardTitle>
              <p className="text-gray-800">
                Add your voice to thousands of others fighting for change
              </p>
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
          {signErrors && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {signErrors}
            </div>
          )}

          {/* Petition Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {petition.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {petition.current_count} signatures
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {petition.type === 'local' ? petition.location : 'National'}
              </span>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700">Secure & Trusted</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">Quick Sign-up</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Heart className="w-4 h-4 text-red-600" />
              <span className="text-gray-700">Make Impact</span>
            </div>
          </div>

          {/* Sign In Button */}
          <div className="space-y-3">
            <Button
              onClick={() => handleSignIn('google')}
              disabled={status === 'loading'}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white flex items-center justify-center gap-3 h-12 text-lg font-semibold shadow-lg"
            >
              <SiGoogle className="w-5 h-5" />
              {status === 'loading' ? 'Loading...' : 'Sign In & Support This Petition'}
            </Button>
            
            <p className="text-center text-sm text-gray-600">
              Sign in to add your signature and join the movement for change
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
