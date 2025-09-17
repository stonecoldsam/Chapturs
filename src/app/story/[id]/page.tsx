'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import { Story, Chapter } from '@/types'
import { mockStories, mockChapters } from '@/lib/mockData'
import { 
  BookmarkIcon as BookmarkOutline,
  HeartIcon as HeartOutline,
  EyeIcon,
  ClockIcon,
  StarIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import { 
  BookmarkIcon as BookmarkSolid,
  HeartIcon as HeartSolid
} from '@heroicons/react/24/solid'
import Image from 'next/image'

export default function StoryPage() {
  const params = useParams()
  const storyId = params?.id as string
  
  const [story, setStory] = useState<Story | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)

  useEffect(() => {
    // Find story by ID
    const foundStory = mockStories.find(s => s.id === storyId)
    if (foundStory) {
      setStory(foundStory)
      
      // Get chapters for this story
      const storyChapters = mockChapters.filter(c => c.storyId === storyId)
      setChapters(storyChapters)
    }
  }, [storyId])

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const startReading = () => {
    if (chapters.length > 0) {
      // Navigate to first chapter
      window.location.href = `/story/${storyId}/chapter/${chapters[0].id}`
    }
  }

  const continueReading = () => {
    // In a real app, this would determine the user's last read chapter
    if (chapters.length > 0) {
      window.location.href = `/story/${storyId}/chapter/${chapters[0].id}`
    }
  }

  if (!story) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Story Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Story Cover */}
              <div className="flex-shrink-0">
                <div className="w-48 h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-4xl mb-2">📚</div>
                    <div className="text-sm font-medium">Cover Image</div>
                  </div>
                </div>
              </div>

              {/* Story Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {story.title}
                    </h1>
                    <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center space-x-2">
                        <Image
                          src={story.author.avatar || '/default-avatar.png'}
                          alt={story.author.username}
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="font-medium">{story.author.username}</span>
                      </div>
                      <span>•</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        story.status === 'ongoing' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        story.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {story.status.charAt(0).toUpperCase() + story.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleBookmark}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {isBookmarked ? (
                        <BookmarkSolid className="w-6 h-6 text-blue-500" />
                      ) : (
                        <BookmarkOutline className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={handleLike}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {isLiked ? (
                        <HeartSolid className="w-6 h-6 text-red-500" />
                      ) : (
                        <HeartOutline className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <p className={`text-gray-700 dark:text-gray-300 leading-relaxed ${
                    !showFullDescription ? 'line-clamp-3' : ''
                  }`}>
                    {story.description}
                  </p>
                  {story.description.length > 200 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-blue-500 hover:text-blue-600 text-sm mt-2"
                    >
                      {showFullDescription ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>

                {/* Genres and Tags */}
                <div className="space-y-3 mb-6">
                  <div className="flex flex-wrap gap-2">
                    {story.genres.map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {story.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {story.statistics.views.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {story.statistics.subscribers.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Subscribers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {story.statistics.bookmarks.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Bookmarks</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {story.statistics.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      ({story.statistics.ratingCount} ratings)
                    </div>
                  </div>
                </div>

                {/* Reading Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={startReading}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex-1"
                  >
                    <PlayIcon className="w-5 h-5" />
                    <span>Start Reading</span>
                  </button>
                  <button
                    onClick={continueReading}
                    className="flex items-center justify-center space-x-2 px-6 py-3 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex-1"
                  >
                    <span>Continue Reading</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chapter List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Chapters ({chapters.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {chapters.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="text-lg font-medium mb-2">No chapters yet</h3>
                <p className="text-sm">Check back later for new content from this author.</p>
              </div>
            ) : (
              chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => window.location.href = `/story/${storyId}/chapter/${chapter.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                        Chapter {chapter.chapterNumber}: {chapter.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>{new Date(chapter.publishedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <EyeIcon className="w-4 h-4" />
                          <span>{chapter.wordCount} words</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {chapter.isPublished ? (
                        <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                          Published
                        </span>
                      ) : (
                        <span className="text-xs text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
