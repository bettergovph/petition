import { useState, useEffect, useCallback, Suspense } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { petitionApi } from '@/services/api'
import { useUserSignatures } from '@/hooks/useUserSignatures'
import type { PetitionWithDetails, Signature } from '@/types/api'
import SignPetitionModal from './SignPetitionModal'
import { Share, Copy, Check } from 'lucide-react'
import { SiFacebook, SiX, SiWhatsapp, SiTelegram } from '@icons-pack/react-simple-icons'

// Loading fallback component for Suspense
function PetitionDetailFallback() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PetitionDetailContent() {
  const { slug } = useParams<{ slug: string }>()
  const { hasSignedPetition, isAuthenticated, addSignedPetition, refreshSignatures } = useUserSignatures()

  const [petition, setPetition] = useState<PetitionWithDetails | null>(null)
  const [signatures, setSignatures] = useState<Signature[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [showSignForm, setShowSignForm] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [sharedPlatform, setSharedPlatform] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [justUpdated, setJustUpdated] = useState(false)

  const fetchPetition = useCallback(async () => {
    try {
      const data = await petitionApi.getBySlug(slug!)
      setPetition(data)

      // Fetch signatures once we have the petition data
      try {
        const signatures = await petitionApi.getSignatures(data.id, { limit: 20 })
        setSignatures(signatures)
      } catch (sigErr) {
        console.error('Failed to fetch signatures:', sigErr)
      }
    } catch (err) {
      console.error('Failed to fetch petition:', err)
      setError('Failed to load petition. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    if (slug) {
      fetchPetition()
    }
  }, [slug, fetchPetition])

  const calculateDaysLeft = (createdAt: string): number => {
    const created = new Date(createdAt)
    const now = new Date()
    const daysSinceCreated = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, 60 - daysSinceCreated)
  }

  const handleSignSuccess = async () => {
    setRefreshing(true)
    
    try {
      // Optimistically update the signed petitions list immediately
      if (petition) {
        addSignedPetition(petition.id)
      }
      
      // Add a small delay to ensure the server has processed the signature
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Force a fresh fetch to get updated data with cache busting
      const timestamp = Date.now()
      const cacheBustingUrl = `/api/petition/${slug}?_t=${timestamp}`
      
      const response = await fetch(cacheBustingUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json() as PetitionWithDetails
      setPetition(data)

      // Fetch updated signatures with cache busting
      const signaturesResponse = await fetch(`/api/petitions/${data.id}/signatures?limit=20&_t=${timestamp}`, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      
      if (signaturesResponse.ok) {
        const signatures = await signaturesResponse.json() as Signature[]
        setSignatures(signatures)
      }
      
      // Refresh user signatures to ensure consistency
      refreshSignatures()
      
      console.log('✅ Petition data refreshed after signing - new count:', data.current_count)
      
      // Show success indicator briefly
      setJustUpdated(true)
      setTimeout(() => setJustUpdated(false), 3000)
    } catch (err) {
      console.error('Failed to refresh petition after signing:', err)
      // Fallback to the original fetch method
      await fetchPetition()
    } finally {
      setRefreshing(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href)
    const title = encodeURIComponent(petition?.title || '')

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}&hashtags=petition,philippines`,
      whatsapp: `https://wa.me/?text=${title}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${title}`,
    }

    if (shareUrls[platform as keyof typeof shareUrls]) {
      // Show visual feedback
      setSharedPlatform(platform)
      setTimeout(() => setSharedPlatform(null), 1000)

      // Open sharing window
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400')
    }
  }

  if (loading) {
    return <PetitionDetailFallback />
  }

  if (error || !petition) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Petition Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/petitions">
            <Button>Browse All Petitions</Button>
          </Link>
        </div>
      </div>
    )
  }

  const progressPercentage = Math.round((petition.current_count / petition.target_count) * 100)
  const daysLeft = calculateDaysLeft(petition.created_at)

  return (
    <>
      <title>{`${petition.title} | Petitions by BetterGov.ph`}</title>
      <meta name="description" content={petition.description.slice(0, 160)} />
      <meta name="keywords" content={petition.categories.map(cat => cat.name).join(', ')} />
      <meta name="author" content={petition.creator.name} />
      <meta property="og:title" content={`${petition.title} | Petitions by BetterGov.ph`} />
      <meta property="og:description" content={petition.description.slice(0, 160)} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={`https://petition.ph/petition/${petition.slug}`} />
      <meta
        property="og:image"
        content={petition.image_url || 'https://petition.ph/bettergov-og.jpg'}
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={petition.title} />
      <meta name="twitter:description" content={petition.description.slice(0, 160)} />
      <meta
        name="twitter:image"
        content={petition.image_url || 'https://petition.ph/bettergov-og.jpg'}
      />
      <link rel="canonical" href={`https://petition.ph/petition/${petition.slug}`} />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-blue-600">
                Home
              </Link>
              <span>→</span>
              <Link to="/petitions" className="hover:text-blue-600">
                Petitions
              </Link>
              <span>→</span>
              <span className="text-gray-900">{petition.title}</span>
            </div>
          </nav>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-sm shadow-sm p-6 mb-6">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {petition.categories.map(category => (
                      <Badge key={category.id} variant="secondary">
                        {category.name}
                      </Badge>
                    ))}
                    <Badge variant={petition.type === 'local' ? 'outline' : 'default'}>
                      {petition.type}
                    </Badge>
                    {petition.status !== 'active' && (
                      <Badge variant="destructive">{petition.status}</Badge>
                    )}
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{petition.title}</h1>

                  {petition.type === 'local' && petition.location && (
                    <p className="text-lg text-blue-600 mb-4">📍 {petition.location}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Started by {petition.creator.name || 'Anonymous'}</span>
                    <span>•</span>
                    <span>{new Date(petition.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{daysLeft} days left</span>
                  </div>
                </div>

                {/* Image */}
                {petition.image_url && (
                  <div className="mb-6">
                    <img
                      src={petition.image_url}
                      alt={petition.title}
                      className="w-full h-64 object-cover rounded-lg"
                      onError={e => {
                        ;(e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}

                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Why this petition matters</h2>
                  <div className="prose max-w-none">
                    {petition.description.split('\n').map(
                      (paragraph, index) =>
                        paragraph.trim() && (
                          <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                            {paragraph}
                          </p>
                        )
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Signatures */}
              <div className="bg-white rounded-sm shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Recent Signatures ({petition.current_count.toLocaleString()})
                </h2>

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse border-b pb-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : petition.current_count === 0 ? (
                  <p className="text-gray-600">No signatures yet. Be the first to sign!</p>
                ) : (
                  <div className="space-y-4">
                    {signatures.map(signature => (
                      <div key={signature.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {signature.anonymous ? 'Anonymous' : 'Supporter'}
                            </p>
                            {signature.comment && (
                              <p className="text-gray-700 mt-1 italic">"{signature.comment}"</p>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(signature.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-sm shadow-sm p-6 sticky top-8">
                {/* Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span className="font-semibold flex items-center gap-2">
                      {petition.current_count.toLocaleString()} signed
                      {refreshing && (
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      )}
                      {justUpdated && !refreshing && (
                        <div className="flex items-center gap-1 text-green-600 animate-pulse">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs">Updated!</span>
                        </div>
                      )}
                    </span>
                    <span>{petition.target_count.toLocaleString()} goal</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">{progressPercentage}% complete</p>
                </div>

                {/* Sign Button */}
                {isAuthenticated && hasSignedPetition(petition.id) ? (
                  <div className="text-center p-4 bg-green-50 rounded-lg mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <p className="text-green-800 font-medium">Thank you for signing!</p>
                    </div>
                    <p className="text-sm text-green-600">
                      Help spread the word by sharing this petition
                    </p>
                  </div>
                ) : petition.status === 'active' ? (
                  <Button onClick={() => setShowSignForm(true)} className="w-full mb-4" size="lg">
                    Sign This Petition
                  </Button>
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-lg mb-4">
                    <p className="text-gray-600">This petition is no longer active</p>
                  </div>
                )}

                {/* Share buttons */}
                <div className="space-y-4">
                  <div className="border-t pt-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-4">
                      <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                        <Share className="h-5 w-5 text-blue-600" />
                        Share this petition
                      </h3>
                      <p className="text-sm text-gray-600">
                        Help spread the word and get more supporters
                      </p>
                    </div>

                    {/* Social Media Share Buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare('facebook')}
                        className={`flex items-center justify-center gap-2 h-11 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-blue-400 hover:text-blue-700 font-medium ${
                          sharedPlatform === 'facebook'
                            ? 'scale-105 shadow-md bg-gradient-to-r from-blue-50 to-blue-100 border-blue-400 text-blue-700'
                            : ''
                        }`}
                      >
                        <SiFacebook className="h-5 w-5 text-blue-600" />
                        <span className="hidden sm:inline">
                          {sharedPlatform === 'facebook' ? 'Shared!' : 'Facebook'}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare('twitter')}
                        className={`flex items-center justify-center gap-2 h-11 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-gradient-to-r hover:from-sky-50 hover:to-sky-100 hover:border-sky-400 hover:text-sky-700 font-medium ${
                          sharedPlatform === 'twitter'
                            ? 'scale-105 shadow-md bg-gradient-to-r from-sky-50 to-sky-100 border-sky-400 text-sky-700'
                            : ''
                        }`}
                      >
                        <SiX className="h-5 w-5 text-sky-500" />
                        <span className="hidden sm:inline">
                          {sharedPlatform === 'twitter' ? 'Shared!' : 'Twitter'}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare('whatsapp')}
                        className={`flex items-center justify-center gap-2 h-11 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:border-green-400 hover:text-green-700 font-medium ${
                          sharedPlatform === 'whatsapp'
                            ? 'scale-105 shadow-md bg-gradient-to-r from-green-50 to-green-100 border-green-400 text-green-700'
                            : ''
                        }`}
                      >
                        <SiWhatsapp className="h-5 w-5 text-green-600" />
                        <span className="hidden sm:inline">
                          {sharedPlatform === 'whatsapp' ? 'Shared!' : 'WhatsApp'}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare('telegram')}
                        className={`flex items-center justify-center gap-2 h-11 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-100 hover:border-indigo-400 hover:text-indigo-700 font-medium ${
                          sharedPlatform === 'telegram'
                            ? 'scale-105 shadow-md bg-gradient-to-r from-blue-50 to-indigo-100 border-indigo-400 text-indigo-700'
                            : ''
                        }`}
                      >
                        <SiTelegram className="h-5 w-5 text-indigo-500" />
                        <span className="hidden sm:inline">
                          {sharedPlatform === 'telegram' ? 'Shared!' : 'Telegram'}
                        </span>
                      </Button>
                    </div>

                    {/* Copy Link Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                      className={`w-full flex items-center justify-center gap-2 h-12 rounded-xl border-2 transition-all duration-200 font-medium ${
                        copiedLink
                          ? 'bg-gradient-to-r from-green-50 to-emerald-100 border-green-400 text-green-700 shadow-md scale-105'
                          : 'hover:scale-105 hover:shadow-md hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-100 hover:border-gray-400'
                      }`}
                    >
                      {copiedLink ? (
                        <>
                          <Check className="h-5 w-5 text-green-600" />
                          <span>Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-5 w-5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SignPetitionModal
            petition={petition}
            isOpen={showSignForm}
            onClose={() => setShowSignForm(false)}
            onSuccess={handleSignSuccess}
          />
        </div>
      </div>
    </>
  )
}

// Main component with Suspense wrapper
export default function PetitionDetail() {
  return (
    <Suspense fallback={<PetitionDetailFallback />}>
      <PetitionDetailContent />
    </Suspense>
  )
}
