'use client'

import { PlayCircleIcon, SignalIcon } from '@heroicons/react/24/outline'
import BaseBlock from './BaseBlock'

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
  const channelUrl = `https://twitch.tv/${data.channelName}`
  
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
              {data.profileImage ? (
                <img
                  src={data.profileImage}
                  alt={data.displayName || data.channelName}
                  className="w-12 h-12 rounded-full border-2 border-white/20"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                  <PlayCircleIcon className="w-6 h-6 text-white/70" />
                </div>
              )}
              {/* Live Indicator */}
              {data.isLive && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#9146FF] animate-pulse" />
              )}
            </div>

            {/* Channel Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm truncate">
                {data.displayName || data.channelName}
              </h3>
              <p className="text-xs text-white/70 truncate">
                twitch.tv/{data.channelName}
              </p>
            </div>

            {/* Live Badge */}
            {data.isLive && (
              <div className="flex items-center gap-1 bg-red-500 px-2 py-1 rounded text-xs font-bold">
                <SignalIcon className="w-3 h-3" />
                LIVE
              </div>
            )}
          </div>

          {/* Stream Info (when live) */}
          {data.isLive && (
            <div className="flex-1 flex flex-col justify-center">
              {data.streamTitle && (
                <p className="text-sm font-medium mb-1 line-clamp-2">
                  {data.streamTitle}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-white/80">
                {data.game && (
                  <span className="truncate">{data.game}</span>
                )}
                {data.viewerCount !== undefined && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    {data.viewerCount.toLocaleString()} viewers
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Offline State */}
          {!data.isLive && (
            <div className="flex-1 flex items-center justify-center text-white/60 text-sm">
              Channel is offline
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
