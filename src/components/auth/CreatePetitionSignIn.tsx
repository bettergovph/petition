import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useModal } from '@/contexts/ModalContext'
import {
  Users,
  Shield,
  CheckCircle,
  TrendingUp,
  MessageSquare,
  ArrowLeft,
  Sparkles,
} from 'lucide-react'

interface CreatePetitionSignInProps {
  isSubmitting?: boolean
}

export default function CreatePetitionSignIn({ isSubmitting = false }: CreatePetitionSignInProps) {
  const navigate = useNavigate()
  const { showSignInModal } = useModal()

  const benefits = [
    {
      icon: Shield,
      title: 'Verified Identity',
      description: 'Your petition will be trusted by supporters with verified authorship',
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor signatures, engagement, and petition performance in real-time',
    },
    {
      icon: MessageSquare,
      title: 'Engage Supporters',
      description: 'Respond to comments and build a community around your cause',
    },
    {
      icon: CheckCircle,
      title: 'Manage Petitions',
      description: 'Edit, update, and control your petition throughout its lifecycle',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Start Your Movement
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Ready to Make a Difference?</h1>
          <p className="text-xl text-gray-800 max-w-2xl mx-auto">
            Join thousands of changemakers who are using Petition.ph to create real impact in the
            Philippines
          </p>
        </div>

        {/* Centered Sign In Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="p-10 shadow-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
            <div className="text-center space-y-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">Sign In to Get Started</h3>
                <p className="text-lg text-gray-800 mb-6">
                  Create your account in seconds and start building support for your cause
                </p>
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <benefit.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">{benefit.title}</h4>
                      <p className="text-gray-800 text-xs">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust Badge */}
              {/* <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-green-800 font-medium mb-2">
                  <Users className="w-5 h-5" />
                  Trusted Platform
                </div>
                <p className="text-green-700 text-sm">
                  Petition.ph is the Philippines' leading petition platform, trusted by citizens,
                  organizations, and government officials nationwide.
                </p>
              </div> */}

              <div className="space-y-4">
                <Button
                  onClick={() =>
                    showSignInModal({
                      title: 'Sign In to Create Your Petition',
                      subtitle: 'Join the movement for positive change in the Philippines',
                    })
                  }
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-900 text-white flex items-center justify-center gap-3 h-14 text-lg font-semibold shadow-lg"
                >
                  <Users className="w-5 h-5" />
                  Sign In & Create Petition
                </Button>
              </div>
            </div>
          </Card>

          <div className="mt-8 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-gray-800 hover:text-gray-800 flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-800 mb-4">
            Already have an account? Sign in to access your dashboard and manage your petitions.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span>• Create unlimited petitions</span>
            <span>• Track real-time analytics</span>
            <span>• Engage with your community</span>
            <span>• Export supporter data</span>
          </div>
        </div>
      </div>
    </div>
  )
}
