'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Work } from '@/types'
import WorkViewer from '@/components/WorkViewer'
import { DataService } from '@/lib/api/DataService'
import { useUser } from '@/hooks/useUser'

export default function WorkPage() {
  const params = useParams()
  const workId = params.id as string
  const { userId, isAuthenticated, isLoading: userLoading } = useUser()
  
  const [work, setWork] = useState<Work | null>(null)
  const [isBookmarkedState, setIsBookmarkedState] = useState(false)
  const [isSubscribedState, setIsSubscribedState] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [buttonLoading, setButtonLoading] = useState({
    bookmark: false,
    subscribe: false,
    like: false
  })

  useEffect(() => {
    const loadWork = async () => {
      try {
        // Get work directly by ID
        const foundWork = await DataService.getWork(workId)
        if (foundWork) {
          setWork(foundWork)
          
          // Load button states if user is authenticated
          if (isAuthenticated && userId) {
            const [bookmarkStatus, subscribeStatus, likeStatus] = await Promise.all([
              DataService.checkUserBookmark(userId, workId),
              DataService.checkUserSubscription(userId, foundWork.authorId),
              DataService.checkUserLike(userId, workId)
            ])
            
            setIsBookmarkedState(bookmarkStatus)
            setIsSubscribedState(subscribeStatus)
            setIsLiked(likeStatus)
          }
        }
      } catch (error) {
        console.error('Error loading work:', error)
      }
      setLoading(false)
    }

    if (!userLoading) {
      loadWork()
    }
  }, [workId, isAuthenticated, userId, userLoading])

  const handleBookmark = async () => {
    if (!work || !isAuthenticated || !userId || buttonLoading.bookmark) return
    
    setButtonLoading(prev => ({ ...prev, bookmark: true }))
    try {
      const newState = await DataService.toggleBookmark(work.id, userId)
      setIsBookmarkedState(newState)
    } catch (error) {
      console.error('Error toggling bookmark:', error)
    }
    setButtonLoading(prev => ({ ...prev, bookmark: false }))
  }

  const handleSubscribe = async () => {
    if (!work || !isAuthenticated || !userId || buttonLoading.subscribe) return
    
    setButtonLoading(prev => ({ ...prev, subscribe: true }))
    try {
      const newState = await DataService.toggleSubscription(work.authorId, userId)
      setIsSubscribedState(newState)
    } catch (error) {
      console.error('Error toggling subscription:', error)
    }
    setButtonLoading(prev => ({ ...prev, subscribe: false }))
  }

  const handleLike = async () => {
    if (!work || !isAuthenticated || !userId || buttonLoading.like) return
    
    setButtonLoading(prev => ({ ...prev, like: true }))
    try {
      const newState = await DataService.toggleLike(work.id, userId)
      setIsLiked(newState)
    } catch (error) {
      console.error('Error toggling like:', error)
    }
    setButtonLoading(prev => ({ ...prev, like: false }))
  }

  if (loading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-300">Loading work...</span>
      </div>
    )
  }

  if (!work) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center">
        <div className="text-gray-300 dark:text-gray-600 text-6xl mb-4">📚</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Work Not Found
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          The work you&rsquo;re looking for doesn&rsquo;t exist or has been removed.
        </p>
      </div>
    )
  }

  return (
    <WorkViewer
      work={work}
      onBookmark={handleBookmark}
      onLike={handleLike}
      onSubscribe={handleSubscribe}
      isBookmarked={isBookmarkedState}
      isLiked={isLiked}
      isSubscribed={isSubscribedState}
    />
  )
}
