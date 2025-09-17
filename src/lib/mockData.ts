import { 
  Work, 
  Section, 
  FeedItem, 
  User, 
  Author, 
  ContentFormat,
  WorkStatus,
  MaturityRating,
  SectionContent,
  MediaFile,
  GlossaryEntry,
  WorkStatistics,
  AuthorStatistics,
  CreatorAnalytics,
  RevenueData,
  AudienceData,
  ContentPerformance,
  EngagementMetrics,
  // Legacy types for compatibility
  Story,
  Chapter,
  Statistics
} from '@/types'

// Content Format Icons
export const getFormatIcon = (format: ContentFormat): string => {
  switch (format) {
    case 'novel': return '📖'
    case 'article': return '📰'
    case 'comic': return '🎨'
    case 'hybrid': return '📚'
    case 'experimental': return '🧪'
    default: return '📄'
  }
}

// Feed Type Icons
export const getFeedTypeIcon = (feedType: string): string => {
  switch (feedType) {
    case 'subscribed': return '📌'
    case 'new': return '🆕'
    case 'discovery': return '🎲'
    case 'algorithmic': return '🔮'
    default: return '📄'
  }
}

// Mock Authors
export const mockAuthors: Author[] = [
  {
    id: 'author1',
    username: 'storyteller_maya',
    displayName: 'Maya Rodriguez',
    bio: 'Fantasy novelist and world-builder. Creating immersive stories that transport readers to new realms.',
    avatar: '/api/placeholder/64/64',
    socialLinks: [
      { platform: 'twitter', url: 'https://twitter.com/storyteller_maya', handle: '@storyteller_maya' },
      { platform: 'website', url: 'https://mayarodriguez.com' }
    ],
    verified: true,
    statistics: {
      totalWorks: 12,
      totalViews: 2500000,
      totalSubscribers: 45000,
      averageRating: 4.7,
      worksCompleted: 8,
      monthlyViews: 180000,
      growthRate: 15.3
    }
  },
  {
    id: 'author2',
    username: 'comic_creator_kai',
    displayName: 'Kai Tanaka',
    bio: 'Manga artist and visual storyteller. Bringing characters to life through dynamic art and compelling narratives.',
    avatar: '/api/placeholder/64/64',
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com/kai_creates', handle: '@kai_creates' }
    ],
    verified: true,
    statistics: {
      totalWorks: 6,
      totalViews: 1800000,
      totalSubscribers: 32000,
      averageRating: 4.8,
      worksCompleted: 3,
      monthlyViews: 220000,
      growthRate: 22.7
    }
  },
  {
    id: 'author3',
    username: 'tech_writer_sam',
    displayName: 'Sam Thompson',
    bio: 'Technology journalist and futurist. Exploring the intersection of humanity and innovation.',
    avatar: '/api/placeholder/64/64',
    socialLinks: [
      { platform: 'website', url: 'https://samthompson.tech' }
    ],
    verified: false,
    statistics: {
      totalWorks: 24,
      totalViews: 950000,
      totalSubscribers: 18000,
      averageRating: 4.4,
      worksCompleted: 20,
      monthlyViews: 85000,
      growthRate: 8.2
    }
  }
]

