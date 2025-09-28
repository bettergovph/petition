import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PetitionCard from './shared/PetitionCard'
import { petitionApi } from '@/services/api'
import type { PetitionWithDetails } from '@/types/api'

export default function FeaturedPetitions() {
  const [petitions, setPetitions] = useState<PetitionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchFeaturedPetitions = async () => {
      try {
        // Get petitions with highest signature percentages
        const allPetitions = await petitionApi.getAll({ limit: 50 })
        
        // Sort by completion percentage and current signature count
        const featured = allPetitions
          .filter(p => p.current_count > 0) // Only petitions with signatures
          .sort((a, b) => {
            const aPercentage = (a.current_count / a.target_count) * 100
            const bPercentage = (b.current_count / b.target_count) * 100
            
            // Primary sort by percentage, secondary by signature count
            if (Math.abs(aPercentage - bPercentage) < 5) {
              return b.current_count - a.current_count
            }
            return bPercentage - aPercentage
          })
          .slice(0, 12) // Show top 12 featured petitions

        setPetitions(featured)
      } catch (err) {
        console.error('Failed to fetch featured petitions:', err)
        setError('Failed to load featured petitions. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedPetitions()
  }, [])

  const calculateDaysLeft = (createdAt: string): number => {
    const created = new Date(createdAt)
    const now = new Date()
    const daysSinceCreated = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, 60 - daysSinceCreated)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Featured Petitions</h1>
            <p className="text-lg text-gray-800 mb-6">
              Loading the most popular and successful petitions...
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Featured Petitions</h1>
          <p className="text-lg text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Featured Petitions</h1>
          <p className="text-lg text-gray-800 mb-6">
            Discover the most popular and successful petitions making real change
          </p>
        </div>

        {petitions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-800 mb-4">No featured petitions available yet.</p>
            <Link to="/create">
              <Button>Start the First Petition</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Highlight the top petition */}
            {petitions[0] && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">🏆 Most Popular</h2>
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2 flex-wrap">
                        <Badge className="bg-blue-600">{petitions[0].categories[0]?.name || 'General'}</Badge>
                        <Badge variant={petitions[0].type === 'local' ? 'outline' : 'default'}>
                          {petitions[0].type}
                        </Badge>
                        <Badge className="bg-yellow-500">Featured</Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {calculateDaysLeft(petitions[0].created_at)} days left
                      </span>
                    </div>
                    <CardTitle className="text-2xl font-bold mb-2">
                      <Link to={`/petition/${petitions[0].slug}`} className="hover:text-blue-600 transition-colors">
                        {petitions[0].title}
                      </Link>
                    </CardTitle>
                    <p className="text-gray-700">{petitions[0].description}</p>
                  </CardHeader>
                  <CardContent>
                    {petitions[0].type === 'local' && petitions[0].location && (
                      <p className="text-sm text-blue-600 mb-4">📍 {petitions[0].location}</p>
                    )}
                    
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-800 mb-2">
                        <span className="font-semibold">{petitions[0].current_count.toLocaleString()} signatures</span>
                        <span>{petitions[0].target_count.toLocaleString()} target</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min(Math.round((petitions[0].current_count / petitions[0].target_count) * 100), 100)}%` 
                          }}
                        />
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {Math.round((petitions[0].current_count / petitions[0].target_count) * 100)}% complete
                      </div>
                    </div>

                    <Link to={`/petition/${petitions[0].slug}`}>
                      <Button size="lg" className="w-full sm:w-auto">
                        View & Sign Featured Petition
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Other featured petitions */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {petitions.slice(1).map(petition => (
                <PetitionCard 
                  key={petition.id} 
                  petition={petition} 
                  showTypeBadge={true}
                />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/petitions">
                <Button variant="outline" size="lg">
                  View All Petitions
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}