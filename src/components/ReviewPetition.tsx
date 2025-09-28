import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { petitionApi, ApiError } from '../services/api'
import type { PetitionWithDetails } from '../types/api'
import { 
  Calendar, 
  MapPin, 
  Target, 
  Edit3, 
  Eye, 
  Share2, 
  CheckCircle,
  ArrowRight,
  Lightbulb,
  TrendingUp,
  MessageCircle,
  PartyPopper,
  Sparkles,
  Trophy,
  Heart
} from 'lucide-react'

export default function ReviewPetition() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [petition, setPetition] = useState<PetitionWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPetition = useCallback(async () => {
    if (!id) return
    
    try {
      setIsLoading(true)
      const petitionData = await petitionApi.getBySlug(id)
      
      // Check if user owns this petition - skip check for now since user type is limited
      // TODO: Fix user type to include id field
      
      setPetition(petitionData)
    } catch (error) {
      console.error('Error loading petition:', error)
      setError('Failed to load petition')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!id) {
      navigate('/')
      return
    }
    
    loadPetition()
  }, [id, navigate, loadPetition])

  const handlePublish = async () => {
    if (!petition) return
    
    try {
      setIsPublishing(true)
      
      // Publish the petition
      await petitionApi.publish(petition.id)
      
      // Navigate to the published petition
      navigate(`/petition/${petition.slug}?published=true`)
    } catch (error) {
      console.error('Error publishing petition:', error)
      if (error instanceof ApiError) {
        setError(error.message)
      } else {
        setError('Failed to publish petition')
      }
    } finally {
      setIsPublishing(false)
    }
  }

  const handleEdit = () => {
    if (petition) {
      navigate(`/petition/${petition.slug}/edit`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading petition...</p>
        </div>
      </div>
    )
  }

  if (error || !petition) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Petition not found'}</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Back to Home
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Congratulations Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <PartyPopper className="h-8 w-8 animate-bounce" />
              <Sparkles className="h-6 w-6 animate-pulse" />
              <Trophy className="h-8 w-8 animate-bounce delay-100" />
              <Sparkles className="h-6 w-6 animate-pulse delay-200" />
              <Heart className="h-8 w-8 animate-bounce delay-300" />
            </div>
            <h1 className="text-4xl font-bold mb-2">🎉 Congratulations! 🎉</h1>
            <p className="text-xl mb-4">Your petition has been created successfully!</p>
            <p className="text-blue-100 max-w-2xl mx-auto">
              You're about to make a real difference! Review your petition below and when you're ready, 
              publish it to start collecting signatures from supporters who share your passion for change.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Review Your Petition</h2>
              <p className="text-gray-600 mt-1">Make sure everything looks perfect before going live</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleEdit} className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Edit
              </Button>
              <Button 
                onClick={handlePublish} 
                disabled={isPublishing}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {isPublishing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Publish & Go Live!
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Petition Preview */}
            <Card className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <Eye className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Petition Preview</h2>
                  <p className="text-sm text-gray-600">This is how your petition will appear to supporters</p>
                </div>
              </div>

              {/* Petition Image */}
              {petition.image_url && (
                <div className="mb-6">
                  <img 
                    src={petition.image_url} 
                    alt={petition.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Petition Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{petition.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant={petition.type === 'national' ? 'default' : 'secondary'}>
                      {petition.type === 'national' ? 'National' : 'Local'}
                    </Badge>
                    {petition.location && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {petition.location}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: petition.description }} />
                </div>

                {/* Petition Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600">
                      Target: <span className="font-medium">{petition.target_count.toLocaleString()}</span> signatures
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600">
                      Due: <span className="font-medium">{new Date(petition.due_date).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* What's Next Section */}
            <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    What's Next? 
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                  </h2>
                  <p className="text-sm text-gray-600">Your journey to making change starts now!</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      🚀 Your petition goes live instantly!
                    </h3>
                    <p className="text-sm text-gray-600">Supporters worldwide can discover and sign your petition right away</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      📢 Share and amplify your voice
                    </h3>
                    <p className="text-sm text-gray-600">Spread the word on social media, email friends, and rally your community</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      💬 Build a movement together
                    </h3>
                    <p className="text-sm text-gray-600">Connect with supporters, share updates, and keep the momentum growing</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">4</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      🏆 Achieve real change!
                    </h3>
                    <p className="text-sm text-gray-600">Present your petition to decision makers and celebrate your victory</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing Checklist */}
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">You're Ready to Launch! ✨</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">✅ Compelling title</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">✅ Clear description</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">✅ Realistic target</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">✅ Appropriate due date</span>
                </div>
                {petition.image_url && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">✅ Eye-catching image</span>
                  </div>
                )}
              </div>
              <div className="mt-4 p-3 bg-green-100 rounded-lg">
                <p className="text-sm text-green-800 font-medium text-center">
                  🎯 Your petition is perfect and ready to make an impact!
                </p>
              </div>
            </Card>

            {/* Tips for Success */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-100 p-1 rounded-full">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">🚀 Pro Tips for Maximum Impact</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3 p-2 bg-white rounded-lg">
                  <Share2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p><strong>Strike while it's hot!</strong> Share within 24 hours to build unstoppable momentum</p>
                </div>
                <div className="flex items-start gap-3 p-2 bg-white rounded-lg">
                  <MessageCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p><strong>Engage your community!</strong> Reply to comments and keep supporters excited</p>
                </div>
                <div className="flex items-start gap-3 p-2 bg-white rounded-lg">
                  <Heart className="h-4 w-4 text-pink-500 mt-0.5 flex-shrink-0" />
                  <p><strong>Share updates!</strong> Keep supporters informed about your progress and wins</p>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={handleEdit}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Petition
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/')}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