// Mock Works with Multiple Formats
export const mockWorks: Work[] = [
  {
    id: 'work1',
    title: 'Chronicles of the Ethereal Realm',
    description: 'Follow Lyra as she discovers her magical abilities and embarks on a quest to save both the mortal and ethereal worlds from an ancient evil that threatens to consume everything she holds dear.',
    authorId: 'author1',
    author: mockAuthors[0],
    formatType: 'novel',
    status: 'ongoing',
    maturityRating: 'teen',
    genres: ['Fantasy', 'Adventure', 'Magic'],
    tags: ['epic fantasy', 'coming of age', 'magic system', 'portal fantasy'],
    languages: ['en'],
    coverImage: '/api/placeholder/400/600',
    thumbnails: ['/api/placeholder/200/300', '/api/placeholder/300/450'],
    sections: [],
    glossary: [],
    statistics: {
      views: 1250000,
      uniqueReaders: 89000,
      subscribers: 23400,
      bookmarks: 15600,
      likes: 45200,
      comments: 8900,
      shares: 3400,
      averageRating: 4.8,
      ratingCount: 12400,
      averageReadTime: 28,
      completionRate: 0.73,
      dropoffPoints: [0.15, 0.34, 0.67]
    },
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date('2024-01-20'),
    publishedAt: new Date('2023-07-01')
  },
  {
    id: 'work2',
    title: 'Urban Legends: A Visual Journey',
    description: 'A stunning comic series exploring modern urban legends through vibrant artwork and compelling character-driven stories.',
    authorId: 'author2',
    author: mockAuthors[1],
    formatType: 'comic',
    status: 'ongoing',
    maturityRating: 'mature',
    genres: ['Urban Fantasy', 'Horror', 'Mystery'],
    tags: ['urban legends', 'supernatural', 'city life', 'mystery'],
    languages: ['en'],
    coverImage: '/api/placeholder/400/600',
    thumbnails: ['/api/placeholder/200/300'],
    sections: [],
    glossary: [],
    statistics: {
      views: 890000,
      uniqueReaders: 67000,
      subscribers: 18900,
      bookmarks: 12300,
      likes: 34500,
      comments: 5600,
      shares: 2800,
      averageRating: 4.6,
      ratingCount: 8900,
      averageReadTime: 15,
      completionRate: 0.82,
      dropoffPoints: [0.08, 0.25, 0.58]
    },
    createdAt: new Date('2023-08-10'),
    updatedAt: new Date('2024-01-15'),
    publishedAt: new Date('2023-09-01')
  },
  {
    id: 'work3',
    title: 'The Future of Human-AI Collaboration',
    description: 'An in-depth analysis of how artificial intelligence will reshape the workplace and society, featuring interviews with leading experts and real-world case studies.',
    authorId: 'author3',
    author: mockAuthors[2],
    formatType: 'article',
    status: 'completed',
    maturityRating: 'general',
    genres: ['Technology', 'Business', 'Science'],
    tags: ['artificial intelligence', 'future of work', 'technology trends', 'innovation'],
    languages: ['en'],
    coverImage: '/api/placeholder/400/600',
    thumbnails: ['/api/placeholder/200/300'],
    sections: [],
    glossary: [],
    statistics: {
      views: 345000,
      uniqueReaders: 28000,
      subscribers: 5600,
      bookmarks: 8900,
      likes: 12400,
      comments: 2300,
      shares: 4500,
      averageRating: 4.4,
      ratingCount: 3400,
      averageReadTime: 22,
      completionRate: 0.68,
      dropoffPoints: [0.12, 0.28, 0.45]
    },
    createdAt: new Date('2023-09-20'),
    updatedAt: new Date('2023-12-15'),
    publishedAt: new Date('2023-10-01')
  },
  {
    id: 'work4',
    title: 'Digital Nomad\'s Guide to Creative Freedom',
    description: 'A hybrid work combining personal essays, practical guides, and stunning photography from remote work locations around the world.',
    authorId: 'author3',
    author: mockAuthors[2],
    formatType: 'hybrid',
    status: 'ongoing',
    maturityRating: 'general',
    genres: ['Lifestyle', 'Travel', 'Business'],
    tags: ['remote work', 'digital nomad', 'travel', 'productivity', 'lifestyle'],
    languages: ['en'],
    coverImage: '/api/placeholder/400/600',
    thumbnails: ['/api/placeholder/200/300'],
    sections: [],
    glossary: [],
    statistics: {
      views: 567000,
      uniqueReaders: 42000,
      subscribers: 9800,
      bookmarks: 11200,
      likes: 18900,
      comments: 3400,
      shares: 5600,
      averageRating: 4.5,
      ratingCount: 5600,
      averageReadTime: 19,
      completionRate: 0.71,
      dropoffPoints: [0.10, 0.32, 0.62]
    },
    createdAt: new Date('2023-11-05'),
    updatedAt: new Date('2024-01-18'),
    publishedAt: new Date('2023-12-01')
  }
]

