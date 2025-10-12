/**
 * Default Ad Configuration Manager
 * 
 * Ensures all content has ads with sensible defaults when creators haven't configured custom placements
 */

'use client'

import React, { useState, useEffect } from 'react'
import { 
  Settings,
  DollarSign,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  BarChart3
} from 'lucide-react'
import { DefaultAdConfiguration } from '@/types/creator-ads'
import { AdPlacementType } from '@/types/ads'

interface DefaultAdConfigManagerProps {
  workId: string
  workTitle: string
  hasCustomPlacements: boolean
  onConfigUpdate: (config: DefaultAdConfiguration) => void
}

export default function DefaultAdConfigManager({
  workId,
  workTitle,
  hasCustomPlacements,
  onConfigUpdate
}: DefaultAdConfigManagerProps) {
  const [config, setConfig] = useState<DefaultAdConfiguration>({
    workId,
    hasCustomPlacements,
    defaultPlacements: {
      sidebarRight: true,    // Less intrusive, good for continuous reading
      sidebarLeft: false,    // Usually avoided to not interfere with navigation
      chapterEnd: true,      // Natural break point
      betweenChapters: false // Can be jarring between chapters
    },
    platformRevenueShare: 0.3,  // 30% platform
    creatorRevenueShare: 0.7,   // 70% creator
    allowExternalAds: true,
    allowCreatorRecommendations: true,
    allowPlatformAds: true,
    createdAt: new Date(),
    updatedAt: new Date()
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load existing configuration
  useEffect(() => {
    loadConfiguration()
  }, [workId])

  const loadConfiguration = async () => {
    try {
      const response = await fetch(`/api/default-ads/config?workId=${workId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.config) {
          setConfig(data.config)
        }
      }
    } catch (error) {
      console.error('Failed to load ad configuration:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveConfiguration = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/default-ads/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          updatedAt: new Date()
        })
      })

      if (response.ok) {
        const data = await response.json()
        setConfig(data.config)
        onConfigUpdate(data.config)
      }
    } catch (error) {
      console.error('Failed to save ad configuration:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updatePlacement = (placement: keyof typeof config.defaultPlacements, enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      defaultPlacements: {
        ...prev.defaultPlacements,
        [placement]: enabled
      },
      updatedAt: new Date()
    }))
  }

  const updateSetting = (key: keyof DefaultAdConfiguration, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
      updatedAt: new Date()
    }))
  }

  const estimateMonthlyRevenue = () => {
    const activePlacements = Object.values(config.defaultPlacements).filter(Boolean).length
    const baseRevenuePerPlacement = 15 // $15 per placement per month (estimate)
    return activePlacements * baseRevenuePerPlacement * config.creatorRevenueShare
  }

  const getPlacementDescription = (placement: keyof typeof config.defaultPlacements) => {
    const descriptions = {
      sidebarRight: "Appears on the right side of content. Less intrusive and maintains reading flow.",
      sidebarLeft: "Left sidebar placement. May interfere with navigation on some devices.",
      chapterEnd: "Shows at the end of each chapter. Natural stopping point for readers.",
      betweenChapters: "Appears between chapter transitions. Can be disruptive to binge readers."
    }
    return descriptions[placement]
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Settings size={20} />
            <span>Default Ad Settings</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {hasCustomPlacements 
              ? "Custom placements override these defaults"
              : "These settings apply since no custom ad placements are configured"}
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">
            ${estimateMonthlyRevenue().toFixed(0)}
          </div>
          <div className="text-sm text-gray-500">Est. monthly revenue</div>
        </div>
      </div>

      {/* Status Alert */}
      {!hasCustomPlacements && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="font-medium text-blue-900">Using Default Ad Placements</h4>
            <p className="text-sm text-blue-800 mt-1">
              Since you haven't set up custom ad placements, we're using these default settings to ensure 
              your content is monetized. You can customize placements in the Ads tab for more control.
            </p>
          </div>
        </div>
      )}

      {/* Platform Revenue Policy */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
          <DollarSign size={18} />
          <span>Revenue Sharing</span>
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Your share:</span>
            <span className="font-semibold text-green-600">
              {Math.round(config.creatorRevenueShare * 100)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Platform share:</span>
            <span className="font-semibold text-gray-600">
              {Math.round(config.platformRevenueShare * 100)}%
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Revenue sharing covers platform maintenance, hosting, and payment processing.
          </div>
        </div>
      </div>

      {/* Default Placements */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <Target size={18} />
          <span>Default Ad Placements</span>
        </h4>
        
        <div className="space-y-4">
          {Object.entries(config.defaultPlacements).map(([placement, enabled]) => (
            <div key={placement} className="flex items-start justify-between p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <button
                    onClick={() => updatePlacement(placement as keyof typeof config.defaultPlacements, !enabled)}
                    className="flex-shrink-0"
                  >
                    {enabled ? (
                      <ToggleRight className="text-green-600" size={24} />
                    ) : (
                      <ToggleLeft className="text-gray-400" size={24} />
                    )}
                  </button>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 capitalize">
                      {placement.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </h5>
                    <p className="text-sm text-gray-600 mt-1">
                      {getPlacementDescription(placement as keyof typeof config.defaultPlacements)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-right ml-4">
                <div className="text-sm font-medium text-gray-900">
                  ${enabled ? '15' : '0'}/month
                </div>
                <div className="text-xs text-gray-500">estimated</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ad Content Settings */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <Eye size={18} />
          <span>Content Preferences</span>
        </h4>
        
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <div>
              <span className="font-medium text-gray-900">External Advertiser Ads</span>
              <p className="text-sm text-gray-600">Third-party advertisements from external companies</p>
            </div>
            <button
              onClick={() => updateSetting('allowExternalAds', !config.allowExternalAds)}
            >
              {config.allowExternalAds ? (
                <ToggleRight className="text-green-600" size={24} />
              ) : (
                <ToggleLeft className="text-gray-400" size={24} />
              )}
            </button>
          </label>
          
          <label className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <div>
              <span className="font-medium text-gray-900">Creator Recommendations</span>
              <p className="text-sm text-gray-600">Story recommendations from fellow creators</p>
            </div>
            <button
              onClick={() => updateSetting('allowCreatorRecommendations', !config.allowCreatorRecommendations)}
            >
              {config.allowCreatorRecommendations ? (
                <ToggleRight className="text-green-600" size={24} />
              ) : (
                <ToggleLeft className="text-gray-400" size={24} />
              )}
            </button>
          </label>
          
          <label className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <div>
              <span className="font-medium text-gray-900">Platform Promoted Content</span>
              <p className="text-sm text-gray-600">Platform-curated story recommendations and features</p>
            </div>
            <button
              onClick={() => updateSetting('allowPlatformAds', !config.allowPlatformAds)}
            >
              {config.allowPlatformAds ? (
                <ToggleRight className="text-green-600" size={24} />
              ) : (
                <ToggleLeft className="text-gray-400" size={24} />
              )}
            </button>
          </label>
        </div>
      </div>

      {/* Performance Projections */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-3 flex items-center space-x-2">
          <BarChart3 size={18} />
          <span>Performance Estimate</span>
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-green-800">
              {Object.values(config.defaultPlacements).filter(Boolean).length}
            </div>
            <div className="text-green-600">Active placements</div>
          </div>
          
          <div className="text-center">
            <div className="font-semibold text-green-800">~2,000</div>
            <div className="text-green-600">Monthly impressions</div>
          </div>
          
          <div className="text-center">
            <div className="font-semibold text-green-800">~4%</div>
            <div className="text-green-600">Expected CTR</div>
          </div>
          
          <div className="text-center">
            <div className="font-semibold text-green-800">
              ${estimateMonthlyRevenue().toFixed(0)}
            </div>
            <div className="text-green-600">Monthly revenue</div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveConfiguration}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              <span>Save Configuration</span>
            </>
          )}
        </button>
      </div>

      {/* Info Footer */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        <Clock size={14} className="inline mr-1" />
        All content on Chapturs includes ads to support creators and platform operations. 
        Creators enrolled in our monetization program receive revenue share from ads on their content.
        You can upgrade to custom ad placements anytime for more control and potentially higher earnings.
      </div>
    </div>
  )
}