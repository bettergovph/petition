import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useUserSignatures } from '@/hooks/useUserSignatures'
import type { PetitionWithDetails } from '@/types/api'

interface PetitionCardProps {
  petition: PetitionWithDetails
  showTypeBadge?: boolean
}

export default function PetitionCard({ 
  petition, 
  showTypeBadge = false 
}: PetitionCardProps) {
  const { hasSignedPetition, isAuthenticated } = useUserSignatures()
  
  // Memoize calculations for better performance
  const cardData = useMemo(() => {
    const progressPercentage = Math.round((petition.current_count / petition.target_count) * 100)
    const primaryCategory = petition.categories[0]?.name || 'General'
    
    // Calculate days left (60 days from creation)
    const created = new Date(petition.created_at)
    const now = new Date()
    const daysSinceCreated = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    const daysLeft = Math.max(0, 60 - daysSinceCreated)
    
    const hasSigned = isAuthenticated && hasSignedPetition(petition.id)
    const isUrgent = daysLeft <= 7
    const isCompleted = progressPercentage >= 100
    
    return {
      progressPercentage,
      primaryCategory,
      daysLeft,
      hasSigned,
      isUrgent,
      isCompleted
    }
  }, [petition.current_count, petition.target_count, petition.categories, petition.created_at, isAuthenticated, hasSignedPetition, petition.id])

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full relative group"
      role="article"
      aria-labelledby={`petition-title-${petition.id}`}
    >
      {/* Status Indicators */}
      <div className="absolute top-0 right-0 z-10 flex flex-col gap-1">
        {cardData.hasSigned && (
          <div className="bg-green-600 text-white text-xs font-bold px-3 py-1 transform rotate-45 translate-x-6 translate-y-4 shadow-md">
            SIGNED
          </div>
        )}
        {cardData.isUrgent && !cardData.isCompleted && (
          <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 transform rotate-45 translate-x-6 translate-y-8 shadow-md">
            URGENT
          </div>
        )}
        {cardData.isCompleted && (
          <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 transform rotate-45 translate-x-6 translate-y-8 shadow-md">
            COMPLETE
          </div>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-1 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {cardData.primaryCategory}
            </Badge>
            {showTypeBadge && (
              <Badge variant={petition.type === 'local' ? 'outline' : 'default'} className="text-xs">
                {petition.type}
              </Badge>
            )}
          </div>
        </div>
        <CardTitle 
          id={`petition-title-${petition.id}`}
          className="text-xl font-semibold line-clamp-2 font-[Figtree] leading-tight"
        >
          <Link 
            to={`/petition/${petition.slug}`} 
            className="hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm"
            aria-describedby={`petition-description-${petition.id}`}
          >
            {petition.title}
          </Link>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-grow">
        <p 
          id={`petition-description-${petition.id}`}
          className="text-gray-700 line-clamp-3 text-sm leading-relaxed"
        >
          {petition.description}
        </p>
        
        {/* Time and Location Info */}
        <div className="my-3 space-y-1">
          <p className={`text-sm font-medium ${cardData.isUrgent ? 'text-red-600' : 'text-gray-600'}`}>
            {cardData.isUrgent ? '⚠️ ' : '⏰ '}
            {cardData.daysLeft} {cardData.daysLeft === 1 ? 'day' : 'days'} left
          </p>
          
          {petition.type === 'local' && petition.location && (
            <p className="text-sm text-blue-600 flex items-center gap-1">
              <span aria-hidden="true">📍</span>
              {petition.location}
            </p>
          )}
        </div>

        {/* Progress Section */}
        <div className="mt-auto space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-gray-700">
              <span>{petition.current_count.toLocaleString()} signatures</span>
              <span>{petition.target_count.toLocaleString()} target</span>
            </div>
            <div 
              className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden"
              role="progressbar"
              aria-valuenow={cardData.progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Petition progress: ${cardData.progressPercentage}% complete`}
            >
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
                  cardData.isCompleted 
                    ? 'bg-blue-600' 
                    : cardData.isUrgent 
                    ? 'bg-red-500' 
                    : 'bg-green-600'
                }`}
                style={{ width: `${Math.min(cardData.progressPercentage, 100)}%` }}
              />
            </div>
            <div className="text-sm text-gray-500 text-center">
              {cardData.progressPercentage}% complete
            </div>
          </div>

          <Link to={`/petition/${petition.slug}`} className="block">
            <Button 
              className={`w-full transition-all duration-200 group-hover:scale-[1.02] ${
                cardData.isCompleted 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
              aria-describedby={`petition-description-${petition.id}`}
            >
              {cardData.hasSigned 
                ? 'View Petition' 
                : cardData.isCompleted 
                ? 'View Results' 
                : 'Sign Petition'
              }
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
