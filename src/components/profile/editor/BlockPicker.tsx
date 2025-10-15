'use client'

import { getAllBlockTypes } from '../blocks'
import { PlusIcon } from '@heroicons/react/24/outline'

interface BlockPickerProps {
  onAddBlock: (blockType: string) => void
}

/**
 * BlockPicker - v0.1
 * Sidebar component showing all available block types
 * Organized by category with visual previews
 */
export default function BlockPicker({ onAddBlock }: BlockPickerProps) {
  const allBlocks = getAllBlockTypes()
  
  // Group blocks by category
  const categories = {
    content: allBlocks.filter(b => b.category === 'content'),
    social: allBlocks.filter(b => b.category === 'social'),
    community: allBlocks.filter(b => b.category === 'community')
  }

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-gray-100">Add Blocks</h2>
        <p className="text-xs text-gray-400 mt-1">
          Click to add to your profile
        </p>
      </div>

      {/* Content Blocks */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <span>📚</span>
          <span>Content</span>
        </h3>
        <div className="space-y-2">
          {categories.content.map((block) => (
            <BlockTypeCard
              key={block.type}
              icon={block.icon}
              name={block.name}
              description={block.description}
              size={block.defaultSize}
              onClick={() => onAddBlock(block.type)}
            />
          ))}
        </div>
      </div>

      {/* Social Blocks */}
      <div className="p-4 border-t border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <span>🌐</span>
          <span>Social</span>
        </h3>
        <div className="space-y-2">
          {categories.social.map((block) => (
            <BlockTypeCard
              key={block.type}
              icon={block.icon}
              name={block.name}
              description={block.description}
              size={block.defaultSize}
              onClick={() => onAddBlock(block.type)}
            />
          ))}
        </div>
      </div>

      {/* Community Blocks */}
      <div className="p-4 border-t border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <span>👥</span>
          <span>Community</span>
        </h3>
        <div className="space-y-2">
          {categories.community.map((block) => (
            <BlockTypeCard
              key={block.type}
              icon={block.icon}
              name={block.name}
              description={block.description}
              size={block.defaultSize}
              onClick={() => onAddBlock(block.type)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface BlockTypeCardProps {
  icon: string
  name: string
  description: string
  size: { width: number; height: number }
  onClick: () => void
}

function BlockTypeCard({ icon, name, description, size, onClick }: BlockTypeCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full p-3 bg-gray-900 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg transition-colors text-left group"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-sm text-gray-100">{name}</h4>
            <PlusIcon className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
          </div>
          <p className="text-xs text-gray-400 line-clamp-2 mb-2">{description}</p>
          <div className="text-xs text-gray-500">
            Size: {size.width}×{size.height}
          </div>
        </div>
      </div>
    </button>
  )
}
