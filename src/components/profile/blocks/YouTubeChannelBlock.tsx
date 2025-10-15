'use client'

import { useEffect, useState } from 'react'
import { PlayIcon } from '@heroicons/react/24/solid'
import { UserIcon } from '@heroicons/react/24/outline'
import BaseBlock from './BaseBlock'
import { formatCount } from '@/lib/api/youtube'

interface YouTubeChannelBlockData {
  channelId: string
  channelName: string
  channelHandle?: string // @handle
  channelImage?: string
  subscriberCount?: string // e.g., "1.2M"
  description?: string
  bannerImage?: string
}

interface YouTubeChannelBlockProps {
  data: YouTubeChannelBlockData
  width?: number
  height?: number
  isOwner?: boolean
  onDelete?: () => void
  onExpand?: (direction: 'width' | 'height') => void
}

/**
 * YouTubeChannelBlock - v0.1
 * YouTube channel showcase with banner and subscribe button
 * Size: 2x1 default, expandable in height
 */
export default function YouTubeChannelBlock({
  data,
  width = 2,
  height = 1,
  isOwner = false,
  onDelete,
  onExpand
}: YouTubeChannelBlockProps) {
  const channelUrl = `https://youtube.com/@${data.channelHandle || data.channelId}`
  const [subs, setSubs] = useState<string | undefined>(data.subscriberCount)
  const [banner, setBanner] = useState<string | undefined>(data.bannerImage)
  const [avatar, setAvatar] = useState<string | undefined>(data.channelImage)
  const [desc, setDesc] = useState<string | undefined>(data.description)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function fetchStats() {
      if (!data.channelId) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/social/youtube/channel/${data.channelId}`)
        if (!res.ok) {
          throw new Error(`Failed to fetch YouTube data (${res.status})`)
        }
        const json = await res.json()
        if (mounted) {
          setSubs(formatCount(json.subscriberCount))
          setBanner(json.bannerImage || data.bannerImage)
          setAvatar(json.thumbnails?.high || json.thumbnails?.medium || data.channelImage)
          setDesc(json.description || data.description)
          setError(null)
        }
      } catch (e) {
        console.error('YouTube fetch error', e)
        if (mounted) setError('Unable to load channel stats')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 60 * 60 * 1000) // refresh hourly
    return () => { mounted = false; clearInterval(interval) }
  }, [data.channelId])
  
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
        className="h-full flex flex-col bg-gray-900 text-white overflow-hidden group/youtube"
      >
        {/* Channel Banner */}
        <div className="relative w-full h-20 bg-gradient-to-r from-red-600 to-red-500 overflow-hidden">
          {(banner || data.bannerImage) ? (
            <img
              src={(banner || data.bannerImage) as string}
              alt={`${data.channelName} banner`}
              className="w-full h-full object-cover group-hover/youtube:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-red-600 to-red-500">
              <PlayIcon className="w-12 h-12 text-white/30" />
            </div>
          )}
          
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/80" />
        </div>

        {/* Channel Info */}
        <div className="flex-1 p-4 -mt-8 relative z-10">
          <div className="flex items-start gap-3">
            {/* Channel Avatar */}
            <div className="relative flex-shrink-0">
              {(avatar || data.channelImage) ? (
                <img
                  src={(avatar || data.channelImage) as string}
                  alt={data.channelName}
                  className="w-16 h-16 rounded-full border-4 border-gray-900 bg-gray-800"
                />
              ) : (
                <div className="w-16 h-16 rounded-full border-4 border-gray-900 bg-gray-800 flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-gray-500" />
                </div>
              )}
            </div>

            {/* Channel Details */}
            <div className="flex-1 min-w-0 pt-2">
              <h3 className="font-bold text-base truncate text-gray-100">
                {data.channelName}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                {data.channelHandle && (
                  <span>@{data.channelHandle}</span>
                )}
                {(subs || data.subscriberCount) && (
                  <>
                    <span>•</span>
                    <span>{(subs || data.subscriberCount)} subscribers</span>
                  </>
                )}
              </div>
              {(desc || data.description) && height >= 2 && (
                <p className="text-xs text-gray-400 line-clamp-2">
                  {desc || data.description}
                </p>
              )}
              {loading && (
                <div className="text-[10px] text-gray-500">Loading channel stats…</div>
              )}
              {error && (
                <div className="text-[10px] text-yellow-200/80">{error}</div>
              )}
            </div>
          </div>

          {/* Subscribe Button */}
          <div className="mt-3">
            <div className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-colors px-4 py-2 rounded-full text-sm font-semibold justify-center">
              <PlayIcon className="w-4 h-4" />
              Subscribe
            </div>
          </div>
        </div>

        {/* YouTube Logo */}
        <div className="absolute top-2 right-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>
      </a>
    </BaseBlock>
  )
}
