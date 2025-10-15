'use client'

import { PlusIcon } from '@heroicons/react/24/outline'

interface BlockGridProps {
  blocks?: any[] // Will be typed properly in v0.2
  isOwner?: boolean
  onAddBlock?: () => void
}

/**
 * BlockGrid - v0.1
 * Right section "ghost area" for customizable content blocks
 * Empty by default, encouraging intentional curation
 */
export default function BlockGrid({
  blocks = [],
  isOwner = false,
  onAddBlock
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

  // Block display (will be implemented in v0.2)
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

      <div className="grid grid-cols-2 gap-4">
        {blocks.map((block, index) => (
          <div
            key={index}
            className="aspect-[3/4] bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center"
          >
            <p className="text-gray-500 text-sm">Block {index + 1}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
