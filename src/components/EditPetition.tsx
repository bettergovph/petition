import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { petitionApi, categoryApi, ApiError } from '../services/api'
import type { Category, PetitionWithDetails } from '../types/api'
import MDEditor, { commands } from '@uiw/react-md-editor'
import { useAuth } from '../hooks/useAuth'
import { ArrowLeft, Save, Trash2, AlertCircle, Eye } from 'lucide-react'

interface EditPetitionFormData {
  title: string
  description: string
  type: 'local' | 'national'
  location: string
  targetCount: number
  imageUrl: string
  categories: number[]
  status: 'active' | 'completed' | 'closed'
}

interface ImageUploadState {
  file: File | null
  url: string
}

export default function EditPetition() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()
  const { session, status } = useAuth()

  const [petition, setPetition] = useState<PetitionWithDetails | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<EditPetitionFormData>({
    title: '',
    description: '',
    type: 'local',
    location: '',
    targetCount: 1000,
    imageUrl: '',
    categories: [],
    status: 'active'
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [errors, setErrors] = useState<Partial<Record<keyof EditPetitionFormData, string>>>({})
  const [submitError, setSubmitError] = useState<string>('')
  const [imageState, setImageState] = useState<ImageUploadState>({ file: null, url: '' })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmTitle, setDeleteConfirmTitle] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUnpublishing, setIsUnpublishing] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  // Load petition and categories on component mount
  useEffect(() => {
    if (slug) {
      loadPetitionData()
    }
  }, [slug])

  useEffect(() => {
    loadCategories()
  }, [])

  const loadPetitionData = async () => {
    if (!slug) return

    try {
      setIsLoading(true)
      const petitionData = await petitionApi.getBySlug(slug)
      setPetition(petitionData)

      // Check if user owns this petition
      if (status === 'authenticated' && session?.user?.id !== petitionData.created_by) {
        navigate('/profile', { replace: true })
        return
      }

      // Populate form with petition data
      setFormData({
        title: petitionData.title,
        description: petitionData.description,
        type: petitionData.type,
        location: petitionData.location || '',
        targetCount: petitionData.target_count,
        imageUrl: petitionData.image_url || '',
        categories: petitionData.categories?.map(cat => cat.id) || [],
        status: petitionData.status
      })
    } catch (error) {
      console.error('Failed to load petition:', error)
      navigate('/profile', { replace: true })
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const fetchedCategories = await categoryApi.getAll()
      setCategories(fetchedCategories)
    } catch (error) {
      console.error('Failed to load categories:', error)
      // Fallback categories
      setCategories([
        { id: 1, name: 'Environment', description: 'Environmental protection', created_at: '' },
        { id: 2, name: 'Education', description: 'Educational policies', created_at: '' },
        { id: 3, name: 'Healthcare', description: 'Healthcare access', created_at: '' },
        { id: 4, name: 'Social Justice', description: 'Social equality', created_at: '' },
        { id: 5, name: 'Transportation', description: 'Public transportation', created_at: '' },
        { id: 6, name: 'Local Government', description: 'Local government policies', created_at: '' },
        { id: 7, name: 'Animal Rights', description: 'Animal welfare', created_at: '' },
        { id: 8, name: 'Technology', description: 'Technology policies', created_at: '' },
      ])
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EditPetitionFormData, string>> = {}

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (
    field: keyof EditPetitionFormData,
    value: string | number | string[] | File | null
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, imageUrl: t('create.imageSizeError') }))
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, imageUrl: t('create.imageTypeError') }))
      return
    }

    // Store the file for later upload and create preview URL
    const previewUrl = URL.createObjectURL(file)
    setImageState({ file, url: previewUrl })
    handleInputChange('imageUrl', previewUrl) // For preview purposes
  }

  const handleCategoryToggle = (categoryId: number) => {
    const updatedCategories = formData.categories.includes(categoryId)
      ? formData.categories.filter(id => id !== categoryId)
      : [...formData.categories, categoryId]

    handleInputChange('categories', updatedCategories.map(String))
  }

  const handlePublish = async () => {
    if (!petition) return

    setIsPublishing(true)
    try {
      await petitionApi.publish(petition.id)
      // Reload petition data to get updated published_at
      await loadPetitionData()
    } catch (error) {
      console.error('Error publishing petition:', error)
      setSubmitError('Failed to publish petition. Please try again.')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleUnpublish = async () => {
    if (!petition) return

    setIsUnpublishing(true)
    try {
      await petitionApi.unpublish(petition.id)
      navigate(`/petition/${petition.slug}`)
    } catch (error) {
      console.error('Error unpublishing petition:', error)
      setSubmitError('Failed to unpublish petition. Please try again.')
    } finally {
      setIsUnpublishing(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!petition || deleteConfirmTitle !== petition.title) {
      return
    }

    setIsDeleting(true)
    try {
      await petitionApi.delete(petition.id)
      navigate('/profile')
    } catch (error) {
      console.error('Error deleting petition:', error)
      setSubmitError('Failed to delete petition. Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!petition || !validateForm()) {
      return
    }

    // Check authentication
    if (status !== 'authenticated' || !session) {
      console.error('User not authenticated')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      if (imageState.file) {
        // Update petition with image using FormData
        console.log('🖼️ EditPetition: Uploading new image file:', imageState.file.name)
        const submitFormData = new FormData()
        submitFormData.append('title', formData.title)
        submitFormData.append('description', formData.description)
        submitFormData.append('type', formData.type)
        if (formData.type === 'local' && formData.location) {
          submitFormData.append('location', formData.location)
        }
        submitFormData.append('target_count', formData.targetCount.toString())
        submitFormData.append('category_ids', JSON.stringify(formData.categories))
        submitFormData.append('status', formData.status)
        submitFormData.append('image', imageState.file)

        // Send FormData directly to the API
        const response = await fetch(`/api/petitions/${petition.id}`, {
          method: 'PUT',
          body: submitFormData,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        console.log('✅ EditPetition: Image uploaded successfully')
      } else {
        // Update petition without new image using JSON
        // Don't include image_url to avoid sending base64 data
        console.log('📝 EditPetition: Updating petition without new image')
        const petitionData = {
          title: formData.title,
          description: formData.description,
          type: formData.type,
          location: formData.type === 'local' ? formData.location : undefined,
          target_count: formData.targetCount,
          category_ids: formData.categories,
          status: formData.status
          // Explicitly NOT including image_url to preserve existing image
        }

        await petitionApi.update(petition.id, petitionData)
        console.log('✅ EditPetition: Petition updated successfully (no image change)')
      }

      // Clean up preview URL if it exists
      if (imageState.url && imageState.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageState.url)
      }

      // Navigate back to profile or petition detail
      navigate(`/petition/${petition.slug}`)
    } catch (error) {
      console.error('Error updating petition:', error)
      if (error instanceof ApiError) {
        setSubmitError(`${t('create.error')}: ${error.message}`)
      } else {
        setSubmitError(t('create.unexpectedError'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-800">Loading petition...</p>
        </div>
      </div>
    )
  }

  if (status !== 'authenticated' || !session || !petition) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-md mx-auto p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-800 mb-6">You can only edit petitions that you created.</p>
            <Button onClick={() => navigate('/profile')} className="bg-blue-600 hover:bg-blue-700 text-white">
              Go to Profile
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(`/petition/${petition.slug}`)}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Petition
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Petition</h1>
          <p className="mt-2 text-lg text-gray-800">
            Update your petition details and settings
          </p>
        </div>

        {/* Publication Status Banner */}
        {!petition?.published_at && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-800 mb-1">
                    Petition Not Published
                  </h3>
                  <p className="text-sm text-amber-700 mb-3">
                    Your petition is currently in draft mode and not visible to the public. 
                    After making your changes, remember to publish it so people can find and sign it.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handlePublish}
                      disabled={isPublishing || isSubmitting}
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {isPublishing ? 'Publishing...' : 'Publish Now'}
                    </Button>
                    <Button
                      onClick={() => navigate(`/petition/${petition.slug}`)}
                      variant="outline"
                      size="sm"
                      className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                      Preview Draft
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-8">
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Petition Status */}
            <div>
              <label className="text-base font-medium text-gray-900 mb-4 block">
                Petition Status
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {['active', 'completed', 'closed'].map((statusOption) => (
                  <Card
                    key={statusOption}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      formData.status === statusOption
                        ? 'border-2 border-blue-500 bg-blue-50'
                        : 'border border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => handleInputChange('status', statusOption as 'active' | 'completed' | 'closed')}
                  >
                    <div className="p-4">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          checked={formData.status === statusOption}
                          onChange={() => handleInputChange('status', statusOption as 'active' | 'completed' | 'closed')}
                          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label className="ml-3 text-lg font-medium text-gray-900 capitalize">
                          {statusOption}
                        </label>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Petition Type Selection */}
            <div>
              <label className="text-base font-medium text-gray-900">
                {t('create.petitionType')}
              </label>
              <p className="text-sm leading-5 text-gray-500 mb-4">
                Choose whether your petition addresses local or national issues
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    <p className="mt-2 text-sm text-gray-800">
                      {t('create.localDescription')}
                    </p>
                  </div>
                </Card>

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
                    <p className="mt-2 text-sm text-gray-800">
                      {t('create.nationalDescription')}
                    </p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Location field for local petitions */}
            {formData.type === 'local' && (
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  {t('create.location')} *
                </label>
                <p className="text-sm text-gray-500 mb-2">
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
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                {t('create.petitionTitle')} *
              </label>
              <p className="text-sm text-gray-500 mb-2">
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
              <div className="flex justify-between items-center mt-1">
                {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                <p className="text-xs text-gray-500 ml-auto">{formData.title.length}/150</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('create.petitionDescription')} *
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Explain the issue, why it matters, and what action you want taken. You can use markdown formatting for better presentation.
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
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('create.petitionImage')} (optional)
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Add an image to make your petition more compelling (Max 5MB)
              </p>

              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-gray-400">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {formData.imageUrl ? (
                        <div className="text-center">
                          <p className="text-sm text-green-600 font-medium">✓ Image uploaded</p>
                          <p className="text-xs text-gray-500">{imageState.file?.name || 'Current image'}</p>
                        </div>
                      ) : (
                        <>
                          <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">{t('create.chooseImage')}</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </>
                      )}
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                {formData.imageUrl && (
                  <div className="relative">
                    <img
                      src={formData.imageUrl}
                      alt="Petition preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        // Clean up preview URL and reset state
                        if (imageState.url && imageState.url.startsWith('blob:')) {
                          URL.revokeObjectURL(imageState.url)
                        }
                        setImageState({ file: null, url: '' })
                        handleInputChange('imageUrl', '')
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {errors.imageUrl && <p className="mt-1 text-sm text-red-600">{errors.imageUrl}</p>}
            </div>

            {/* Target Count */}
            <div>
              <label htmlFor="targetCount" className="block text-sm font-medium text-gray-700">
                {t('create.targetSignatures')}
              </label>
              <p className="text-sm text-gray-500 mb-2">
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
                <p className="mt-1 text-sm text-red-600">{errors.targetCount}</p>
              )}
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('create.categories')}
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Select categories that best describe your petition
              </p>

              {/* Category Dropdown */}
              <div className="relative">
                <select
                  onChange={(e) => {
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
                    ))
                  }
                </select>
              </div>

              {/* Selected Categories as Tags */}
              {formData.categories.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected categories:</p>
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
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/petition/${petition.slug}`)}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                Cancel
              </Button>
              <div className="flex gap-3">
                {!petition?.published_at ? (
                  <Button
                    type="button"
                    onClick={handlePublish}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                    disabled={isSubmitting || isPublishing}
                  >
                    <Eye className="w-4 h-4" />
                    {isPublishing ? 'Publishing...' : 'Publish Petition'}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUnpublish}
                    className="flex items-center gap-2 text-orange-600 border-orange-300 hover:bg-orange-50"
                    disabled={isSubmitting || isUnpublishing}
                  >
                    {isUnpublishing ? 'Unpublishing...' : 'Unpublish'}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                  disabled={isSubmitting || isDeleting}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Petition
                </Button>
                <Button type="submit" disabled={isSubmitting || isDeleting || isUnpublishing || isPublishing} className="min-w-[120px] flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Petition
            </h3>
            <p className="text-gray-800 mb-4">
              This action cannot be undone. This will permanently delete the petition and all associated signatures.
            </p>
            <p className="text-sm text-gray-800 mb-4">
              To confirm deletion, please type the petition title: <strong>"{petition?.title}"</strong>
            </p>
            <Input
              type="text"
              value={deleteConfirmTitle}
              onChange={(e) => setDeleteConfirmTitle(e.target.value)}
              placeholder="Type petition title here"
              className="mb-4"
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmTitle('')
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting || deleteConfirmTitle !== petition?.title}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Delete Petition'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}