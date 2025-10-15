'use client'

import { UserCircleIcon, PhotoIcon, PencilIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface EditableFeaturedSpaceProps {
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
    data: string
  }
  onSelectFeatured: () => void
  onEditFeatured: () => void
}

/**
 * EditableFeaturedSpace - WYSIWYG featured content editing
 * Shows featured content as it appears on public profile, with edit controls
 */
export default function EditableFeaturedSpace({
  type,
  workData,
  blockData,
  onSelectFeatured,
  onEditFeatured
}: EditableFeaturedSpaceProps) {
  
  // Empty state
  if (type === 'none') {
    return (
      <div className="h-full min-h-[500px] flex items-center justify-center relative group">
        <button
          onClick={onSelectFeatured}
          className="flex flex-col items-center gap-4 p-8 bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-lg hover:border-blue-500 hover:bg-gray-800 transition-all"
        >
          <PhotoIcon className="w-16 h-16 text-gray-600 group-hover:text-blue-500 transition-colors" />
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

  // Featured Work Display
  if (type === 'work' && workData) {
    return (
      <div className="relative group">
        {/* Edit Button */}
        <button
          onClick={onEditFeatured}
          className="absolute top-2 right-2 z-10 p-2 bg-gray-900/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          title="Change featured content"
        >
          <PencilIcon className="w-4 h-4 text-gray-300" />
        </button>

        {/* Edit mode indicator ring */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/50 rounded-lg pointer-events-none transition-colors" />

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
              <PhotoIcon className="w-24 h-24 text-gray-600" />
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
            <div className="flex-1 px-6 py-3 bg-blue-600 text-white text-center rounded-lg font-medium">
              Read Now
            </div>
            <div className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg font-medium">
              Bookmark
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Featured Block Display
  if (type === 'block' && blockData) {
    // Import and render the block component dynamically
    return (
      <div className="relative group">
        {/* Edit Button */}
        <button
          onClick={onEditFeatured}
          className="absolute top-2 right-2 z-10 p-2 bg-gray-900/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          title="Change featured content"
        >
          <PencilIcon className="w-4 h-4 text-gray-300" />
        </button>

        {/* Edit mode indicator ring */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/50 rounded-lg pointer-events-none transition-colors" />

        {/* Block would render here */}
        <div className="h-full min-h-[500px] bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center">
          <p className="text-gray-400">Featured Block: {blockData.type}</p>
        </div>
      </div>
    )
  }

  return null
}
