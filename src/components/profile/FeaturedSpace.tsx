'use client'

import { BookOpenIcon, PencilIcon } from '@heroicons/react/24/outline'
import { getBlockComponent } from '@/components/profile/blocks'

interface FeaturedSpaceProps {
  type: 'work' | 'block' | 'none'
  workData?: {
    id: string
    title: string
    coverImage?: string
    description: string
    genres: string[]
    status: string
  }
  blockData?: {
    id: string
    type: string
    data: string // JSON string
  }
  isOwner?: boolean
  onEdit?: () => void
  onSelect?: () => void
}

/**
 * FeaturedSpace - v0.2
 * Center prominent area for showcasing a featured work or custom block
 * This is the most visually prominent element on the profile
 */
export default function FeaturedSpace({
  type,
  workData,
  blockData,
  isOwner = false,
  onEdit,
  onSelect
}: FeaturedSpaceProps) {
  // Empty state for owners
  if (type === 'none' && isOwner) {
    return (
      <div className="h-full min-h-[500px] flex items-center justify-center">
        <button
          onClick={onSelect}
          className="flex flex-col items-center gap-4 p-8 bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-lg hover:border-blue-500 hover:bg-gray-800 transition-all group"
        >
          <BookOpenIcon className="w-16 h-16 text-gray-600 group-hover:text-blue-500 transition-colors" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-300 mb-1">
              No Featured Content
            </p>
            <p className="text-sm text-gray-500">
              Click to select a work or block to feature
            </p>
          </div>
        </button>
      </div>
    )
  }

  // Empty state for visitors
  if (type === 'none') {
    return (
      <div className="h-full min-h-[500px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <BookOpenIcon className="w-16 h-16 mx-auto mb-3 opacity-30" />
          <p>No featured content</p>
        </div>
      </div>
    )
  }

  // Featured Work Display
  if (type === 'work' && workData) {
    return (
      <div className="relative group">
        {/* Cover Image */}
        <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-800 border border-gray-700 mb-4">
          {workData.coverImage ? (
            <img
              src={workData.coverImage}
              alt={workData.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpenIcon className="w-24 h-24 text-gray-600" />
            </div>
          )}
        </div>

        {/* Work Info */}
        <div className="space-y-3">
          <div>
            <h2 className="text-3xl font-bold text-gray-100 mb-2">
              {workData.title}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              {(workData.genres || []).slice(0, 3).map((genre) => (
                <span
                  key={genre}
                  className="px-2 py-1 text-xs font-medium bg-gray-800 text-gray-300 rounded-full"
                >
                  {genre}
                </span>
              ))}
              <span className="px-2 py-1 text-xs font-medium bg-blue-900/30 text-blue-300 rounded-full">
                {workData.status}
              </span>
            </div>
          </div>

          <p className="text-gray-300 line-clamp-4">
            {workData.description}
          </p>

          <div className="flex gap-3">
            <a
              href={`/story/${workData.id}`}
              className="flex-1 px-6 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Read Now
            </a>
            <button className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors font-medium">
              Bookmark
            </button>
          </div>
        </div>

        {/* Edit Button for Owners */}
        {isOwner && onEdit && (
          <button
            onClick={onEdit}
            className="absolute top-2 right-2 p-2 bg-gray-900/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            title="Change featured content"
          >
            <PencilIcon className="w-4 h-4 text-gray-300" />
          </button>
        )}
      </div>
    )
  }

  // Featured Block Display
  if (type === 'block' && blockData) {
    const BlockComponent = getBlockComponent(blockData.type as any)
    
    if (!BlockComponent) {
      return (
        <div className="h-full min-h-[500px] flex items-center justify-center">
          <p className="text-gray-500">Unknown block type: {blockData.type}</p>
        </div>
      )
    }

    let parsedData
    try {
      parsedData = JSON.parse(blockData.data)
    } catch {
      parsedData = {}
    }

    return (
      <div className="relative group">
        {/* Render the block component */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <BlockComponent
            data={parsedData}
            width={2}
            height={2}
            isOwner={isOwner}
          />
        </div>

        {/* Edit Button for Owners */}
        {isOwner && onEdit && (
          <button
            onClick={onEdit}
            className="absolute top-2 right-2 p-2 bg-gray-900/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
            title="Change featured content"
          >
            <PencilIcon className="w-4 h-4 text-gray-300" />
          </button>
        )}
      </div>
    )
  }

  return null
}