// Mock Feed Items with Format Indicators
export const mockFeedItems: FeedItem[] = [
  {
    id: 'feed1',
    work: mockWorks[0],
    feedType: 'subscribed',
    reason: 'New chapter available from your subscription',
    score: 0.95,
    readingStatus: 'in-progress',
    lastReadSection: 'prologue',
    bookmark: true,
    liked: true,
    addedToFeedAt: new Date('2024-01-20'),
    lastInteractionAt: new Date('2024-01-18')
  },
  {
    id: 'feed2',
    work: mockWorks[1],
    feedType: 'new',
    reason: 'Trending in Urban Fantasy',
    score: 0.88,
    readingStatus: 'unread',
    bookmark: false,
    liked: false,
    addedToFeedAt: new Date('2024-01-19'),
  },
  {
    id: 'feed3',
    work: mockWorks[2],
    feedType: 'discovery',
    reason: 'Recommended based on your interest in technology',
    score: 0.76,
    readingStatus: 'completed',
    bookmark: true,
    liked: true,
    addedToFeedAt: new Date('2024-01-18'),
    lastInteractionAt: new Date('2024-01-10')
  },
  {
    id: 'feed4',
    work: mockWorks[3],
    feedType: 'algorithmic',
    reason: 'Similar readers also enjoyed this hybrid content',
    score: 0.82,
    readingStatus: 'in-progress',
    lastReadSection: 'intro',
    bookmark: false,
    liked: false,
    addedToFeedAt: new Date('2024-01-17'),
    lastInteractionAt: new Date('2024-01-16')
  }
]

// Legacy compatibility functions
export const getLegacyStories = (): Story[] => {
  return mockWorks.map(work => ({
    id: work.id,
    title: work.title,
    author: work.author,
    description: work.description,
    genres: work.genres,
    thumbnail: work.coverImage || '/api/placeholder/400/600',
    status: work.status === 'ongoing' ? 'ongoing' : 'completed',
    chapters: [],
    statistics: {
      views: work.statistics.views,
      subscribers: work.statistics.subscribers,
      bookmarks: work.statistics.bookmarks,
      likes: work.statistics.likes,
      comments: work.statistics.comments,
      averageRating: work.statistics.averageRating,
      ratingCount: work.statistics.ratingCount
    },
    tags: work.tags,
    lastUpdated: work.updatedAt,
    createdAt: work.createdAt
  }))
}

export const getLegacyFeedItems = () => {
  return mockFeedItems.map(item => ({
    id: item.id,
    story: getLegacyStories().find(s => s.id === item.work.id)!,
    status: item.feedType as 'subscribed' | 'new' | 'unexpected',
    reason: item.reason,
    readingStatus: item.readingStatus,
    lastReadChapter: item.lastReadSection ? 1 : undefined
  }))
}

// API Functions
// Create curated feed for guest users
const getGuestFeedItems = (hubMode: 'reader' | 'creator'): FeedItem[] => {
  if (hubMode === 'creator') {
    // For creator hub, guests should be redirected to sign in
    return []
  }

  // Curate a mix of the best content across all formats
  const curatedWorks = mockWorks
    .filter(work => work.statistics.averageRating >= 4.2) // High-rated content
    .sort((a, b) => b.statistics.views - a.statistics.views) // Popular content
    .slice(0, 15) // Limit to best content

  return curatedWorks.map((work, index) => ({
    id: `guest-${work.id}`,
    work,
    section: work.sections && work.sections.length > 0 ? work.sections[0] : undefined,
    feedType: index < 3 ? 'discovery' : 'new' as any,
    reason: index < 3 ? 'Trending this week' : 
            index < 6 ? 'Popular in your area' :
            index < 9 ? 'Editor\'s choice' : 'New releases',
    score: 1.0 - (index * 0.05), // Decreasing relevance score
    readingStatus: 'unread' as any,
    lastReadChapter: 0,
    addedToFeedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random within last week
    lastInteractionAt: undefined
  }))
}

