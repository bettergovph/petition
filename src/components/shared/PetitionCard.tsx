import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUserSignatures } from '@/hooks/useUserSignatures'
import type { PetitionWithDetails } from '@/types/api'

interface PetitionCardProps {
  petition: PetitionWithDetails
  showSignedStatus?: boolean
  showTypeBadge?: boolean
}

export default function PetitionCard({ 
  petition, 
  showTypeBadge = false 
}: PetitionCardProps) {
  const { hasSignedPetition, isAuthenticated } = useUserSignatures()
  
  const progressPercentage = Math.round((petition.current_count / petition.target_count) * 100)
  const primaryCategory = petition.categories[0]?.name || 'General'
  
  // Calculate days left (60 days from creation)
  const calculateDaysLeft = (createdAt: string): number => {
    const created = new Date(createdAt)
    const now = new Date()
    const daysSinceCreated = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, 60 - daysSinceCreated)
  }
  
  const daysLeft = calculateDaysLeft(petition.created_at)
  const hasSigned = isAuthenticated && hasSignedPetition(petition.id)

  return (
    <Card className="overflow-hidden border border-gray-300 flex flex-col h-full relative bg-white">
      {/* Signed Ribbon */}
      {hasSigned && (
        <div className="absolute top-0 right-0 z-20">
          <div className="bg-green-600 text-white text-xs font-bold px-8 py-1 transform rotate-45 translate-x-8 translate-y-4 shadow-md">
            SIGNED
          </div>
        </div>
      )}
      
      
      <CardHeader className="p-6 pb-4">
        {/* Category and location badges */}
         <div className="mb-3 flex gap-2">
           <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded">
             {primaryCategory}
           </span>
           {showTypeBadge && (
             <span className="inline-block border border-gray-400 text-gray-700 text-sm px-3 py-1 rounded">
               {petition.type}
             </span>
           )}
         </div>

        {/* Petition title */}
        <CardTitle className="text-2xl font-bold leading-tight mb-4 text-gray-900">
          <Link to={`/petition/${petition.slug}`} className="hover:text-blue-600 transition-colors no-underline">
            {petition.title}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col flex-grow px-6 pb-6">
        {/* Petition description */}
        <div className="h-20 mb-4">
          <p className="text-base leading-relaxed text-gray-800 line-clamp-3">
            {petition.description}
          </p>
        </div>

        {/* Location info */}
        {petition.type === 'local' && petition.location && (
          <div className="mb-6">
            <span className="inline-flex items-center gap-1 text-gray-600 text-sm">
              📍 {petition.location}
            </span>
          </div>
        )}

        {/* Bottom section: progress + CTA stays aligned across cards */}
        <div className="mt-auto space-y-4">
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-bold text-gray-900">
                {petition.current_count.toLocaleString()}
              </span>
              <span className="text-sm text-gray-600">
                of {petition.target_count.toLocaleString()} signatures
              </span>
            </div>
            
            <div className="w-full bg-gray-200 h-3 mb-2">
              <div
                className="bg-green-600 h-3 transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {progressPercentage}% complete
              </p>
              <p className="text-sm text-gray-600">
                <strong>{daysLeft}</strong> days left
              </p>
            </div>
          </div>

          <Link to={`/petition/${petition.slug}`}>
            <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 text-lg border-0 rounded">
              {hasSigned ? 'View petition' : 'Sign this petition'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
