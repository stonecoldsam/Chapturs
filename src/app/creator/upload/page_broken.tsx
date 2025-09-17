'use client'

// Upload page for creating new works
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import { ContentFormat } from '@/types'
import { getFormatIcon } from '@/lib/mockData'
import { 
  XMarkIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

interface NewWork {
  title: string
  description: string
  formatType: ContentFormat
  coverImage?: string
  genres: string[]
  tags: string[]
}

export default function UploadPage() {
  const router = useRouter()
  const [newWork, setNewWork] = useState<NewWork>({
    title: '',
    description: '',
    formatType: 'novel',
    coverImage: '',
    genres: [],
    tags: []
  })

  // Predefined options
  const availableGenres = [
    'Fantasy', 'Science Fiction', 'Romance', 'Mystery', 'Thriller', 
    'Horror', 'Historical Fiction', 'Literary Fiction', 'Young Adult',
    'Non-Fiction', 'Biography', 'Self-Help', 'Comedy', 'Drama', 'Adventure'
  ]

  const handleCreateWork = async () => {
    if (!newWork.title || !newWork.description) {
      alert('Please fill in the title and description')
      return
    }

    try {
      // Create the work via API
      const response = await fetch('/api/works', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newWork.title,
          description: newWork.description,
          formatType: newWork.formatType,
          coverImage: newWork.coverImage,
          genres: newWork.genres,
          tags: newWork.tags,
          status: 'draft'
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Work created:', result)
        
        // Redirect to editor with the new work
        router.push(`/creator/editor?mode=edit&workId=${result.work.id}`)
      } else {
        const error = await response.json()
        alert(`Failed to create work: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating work:', error)
      alert('Failed to create work. Please try again.')
    }
  }

  const handleGenreToggle = (genre: string) => {
    setNewWork(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }))
  }

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !newWork.tags.includes(tag.trim())) {
      setNewWork(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }))
    }
  }

  const handleTagRemove = (tagToRemove: string) => {
    setNewWork(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Work</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Start your creative journey by setting up a new work
          </p>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Work Title *
                </label>
                <input
                  type="text"
                  value={newWork.title}
                  onChange={(e) => setNewWork(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter the title of your work..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={newWork.description}
                  onChange={(e) => setNewWork(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your work - what is it about? What should readers expect?"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Format Type Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Content Format</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(['novel', 'article', 'comic', 'hybrid'] as ContentFormat[]).map((format) => (
                <button
                  key={format}
                  onClick={() => setNewWork(prev => ({ ...prev, formatType: format }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    newWork.formatType === format
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{getFormatIcon(format)}</div>
                    <div className="font-medium text-gray-900 dark:text-white capitalize">
                      {format}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {format === 'novel' && 'Chapters & Stories'}
                      {format === 'article' && 'Essays & Analysis'}
                      {format === 'comic' && 'Visual Stories'}
                      {format === 'hybrid' && 'Mixed Media'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Genres */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {availableGenres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => handleGenreToggle(genre)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    newWork.genres.includes(genre)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tags</h3>
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Add tags (press Enter)..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleTagAdd(e.currentTarget.value)
                      e.currentTarget.value = ''
                    }
                  }}
                />
              </div>
              {newWork.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newWork.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                    >
                      {tag}
                      <button
                        onClick={() => handleTagRemove(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Create Work Button */}
          <div className="flex justify-end">
            <button
              onClick={handleCreateWork}
              disabled={!newWork.title || !newWork.description}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <span>Create Work & Start Writing</span>
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