export const fetchFeedItems = async (
  hubMode: 'reader' | 'creator', 
  userId?: string,
  filters?: any
): Promise<FeedItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  if (!userId) {
    // Guest user experience - show curated popular content
    return getGuestFeedItems(hubMode)
  }
  
  const userPrefs = getUserPreferences(userId)
  const userSubs = getUserSubscriptions(userId)
  const userHistory = getUserReadingHistory(userId)
  const userCreated = getUserCreatedWorks(userId)
  
  if (hubMode === 'creator') {
    // Show only user's created works in creator mode
    return mockFeedItems.filter(item => userCreated.includes(item.work.id))
      .map(item => ({
        ...item,
        feedType: 'subscribed' as any,
        reason: 'Your published work',
        readingStatus: 'completed' as any
      }))
  }
  
  // Reader mode - personalized feed
  const personalizedFeed: FeedItem[] = []
  
  // 1. Subscribed content (highest priority)
  const subscribedWorks = mockWorks.filter(work => userSubs.has(work.id))
  subscribedWorks.forEach(work => {
    const lastRead = userHistory.get(work.id)
    personalizedFeed.push({
      id: `feed-sub-${work.id}`,
      work,
      feedType: 'subscribed',
      reason: lastRead ? 'New content available' : 'From your subscriptions',
      score: 0.95,
      readingStatus: lastRead ? 'in-progress' : 'unread',
      lastReadSection: lastRead,
      bookmark: getUserBookmarks(userId).has(work.id),
      liked: false,
      addedToFeedAt: new Date(),
      lastInteractionAt: lastRead ? new Date(Date.now() - 24 * 60 * 60 * 1000) : undefined
    })
  })
  
  // 2. New content matching preferences
  const newWorks = mockWorks.filter(work => 
    !userSubs.has(work.id) && 
    work.genres.some(genre => userPrefs.includes(genre))
  )
  newWorks.slice(0, 2).forEach(work => {
    personalizedFeed.push({
      id: `feed-new-${work.id}`,
      work,
      feedType: 'new',
      reason: `New ${work.genres.find(g => userPrefs.includes(g))} content`,
      score: 0.85,
      readingStatus: 'unread',
      bookmark: false,
      liked: false,
      addedToFeedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
    })
  })
  
  // 3. Discovery content (different genres)
  const discoveryWorks = mockWorks.filter(work => 
    !userSubs.has(work.id) && 
    !work.genres.some(genre => userPrefs.includes(genre))
  )
  discoveryWorks.slice(0, 1).forEach(work => {
    personalizedFeed.push({
      id: `feed-discovery-${work.id}`,
      work,
      feedType: 'discovery',
      reason: `Highly rated ${work.genres[0]} - discover something new`,
      score: 0.75,
      readingStatus: 'unread',
      bookmark: false,
      liked: false,
      addedToFeedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
    })
  })
  
  // Sort by priority and score
  return personalizedFeed.sort((a, b) => {
    const priorityOrder = { subscribed: 3, new: 2, discovery: 1, algorithmic: 1 }
    const aPriority = priorityOrder[a.feedType as keyof typeof priorityOrder] || 0
    const bPriority = priorityOrder[b.feedType as keyof typeof priorityOrder] || 0
    
    if (aPriority !== bPriority) return bPriority - aPriority
    return b.score - a.score
  })
}

export const searchWorks = async (query: string, filters?: any): Promise<Work[]> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  
  if (!query.trim()) return mockWorks
  
  return mockWorks.filter(work => 
    work.title.toLowerCase().includes(query.toLowerCase()) ||
    work.description.toLowerCase().includes(query.toLowerCase()) ||
    work.genres.some(genre => genre.toLowerCase().includes(query.toLowerCase())) ||
    work.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  )
}

// Subscription management - User-specific data
const userData = new Map<string, {
  subscriptions: Set<string>
  bookmarks: Set<string>
  readingHistory: Map<string, string> // workId -> lastReadSection
  preferences: string[]
  createdWorks: string[]
}>()

