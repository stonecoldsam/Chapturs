'use client'

import { ReactNode } from 'react'
import { TrashIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline'

interface BaseBlockProps {
  children: ReactNode
  width?: number // Grid units (1-4)
  height?: number // Grid units (1-4)
  isOwner?: boolean
  onDelete?: () => void
  onExpand?: (direction: 'width' | 'height') => void
  canExpandWidth?: boolean
  canExpandHeight?: boolean
  className?: string
}

/**
 * BaseBlock - v0.1
 * Wrapper component for all profile blocks
 * Handles sizing, expansion controls, and delete functionality
 * Enforces rule: blocks can expand in ONE direction only (width OR height, not both)
 */
export default function BaseBlock({
  children,
  width = 1,
  height = 1,
  isOwner = false,
  onDelete,
  onExpand,
  canExpandWidth = false,
  canExpandHeight = false,
  className = ''
}: BaseBlockProps) {
  const gridSpanClass = `col-span-${width} row-span-${height}`
  
  return (
    <div 
      className={`relative group ${gridSpanClass} ${className}`}
      style={{
        gridColumn: `span ${width}`,
        gridRow: `span ${height}`
      }}
    >
      {/* Block Content */}
      <div className="h-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-colors">
        {children}
      </div>

      {/* Owner Controls - Only visible on hover */}
      {isOwner && (
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {/* Expand Width Button */}
          {canExpandWidth && onExpand && (
            <button
              onClick={() => onExpand('width')}
              className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              title="Expand width"
            >
              <ArrowsPointingOutIcon className="w-4 h-4 rotate-90" />
            </button>
          )}

          {/* Expand Height Button */}
          {canExpandHeight && onExpand && (
            <button
              onClick={() => onExpand('height')}
              className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              title="Expand height"
            >
              <ArrowsPointingOutIcon className="w-4 h-4" />
            </button>
          )}

          {/* Delete Button */}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              title="Delete block"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
