'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import ChapterContent from '@/components/GlossarySystem'
import { Story, Chapter } from '@/types'
import { mockStories, mockChapters } from '@/lib/mockData'
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  ListBulletIcon,
  Cog6ToothIcon,
  BookmarkIcon as BookmarkOutline,
  HeartIcon as HeartOutline
} from '@heroicons/react/24/outline'
import { 
  BookmarkIcon as BookmarkSolid,
  HeartIcon as HeartSolid
} from '@heroicons/react/24/solid'

export default function ChapterPage() {
  const params = useParams()
  const storyId = params?.id as string
  const chapterId = params?.chapterId as string
  
  const [story, setStory] = useState<Story | null>(null)
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [allChapters, setAllChapters] = useState<Chapter[]>([])
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [showChapterList, setShowChapterList] = useState(false)
  const [readingSettings, setReadingSettings] = useState({
    fontSize: 'medium',
    fontFamily: 'Inter',
    lineHeight: 1.7,
    theme: 'auto'
  })

  useEffect(() => {
    // Find story and chapter
    const foundStory = mockStories.find(s => s.id === storyId)
    if (foundStory) {
      setStory(foundStory)
      
      const storyChapters = mockChapters.filter(c => c.storyId === storyId)
      setAllChapters(storyChapters)
      
      const foundChapter = storyChapters.find(c => c.id === chapterId)
      if (foundChapter) {
        setChapter(foundChapter)
        const index = storyChapters.findIndex(c => c.id === chapterId)
        setCurrentChapterIndex(index)
      }
    }
  }, [storyId, chapterId])

  const navigateToChapter = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < allChapters.length) {
      const newChapter = allChapters[newIndex]
      window.location.href = `/story/${storyId}/chapter/${newChapter.id}`
    }
  }

  const previousChapter = () => {
    navigateToChapter(currentChapterIndex - 1)
  }

  const nextChapter = () => {
    navigateToChapter(currentChapterIndex + 1)
  }

  const getFontSizeClass = () => {
    switch (readingSettings.fontSize) {
      case 'small': return 'text-sm'
      case 'large': return 'text-lg'
      case 'xl': return 'text-xl'
      default: return 'text-base'
    }
  }

  const getLineHeightStyle = () => ({
    lineHeight: readingSettings.lineHeight
  })

  if (!story || !chapter) {
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
      <div className="max-w-4xl mx-auto">
        {/* Chapter Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = `/story/${storyId}`}
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                ← Back to Story
              </button>
              <div className="h-4 border-l border-gray-300 dark:border-gray-600"></div>
              <button
                onClick={() => setShowChapterList(!showChapterList)}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ListBulletIcon className="w-5 h-5" />
                <span className="text-sm">Chapters</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isBookmarked ? (
                  <BookmarkSolid className="w-5 h-5 text-blue-500" />
                ) : (
                  <BookmarkOutline className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isLiked ? (
                  <HeartSolid className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartOutline className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Cog6ToothIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {story.title}
            </h1>
            <h2 className="text-xl text-gray-700 dark:text-gray-300">
              Chapter {chapter.chapterNumber}: {chapter.title}
            </h2>
          </div>
        </div>

        {/* Chapter List Dropdown */}
        {showChapterList && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">All Chapters</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {allChapters.map((ch, index) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setShowChapterList(false)
                    navigateToChapter(index)
                  }}
                  className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    ch.id === chapter.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    Chapter {ch.chapterNumber}: {ch.title}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {ch.wordCount} words • {new Date(ch.publishedAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chapter Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <div
            className={`${getFontSizeClass()} text-gray-900 dark:text-gray-100`}
            style={getLineHeightStyle()}
          >
            <ChapterContent
              content={chapter.content}
              glossaryTerms={chapter.glossaryTerms}
              currentChapter={chapter.chapterNumber}
            />
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={previousChapter}
              disabled={currentChapterIndex === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              <span>Previous</span>
            </button>

            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Chapter {currentChapterIndex + 1} of {allChapters.length}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {chapter.wordCount} words
              </div>
            </div>

            <button
              onClick={nextChapter}
              disabled={currentChapterIndex === allChapters.length - 1}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentChapterIndex + 1) / allChapters.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </AppLayout>
  )
}
