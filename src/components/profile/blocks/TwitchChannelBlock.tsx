'use client'

import { useState, useEffect } from 'react'
import { PlayCircleIcon, SignalIcon } from '@heroicons/react/24/outline'
import BaseBlock from './BaseBlock'
import type { TwitchData } from '@/lib/api/twitch'

interface TwitchChannelBlockData {
  channelName: string
  displayName?: string
  profileImage?: string
  isLive?: boolean
  streamTitle?: string
  game?: string
  viewerCount?: number
}

interface TwitchChannelBlockProps {
  data: TwitchChannelBlockData
  width?: number
  height?: number
  isOwner?: boolean
  onDelete?: () => void
  onExpand?: (direction: 'width' | 'height') => void
}

/**
 * TwitchChannelBlock - v0.1
 * Twitch stream status and channel link
 * Shows live indicator, game, viewer count
 * Size: 2x1 default, expandable in height
 */
export default function TwitchChannelBlock({
  data,
  width = 2,
  height = 1,
  isOwner = false,
  onDelete,
  onExpand
}: TwitchChannelBlockProps) {
  const [liveData, setLiveData] = useState<TwitchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const channelUrl = `https://twitch.tv/${data.channelName}`
  
  // Fetch live data from API
  useEffect(() => {
    async function fetchTwitchData() {
      try {
        const res = await fetch(`/api/social/twitch/channel/${data.channelName}`)
        
        if (!res.ok) {
          throw new Error('Failed to fetch Twitch data')
        }
        
        const twitchData: TwitchData = await res.json()
        setLiveData(twitchData)
        setError(null)
      } catch (err) {
        console.error('Error fetching Twitch data:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchTwitchData()

    // Refresh every 5 minutes
    const interval = setInterval(fetchTwitchData, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [data.channelName])

  // Use live data if available, otherwise fallback to config data
  const displayData = liveData ? {
    channelName: data.channelName,
    displayName: liveData.channel.displayName || data.displayName,
    profileImage: liveData.channel.profileImage || data.profileImage,
    isLive: liveData.stream?.isLive || false,
    streamTitle: liveData.stream?.title,
    game: liveData.stream?.gameName,
    viewerCount: liveData.stream?.viewerCount,
  } : data

  // Can expand height only (already 2 wide)
  const canExpandHeight = height < 2

  return (
    <BaseBlock
      width={width}
      height={height}
      isOwner={isOwner}
      onDelete={onDelete}
      onExpand={onExpand}
      canExpandWidth={false}
      canExpandHeight={canExpandHeight}
    >
      <a
        href={channelUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="h-full flex flex-col bg-gradient-to-br from-[#9146FF] to-[#772CE8] text-white relative overflow-hidden group/twitch"
      >
        {/* Twitch pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
          }} />
        </div>

        <div className="relative z-10 flex-1 p-4 flex flex-col">
          {/* Header: Profile + Live Status */}
          <div className="flex items-center gap-3 mb-3">
            {/* Profile Image */}
            <div className="relative">
              {displayData.profileImage ? (
                <img
                  src={displayData.profileImage}
                  alt={displayData.displayName || displayData.channelName}
                  className="w-12 h-12 rounded-full border-2 border-white/20"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                  <PlayCircleIcon className="w-6 h-6 text-white/70" />
                </div>
              )}
              {/* Live Indicator */}
              {displayData.isLive && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#9146FF] animate-pulse" />
              )}
            </div>

            {/* Channel Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm truncate">
                {displayData.displayName || displayData.channelName}
              </h3>
              <p className="text-xs text-white/70 truncate">
                twitch.tv/{displayData.channelName}
              </p>
            </div>

            {/* Live Badge */}
            {displayData.isLive && (
              <div className="flex items-center gap-1 bg-red-500 px-2 py-1 rounded text-xs font-bold">
                <SignalIcon className="w-3 h-3" />
                LIVE
              </div>
            )}
          </div>

          {/* Stream Info (when live) */}
          {displayData.isLive && (
            <div className="flex-1 flex flex-col justify-center">
              {displayData.streamTitle && (
                <p className="text-sm font-medium mb-1 line-clamp-2">
                  {displayData.streamTitle}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-white/80">
                {displayData.game && (
                  <span className="truncate">{displayData.game}</span>
                )}
                {displayData.viewerCount !== undefined && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    {displayData.viewerCount.toLocaleString()} viewers
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Offline State */}
          {!displayData.isLive && (
            <div className="flex-1 flex items-center justify-center text-white/60 text-sm">
              {loading ? 'Loading...' : error ? 'Failed to load data' : 'Channel is offline'}
            </div>
          )}

          {/* CTA */}
          <div className="mt-auto pt-3 flex items-center justify-between">
            <span className="text-xs text-white/70">Watch on Twitch</span>
            <span className="text-white/70">→</span>
          </div>
        </div>

        {/* Glitch effect on hover */}
        <div className="absolute inset-0 bg-white opacity-0 group-hover/twitch:opacity-5 transition-opacity pointer-events-none" />
      </a>
    </BaseBlock>
  )
}
