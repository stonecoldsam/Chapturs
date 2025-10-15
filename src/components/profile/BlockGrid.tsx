'use client'

import { PlusIcon } from '@heroicons/react/24/outline'
import { getBlockComponent, BlockType } from './blocks'

interface ProfileBlock {
  id: string
  type: BlockType
  data: any // JSON data parsed from string
  gridX: number
  gridY: number
  width: number
  height: number
  title?: string
  order: number
}

interface BlockGridProps {
  blocks?: ProfileBlock[]
  isOwner?: boolean
  onAddBlock?: () => void
  onDeleteBlock?: (blockId: string) => void
  onExpandBlock?: (blockId: string, direction: 'width' | 'height') => void
}

/**
 * BlockGrid - v0.1
 * Right section "ghost area" for customizable content blocks
 * Empty by default, encouraging intentional curation
 * Renders blocks in a 2-column grid system
 */
export default function BlockGrid({
  blocks = [],
  isOwner = false,
  onAddBlock,
  onDeleteBlock,
  onExpandBlock
}: BlockGridProps) {
  // Empty state for owners
  if (blocks.length === 0 && isOwner) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-100">Blocks</h3>
          <button
            onClick={onAddBlock}
            className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            title="Add block"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="min-h-[400px] flex items-center justify-center">
          <button
            onClick={onAddBlock}
            className="flex flex-col items-center gap-3 p-6 bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-lg hover:border-blue-500 hover:bg-gray-800 transition-all group w-full"
          >
            <PlusIcon className="w-12 h-12 text-gray-600 group-hover:text-blue-500 transition-colors" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-300 mb-1">
                Add Your First Block
              </p>
              <p className="text-xs text-gray-500">
                Showcase works, social links, or custom content
              </p>
            </div>
          </button>
        </div>

        {/* Ghost Area Hint */}
        <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
          <p className="text-xs text-gray-400 mb-2">
            <span className="font-semibold text-gray-300">Ghost Area:</span> This space is yours to customize
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Add work cards to showcase your portfolio</li>
            <li>• Embed social media feeds</li>
            <li>• Add custom text blocks</li>
            <li>• Feature favorite authors</li>
          </ul>
        </div>
      </div>
    )
  }

  // Empty state for visitors
  if (blocks.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-sm">No blocks added yet</p>
        </div>
      </div>
    )
  }

  // Block display
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-100">Blocks</h3>
        {isOwner && (
          <button
            onClick={onAddBlock}
            className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            title="Add block"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Grid Layout - 2 columns, auto rows */}
      <div className="grid grid-cols-2 auto-rows-fr gap-4">
        {blocks.map((block) => {
          const BlockComponent = getBlockComponent(block.type as BlockType)
          
          if (!BlockComponent) {
            return (
              <div
                key={block.id}
                className="aspect-[3/4] bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center"
              >
                <p className="text-gray-500 text-sm">Unknown block type</p>
              </div>
            )
          }

          // Parse data if it's a string
          const blockData = typeof block.data === 'string' 
            ? JSON.parse(block.data) 
            : block.data

          return (
            <BlockComponent
              key={block.id}
              data={blockData}
              width={block.width}
              height={block.height}
              isOwner={isOwner}
              onDelete={onDeleteBlock ? () => onDeleteBlock(block.id) : undefined}
              onExpand={onExpandBlock ? (direction) => onExpandBlock(block.id, direction) : undefined}
            />
          )
        })}
      </div>
    </div>
  )
}
