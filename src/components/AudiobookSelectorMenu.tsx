'use client'

import { useState, useEffect } from 'react'
import { StarIcon, PlayIcon } from '@heroicons/react/24/solid'
import { CheckIcon } from '@heroicons/react/24/outline'

interface Audiobook {
  id: string
  tier: string
  narratorName: string
  narratorId: string | null
  durationSeconds: number
  qualityOverall: number
  ratingCount: number
  isDefault: boolean
  isPlaying: boolean
}

interface AudiobookSelectorMenuProps {
  workId: string
  chapterId: string
  onClose: () => void
  onAudiobookSelect: (audiobookId: string) => void
}

export default function AudiobookSelectorMenu({
  workId,
  chapterId,
  onClose,
  onAudiobookSelect,
}: AudiobookSelectorMenuProps) {
  const [audiobooks, setAudiobooks] = useState<Audiobook[]>([])
  const [loading, setLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    if (isFetching) return // Prevent concurrent fetches
    
    const fetchAudiobooks = async () => {
      try {
        setLoading(true)
        setIsFetching(true)
        const response = await fetch(
          `/api/works/${workId}/chapters/${chapterId}/audiobooks`
        )
        if (response.ok) {
          const data = await response.json()
          setAudiobooks(data.audiobooks || [])
        } else {
          setAudiobooks([])
        }
      } catch (error) {
        console.error('Failed to fetch audiobooks:', error)
        setAudiobooks([])
      } finally {
        setLoading(false)
        setIsFetching(false)
      }
    }

    fetchAudiobooks()
  }, [workId, chapterId, isFetching])

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const groupedAudiobooks = audiobooks.reduce(
    (acc, a) => {
      if (a.tier === 'TIER_1_OFFICIAL') {
        acc.tier1.push(a)
      } else if (a.tier === 'TIER_3_PROFESSIONAL') {
        acc.tier3.push(a)
      }
      return acc
    },
    { tier1: [] as Audiobook[], tier3: [] as Audiobook[] }
  )

  return (
    <div className="absolute left-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-[600px] overflow-y-auto z-50">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Audiobook Selection
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Choose a narrator for this chapter
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
            {/* Tier 1 (Official House) */}
            {groupedAudiobooks.tier1.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Tier 1 (Official House)
                </h4>
                {groupedAudiobooks.tier1.map((a) => (
                  <AudiobookItem
                    key={a.id}
                    audiobook={a}
                    formatDuration={formatDuration}
                    onSelect={() => onAudiobookSelect(a.id)}
                  />
                ))}
              </div>
            )}

            {/* Tier 3 (Professional Narrators) */}
            {groupedAudiobooks.tier3.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Tier 3 (Professional Narrators)
                </h4>
                {groupedAudiobooks.tier3.map((a) => (
                  <AudiobookItem
                    key={a.id}
                    audiobook={a}
                    formatDuration={formatDuration}
                    onSelect={() => onAudiobookSelect(a.id)}
                  />
                ))}
              </div>
            )}

            {audiobooks.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No audiobooks available for this chapter yet.
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
            + Submit Audiobook
          </button>
          <button className="text-sm text-gray-500 hover:text-gray-600">
            + Report Issue
          </button>
        </div>
      </div>
    </div>
  )
}

function AudiobookItem({
  audiobook,
  formatDuration,
  onSelect,
}: {
  audiobook: Audiobook
  formatDuration: (seconds: number) => string
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-lg border transition-colors mb-2 ${
        audiobook.isDefault || audiobook.isPlaying
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            {audiobook.isPlaying && (
              <PlayIcon className="w-4 h-4 text-blue-500" />
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {audiobook.narratorName}
            </span>
            {audiobook.isDefault && !audiobook.isPlaying && (
              <CheckIcon className="w-4 h-4 text-blue-500" />
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Duration: {formatDuration(audiobook.durationSeconds)}
          </div>
          <div className="flex items-center space-x-1">
            <StarIcon className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {audiobook.qualityOverall.toFixed(1)}/5
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({audiobook.ratingCount} votes)
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
