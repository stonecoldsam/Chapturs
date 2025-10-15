'use client'

import { BookOpenIcon } from '@heroicons/react/24/outline'
import BaseBlock from './BaseBlock'

interface WorkCardBlockData {
  workId: string
  title: string
  coverImage?: string
  genres?: string[]
  status?: string
  showDescription?: boolean
  customText?: string
}

interface WorkCardBlockProps {
  data: WorkCardBlockData
  width?: number
  height?: number
  isOwner?: boolean
  onDelete?: () => void
  onExpand?: (direction: 'width' | 'height') => void
}

/**
 * WorkCardBlock - v0.1
 * Display a work from the creator's portfolio
 * Default size: 1x1 (book thumbnail size)
 * Can expand in height to show more info
 */
export default function WorkCardBlock({
  data,
  width = 1,
  height = 1,
  isOwner = false,
  onDelete,
  onExpand
}: WorkCardBlockProps) {
  return (
    <BaseBlock
      width={width}
      height={height}
      isOwner={isOwner}
      onDelete={onDelete}
      onExpand={onExpand}
      canExpandHeight={height < 2}
      canExpandWidth={false}
    >
      <a 
        href={`/story/${data.workId}`}
        className="block h-full flex flex-col group/card"
      >
        {/* Cover Image */}
        <div className="aspect-[3/4] relative overflow-hidden bg-gray-900">
          {data.coverImage ? (
            <img
              src={data.coverImage}
              alt={data.title}
              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpenIcon className="w-12 h-12 text-gray-600" />
            </div>
          )}
          
          {/* Status Badge */}
          {data.status && (
            <div className="absolute top-2 left-2">
              <span className="px-2 py-1 text-xs font-medium bg-gray-900/80 text-gray-200 rounded backdrop-blur-sm">
                {data.status}
              </span>
            </div>
          )}
        </div>

        {/* Info Section - Expands when height > 1 */}
        <div className="p-3 flex-1 flex flex-col">
          <h3 className="font-semibold text-gray-100 text-sm line-clamp-2 mb-1 group-hover/card:text-blue-400 transition-colors">
            {data.title}
          </h3>
          
          {data.genres && data.genres.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-auto">
              {data.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre}
                  className="px-1.5 py-0.5 text-xs bg-gray-700 text-gray-300 rounded"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Show custom text or description when expanded */}
          {height > 1 && (data.customText || data.showDescription) && (
            <p className="text-xs text-gray-400 mt-2 line-clamp-3">
              {data.customText || 'Click to read more...'}
            </p>
          )}
        </div>
      </a>
    </BaseBlock>
  )
}
