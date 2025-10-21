'use client'

import { useState, useEffect } from 'react'
import { StarIcon } from '@heroicons/react/24/solid'
import { CheckIcon } from '@heroicons/react/24/outline'

interface Translation {
  id: string
  tier: string
  title: string
  translatorName: string
  qualityOverall: number
  ratingCount: number
  editCount: number
  isDefault: boolean
}

interface LanguageSelectorMenuProps {
  workId: string
  chapterId: string
  onClose: () => void
  onLanguageSelect: (language: string) => void
}

export default function LanguageSelectorMenu({
  workId,
  chapterId,
  onClose,
  onLanguageSelect,
}: LanguageSelectorMenuProps) {
  const [translations, setTranslations] = useState<Translation[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTranslations()
  }, [workId, chapterId, selectedLanguage])

  const fetchTranslations = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/works/${workId}/chapters/${chapterId}/translations?languageCode=${selectedLanguage}`
      )
      if (response.ok) {
        const data = await response.json()
        setTranslations(data.translations || [])
      }
    } catch (error) {
      console.error('Failed to fetch translations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'TIER_1_OFFICIAL':
        return 'Tier 1 (Official LLM)'
      case 'TIER_2_COMMUNITY':
        return 'Tier 2 (Community Enhanced)'
      case 'TIER_3_PROFESSIONAL':
        return 'Tier 3 (Professional)'
      default:
        return tier
    }
  }

  const groupedTranslations = translations.reduce(
    (acc, t) => {
      if (t.tier === 'TIER_1_OFFICIAL') {
        acc.tier1.push(t)
      } else if (t.tier === 'TIER_2_COMMUNITY') {
        acc.tier2.push(t)
      } else if (t.tier === 'TIER_3_PROFESSIONAL') {
        acc.tier3.push(t)
      }
      return acc
    },
    { tier1: [] as Translation[], tier2: [] as Translation[], tier3: [] as Translation[] }
  )

  return (
    <div className="absolute left-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-[600px] overflow-y-auto z-50">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Translation Quality
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Quality ratings appear only in this menu to protect story perception
        </p>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Tier 1 (Official LLM) */}
            {groupedTranslations.tier1.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Tier 1 (Official LLM)
                </h4>
                {groupedTranslations.tier1.map((t) => (
                  <TranslationItem
                    key={t.id}
                    translation={t}
                    onSelect={() => onLanguageSelect(t.title)}
                  />
                ))}
              </div>
            )}

            {/* Tier 2 (Community Enhanced) */}
            {groupedTranslations.tier2.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Tier 2 (Community Enhanced)
                </h4>
                {groupedTranslations.tier2.map((t) => (
                  <TranslationItem
                    key={t.id}
                    translation={t}
                    onSelect={() => onLanguageSelect(t.title)}
                  />
                ))}
              </div>
            )}

            {/* Tier 3 (Professional) */}
            {groupedTranslations.tier3.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Tier 3 (Professional)
                </h4>
                {groupedTranslations.tier3.map((t) => (
                  <TranslationItem
                    key={t.id}
                    translation={t}
                    onSelect={() => onLanguageSelect(t.title)}
                  />
                ))}
              </div>
            )}

            {translations.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No translations available for this chapter yet.
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
            + Submit Translation
          </button>
          <button className="text-sm text-gray-500 hover:text-gray-600">
            + Report Issue
          </button>
        </div>
      </div>
    </div>
  )
}

function TranslationItem({
  translation,
  onSelect,
}: {
  translation: Translation
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-lg border transition-colors mb-2 ${
        translation.isDefault
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {translation.title}
            </span>
            {translation.isDefault && (
              <CheckIcon className="w-4 h-4 text-blue-500" />
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            by {translation.translatorName}
            {translation.editCount > 0 && ` • ${translation.editCount} edits`}
          </div>
          <div className="flex items-center space-x-1">
            <StarIcon className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {translation.qualityOverall.toFixed(1)}/5
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({translation.ratingCount} votes)
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
