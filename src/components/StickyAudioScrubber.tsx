'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/solid'
import { BackwardIcon, ForwardIcon } from '@heroicons/react/24/outline'

interface StickyAudioScrubberProps {
  audiobookId: string
  workId: string
  chapterId: string
  narratorName: string
  onMinimize: () => void
  onNarratorChange: () => void
}

export default function StickyAudioScrubber({
  audiobookId,
  workId,
  chapterId,
  narratorName,
  onMinimize,
  onNarratorChange,
}: StickyAudioScrubberProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const skip = useCallback((seconds: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.max(
      0,
      Math.min(duration, audioRef.current.currentTime + seconds)
    )
  }, [duration])

  useEffect(() => {
    if (isFetching) return
    
    const fetchAudioUrl = async () => {
      try {
        setIsLoading(true)
        setIsFetching(true)
        const response = await fetch(
          `/api/works/${workId}/chapters/${chapterId}/audiobooks/${audiobookId}/stream`
        )
        if (response.ok) {
          const data = await response.json()
          setAudioUrl(data.url)
          setDuration(data.durationSeconds)
        }
      } catch (error) {
        console.error('Failed to fetch audio URL:', error)
      } finally {
        setIsLoading(false)
        setIsFetching(false)
      }
    }

    fetchAudioUrl()
  }, [audiobookId, workId, chapterId, isFetching])

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      switch (e.key) {
        case ' ':
          e.preventDefault()
          togglePlayPause()
          break
        case 'ArrowLeft':
          e.preventDefault()
          skip(-10)
          break
        case 'ArrowRight':
          e.preventDefault()
          skip(10)
          break
        case 'n':
        case 'N':
          e.preventDefault()
          // TODO: Next chapter
          break
        case 'p':
        case 'P':
          e.preventDefault()
          // TODO: Previous chapter
          break
        case 'm':
        case 'M':
          e.preventDefault()
          onMinimize()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlayPause, skip, onMinimize])

  const fetchAudioUrl = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/works/${workId}/chapters/${chapterId}/audiobooks/${audiobookId}/stream`
      )
      if (response.ok) {
        const data = await response.json()
        setAudioUrl(data.url)
        setDuration(data.durationSeconds)
      }
    } catch (error) {
      console.error('Failed to fetch audio URL:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * duration
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (!audioRef.current) return

    if (isMuted) {
      audioRef.current.volume = volume
      setIsMuted(false)
    } else {
      audioRef.current.volume = 0
      setIsMuted(true)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="sticky top-14 z-30 bg-gray-900 text-white shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Main Controls */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4 flex-1">
            {/* Narrator Info */}
            <button
              onClick={onNarratorChange}
              className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
              title="Change narrator"
            >
              <span className="text-sm font-medium">🎙️ {narratorName}</span>
            </button>

            {/* Playback Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => skip(-10)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Rewind 10s (← Arrow)"
              >
                <BackwardIcon className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlayPause}
                disabled={isLoading || !audioUrl}
                className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                title="Play/Pause (Space)"
              >
                {isPlaying ? (
                  <PauseIcon className="w-6 h-6" />
                ) : (
                  <PlayIcon className="w-6 h-6" />
                )}
              </button>

              <button
                onClick={() => skip(10)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Skip 10s (→ Arrow)"
              >
                <ForwardIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Time Display */}
            <div className="text-sm text-gray-400">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Volume & Minimize */}
          <div className="flex items-center space-x-4">
            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                {isMuted ? (
                  <SpeakerXMarkIcon className="w-5 h-5" />
                ) : (
                  <SpeakerWaveIcon className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Minimize Button */}
            <button
              onClick={onMinimize}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Minimize (M key)"
            >
              <ChevronDownIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrubber Bar */}
        <div
          onClick={handleSeek}
          className="w-full h-2 bg-gray-700 rounded-full cursor-pointer relative group"
        >
          <div
            className="h-full bg-blue-500 rounded-full relative"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>

        {/* Hidden Audio Element */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={(e) =>
              setCurrentTime((e.target as HTMLAudioElement).currentTime)
            }
            onLoadedMetadata={(e) =>
              setDuration((e.target as HTMLAudioElement).duration)
            }
            onEnded={() => setIsPlaying(false)}
          />
        )}

        {/* Keyboard Shortcuts Hint */}
        <div className="text-xs text-gray-500 mt-2 text-center">
          Shortcuts: Space (play/pause) • ← → (skip) • N (next) • P (previous) • M (minimize)
        </div>
      </div>
    </div>
  )
}
