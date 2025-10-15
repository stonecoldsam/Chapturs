 'use client'

import { getAllBlockTypes } from '../blocks'
import { PlusIcon } from '@heroicons/react/24/outline'

interface BlockPickerProps {
  onAddBlock: (blockType: string) => void
  availableWorks?: Array<{
    id: string
    title: string
    coverImage?: string
  }>
  onQuickAddWork?: (workId: string) => void
}

/**
 * BlockPicker - v0.1
 * Sidebar component showing all available block types
 * Organized by category with visual previews
 */
export default function BlockPicker({ onAddBlock, availableWorks = [], onQuickAddWork }: BlockPickerProps) {
  const allBlocks = getAllBlockTypes()
  
  // Group blocks by category
  const categories = {
    content: allBlocks.filter(b => b.category === 'content'),
    social: allBlocks.filter(b => b.category === 'social'),
    community: allBlocks.filter(b => b.category === 'community')
  }

  return (
    <div className="w-full max-h-[70vh] overflow-y-auto p-4">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-100">Add to Profile</h2>
        <p className="text-xs text-gray-400 mt-1">Choose a block or quickly add one of your works</p>
      </div>

      {/* Quick Add: Your Works */}
      {availableWorks && availableWorks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <span>📚</span>
            <span>Your Works</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(availableWorks || []).slice(0, 9).map(work => (
              <button
                key={work.id}
                onClick={() => onQuickAddWork && onQuickAddWork(work.id)}
                className="group rounded-lg border border-gray-700 hover:border-blue-500/60 overflow-hidden bg-gray-900/60 hover:bg-gray-800/70 transition-colors text-left"
                title={`Add "${work.title}" as a Work Card`}
              >
                <div className="aspect-[3/4] w-full bg-gray-800 flex items-center justify-center overflow-hidden">
                  {work.coverImage ? (
                    <img src={work.coverImage} alt={work.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" />
                  ) : (
                    <div className="text-gray-600 text-sm">No Cover</div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-100 truncate" title={work.title}>{work.title}</p>
                  <p className="text-[10px] text-gray-500">Work Card</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Blocks */}
      <div className="">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <span>🧩</span>
          <span>Blocks: Content</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
      <div className="mt-6 border-t border-gray-700 pt-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <span>🌐</span>
          <span>Blocks: Social</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
      <div className="mt-6 border-t border-gray-700 pt-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <span>👥</span>
          <span>Blocks: Community</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
      className="w-full p-3 bg-gray-900/70 hover:bg-gray-800/80 border border-gray-700/80 hover:border-gray-600 rounded-lg transition-colors text-left group backdrop-blur-sm"
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
