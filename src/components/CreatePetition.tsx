import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
// import { ImageUpload } from './ui/ImageUpload' // Using custom implementation for server-side upload
import { petitionApi, categoryApi, ApiError } from '../services/api'
import type { Category } from '../types/api'
import MDEditor, { commands } from '@uiw/react-md-editor'
import { useAuth, type Session } from '../hooks/useAuth'
import { useModal } from '../contexts/ModalContext'
import { useTranslation } from 'react-i18next'

interface CreatePetitionFormData {
  title: string
  description: string
  type: 'local' | 'national'
  location: string
  targetCount: number
  imageUrl: string
  categories: number[]
}

interface ImageUploadState {
  file: File | null
  url: string
}

export default function CreatePetition() {
  const navigate = useNavigate()
  const {
    session,
    status,
  }: {
    session: Session | null
    status: 'loading' | 'authenticated' | 'unauthenticated'
  } = useAuth()
  const { showSignInModal } = useModal()
  const { t } = useTranslation('common')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<CreatePetitionFormData>({
    title: '',
    description: '',
    type: 'national',
    location: '',
    targetCount: 1000,
    imageUrl: '',
    categories: [],
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [errors, setErrors] = useState<Partial<Record<keyof CreatePetitionFormData, string>>>({})
  const [submitError, setSubmitError] = useState<string>('')
  const [imageState, setImageState] = useState<ImageUploadState>({ file: null, url: '' })

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await categoryApi.getAll()
        setCategories(fetchedCategories)
      } catch (error) {
        console.error('Failed to load categories:', error)
        // Fallback to hardcoded categories if API fails
        setCategories([
          {
            id: 1,
            name: 'Environment',
            description: 'Environmental protection and sustainability',
            created_at: '',
          },
          {
            id: 2,
            name: 'Education',
            description: 'Educational policies and reforms',
            created_at: '',
          },
          {
            id: 3,
            name: 'Healthcare',
            description: 'Healthcare access and policies',
            created_at: '',
          },
          {
            id: 4,
            name: 'Social Justice',
            description: 'Social equality and justice',
            created_at: '',
          },
          {
            id: 5,
            name: 'Transportation',
            description: 'Public transportation and infrastructure',
            created_at: '',
          },
          {
            id: 6,
            name: 'Local Government',
            description: 'Local government policies',
            created_at: '',
          },
          {
            id: 7,
            name: 'Animal Rights',
            description: 'Animal welfare and protection',
            created_at: '',
          },
          {
            id: 8,
            name: 'Technology',
            description: 'Technology policies and digital rights',
            created_at: '',
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreatePetitionFormData, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = t('create.titleRequired')
    } else if (formData.title.length < 10) {
      newErrors.title = t('create.titleTooShort')
    }

    if (!formData.description.trim()) {
      newErrors.description = t('create.descriptionRequired')
    } else if (formData.description.length < 100) {
      newErrors.description = t('create.descriptionTooShort')
    }

    if (formData.type === 'local' && !formData.location.trim()) {
      newErrors.location = t('create.locationRequired')
    }

    if (formData.targetCount < 1) {
      newErrors.targetCount = t('create.targetCountMinimum')
    }

    // Image validation is handled during file upload

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Removed unused isValidUrl function

  const handleInputChange = (
    field: keyof CreatePetitionFormData,
    value: string | number | number[] | File | null
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const handleImageSelected = (file: File) => {
    // Store the file for later upload and create preview URL
    const previewUrl = URL.createObjectURL(file)
    setImageState({ file, url: previewUrl })
    handleInputChange('imageUrl', previewUrl) // For preview purposes
    
    // Clear any previous image errors
    if (errors.imageUrl) {
      setErrors(prev => ({ ...prev, imageUrl: undefined }))
    }
  }

  const handleImageRemoved = () => {
    // Clean up preview URL and reset state
    if (imageState.url && imageState.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageState.url)
    }
    setImageState({ file: null, url: '' })
    handleInputChange('imageUrl', '')
  }

  const handleCategoryToggle = (categoryId: number) => {
    const updatedCategories = formData.categories.includes(categoryId)
      ? formData.categories.filter(id => id !== categoryId)
      : [...formData.categories, categoryId]

    handleInputChange('categories', updatedCategories)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check authentication before submitting
    if (status !== 'authenticated' || !session) {
      // This shouldn't happen as the form is only shown to authenticated users
      console.error('Attempt to submit petition without authentication')
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      let petition

      if (imageState.file) {
        // Create petition with image using FormData
        const submitFormData = new FormData()
        submitFormData.append('title', formData.title)
        submitFormData.append('description', formData.description)
        submitFormData.append('type', formData.type)
        if (formData.type === 'local' && formData.location) {
          submitFormData.append('location', formData.location)
        }
        submitFormData.append('target_count', formData.targetCount.toString())
        submitFormData.append('created_by', session.user.id)
        submitFormData.append('category_ids', JSON.stringify(formData.categories))
        submitFormData.append('image', imageState.file)

        // Send FormData directly to the API
        const response = await fetch('/api/petitions', {
          method: 'POST',
          body: submitFormData,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        petition = await response.json() as any
      } else {
        // Create petition without image using JSON
        const petitionData = {
          title: formData.title,
          description: formData.description,
          type: formData.type,
          location: formData.type === 'local' ? formData.location : undefined,
          target_count: formData.targetCount,
          created_by: session.user.id,
          category_ids: formData.categories,
        }

        petition = await petitionApi.create(petitionData)
      }

      // Clean up preview URL if it exists
      if (imageState.url && imageState.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageState.url)
      }

      // Navigate to review and publish page
      navigate(`/review/${petition.slug}`)
    } catch (error) {
      console.error('Error creating petition:', error)
      if (error instanceof ApiError) {
        setSubmitError(`${t('create.error')}: ${error.message}`)
      } else {
        setSubmitError(t('create.unexpectedError'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {status === 'loading' ? t('create.signInRequired') : 'Loading form...'}
          </p>
        </div>
      </div>
    )
  }

  // Show sign-in prompt if not authenticated
  if (status !== 'authenticated' || !session) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('create.title')}</h1>
            <p className="text-lg text-gray-600 mb-8">{t('create.subtitle')}</p>

            <Card className="max-w-md mx-auto p-8">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('create.signInRequired')}
                  </h2>
                  <p className="text-gray-600 text-sm">{t('create.signInSubtitle')}</p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => showSignInModal({
                      title: 'Sign In to Create Petition',
                      subtitle: 'Sign in to start creating your petition'
                    })}
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-3 h-12"
                  >
                    {t('create.signInRequired')}
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="w-full text-gray-600 hover:text-gray-800"
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('create.title')}</h1>
          <p className="mt-2 text-lg text-gray-600">{t('create.subtitle')}</p>
        </div>

        <Card className="p-8 bg-white shadow-lg border border-gray-200">
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700 font-medium">{submitError}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Petition Type Selection */}
            <div>
              <label className="text-base font-medium text-gray-900">
                {t('create.petitionType')}
              </label>
              <p className="text-sm leading-5 text-gray-700 mb-4">
                Choose whether your petition addresses local or national issues
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    formData.type === 'national'
                      ? 'border-2 border-blue-500 bg-blue-50'
                      : 'border border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handleInputChange('type', 'national')}
                >
                  <div className="p-6">
                    <div className="flex items-center">
                      <input
                        id="national"
                        name="petition-type"
                        type="radio"
                        checked={formData.type === 'national'}
                        onChange={() => handleInputChange('type', 'national')}
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="national" className="ml-3 text-lg font-medium text-gray-900">
                        {t('create.national')}
                      </label>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{t('create.nationalDescription')}</p>
                  </div>
                </Card>

                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    formData.type === 'local'
                      ? 'border-2 border-blue-500 bg-blue-50'
                      : 'border border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handleInputChange('type', 'local')}
                >
                  <div className="p-6">
                    <div className="flex items-center">
                      <input
                        id="local"
                        name="petition-type"
                        type="radio"
                        checked={formData.type === 'local'}
                        onChange={() => handleInputChange('type', 'local')}
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="local" className="ml-3 text-lg font-medium text-gray-900">
                        {t('create.local')}
                      </label>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{t('create.localDescription')}</p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Location field for local petitions */}
            {formData.type === 'local' && (
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-900">
                  {t('create.location')} *
                </label>
                <p className="text-sm text-gray-700 mb-2">
                  Specify the city, county, or state this petition addresses
                </p>
                <Input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={e => handleInputChange('location', e.target.value)}
                  placeholder={t('create.locationPlaceholder')}
                  className={errors.location ? 'border-red-300' : ''}
                />
                {errors.location && (
                  <div className="mt-2 flex items-center">
                    <svg
                      className="h-4 w-4 text-red-500 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-red-700 font-medium">{errors.location}</p>
                  </div>
                )}
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-900">
                {t('create.petitionTitle')} *
              </label>
              <p className="text-sm text-gray-700 mb-2">
                Create a clear, compelling title that summarizes your petition
              </p>
              <Input
                type="text"
                id="title"
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                placeholder={t('create.titlePlaceholder')}
                className={errors.title ? 'border-red-300' : ''}
                maxLength={150}
              />
              <div className="flex justify-between items-start mt-1">
                {errors.title && (
                  <div className="flex items-center">
                    <svg
                      className="h-4 w-4 text-red-500 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-red-700 font-medium">{errors.title}</p>
                  </div>
                )}
                <p className="text-xs text-gray-500 ml-auto">{formData.title.length}/150</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('create.petitionDescription')} *
              </label>
              <p className="text-sm text-gray-700 mb-4">
                Explain the issue, why it matters, and what action you want taken. You can use
                markdown formatting for better presentation.
              </p>
              <div
                className={`rounded-md overflow-hidden ${errors.description ? 'ring-2 ring-red-500' : ''}`}
              >
                <MDEditor
                  value={formData.description}
                  onChange={value => handleInputChange('description', value || '')}
                  preview="edit"
                  hideToolbar={false}
                  visibleDragbar={false}
                  textareaProps={{
                    placeholder: t('create.descriptionPlaceholder'),
                    style: { minHeight: '200px', maxHeight: '400px' },
                  }}
                  data-color-mode="light"
                  commands={[
                    commands.bold,
                    commands.italic,
                    commands.unorderedListCommand,
                    commands.orderedListCommand,
                    commands.link
                  ]}
                  style={{ 
                    border: '1px solid #ccc', 
                    borderRadius: '0',
                    backgroundColor: 'white'
                  }}
                  height={300}
                />
              </div>
              <div className="flex justify-between items-start mt-2">
                {errors.description && (
                  <div className="flex items-center">
                    <svg
                      className="h-4 w-4 text-red-500 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-red-700 font-medium">{errors.description}</p>
                  </div>
                )}
                <p className="text-xs text-gray-500 ml-auto">
                  {formData.description.length} characters
                </p>
              </div>

              <div className="mt-2 text-xs text-gray-800">
                <p className="font-medium mb-1">Markdown formatting tips:</p>
                <div className="grid grid-cols-2 gap-2">
                  <span>**Bold text**</span>
                  <span>*Italic text*</span>
                  <span>- Bullet points</span>
                  <span>1. Numbered lists</span>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('create.petitionImage')}
              </label>
              <p className="text-sm text-gray-700 mb-4">
                Add an image to make your petition more compelling (Max 5MB)
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleImageSelected(file)
                    }
                  }}
                  className="hidden"
                  id="image-upload"
                  disabled={isSubmitting}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  {formData.imageUrl ? (
                    <div className="relative">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="max-w-full max-h-48 mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleImageRemoved()
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        📷
                      </div>
                      <p className="text-gray-500">Click to select an image</p>
                      <p className="text-xs text-gray-400">Max 5MB, JPEG/PNG/WebP/GIF</p>
                    </div>
                  )}
                </label>
              </div>
              {errors.imageUrl && (
                <div className="mt-2 flex items-center">
                  <svg
                    className="h-4 w-4 text-red-500 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-red-700 font-medium">{errors.imageUrl}</p>
                </div>
              )}
            </div>

            {/* Target Count */}
            <div>
              <label htmlFor="targetCount" className="block text-sm font-medium text-gray-900">
                {t('create.targetSignatures')}
              </label>
              <p className="text-sm text-gray-700 mb-2">
                Set a goal for how many signatures you want to collect
              </p>
              <Input
                type="number"
                id="targetCount"
                value={formData.targetCount}
                onChange={e => handleInputChange('targetCount', parseInt(e.target.value) || 0)}
                min="1"
                max="1000000"
                className={errors.targetCount ? 'border-red-300' : ''}
              />
              {errors.targetCount && (
                <div className="mt-2 flex items-center">
                  <svg
                    className="h-4 w-4 text-red-500 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-red-700 font-medium">{errors.targetCount}</p>
                </div>
              )}
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('create.categories')}
              </label>
              <p className="text-sm text-gray-700 mb-3">
                Select categories that best describe your petition
              </p>

              {/* Category Dropdown */}
              <div className="relative">
                <select
                  onChange={e => {
                    const categoryId = parseInt(e.target.value)
                    if (categoryId && !formData.categories.includes(categoryId)) {
                      handleCategoryToggle(categoryId)
                    }
                    e.target.value = '' // Reset selection
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t('create.selectCategories')}</option>
                  {categories
                    .filter(category => !formData.categories.includes(category.id))
                    .map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Selected Categories as Tags */}
              {formData.categories.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-900 mb-2">Selected categories:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.categories.map(categoryId => {
                      const category = categories.find(c => c.id === categoryId)
                      return category ? (
                        <Badge
                          key={categoryId}
                          variant="secondary"
                          className="flex items-center gap-1 px-3 py-1"
                        >
                          {category.name}
                          <button
                            type="button"
                            onClick={() => handleCategoryToggle(categoryId)}
                            className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* User Info Display */}
            {session && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">Creating petition as:</h3>
                <div className="flex items-center gap-3">
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-green-900">
                      {session.user.name || 'User'}
                    </p>

                  </div>
                </div>
              </div>
            )}

            {/* Error Summary */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Please fix the following errors before submitting:
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc list-inside space-y-1">
                        {Object.entries(errors).map(([field, error]) => (
                          <li key={field}>
                            <span className="font-medium capitalize">
                              {field === 'targetCount' ? 'Target signatures' : field}:
                            </span>{' '}
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                {isSubmitting ? t('create.creating') : t('create.createPetition')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
