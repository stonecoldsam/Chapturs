'use client'

import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import BaseBlock from './BaseBlock'

interface TwitterFeedBlockData {
  twitterHandle: string
  displayName?: string
  profileImage?: string
  bio?: string
  followerCount?: string
  embedType?: 'timeline' | 'profile' // Timeline shows recent tweets, profile shows static info
}

interface TwitterFeedBlockProps {
  data: TwitterFeedBlockData
  width?: number
  height?: number
  isOwner?: boolean
  onDelete?: () => void
  onExpand?: (direction: 'width' | 'height') => void
}

/**
 * TwitterFeedBlock - v0.1
 * Twitter/X profile showcase
 * Can show timeline embed (requires Twitter widget JS) or static profile card
 * Size: 1x2 default (tall for timeline), expandable in width
 */
export default function TwitterFeedBlock({
  data,
  width = 1,
  height = 2,
  isOwner = false,
  onDelete,
  onExpand
}: TwitterFeedBlockProps) {
  const twitterUrl = `https://twitter.com/${data.twitterHandle}`
  
  // Can expand width only (already 2 tall for timeline)
  const canExpandWidth = width < 2

  return (
    <BaseBlock
      width={width}
      height={height}
      isOwner={isOwner}
      onDelete={onDelete}
      onExpand={onExpand}
      canExpandWidth={canExpandWidth}
      canExpandHeight={false}
    >
      <div className="h-full flex flex-col bg-black text-white relative overflow-hidden">
        {/* Twitter/X Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-start gap-3">
            {/* Profile Image */}
            {data.profileImage ? (
              <img
                src={data.profileImage}
                alt={data.displayName || data.twitterHandle}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-gray-500" />
              </div>
            )}

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm truncate">
                {data.displayName || data.twitterHandle}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                @{data.twitterHandle}
              </p>
              {data.followerCount && (
                <p className="text-xs text-gray-400 mt-1">
                  {data.followerCount} followers
                </p>
              )}
            </div>

            {/* X Logo */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>

          {/* Bio */}
          {data.bio && (
            <p className="text-xs text-gray-300 mt-3 line-clamp-3">
              {data.bio}
            </p>
          )}
        </div>

        {/* Timeline/Feed Area */}
        <div className="flex-1 overflow-hidden">
          {data.embedType === 'timeline' ? (
            // Twitter Timeline Embed
            // Note: Requires Twitter widget.js to be loaded in the page
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
              <a
                className="twitter-timeline"
                data-theme="dark"
                data-chrome="noheader nofooter noborders"
                href={`${twitterUrl}?ref_src=twsrc%5Etfw`}
              >
                Loading tweets...
              </a>
            </div>
          ) : (
            // Static Call-to-Action
            <div className="h-full flex flex-col items-center justify-center p-4 text-center">
              <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-700 mb-3" />
              <p className="text-sm text-gray-400 mb-4">
                Follow on X for updates
              </p>
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white text-black rounded-full font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                Follow @{data.twitterHandle}
              </a>
            </div>
          )}
        </div>

        {/* Footer Link */}
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 border-t border-gray-800 text-center text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          View full profile on X →
        </a>
      </div>
    </BaseBlock>
  )
}
