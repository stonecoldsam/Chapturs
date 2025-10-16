/**
 * Creator Recommendation Ad Setup Component
 * 
 * Easy interface for creators to recommend other stories they love
 */

'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { resolveCoverSrc } from '@/lib/images'
import { 
  Heart, 
  Search, 
  Star,
  Users,
  TrendingUp,
  BookOpen,
  Zap,
  Eye,
  DollarSign,
  Check,
  X,
  Plus,
  Edit3,
  Share2,
  Target,
  Sparkles
} from 'lucide-react'
import { 
  CreatorRecommendationAd,
  RecommendationTemplate,
  CreatorRecommendationSettings,
  RecommendationAdTemplate 
} from '@/types/creator-ads'
import { AdPlacementType, AdFormat } from '@/types/ads'

interface CreatorRecommendationSetupProps {
  creatorId: string
  creatorWorks: Array<{
    id: string
    title: string
    status: string
  }>
  onRecommendationCreated: (recommendation: CreatorRecommendationAd) => void
}

// Predefined recommendation templates
const RECOMMENDATION_TEMPLATES: RecommendationAdTemplate[] = [
  {
    template: RecommendationTemplate.SIMILAR_VIBES,
    title: "Similar Vibes",
    description: "Perfect for stories with similar themes, genres, or mood",
    defaultMessage: "If you're enjoying {my_work}, you'll absolutely love {recommended_work}! Similar vibes and incredible storytelling.",
    placeholderVars: ['my_work', 'recommended_work', 'creator_name'],
    suggestedPlacements: [AdPlacementType.CHAPTER_END, AdPlacementType.SIDEBAR_RIGHT],
    estimatedEngagement: 0.08
  },
  {
    template: RecommendationTemplate.PERSONAL_FAVORITE,
    title: "Personal Favorite",
    description: "Share your genuine love for another creator's work",
    defaultMessage: "As both a writer and avid reader, {recommended_work} is hands down one of my favorites. The storytelling is phenomenal!",
    placeholderVars: ['recommended_work', 'creator_name', 'recommended_author'],
    suggestedPlacements: [AdPlacementType.INLINE_CONTENT, AdPlacementType.SCENE_BREAK],
    estimatedEngagement: 0.12
  },
  {
    template: RecommendationTemplate.HIDDEN_GEM,
    title: "Hidden Gem",
    description: "Highlight underrated works that deserve more attention",
    defaultMessage: "Found an incredible hidden gem! {recommended_work} deserves way more readers. Trust me on this one 💎",
    placeholderVars: ['recommended_work', 'recommended_author'],
    suggestedPlacements: [AdPlacementType.SIDEBAR_RIGHT, AdPlacementType.CHAPTER_START],
    estimatedEngagement: 0.15
  },
  {
    template: RecommendationTemplate.BINGE_WORTHY,
    title: "Binge-Worthy",
    description: "For stories you couldn't put down",
    defaultMessage: "Just binged all of {recommended_work} in one sitting. Couldn't put it down! You won't be able to either 🔥",
    placeholderVars: ['recommended_work', 'recommended_author'],
    suggestedPlacements: [AdPlacementType.CHAPTER_END, AdPlacementType.INLINE_CONTENT],
    estimatedEngagement: 0.18
  },
  {
    template: RecommendationTemplate.WRITING_STYLE,
    title: "Similar Style",
    description: "Recommend works with similar writing techniques or voice",
    defaultMessage: "Love the writing style in {my_work}? Check out {recommended_work} - similar narrative voice and incredible character development!",
    placeholderVars: ['my_work', 'recommended_work', 'recommended_author'],
    suggestedPlacements: [AdPlacementType.SIDEBAR_RIGHT, AdPlacementType.SCENE_BREAK],
    estimatedEngagement: 0.10
  },
  {
    template: RecommendationTemplate.COLLABORATION,
    title: "Fellow Creator",
    description: "Cross-promote with creators you're collaborating with",
    defaultMessage: "Thrilled to recommend my fellow creator {recommended_author}'s amazing work {recommended_work}. Support incredible indie authors!",
    placeholderVars: ['recommended_author', 'recommended_work'],
    suggestedPlacements: [AdPlacementType.CHAPTER_START, AdPlacementType.CHAPTER_END],
    estimatedEngagement: 0.14
  }
]

