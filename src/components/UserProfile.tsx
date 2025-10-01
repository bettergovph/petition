import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useModal } from '../contexts/useModal'
import { useAuth } from '../hooks/useAuthHook'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { petitionApi } from '../services/api'
import type { Petition } from '../types/api'
import {
  Edit3,
  Calendar,
  MapPin,
  Users,
  Target,
  Heart,
  BarChart3,
  Settings,
  User,
} from 'lucide-react'

interface UserStats {
  petitionsCreated: number
  totalSignaturesReceived: number
  activePetitions: number
  petitionsSigned: number
}

export default function UserProfile() {
  const { session, status } = useAuth()
  const { showSignInModal } = useModal()
  const [createdPetitions, setCreatedPetitions] = useState<Petition[]>([])
  const [userStats, setUserStats] = useState<UserStats>({
    petitionsCreated: 0,
    totalSignaturesReceived: 0,
    activePetitions: 0,
    petitionsSigned: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'created' | 'supported'>('overview')

  const loadUserData = useCallback(async () => {
    if (!session?.user?.id) return

    try {
      setLoading(true)

      // Load created petitions
      const created = await petitionApi.getByUser(session.user.id)
      setCreatedPetitions(created)

      // Load supported petitions (this would need to be implemented in the API)
      // const supported = await petitionApi.getUserSignatures(session.user.id)
      // setSupportedPetitions(supported)

      // Calculate stats
      const totalSignaturesReceived = created.reduce(
        (sum, petition) => sum + petition.current_count,
        0
      )
      setUserStats({
        petitionsCreated: created.length,
        petitionsSigned: 0, // Will be updated when supported petitions API is ready
        totalSignaturesReceived,
        activePetitions: created.filter(p => p.status === 'active').length,
      })
    } catch (err) {
      console.error('Failed to load user data:', err)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      loadUserData()
    }
  }, [status, session, loadUserData])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-800">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (status !== 'authenticated' || !session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-md mx-auto p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sign In Required</h2>
            <p className="text-gray-800 mb-6">Please sign in to view your profile.</p>
            <Button
              onClick={() => showSignInModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Sign In
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-shrink-0">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-24 h-24 rounded-full"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-500" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {session.user.name || 'User'}
                </h1>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-800">
                    <BarChart3 className="w-4 h-4" />
                    <span>{userStats.petitionsCreated} petitions created</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-800">
                    <Heart className="w-4 h-4" />
                    <span>{userStats.petitionsSigned} petitions supported</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-800">
                    <Users className="w-4 h-4" />
                    <span>{userStats.totalSignaturesReceived} total signatures received</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('created')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'created'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Petitions ({userStats.petitionsCreated})
            </button>
            <button
              onClick={() => setActiveTab('supported')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'supported'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Supported Petitions ({userStats.petitionsSigned})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-800">Loading...</p>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-800">Petitions Created</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {userStats.petitionsCreated}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Heart className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-800">Petitions Supported</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {userStats.petitionsSigned}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-800">Total Signatures</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {userStats.totalSignaturesReceived}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <div className="md:col-span-2 lg:col-span-3">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                      {createdPetitions.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500 mb-4">
                            You haven't created any petitions yet.
                          </p>
                          <Link to="/create">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                              Create Your First Petition
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {createdPetitions.slice(0, 3).map(petition => (
                            <div
                              key={petition.id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{petition.title}</h4>
                                <p className="text-sm text-gray-800">
                                  {petition.current_count} of {petition.target_count} signatures
                                </p>
                              </div>
                              <Badge className={getStatusColor(petition.status)}>
                                {petition.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Created Petitions Tab */}
            {activeTab === 'created' && (
              <div>
                {createdPetitions.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No petitions created yet
                      </h3>
                      <p className="text-gray-800 mb-6">
                        Start making a difference by creating your first petition.
                      </p>
                      <Link to="/create">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          Create Your First Petition
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {createdPetitions.map(petition => (
                      <Card key={petition.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                            {petition.image_url && (
                              <div className="flex-shrink-0">
                                <img
                                  src={petition.image_url}
                                  alt={petition.title}
                                  className="w-full lg:w-48 h-32 object-cover rounded-lg"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {petition.title}
                                  </h3>
                                  <div className="flex items-center gap-4 text-sm text-gray-800 mb-2">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      <span>Created {formatDate(petition.created_at)}</span>
                                    </div>
                                    {petition.location && (
                                      <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{petition.location}</span>
                                      </div>
                                    )}
                                    <Badge className={getStatusColor(petition.status)}>
                                      {petition.status}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Link to={`/petition/${petition.slug}/edit`}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center gap-2"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                      Edit
                                    </Button>
                                  </Link>
                                  <Link to={`/petition/${petition.slug}`}>
                                    <Button variant="outline" size="sm">
                                      View
                                    </Button>
                                  </Link>
                                </div>
                              </div>

                              <p className="text-gray-700 mb-4 line-clamp-2">
                                {petition.description}
                              </p>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-800">
                                      {petition.current_count} of {petition.target_count} signatures
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-800">
                                      {Math.round(
                                        (petition.current_count / petition.target_count) * 100
                                      )}
                                      % complete
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Progress bar */}
                              <div className="mt-3">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{
                                      width: `${Math.min((petition.current_count / petition.target_count) * 100, 100)}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Supported Petitions Tab */}
            {activeTab === 'supported' && (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Supported petitions coming soon
                  </h3>
                  <p className="text-gray-800">
                    This feature will show all the petitions you've signed and supported.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
