/**
 * Ad Placement Editor Component
 * 
 * Integrates with the CreatorEditor to allow creators to place ads directly in their content
 * Provides visual ad placement tools and real-time revenue estimates
 */

'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { 
  DollarSign, 
  Target, 
  Eye, 
  Settings,
  MapPin,
  BarChart3,
  Wand2,
  Plus,
  X,
  Edit,
  Trash2,
  Move,
  AlertCircle,
  Check,
  Zap
} from 'lucide-react'
import { 
  AdPlacementType, 
  AdFormat, 
  AdTargeting,
  AdPlacement,
  AdPosition,
  AdTargetingConfig,
  AdDisplaySettings,
  EditorAdMarker,
  SuggestedAdPlacement
} from '@/types/ads'

interface AdPlacementEditorProps {
  workId: string
  sectionId?: string
  content: string                              // Current editor content
  onPlacementChange: (placements: AdPlacement[]) => void
  onMarkerUpdate: (markers: EditorAdMarker[]) => void
  isEnabled: boolean
}

export default function AdPlacementEditor({
  workId,
  sectionId,
  content,
  onPlacementChange,
  onMarkerUpdate,
  isEnabled
}: AdPlacementEditorProps) {
  const [placements, setPlacements] = useState<AdPlacement[]>([])
  const [markers, setMarkers] = useState<EditorAdMarker[]>([])
  const [suggestedPlacements, setSuggestedPlacements] = useState<SuggestedAdPlacement[]>([])
  
  // UI State
  const [showPlacementPanel, setShowPlacementPanel] = useState(false)
  const [selectedPlacement, setSelectedPlacement] = useState<AdPlacement | null>(null)
  const [isCreatingPlacement, setIsCreatingPlacement] = useState(false)
  const [dragMode, setDragMode] = useState(false)
  
  // Form state for new placements
  const [newPlacement, setNewPlacement] = useState<Partial<AdPlacement>>({
    placementType: AdPlacementType.INLINE_CONTENT,
    format: AdFormat.BANNER,
    revenueShare: 0.7, // 70% to creator by default
    isActive: true,
    requiresApproval: false
  })

  // Load existing placements
  useEffect(() => {
    loadPlacements()
    analyzeSuggestedPlacements()
  }, [workId, sectionId, content])

  const loadPlacements = async () => {
    try {
      const response = await fetch(`/api/ads/placements?workId=${workId}&sectionId=${sectionId || ''}`)
      if (response.ok) {
        const data = await response.json()
        setPlacements(data.placements)
        updateMarkers(data.placements)
      }
    } catch (error) {
      console.error('Failed to load ad placements:', error)
    }
  }

  const analyzeSuggestedPlacements = () => {
    // Analyze content for optimal ad placement suggestions
    const suggestions: SuggestedAdPlacement[] = []
    const paragraphs = content.split('\\n\\n').length
    const wordCount = content.split(/\\s+/).length
    
    // Suggest chapter start/end placements
    if (wordCount > 500) {
      suggestions.push({
        position: 0,
        placementType: AdPlacementType.CHAPTER_START,
        reason: 'High engagement at chapter beginning',
        confidence: 0.85,
        estimatedRevenue: 2.50
      })
      
      suggestions.push({
        position: content.length,
        placementType: AdPlacementType.CHAPTER_END,
        reason: 'Natural break point for readers',
        confidence: 0.80,
        estimatedRevenue: 2.20
      })
    }
    
    // Suggest scene break placements for longer content
    if (wordCount > 1500 && paragraphs > 5) {
      const midPoint = Math.floor(content.length / 2)
      suggestions.push({
        position: midPoint,
        placementType: AdPlacementType.SCENE_BREAK,
        reason: 'Natural pause in content flow',
        confidence: 0.75,
        estimatedRevenue: 1.80
      })
    }
    
    setSuggestedPlacements(suggestions)
  }

  const updateMarkers = (placementList: AdPlacement[]) => {
    const newMarkers: EditorAdMarker[] = placementList.map((placement, index) => ({
      id: placement.id,
      position: getMarkerPosition(placement),
      placementType: placement.placementType,
      format: placement.format,
      notes: placement.creatorNotes,
      color: getPlacementTypeColor(placement.placementType),
      icon: getPlacementTypeIcon(placement.placementType),
      visible: true
    }))
    
    setMarkers(newMarkers)
    onMarkerUpdate(newMarkers)
  }

  const getMarkerPosition = (placement: AdPlacement): number => {
    if (placement.position.wordOffset) return placement.position.wordOffset
    if (placement.position.paragraph) {
      // Calculate approximate position based on paragraph
      const paragraphs = content.split('\\n\\n')
      let position = 0
      for (let i = 0; i < Math.min(placement.position.paragraph, paragraphs.length); i++) {
        position += paragraphs[i].length + 2 // +2 for \\n\\n
      }
      return position
    }
    return 0
  }

  const createPlacement = async (placementData: Partial<AdPlacement>) => {
    try {
      const response = await fetch('/api/ads/placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...placementData,
          workId,
          sectionId,
          targeting: getDefaultTargeting(),
          displaySettings: getDefaultDisplaySettings(),
          performanceMetrics: getEmptyMetrics()
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        const updatedPlacements = [...placements, data.placement]
        setPlacements(updatedPlacements)
        updateMarkers(updatedPlacements)
        onPlacementChange(updatedPlacements)
        setIsCreatingPlacement(false)
        setNewPlacement({
          placementType: AdPlacementType.INLINE_CONTENT,
          format: AdFormat.BANNER,
          revenueShare: 0.7,
          isActive: true,
          requiresApproval: false
        })
      }
    } catch (error) {
      console.error('Failed to create ad placement:', error)
    }
  }

  const updatePlacement = async (placementId: string, updates: Partial<AdPlacement>) => {
    try {
      const response = await fetch(`/api/ads/placements/${placementId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        const data = await response.json()
        const updatedPlacements = placements.map(p => 
          p.id === placementId ? data.placement : p
        )
        setPlacements(updatedPlacements)
        updateMarkers(updatedPlacements)
        onPlacementChange(updatedPlacements)
      }
    } catch (error) {
      console.error('Failed to update ad placement:', error)
    }
  }

  const deletePlacement = async (placementId: string) => {
    try {
      const response = await fetch(`/api/ads/placements/${placementId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        const updatedPlacements = placements.filter(p => p.id !== placementId)
        setPlacements(updatedPlacements)
        updateMarkers(updatedPlacements)
        onPlacementChange(updatedPlacements)
        setSelectedPlacement(null)
      }
    } catch (error) {
      console.error('Failed to delete ad placement:', error)
    }
  }

  const acceptSuggestion = (suggestion: SuggestedAdPlacement) => {
    const newPlacementData: Partial<AdPlacement> = {
      placementType: suggestion.placementType,
      format: AdFormat.BANNER,
      position: {
        wordOffset: suggestion.position
      },
      revenueShare: 0.7,
      isActive: true,
      requiresApproval: false,
      creatorNotes: `Auto-suggested: ${suggestion.reason}`
    }
    
    createPlacement(newPlacementData)
    
    // Remove suggestion after accepting
    setSuggestedPlacements(prev => prev.filter(s => s !== suggestion))
  }

  const getPlacementTypeColor = (type: AdPlacementType): string => {
    const colors = {
      [AdPlacementType.INLINE_CONTENT]: '#3B82F6',      // Blue
      [AdPlacementType.SCENE_BREAK]: '#10B981',         // Green
      [AdPlacementType.CHAPTER_START]: '#8B5CF6',       // Purple
      [AdPlacementType.CHAPTER_END]: '#F59E0B',         // Orange
      [AdPlacementType.SIDEBAR_LEFT]: '#EF4444',        // Red
      [AdPlacementType.SIDEBAR_RIGHT]: '#EF4444',       // Red
      [AdPlacementType.HEADER_BANNER]: '#6366F1',       // Indigo
      [AdPlacementType.FOOTER_BANNER]: '#6366F1',       // Indigo
    }
  return (colors as any)[type] || '#6B7280'
  }

  const getPlacementTypeIcon = (type: AdPlacementType): string => {
    const icons = {
      [AdPlacementType.INLINE_CONTENT]: '📝',
      [AdPlacementType.SCENE_BREAK]: '🎬',
      [AdPlacementType.CHAPTER_START]: '🚀',
      [AdPlacementType.CHAPTER_END]: '🏁',
      [AdPlacementType.SIDEBAR_LEFT]: '📱',
      [AdPlacementType.SIDEBAR_RIGHT]: '📱',
      [AdPlacementType.HEADER_BANNER]: '📊',
      [AdPlacementType.FOOTER_BANNER]: '📊',
    }
  return (icons as any)[type] || '📍'
  }

  const getDefaultTargeting = (): AdTargetingConfig => ({
    targetingTypes: [AdTargeting.GENRE_BASED, AdTargeting.CONTEXTUAL],
    genrePreferences: [],
    contentKeywords: [],
    deviceTypes: ['mobile', 'tablet', 'desktop'],
    minimumEngagement: 0.3
  })

  const getDefaultDisplaySettings = (): AdDisplaySettings => ({
    fadeIn: true,
    animationDuration: 300,
    maxImpressionsPerSession: 3,
    minimumTimeBetweenAds: 30,
    closeable: true,
    respectDoNotTrack: true
  })

  const getEmptyMetrics = () => ({
    impressions: 0,
    clicks: 0,
    conversions: 0,
    revenue: 0,
    ctr: 0,
    cpm: 0,
    cpc: 0,
    conversionRate: 0,
    viewabilityRate: 0,
    completionRate: 0,
    engagementTime: 0,
    dailyMetrics: {},
    weeklyMetrics: {},
    monthlyMetrics: {}
  })

  const estimateDailyRevenue = (placement: AdPlacement): number => {
    // Simple revenue estimation based on placement type and targeting
    const baseRates = {
      [AdPlacementType.INLINE_CONTENT]: 1.5,
      [AdPlacementType.SCENE_BREAK]: 2.0,
      [AdPlacementType.CHAPTER_START]: 2.5,
      [AdPlacementType.CHAPTER_END]: 2.2,
      [AdPlacementType.SIDEBAR_LEFT]: 1.0,
      [AdPlacementType.SIDEBAR_RIGHT]: 1.0,
      [AdPlacementType.HEADER_BANNER]: 1.8,
      [AdPlacementType.FOOTER_BANNER]: 1.3,
    }
    
  const baseRate = (baseRates as any)[placement.placementType] || 1.0
    const revenueShare = placement.revenueShare
    
    // Estimate based on 100 daily views (adjustable based on actual analytics)
    return baseRate * revenueShare * 100 / 1000 // CPM calculation
  }

  if (!isEnabled) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <DollarSign className="text-gray-400" size={20} />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Monetization Disabled</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enable ads in your creator settings to start earning revenue from your content.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Ad Placement Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <DollarSign className="text-green-600" size={20} />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Ad Placements</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {placements.length} active • Est. ${(placements.reduce((sum, p) => sum + estimateDailyRevenue(p), 0)).toFixed(2)}/day
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setDragMode(!dragMode)}
            className={`p-2 rounded-lg transition-colors ${
              dragMode 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Drag to reposition ads"
          >
            <Move size={16} />
          </button>
          
          <button
            onClick={() => setIsCreatingPlacement(true)}
            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            title="Add new ad placement"
          >
            <Plus size={16} />
          </button>
          
          <button
            onClick={() => setShowPlacementPanel(!showPlacementPanel)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Ad settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Suggested Placements */}
      {suggestedPlacements.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2 mb-3">
            <Wand2 className="text-blue-600" size={16} />
            <h4 className="font-medium text-blue-900 dark:text-blue-100">AI Suggestions</h4>
          </div>
          
          <div className="space-y-2">
            {suggestedPlacements.map((suggestion, index) => (
              <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded p-3 border border-blue-200 dark:border-blue-700">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getPlacementTypeIcon(suggestion.placementType)}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {suggestion.placementType.replace('_', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {suggestion.reason} • Est. ${suggestion.estimatedRevenue.toFixed(2)}/day
                  </p>
                  <div className="flex items-center mt-1">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${suggestion.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => acceptSuggestion(suggestion)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => setSuggestedPlacements(prev => prev.filter(s => s !== suggestion))}
                    className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm rounded transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Placements */}
      <div className="space-y-2">
        {placements.map((placement) => (
          <div 
            key={placement.id}
            className={`flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border transition-all ${
              selectedPlacement?.id === placement.id
                ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setSelectedPlacement(placement)}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getPlacementTypeColor(placement.placementType) }}
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {placement.placementType.replace('_', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">
                    {placement.format}
                  </span>
                  {!placement.isActive && (
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded">
                      Paused
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>Revenue: {Math.round(placement.revenueShare * 100)}%</span>
                  <span>Est. ${estimateDailyRevenue(placement).toFixed(2)}/day</span>
                  {placement.performanceMetrics.impressions > 0 && (
                    <span>CTR: {(placement.performanceMetrics.ctr * 100).toFixed(1)}%</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  updatePlacement(placement.id, { isActive: !placement.isActive })
                }}
                className={`p-2 rounded transition-colors ${
                  placement.isActive
                    ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'
                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={placement.isActive ? 'Pause placement' : 'Activate placement'}
              >
                {placement.isActive ? <Eye size={16} /> : <Eye size={16} className="opacity-50" />}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Open placement editor modal
                }}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Edit placement"
              >
                <Edit size={16} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm('Delete this ad placement?')) {
                    deletePlacement(placement.id)
                  }
                }}
                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                title="Delete placement"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Add Placement */}
      {isCreatingPlacement && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white">New Ad Placement</h4>
            <button
              onClick={() => setIsCreatingPlacement(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Placement Type
              </label>
              <select
                value={newPlacement.placementType}
                onChange={(e) => setNewPlacement(prev => ({ 
                  ...prev, 
                  placementType: e.target.value as AdPlacementType 
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              >
                <option value={AdPlacementType.INLINE_CONTENT}>Inline Content</option>
                <option value={AdPlacementType.SCENE_BREAK}>Scene Break</option>
                <option value={AdPlacementType.CHAPTER_START}>Chapter Start</option>
                <option value={AdPlacementType.CHAPTER_END}>Chapter End</option>
                <option value={AdPlacementType.SIDEBAR_LEFT}>Left Sidebar</option>
                <option value={AdPlacementType.SIDEBAR_RIGHT}>Right Sidebar</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ad Format
              </label>
              <select
                value={newPlacement.format}
                onChange={(e) => setNewPlacement(prev => ({ 
                  ...prev, 
                  format: e.target.value as AdFormat 
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              >
                <option value={AdFormat.BANNER}>Banner</option>
                <option value={AdFormat.SQUARE}>Square</option>
                <option value={AdFormat.NATIVE}>Native</option>
                <option value={AdFormat.TEXT_ONLY}>Text Only</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Revenue Share: {Math.round((newPlacement.revenueShare || 0.7) * 100)}%
            </label>
            <input
              type="range"
              min="0.5"
              max="0.9"
              step="0.05"
              value={newPlacement.revenueShare || 0.7}
              onChange={(e) => setNewPlacement(prev => ({ 
                ...prev, 
                revenueShare: parseFloat(e.target.value) 
              }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50%</span>
              <span>90%</span>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsCreatingPlacement(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => createPlacement(newPlacement)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Create Placement
            </button>
          </div>
        </div>
      )}
      
      {/* Revenue Summary */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
        <div className="flex items-center space-x-2 mb-2">
          <BarChart3 className="text-green-600" size={16} />
          <h4 className="font-medium text-green-900 dark:text-green-100">Revenue Projection</h4>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-green-700 dark:text-green-300 font-medium">
              ${(placements.reduce((sum, p) => sum + estimateDailyRevenue(p), 0) * 7).toFixed(2)}
            </p>
            <p className="text-green-600 dark:text-green-400">Weekly</p>
          </div>
          <div>
            <p className="text-green-700 dark:text-green-300 font-medium">
              ${(placements.reduce((sum, p) => sum + estimateDailyRevenue(p), 0) * 30).toFixed(2)}
            </p>
            <p className="text-green-600 dark:text-green-400">Monthly</p>
          </div>
          <div>
            <p className="text-green-700 dark:text-green-300 font-medium">
              {placements.filter(p => p.isActive).length}/{placements.length}
            </p>
            <p className="text-green-600 dark:text-green-400">Active</p>
          </div>
        </div>
      </div>
    </div>
  )
}