export default function CreatorRecommendationSetup({ 
  creatorId, 
  creatorWorks, 
  onRecommendationCreated 
}: CreatorRecommendationSetupProps) {
  const [step, setStep] = useState<'search' | 'template' | 'customize' | 'preview'>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedWork, setSelectedWork] = useState<any>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<RecommendationAdTemplate | null>(null)
  const [customMessage, setCustomMessage] = useState('')
  const [personalRating, setPersonalRating] = useState(5)
  const [similarityReason, setSimilarityReason] = useState('')
  
  // Settings
  const [settings, setSettings] = useState<CreatorRecommendationSettings>({
    showCreatorAvatar: true,
    showPersonalMessage: true,
    showSimilarityScore: false,
    showRating: true,
    animateEntrance: true,
    revenueShareWithRecommendee: 0.2, // 20% to recommended author
    preferredFormats: [AdFormat.NATIVE, AdFormat.BANNER],
    preferredPlacements: [AdPlacementType.SIDEBAR_RIGHT, AdPlacementType.CHAPTER_END],
    maxImpressionsPerReader: 3,
    cooldownBetweenShows: 24
  })

  const [targetWorks, setTargetWorks] = useState<string[]>([])

  // Search for works to recommend
  const searchWorks = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(`/api/works/search?q=${encodeURIComponent(query)}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.works.filter((work: any) => work.authorId !== creatorId))
      }
    } catch (error) {
      console.error('Failed to search works:', error)
    }
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery) {
        searchWorks(searchQuery)
      }
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchQuery])

  const selectWork = (work: any) => {
    setSelectedWork(work)
    setStep('template')
  }

  const selectTemplate = (template: RecommendationAdTemplate) => {
    setSelectedTemplate(template)
    setCustomMessage(template.defaultMessage)
    setStep('customize')
  }

  const generateCustomMessage = () => {
    if (!selectedTemplate || !selectedWork) return ''

    const myWork = creatorWorks[0] // Default to first work, could be selectable
    
    return selectedTemplate.defaultMessage
      .replace('{my_work}', myWork?.title || 'my story')
      .replace('{recommended_work}', selectedWork.title)
      .replace('{recommended_author}', selectedWork.author?.displayName || selectedWork.author?.username)
      .replace('{creator_name}', 'you') // Would be current user's name
  }

  const createRecommendation = async () => {
    if (!selectedWork || !selectedTemplate) return

    const recommendation: Partial<CreatorRecommendationAd> = {
      creatorId,
      recommendedWorkId: selectedWork.id,
      recommendedAuthorId: selectedWork.authorId,
      template: selectedTemplate.template,
      customMessage: customMessage || generateCustomMessage(),
      similarityReason,
      personalRating,
      placementTargets: [{
        targetType: 'own_works',
        targetWorkIds: targetWorks.length > 0 ? targetWorks : creatorWorks.map(w => w.id)
      }],
      displaySettings: settings,
      isActive: true
    }

    try {
      const response = await fetch('/api/creator-ads/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recommendation)
      })

      if (response.ok) {
        const data = await response.json()
        onRecommendationCreated(data.recommendation)
        
        // Reset form
        setStep('search')
        setSelectedWork(null)
        setSelectedTemplate(null)
        setCustomMessage('')
        setSearchQuery('')
      }
    } catch (error) {
      console.error('Failed to create recommendation:', error)
    }
  }

  const estimateReach = () => {
    // Simple estimation based on creator's works and selected targeting
    const baseReach = targetWorks.length * 100 // Estimate 100 readers per work
    return Math.min(baseReach, 1000) // Cap at 1K for display
  }

  const estimateRevenue = () => {
    const reach = estimateReach()
    const ctr = selectedTemplate?.estimatedEngagement || 0.1
    const clicks = reach * ctr
    const revenuePerClick = 0.05 // $0.05 per click
    return clicks * revenuePerClick
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Heart className="text-red-500" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Recommend a Story You Love</h1>
        </div>
        <p className="text-gray-600">
          Share amazing stories with your readers and earn revenue while supporting fellow creators
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[
          { key: 'search', label: 'Find Story', icon: Search },
          { key: 'template', label: 'Choose Style', icon: Sparkles },
          { key: 'customize', label: 'Customize', icon: Edit3 },
          { key: 'preview', label: 'Preview', icon: Eye }
        ].map(({ key, label, icon: Icon }, index) => (
          <div key={key} className="flex items-center">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              step === key ? 'bg-blue-100 text-blue-700' : 
              ['search', 'template', 'customize'].slice(0, ['search', 'template', 'customize', 'preview'].indexOf(step)).includes(key) 
                ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              <Icon size={16} />
              <span className="text-sm font-medium">{label}</span>
            </div>
            {index < 3 && <div className="w-8 h-px bg-gray-300 mx-2" />}
          </div>
        ))}
      </div>

      {/* Step 1: Search for Stories */}
      {step === 'search' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Find a Story to Recommend</h2>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for stories by title, author, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-3">
            {searchResults.map((work) => (
              <div
                key={work.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                onClick={() => selectWork(work)}
              >
                <div className="flex items-center space-x-4">
                  {work.coverImage ? (
                    <img 
                      src={resolveCoverSrc(work.id, work.coverImage)} 
                      alt={work.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">
                      {work.title.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium text-gray-900">{work.title}</h3>
                    <p className="text-sm text-gray-600">by {work.author?.displayName || work.author?.username}</p>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                      <span>📚 {work.formatType}</span>
                      <span>⭐ {work.statistics?.averageRating || 'New'}</span>
                      <span>👥 {work.statistics?.totalReaders || 0} readers</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {work.genres?.slice(0, 2).map((genre: string) => (
                    <span key={genre} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {genre}
                    </span>
                  ))}
                  <Plus className="text-blue-600" size={20} />
                </div>
              </div>
            ))}
          </div>

          {searchQuery && searchResults.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p>No stories found matching "{searchQuery}"</p>
              <p className="text-sm mt-1">Try different keywords or browse by genre</p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Choose Template */}
      {step === 'template' && selectedWork && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded flex items-center justify-center text-white font-bold">
              {selectedWork.title.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Choose Your Recommendation Style
              </h2>
              <p className="text-gray-600">for "{selectedWork.title}" by {selectedWork.author?.displayName}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RECOMMENDATION_TEMPLATES.map((template) => (
              <div
                key={template.template}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                onClick={() => selectTemplate(template)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{template.title}</h3>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <TrendingUp size={14} />
                    <span>{Math.round(template.estimatedEngagement * 100)}%</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                
                <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 italic">
                  "{template.defaultMessage.replace('{my_work}', 'My Story').replace('{recommended_work}', selectedWork.title).replace('{recommended_author}', selectedWork.author?.displayName || 'Author')}"
                </div>
                
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <div className="flex space-x-2">
                    {template.suggestedPlacements.slice(0, 2).map(placement => (
                      <span key={placement} className="bg-gray-200 px-2 py-1 rounded">
                        {placement.replace('_', ' ').toLowerCase()}
                      </span>
                    ))}
                  </div>
                  <span>Est. ${(estimateReach() * template.estimatedEngagement * 0.05).toFixed(2)}/month</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep('search')}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Back to Search
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Customize */}
      {step === 'customize' && selectedTemplate && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Customize Your Recommendation</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Personal Message
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder={generateCustomMessage()}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Make it personal! Readers love authentic recommendations.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setPersonalRating(star)}
                      className={`text-2xl ${star <= personalRating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ⭐
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">{personalRating}/5 stars</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why is it similar to your work? (Optional)
                </label>
                <input
                  type="text"
                  value={similarityReason}
                  onChange={(e) => setSimilarityReason(e.target.value)}
                  placeholder="Similar themes, writing style, character development..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Show On These Works
                </label>
                <div className="space-y-2">
                  {creatorWorks.map((work) => (
                    <label key={work.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={targetWorks.length === 0 || targetWorks.includes(work.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTargetWorks(prev => prev.includes(work.id) ? prev : [...prev, work.id])
                          } else {
                            setTargetWorks(prev => prev.filter(id => id !== work.id))
                          }
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{work.title}</span>
                      <span className="text-xs text-gray-500">({work.status})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Display Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.showCreatorAvatar}
                      onChange={(e) => setSettings(prev => ({ ...prev, showCreatorAvatar: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Show your avatar</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.showRating}
                      onChange={(e) => setSettings(prev => ({ ...prev, showRating: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Show your star rating</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.animateEntrance}
                      onChange={(e) => setSettings(prev => ({ ...prev, animateEntrance: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Animated entrance</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Revenue Share with Recommended Author
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="0.5"
                    step="0.05"
                    value={settings.revenueShareWithRecommendee}
                    onChange={(e) => setSettings(prev => ({ ...prev, revenueShareWithRecommendee: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Keep all revenue</span>
                    <span className="font-medium">
                      Share {Math.round(settings.revenueShareWithRecommendee * 100)}% with author
                    </span>
                    <span>Share 50%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Sharing revenue shows support and may encourage reciprocal recommendations
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Estimated Performance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Monthly Reach:</span>
                    <span className="font-medium">{estimateReach().toLocaleString()} readers</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Expected Clicks:</span>
                    <span className="font-medium">{Math.round(estimateReach() * (selectedTemplate?.estimatedEngagement || 0.1))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Estimated Revenue:</span>
                    <span className="font-medium text-green-800">${estimateRevenue().toFixed(2)}/month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep('template')}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Back to Templates
            </button>
            
            <div className="space-x-3">
              <button
                onClick={() => setStep('preview')}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Preview
              </button>
              <button
                onClick={createRecommendation}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Create Recommendation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Preview */}
      {step === 'preview' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Preview Your Recommendation</h2>
          
          {/* Preview of the actual ad */}
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 relative">
              <div className="absolute top-2 right-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                Recommendation
              </div>
              
              <div className="flex items-start space-x-3">
                {settings.showCreatorAvatar && (
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    You
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">Your Recommendation</span>
                    {settings.showRating && (
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={`text-sm ${star <= personalRating ? 'text-yellow-400' : 'text-gray-300'}`}>
                            ⭐
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{customMessage || generateCustomMessage()}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">
                        {selectedWork?.title.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{selectedWork?.title}</p>
                        <p className="text-xs text-gray-600">by {selectedWork?.author?.displayName}</p>
                      </div>
                    </div>
                    
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                      Read Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => setStep('customize')}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Back to Customize
            </button>
            
            <button
              onClick={createRecommendation}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Check size={16} />
              <span>Create Recommendation</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}