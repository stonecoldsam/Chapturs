'use client'

import { UserIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import BaseBlock from './BaseBlock'

interface FavoriteAuthorBlockData {
  authorId: string
  authorName: string
  displayName?: string
  avatar?: string
  workCount: number
  isFollowing?: boolean
}

interface FavoriteAuthorBlockProps {
  data: FavoriteAuthorBlockData
  width?: number
  height?: number
  isOwner?: boolean
  onDelete?: () => void
  onExpand?: (direction: 'width' | 'height') => void
}

/**
 * FavoriteAuthorBlock - v0.1
 * Showcase a favorite creator/author
 * Promotes cross-discovery and community building
 * Size: 1x1 (compact author card)
 */
export default function FavoriteAuthorBlock({
  data,
  width = 1,
  height = 1,
  isOwner = false,
  onDelete,
  onExpand
}: FavoriteAuthorBlockProps) {
  return (
    <BaseBlock
      width={width}
      height={height}
      isOwner={isOwner}
      onDelete={onDelete}
      onExpand={onExpand}
      canExpandWidth={false}
      canExpandHeight={false}
    >
      <a
        href={`/profile/${data.authorName}`}
        className="h-full flex flex-col p-4 hover:bg-gray-750 transition-colors group/author"
      >
        {/* Avatar */}
        <div className="aspect-square rounded-lg overflow-hidden bg-gray-700 mb-3">
          {data.avatar ? (
            <img
              src={data.avatar}
              alt={data.displayName || data.authorName}
              className="w-full h-full object-cover group-hover/author:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UserIcon className="w-12 h-12 text-gray-500" />
            </div>
          )}
        </div>

        {/* Author Info */}
        <div className="flex-1 flex flex-col">
          <h3 className="font-semibold text-gray-100 text-sm mb-1 group-hover/author:text-blue-400 transition-colors">
            {data.displayName || data.authorName}
          </h3>
          <p className="text-xs text-gray-400 mb-2">@{data.authorName}</p>
          
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-auto">
            <BookOpenIcon className="w-3 h-3" />
            <span>{data.workCount} works</span>
          </div>
        </div>

        {/* Follow Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            // TODO: Implement follow functionality
          }}
          className={`mt-3 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            data.isFollowing
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {data.isFollowing ? 'Following' : 'Follow'}
        </button>
      </a>
    </BaseBlock>
  )
}
