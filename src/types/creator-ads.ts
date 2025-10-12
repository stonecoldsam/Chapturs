/**
 * Creator Recommendation Ad Types
 * 
 * Extends the ad system to support creator-to-creator recommendations
 */

import { AdFormat, AdPlacementType } from './ads'

export interface CreatorRecommendationAd {
  id: string
  creatorId: string                            // Who is making the recommendation
  recommendedWorkId: string                    // The work being recommended
  recommendedAuthorId: string                  // Author of recommended work
  
  // Recommendation content
  template: RecommendationTemplate
  customMessage?: string                       // Creator's personal message
  similarityReason?: string                    // Why it's similar
  personalRating?: number                      // 1-5 stars
  
  // Targeting & Display
  placementTargets: CreatorAdTarget[]          // Where this rec should show
  displaySettings: CreatorRecommendationSettings
  
  // Performance & Analytics
  impressions: number
  clicks: number
  conversions: number                          // Readers who started the recommended work
  revenue: number                              // Revenue generated for recommender
  
  // Status
  isActive: boolean
  approvedByRecommendee?: boolean              // Did the recommended author approve?
  createdAt: Date
  updatedAt: Date
}

export enum RecommendationTemplate {
  SIMILAR_VIBES = 'similar_vibes',             // "If you like X, you'll love Y"
  PERSONAL_FAVORITE = 'personal_favorite',     // "As a creator and reader, I personally love..."
  GENRE_MATCH = 'genre_match',                 // "Fellow fantasy lovers should check out..."
  WRITING_STYLE = 'writing_style',             // "Similar writing style and themes"
  COLLABORATION = 'collaboration',             // "Fellow creator I'm collaborating with"
  INSPIRATION = 'inspiration',                 // "This work inspired my own writing"
  HIDDEN_GEM = 'hidden_gem',                   // "Underrated gem that deserves more readers"
  BINGE_WORTHY = 'binge_worthy'                // "Can't put it down - binged the whole thing"
}

export interface CreatorAdTarget {
  targetType: 'own_works' | 'genre_match' | 'similar_readers' | 'cross_promotion'
  targetWorkIds?: string[]                     // Specific works to show on
  genreFilters?: string[]                      // Show to readers of these genres
  readerSegments?: string[]                    // Target specific reader types
}

export interface CreatorRecommendationSettings {
  showCreatorAvatar: boolean
  showPersonalMessage: boolean
  showSimilarityScore: boolean
  showRating: boolean
  animateEntrance: boolean
  
  // Revenue sharing with recommended creator
  revenueShareWithRecommendee: number          // 0-0.5 (0-50% to recommended author)
  
  // Display preferences
  preferredFormats: AdFormat[]
  preferredPlacements: AdPlacementType[]
  maxImpressionsPerReader: number
  cooldownBetweenShows: number                 // Hours between showing same rec
}

export interface RecommendationAdTemplate {
  template: RecommendationTemplate
  title: string
  description: string
  defaultMessage: string
  placeholderVars: string[]                    // Variables like {creator_name}, {work_title}
  suggestedPlacements: AdPlacementType[]
  estimatedEngagement: number                  // Expected CTR
}

// Default ad placement configuration for all content
export interface DefaultAdConfiguration {
  workId: string
  hasCustomPlacements: boolean
  
  // Default placements when creator hasn't configured ads
  defaultPlacements: {
    sidebarRight: boolean
    sidebarLeft: boolean
    chapterEnd: boolean
    betweenChapters: boolean
  }
  
  // Revenue settings
  platformRevenueShare: number                 // Platform's cut (e.g., 0.3 = 30%)
  creatorRevenueShare: number                  // Creator's cut (e.g., 0.7 = 70%)
  
  // Content filtering
  allowExternalAds: boolean
  allowCreatorRecommendations: boolean
  allowPlatformAds: boolean
  
  createdAt: Date
  updatedAt: Date
}

// Analytics for recommendation performance
export interface RecommendationAnalytics {
  recommendationId: string
  
  // Engagement metrics
  totalImpressions: number
  uniqueViewers: number
  clickThroughRate: number
  conversionRate: number                       // Clicked → Started reading
  readerRetentionRate: number                  // Started → Continued reading
  
  // Revenue metrics
  totalRevenue: number
  recommenderEarnings: number
  recommendeeEarnings: number
  averageRevenuePerClick: number
  
  // Performance by placement
  performanceByPlacement: Record<AdPlacementType, {
    impressions: number
    clicks: number
    conversions: number
    revenue: number
  }>
  
  // Time-based analytics
  dailyStats: Record<string, {
    impressions: number
    clicks: number
    revenue: number
  }>
  
  lastUpdated: Date
}

export interface RecommendationCampaign {
  id: string
  creatorId: string
  name: string
  description?: string
  
  // Campaign settings
  budget?: number                              // Optional spending limit
  targetGenres?: string[]
  targetAudience?: string[]
  startDate: Date
  endDate?: Date
  
  // Recommendations in this campaign
  recommendations: string[]                    // RecommendationAd IDs
  
  // Campaign performance
  totalImpressions: number
  totalClicks: number
  totalConversions: number
  totalRevenue: number
  
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Types are already exported above with interface declarations