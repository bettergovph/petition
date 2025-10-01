import { useSearchParams, Link } from 'react-router-dom'
import { useModal } from '../../contexts/useModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Home, LogIn } from 'lucide-react'

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'Access denied. You do not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  Default: 'An unexpected error occurred during authentication.',
  OAuthSignin: 'Error in constructing an authorization URL.',
  OAuthCallback: 'Error in handling the response from the OAuth provider.',
  OAuthCreateAccount: 'Could not create OAuth account in the database.',
  EmailCreateAccount: 'Could not create email account in the database.',
  Callback: 'Error in the OAuth callback handler route.',
  OAuthAccountNotLinked: 'Another account with the same email address already exists.',
  EmailSignin: 'Check your email address.',
  CredentialsSignin: 'Sign in failed. Check the details you provided are correct.',
  SessionRequired: 'Please sign in to access this page.',
}

export default function AuthErrorPage() {
  const [searchParams] = useSearchParams()
  const { showSignInModal } = useModal()
  const error = searchParams.get('error') || 'Default'

  const errorMessage = ERROR_MESSAGES[error] || ERROR_MESSAGES.Default
  const isConfigurationError = error === 'Configuration'
  const isAccessDenied = error === 'AccessDenied'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-xl border border-gray-200">
        <CardHeader className="text-center border-b border-gray-200">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center space-y-4">
          <p className="text-gray-800">{errorMessage}</p>

          {error && error !== 'Default' && (
            <div className="bg-gray-100 rounded p-3">
              <p className="text-xs text-gray-500 font-mono">Error: {error}</p>
            </div>
          )}

          {isConfigurationError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-yellow-800 text-sm">
                This appears to be a server configuration issue. Please contact support.
              </p>
            </div>
          )}

          {isAccessDenied && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-blue-800 text-sm">
                Your account may not have the necessary permissions to access this application.
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              asChild
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button
              onClick={() => showSignInModal()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
