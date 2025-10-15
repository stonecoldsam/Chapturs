'use client'

import ReactMarkdown from 'react-markdown'
import BaseBlock from './BaseBlock'

interface TextBoxBlockData {
  content: string // Markdown text
  backgroundColor?: string
  textColor?: string
  alignment?: 'left' | 'center' | 'right'
  fontSize?: 'sm' | 'base' | 'lg'
}

interface TextBoxBlockProps {
  data: TextBoxBlockData
  width?: number
  height?: number
  isOwner?: boolean
  onDelete?: () => void
  onExpand?: (direction: 'width' | 'height') => void
  onEdit?: () => void
}

/**
 * TextBoxBlock - v0.1
 * Custom text content block with markdown support
 * Can expand in EITHER width OR height (not both - enforced by BaseBlock)
 * Default size: 1x1, expandable to 2x1 or 1x2
 */
export default function TextBoxBlock({
  data,
  width = 1,
  height = 1,
  isOwner = false,
  onDelete,
  onExpand,
  onEdit
}: TextBoxBlockProps) {
  const fontSizeMap = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg'
  }

  const alignmentMap = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  const fontSize = fontSizeMap[data.fontSize || 'base']
  const alignment = alignmentMap[data.alignment || 'left']

  // Determine what can expand based on current size
  const canExpandWidth = width < 2
  const canExpandHeight = height < 2
  
  // If already expanded in one direction, can't expand in the other
  const actualCanExpandWidth = canExpandWidth && width === 1 && height === 1
  const actualCanExpandHeight = canExpandHeight && width === 1 && height === 1

  return (
    <BaseBlock
      width={width}
      height={height}
      isOwner={isOwner}
      onDelete={onDelete}
      onExpand={onExpand}
      canExpandWidth={actualCanExpandWidth}
      canExpandHeight={actualCanExpandHeight}
    >
      <div
        className={`h-full p-4 overflow-y-auto ${alignment}`}
        style={{
          backgroundColor: data.backgroundColor || 'transparent',
          color: data.textColor || 'inherit'
        }}
        onClick={isOwner && onEdit ? onEdit : undefined}
      >
        <div className={`prose prose-invert prose-sm max-w-none ${fontSize}`}>
          <ReactMarkdown>{data.content}</ReactMarkdown>
        </div>
      </div>

      {isOwner && onEdit && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-gray-900/50 cursor-pointer">
          <span className="text-sm text-gray-300 font-medium">Click to edit</span>
        </div>
      )}
    </BaseBlock>
  )
}
