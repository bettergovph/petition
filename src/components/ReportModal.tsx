import { useState } from 'react'
import { Button } from './ui/button'
import { AlertTriangle, X } from 'lucide-react'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: string, description?: string) => Promise<void>
  itemType: 'petition' | 'signature'
  itemTitle?: string
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or fake content' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'misinformation', label: 'False or misleading information' },
  { value: 'hate_speech', label: 'Hate speech or discrimination' },
  { value: 'violence', label: 'Promotes violence or harm' },
  { value: 'copyright_violation', label: 'Copyright violation' },
  { value: 'other', label: 'Other (please describe)' },
]

export default function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  itemType,
  itemTitle,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedReason) {
      setError('Please select a reason for reporting')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await onSubmit(selectedReason, description.trim() || undefined)
      // Reset form
      setSelectedReason('')
      setDescription('')
      onClose()
    } catch (error) {
      console.error('Error submitting report:', error)
      setError(error instanceof Error ? error.message : 'Failed to submit report')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedReason('')
      setDescription('')
      setError('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Report {itemType}</h2>
              {itemTitle && (
                <p className="text-sm text-gray-600 truncate max-w-xs">"{itemTitle}"</p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-4">
              Help us maintain a safe and respectful community. Please select the reason for
              reporting this {itemType}:
            </p>

            <div className="space-y-2">
              {REPORT_REASONS.map(reason => (
                <label
                  key={reason.value}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedReason === reason.value
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={e => setSelectedReason(e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                      selectedReason === reason.value
                        ? 'border-red-500 bg-red-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedReason === reason.value && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-sm text-gray-900">{reason.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description field */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Additional details (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Please provide any additional context that would help us understand the issue..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              rows={3}
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                This information will help our moderation team review the report
              </p>
              <span className="text-xs text-gray-500">{description.length}/500</span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedReason}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Reports are reviewed by our moderation team. False reports may result in account
            restrictions.
          </p>
        </form>
      </div>
    </div>
  )
}
