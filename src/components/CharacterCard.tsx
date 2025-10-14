'use client'

import { User, Edit, Trash2, Users } from 'lucide-react'

interface CharacterCardProps {
  character: {
    id: string
    name: string
    role?: string
    imageUrl?: string
    physicalDescription?: string
    firstAppearance?: number
    aliases?: string[]
    personalityTraits?: string[]
  }
  onEdit?: () => void
  onDelete?: () => void
  compact?: boolean
}

export default function CharacterCard({ 
  character, 
  onEdit, 
  onDelete,
  compact = false 
}: CharacterCardProps) {
  
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group">
        {character.imageUrl ? (
          <img
            src={character.imageUrl}
            alt={character.name}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
            <User size={24} className="text-gray-400 dark:text-gray-500" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 dark:text-white truncate">
            {character.name}
          </div>
          {character.role && (
            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {character.role.replace('_', ' ')}
            </div>
          )}
          {character.firstAppearance && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Ch. {character.firstAppearance}
            </div>
          )}
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900 rounded text-blue-600 dark:text-blue-400"
              title="Edit character"
            >
              <Edit size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600 dark:text-red-400"
              title="Delete character"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-start gap-4">
        {character.imageUrl ? (
          <img
            src={character.imageUrl}
            alt={character.name}
            className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
            <User size={40} className="text-gray-400 dark:text-gray-500" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {character.name}
              </h3>
              {character.role && (
                <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded capitalize">
                  {character.role.replace('_', ' ')}
                </span>
              )}
            </div>
            
            <div className="flex gap-1">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded text-blue-600 dark:text-blue-400"
                  title="Edit character"
                >
                  <Edit size={18} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600 dark:text-red-400"
                  title="Delete character"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>

          {character.aliases && character.aliases.length > 0 && (
            <div className="mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Also known as: </span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {character.aliases.join(', ')}
              </span>
            </div>
          )}

          {character.firstAppearance && (
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              First appearance: Chapter {character.firstAppearance}
            </div>
          )}

          {character.physicalDescription && (
            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {character.physicalDescription}
            </p>
          )}

          {character.personalityTraits && character.personalityTraits.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {character.personalityTraits.slice(0, 5).map((trait, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded"
                >
                  {trait}
                </span>
              ))}
              {character.personalityTraits.length > 5 && (
                <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                  +{character.personalityTraits.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
