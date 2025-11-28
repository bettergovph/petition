import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DEFAULT_CATEGORIES } from '@/constants/categories'
import { categoryApi, petitionApi } from '@/services/api'
import type { PetitionWithDetails } from '@/types/api'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Category } from '../types/api'
import FilterPopover from './shared/FilterPopover'
import PetitionCard from './shared/PetitionCard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

type PetitionLocation = 'all' | 'local' | 'national'

export default function AllPetitions() {
  const [petitions, setPetitions] = useState<PetitionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [filter, setFilter] = useState<PetitionLocation>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const PETITIONS_PER_PAGE = 12

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await categoryApi.getAll()
        setCategories(fetchedCategories)
      } catch (error) {
        console.error('Failed to load categories:', error)
        // Fallback to hardcoded categories if API fails
        setCategories(DEFAULT_CATEGORIES)
      }
    }

    loadCategories()
  }, [])

  const filterOptions = useMemo(
    () =>
      categories.map(cat => ({
        label: cat.name,
        value: cat.id.toString(),
      })),
    [categories]
  )

  const fetchPetitions = useCallback(
    async (reset = false) => {
      try {
        if (reset) {
          setLoading(true)
          setPage(1)
        }

        const currentPage = reset ? 1 : page
        const offset = (currentPage - 1) * PETITIONS_PER_PAGE

        const data = await petitionApi.getAll({
          limit: PETITIONS_PER_PAGE,
          offset,
          type: filter === 'all' ? undefined : filter,
          categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        })

        if (reset) {
          setPetitions(data)
        } else {
          setPetitions(prev => [...prev, ...data])
        }

        setHasMore(data.length === PETITIONS_PER_PAGE)
      } catch (err) {
        console.error('Failed to fetch petitions:', err)
        setError('Failed to load petitions. Please try again later.')
      } finally {
        setLoading(false)
      }
    },
    [filter, page, selectedCategories]
  )

  useEffect(() => {
    fetchPetitions(true) // Reset when filters change
  }, [filter, selectedCategories])

  useEffect(() => {
    if (page !== 1) {
      fetchPetitions(false)
    }
  }, [page])

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
  }

  const handleCategorySelect = (value: string) => {
    const isSelected = selectedCategories.includes(value)
    if (isSelected) {
      setSelectedCategories(selectedCategories.filter(cat => cat !== value))
    } else {
      setSelectedCategories([...selectedCategories, value])
    }
    // Reset pagination when categories change
    setPage(1)
  }

  const handleCategoryClear = () => {
    setSelectedCategories([])
    // Reset pagination when categories change
    setPage(1)
  }

  const filteredPetitions = petitions.filter(
    petition =>
      petition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      petition.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      petition.categories.some(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <>
      <title>All Petitions | Petitions by BetterGov.ph</title>
      <meta
        name="description"
        content="Browse and support petitions that matter to you. Discover local and national campaigns for social change, community activism, and civic engagement."
      />
      <meta
        name="keywords"
        content="browse petitions, find petitions, social change campaigns, community activism, civic engagement, local petitions, national petitions, advocacy"
      />
      <meta name="author" content="Petitions by BetterGov.ph" />
      <meta property="og:title" content="All Petitions | Petitions by BetterGov.ph" />
      <meta
        property="og:description"
        content="Browse and support petitions that matter to you. Discover local and national campaigns for change."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://petition.ph/petitions" />
      <meta property="og:image" content="https://petition.ph/og-image.jpg" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="All Petitions | Petitions by BetterGov.ph" />
      <meta
        name="twitter:description"
        content="Browse and support petitions that matter to you. Discover local and national campaigns for change."
      />
      <meta name="twitter:image" content="https://petition.ph/og-image.jpg" />
      <link rel="canonical" href="https://petition.ph/petitions" />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Active Petitions</h1>
            <p className="text-lg text-gray-800 mb-6">
              Browse and support petitions that matter to you
            </p>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search petitions..."
                  className="w-full text-lg py-6 bg-white shadow-xs"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                {/* Petition Location */}
                <Select
                  value={filter}
                  onValueChange={value => setFilter(value as PetitionLocation)}
                >
                  <SelectTrigger className="w-[180px] text-lg py-6 gap-1 bg-white shadow-xs">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem className="text-base" value="all">
                      All
                    </SelectItem>
                    <SelectItem className="text-base" value="local">
                      Local
                    </SelectItem>
                    <SelectItem className="text-base" value="national">
                      National
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Categories */}
                <FilterPopover
                  title="Categories"
                  options={filterOptions}
                  selectedValues={selectedCategories}
                  onSelect={handleCategorySelect}
                  onClear={handleCategoryClear}
                />
              </div>
            </div>
          </div>

          {loading && petitions.length === 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
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
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-lg text-red-600">{error}</p>
              <Button onClick={() => fetchPetitions(true)} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : filteredPetitions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-800 mb-4">
                {searchQuery ? 'No petitions match your search.' : 'No petitions found.'}
              </p>
              <Link to="/create">
                <Button>Create the First Petition</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredPetitions.map(petition => (
                  <PetitionCard
                    key={petition.id}
                    petition={petition}
                    showSignedStatus={true}
                    showTypeBadge={true}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && !searchQuery && (
                <div className="text-center mt-8">
                  <Button onClick={handleLoadMore} disabled={loading} variant="outline" size="lg">
                    {loading ? 'Loading...' : 'Load More Petitions'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
