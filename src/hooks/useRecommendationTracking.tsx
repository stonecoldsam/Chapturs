/**
 * Client-Side Signal Tracking Hook
 * 
 * Tracks user interactions and reading behavior for recommendation system
 * Provides easy-to-use React hooks for component integration
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useUser } from '@/hooks/useUser'
import { SignalType } from '@/lib/recommendations/SignalTracker'

// === TYPES === //

interface ReadingSession {
  workId: string
  sectionId?: string
  startTime: Date
  scrollDepth: number
  wordsRead: number
  totalWords: number
  interactions: string[]
  deviceType: 'mobile' | 'desktop' | 'tablet'
  referrer?: string
}

interface SignalData {
  signalType: SignalType
  workId?: string
  authorId?: string
  value: number
  metadata?: Record<string, any>
}

// === SIGNAL TRACKING HOOK === //

export function useSignalTracker() {
  const { userId, isAuthenticated } = useUser()
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substring(7)}`)
  
  // Track individual signals
  const trackSignal = useCallback(async (data: SignalData) => {
    if (!isAuthenticated || !userId) return
    
    try {
      await fetch('/api/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionId,
          timestamp: new Date(),
          ...data
        })
      })
    } catch (error) {
      console.error('Failed to track signal:', error)
    }
  }, [userId, isAuthenticated, sessionId])
  
  // Track engagement actions (likes, bookmarks, etc.)
  const trackEngagement = useCallback((
    action: 'like' | 'bookmark' | 'subscribe' | 'share',
    workId: string,
    authorId?: string
  ) => {
    const signalMap = {
      like: SignalType.LIKE,
      bookmark: SignalType.BOOKMARK,
      subscribe: SignalType.SUBSCRIBE,
      share: SignalType.SHARE
    }
    
    trackSignal({
      signalType: signalMap[action],
      workId,
      authorId,
      value: 1,
      metadata: { action, timestamp: Date.now() }
    })
  }, [trackSignal])
  
  // Track search behavior
  const trackSearch = useCallback((
    query: string,
    filters: Record<string, any>,
    results: string[],
    clickedResults: string[]
  ) => {
    trackSignal({
      signalType: SignalType.SEARCH_QUERY,
      value: 1,
      metadata: {
        query,
        filters,
        resultCount: results.length,
        clickThroughRate: clickedResults.length / results.length,
        results,
        clickedResults
      }
    })
  }, [trackSignal])
  
  // Track recommendation interaction
  const trackRecommendation = useCallback((
    workId: string,
    action: 'view' | 'click' | 'skip',
    recommendationSource: string,
    recommendationRank: number
  ) => {
    const value = action === 'skip' ? -0.5 : action === 'view' ? 0.5 : 1
    
    trackSignal({
      signalType: SignalType.CLICK_THROUGH,
      workId,
      value,
      metadata: {
        action,
        recommendationSource,
        recommendationRank
      }
    })
  }, [trackSignal])
  
  return {
    trackSignal,
    trackEngagement,
    trackSearch,
    trackRecommendation,
    sessionId
  }
}

// === READING SESSION TRACKER === //

export function useReadingTracker(workId: string, sectionId?: string, totalWords: number = 1000) {
  const { trackSignal } = useSignalTracker()
  const { isAuthenticated } = useUser()
  
  const sessionRef = useRef<ReadingSession | null>(null)
  const [isReading, setIsReading] = useState(false)
  
  // Start reading session
  const startSession = useCallback((referrer?: string) => {
    if (!isAuthenticated) return
    
    sessionRef.current = {
      workId,
      sectionId,
      startTime: new Date(),
      scrollDepth: 0,
      wordsRead: 0,
      totalWords,
      interactions: [],
      deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
      referrer
    }
    setIsReading(true)
  }, [workId, sectionId, totalWords, isAuthenticated])
  
  // Update reading progress
  const updateProgress = useCallback((scrollDepth: number, wordsRead: number) => {
    if (sessionRef.current) {
      sessionRef.current.scrollDepth = Math.max(sessionRef.current.scrollDepth, scrollDepth)
      sessionRef.current.wordsRead = Math.max(sessionRef.current.wordsRead, wordsRead)
    }
  }, [])
  
  // Add interaction to session
  const addInteraction = useCallback((interaction: string) => {
    if (sessionRef.current) {
      sessionRef.current.interactions.push(interaction)
    }
  }, [])
  
  // End reading session and send data
  const endSession = useCallback(async () => {
    if (!sessionRef.current || !isAuthenticated) return
    
    const session = sessionRef.current
    const endTime = new Date()
    const duration = endTime.getTime() - session.startTime.getTime()
    
    // Only track if session was meaningful (> 10 seconds)
    if (duration > 10000) {
      try {
        await fetch('/api/reading-sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...session,
            endTime,
            duration: Math.round(duration / 1000) // Convert to seconds
          })
        })
        
        // Also track individual signals
        const readingSpeed = session.wordsRead / (duration / (1000 * 60)) // words per minute
        const completionRate = session.wordsRead / session.totalWords
        
        await Promise.all([
          trackSignal({
            signalType: SignalType.VIEW_DURATION,
            workId,
            value: Math.min(duration / (1000 * 60 * 30), 1), // Normalize to 30 min
            metadata: { actualDurationMs: duration, sectionId }
          }),
          trackSignal({
            signalType: SignalType.SCROLL_DEPTH,
            workId,
            value: session.scrollDepth,
            metadata: { sectionId }
          }),
          trackSignal({
            signalType: SignalType.COMPLETION_RATE,
            workId,
            value: completionRate,
            metadata: { wordsRead: session.wordsRead, totalWords: session.totalWords }
          }),
          ...(readingSpeed > 0 ? [trackSignal({
            signalType: SignalType.READING_SPEED,
            workId,
            value: Math.min(readingSpeed / 400, 1), // Normalize to 400 wpm
            metadata: { actualWpm: readingSpeed }
          })] : [])
        ])
        
      } catch (error) {
        console.error('Failed to track reading session:', error)
      }
    }
    
    sessionRef.current = null
    setIsReading(false)
  }, [workId, sectionId, isAuthenticated, trackSignal])
  
  // Auto-end session on component unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        endSession()
      }
    }
  }, [endSession])
  
  return {
    startSession,
    endSession,
    updateProgress,
    addInteraction,
    isReading
  }
}

// === SCROLL TRACKING HOOK === //

export function useScrollTracker(contentRef: React.RefObject<HTMLElement>) {
  const [scrollDepth, setScrollDepth] = useState(0)
  
  useEffect(() => {
    const element = contentRef.current
    if (!element) return
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = element
      const depth = Math.min(scrollTop / (scrollHeight - clientHeight), 1)
      setScrollDepth(Math.max(scrollDepth, depth))
    }
    
    element.addEventListener('scroll', handleScroll, { passive: true })
    return () => element.removeEventListener('scroll', handleScroll)
  }, [contentRef, scrollDepth])
  
  return scrollDepth
}

// === ENGAGEMENT TRACKING COMPONENT === //

interface EngagementTrackerProps {
  workId: string
  authorId: string
  onInteraction?: (action: string) => void
  children: React.ReactNode
}

export function EngagementTracker({ 
  workId, 
  authorId, 
  onInteraction, 
  children 
}: EngagementTrackerProps) {
  const { trackEngagement } = useSignalTracker()
  
  const handleInteraction = useCallback((action: 'like' | 'bookmark' | 'subscribe' | 'share') => {
    trackEngagement(action, workId, authorId)
    onInteraction?.(action)
  }, [trackEngagement, workId, authorId, onInteraction])
  
  // Provide interaction handler through context or props
  return (
    <div data-work-id={workId} data-author-id={authorId}>
      {children}
    </div>
  )
}

// === RECOMMENDATION TRACKER COMPONENT === //

interface RecommendationTrackerProps {
  workId: string
  recommendationSource: string
  recommendationRank: number
  onView?: () => void
  onClick?: () => void
  onSkip?: () => void
  children: React.ReactNode
}

export function RecommendationTracker({
  workId,
  recommendationSource, 
  recommendationRank,
  onView,
  onClick,
  onSkip,
  children
}: RecommendationTrackerProps) {
  const { trackRecommendation } = useSignalTracker()
  const [hasViewed, setHasViewed] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  
  // Track view when element comes into viewport
  useEffect(() => {
    const element = elementRef.current
    if (!element || hasViewed) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasViewed) {
          setHasViewed(true)
          trackRecommendation(workId, 'view', recommendationSource, recommendationRank)
          onView?.()
        }
      },
      { threshold: 0.5 } // Track when 50% visible
    )
    
    observer.observe(element)
    return () => observer.disconnect()
  }, [workId, recommendationSource, recommendationRank, hasViewed, trackRecommendation, onView])
  
  const handleClick = useCallback(() => {
    trackRecommendation(workId, 'click', recommendationSource, recommendationRank)
    onClick?.()
  }, [workId, recommendationSource, recommendationRank, trackRecommendation, onClick])
  
  const handleSkip = useCallback(() => {
    trackRecommendation(workId, 'skip', recommendationSource, recommendationRank)
    onSkip?.()
  }, [workId, recommendationSource, recommendationRank, trackRecommendation, onSkip])
  
  return (
    <div 
      ref={elementRef}
      onClick={handleClick}
      data-recommendation-source={recommendationSource}
      data-recommendation-rank={recommendationRank}
    >
      {children}
    </div>
  )
}

export default {
  useSignalTracker,
  useReadingTracker,
  useScrollTracker,
  EngagementTracker,
  RecommendationTracker
}