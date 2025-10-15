'use client'

import { LinkIcon } from '@heroicons/react/24/outline'
import BaseBlock from './BaseBlock'

interface ExternalLinkBlockData {
  url: string
  title: string
  description?: string
  image?: string
  icon?: string // Emoji or icon
  backgroundColor?: string
}

interface ExternalLinkBlockProps {
  data: ExternalLinkBlockData
  width?: number
  height?: number
  isOwner?: boolean
  onDelete?: () => void
  onExpand?: (direction: 'width' | 'height') => void
}

/**
 * ExternalLinkBlock - v0.1
 * Link to external content (Patreon, Ko-fi, personal site, etc.)
 * Can expand in width OR height
 * Size: 1x1 default, expandable
 */
export default function ExternalLinkBlock({
  data,
  width = 1,
  height = 1,
  isOwner = false,
  onDelete,
  onExpand
}: ExternalLinkBlockProps) {
  // Determine what can expand (one direction only)
  const canExpandWidth = width < 2 && (width === 1 && height === 1)
  const canExpandHeight = height < 2 && (width === 1 && height === 1)

  return (
    <BaseBlock
      width={width}
      height={height}
      isOwner={isOwner}
      onDelete={onDelete}
      onExpand={onExpand}
      canExpandWidth={canExpandWidth}
      canExpandHeight={canExpandHeight}
    >
      <a
        href={data.url}
        target="_blank"
        rel="noopener noreferrer"
        className="h-full flex flex-col group/link"
        style={{ backgroundColor: data.backgroundColor || 'transparent' }}
      >
        {/* Image/Icon Section */}
        {(data.image || data.icon) && (
          <div className="flex items-center justify-center p-4 bg-gray-900/30">
            {data.image ? (
              <img
                src={data.image}
                alt={data.title}
                className="w-16 h-16 object-contain group-hover/link:scale-105 transition-transform"
              />
            ) : data.icon ? (
              <span className="text-4xl">{data.icon}</span>
            ) : (
              <LinkIcon className="w-12 h-12 text-gray-400" />
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          <h3 className="font-semibold text-gray-100 text-sm mb-1 group-hover/link:text-blue-400 transition-colors">
            {data.title}
          </h3>
          
          {data.description && (
            <p className="text-xs text-gray-400 line-clamp-2 mb-2">
              {data.description}
            </p>
          )}

          {/* URL Preview */}
          <div className="mt-auto flex items-center gap-1 text-xs text-gray-500">
            <LinkIcon className="w-3 h-3" />
            <span className="truncate">
              {new URL(data.url).hostname}
            </span>
          </div>
        </div>

        {/* External Link Indicator */}
        <div className="px-4 pb-3">
          <div className="text-xs text-gray-400 group-hover/link:text-blue-400 transition-colors flex items-center gap-1">
            <span>Visit Link</span>
            <span>→</span>
          </div>
        </div>
      </a>
    </BaseBlock>
  )
}