// Initialize some mock user data
const initializeUserData = (userId: string) => {
  if (!userData.has(userId)) {
    // Give every user some sample data for demonstration
    const sampleWorks = userId.includes('@') ? ['work1', 'work2'] : // Real email users get work1 and work2
                       userId === 'author1' ? ['work1'] : 
                       userId === 'author2' ? ['work2'] : 
                       userId === 'author3' ? ['work3', 'work4'] : 
                       ['work3'] // Default sample work
                       
    userData.set(userId, {
      subscriptions: new Set(['work1', 'work2']),
      bookmarks: new Set(['work3']),
      readingHistory: new Map([
        ['work1', 'chapter-3'],
        ['work2', 'page-10']
      ]),
      preferences: ['Fantasy', 'Science Fiction', 'Urban Fantasy'],
      createdWorks: sampleWorks
    })
  }
  return userData.get(userId)!
}

export const getUserSubscriptions = (userId: string): Set<string> => {
  return initializeUserData(userId).subscriptions
}

export const getUserBookmarks = (userId: string): Set<string> => {
  return initializeUserData(userId).bookmarks
}

export const getUserReadingHistory = (userId: string): Map<string, string> => {
  return initializeUserData(userId).readingHistory
}

export const getUserPreferences = (userId: string): string[] => {
  return initializeUserData(userId).preferences
}

export const getUserCreatedWorks = (userId: string): string[] => {
  return initializeUserData(userId).createdWorks
}

export const isSubscribed = (workId: string, userId?: string): boolean => {
  if (!userId) return false
  return getUserSubscriptions(userId).has(workId)
}

export const isBookmarked = (workId: string, userId?: string): boolean => {
  if (!userId) return false
  return getUserBookmarks(userId).has(workId)
}

export const toggleSubscription = async (workId: string, userId?: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 200))
  
  if (!userId) return false
  
  const userSubs = getUserSubscriptions(userId)
  if (userSubs.has(workId)) {
    userSubs.delete(workId)
    return false
  } else {
    userSubs.add(workId)
    return true
  }
}

export const toggleBookmark = async (workId: string, userId?: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 200))
  
  if (!userId) return false
  
  const userBookmarks = getUserBookmarks(userId)
  if (userBookmarks.has(workId)) {
    userBookmarks.delete(workId)
    return false
  } else {
    userBookmarks.add(workId)
    return true
  }
}

// Legacy mock data for story/chapter system compatibility
export const mockStories: Story[] = mockWorks.map(work => ({
  id: work.id,
  title: work.title,
  author: work.author,
  description: work.description,
  genres: work.genres,
  thumbnail: work.coverImage || '/api/placeholder/400/600',
  status: work.status === 'ongoing' ? 'ongoing' : 'completed',
  chapters: [],
  statistics: {
    views: work.statistics.views,
    subscribers: work.statistics.subscribers,
    bookmarks: work.statistics.bookmarks,
    likes: work.statistics.likes,
    comments: work.statistics.comments,
    averageRating: work.statistics.averageRating,
    ratingCount: work.statistics.ratingCount
  },
  tags: work.tags,
  lastUpdated: work.updatedAt,
  createdAt: work.createdAt
}))

export const mockChapters: Chapter[] = mockWorks.flatMap(work => {
  if (!work.sections || work.sections.length === 0) {
    // Generate default chapters for works without sections
    return [{
      id: `${work.id}-chapter-1`,
      storyId: work.id,
      chapterNumber: 1,
      title: 'Chapter 1',
      content: work.description + '\n\nThis is the beginning of an amazing story...',
      wordCount: 1500,
      publishedAt: work.createdAt,
      isPublished: true,
      glossaryTerms: work.glossary?.slice(0, 3) || []
    }]
  }
  
  return work.sections.map((section, index) => ({
    id: section.id,
    storyId: work.id,
    chapterNumber: index + 1,
    title: section.title,
    content: section.content?.text || 'Chapter content coming soon...',
    wordCount: section.wordCount || 1000,
    publishedAt: section.publishedAt || work.createdAt,
    isPublished: true,
    glossaryTerms: work.glossary?.slice(0, 2) || []
  }))
})

export default {
  mockWorks,
  mockFeedItems,
  mockAuthors,
  mockStories,
  mockChapters,
  getFormatIcon,
  getFeedTypeIcon,
  fetchFeedItems,
  searchWorks,
  isSubscribed,
  isBookmarked,
  toggleSubscription,
  toggleBookmark,
  getLegacyStories,
  getLegacyFeedItems
}
