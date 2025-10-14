'use client'

import { useState } from 'react'
import { X, User, Image as ImageIcon, BookOpen, Users as UsersIcon, Upload } from 'lucide-react'

interface Character {
  id: string
  name: string
  aliases?: string[]
  role?: string
  firstAppearance?: number
  imageUrl?: string
  quickGlance?: string
  physicalDescription?: string
  age?: string
  height?: string
  appearanceNotes?: string
  backstory?: string
  personalityTraits?: string[]
  motivations?: string
  characterArc?: string
  authorNotes?: string
  categoryLabels?: Record<string, string>
  allowUserSubmissions?: boolean
  [key: string]: any
}

interface CharacterProfileViewModalProps {
  character: Character
  isOpen: boolean
  onClose: () => void
}

export default function CharacterProfileViewModal({
  character,
  isOpen,
  onClose
}: CharacterProfileViewModalProps) {
  const [showSubmitFanart, setShowSubmitFanart] = useState(false)

  // Get custom label or default
  const getLabel = (field: string, defaultLabel: string) => {
    return character.categoryLabels?.[field] || defaultLabel
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <User size={24} />
            {character.name}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Hero Section with Image and Quick Info */}
          <div className="flex flex-col md:flex-row gap-6 border-b border-gray-200 dark:border-gray-700 pb-6">
            {character.imageUrl && (
              <div className="flex-shrink-0">
                <img
                  src={character.imageUrl}
                  alt={character.name}
                  className="w-48 h-48 rounded-lg object-cover shadow-lg"
                />
              </div>
            )}
            
            <div className="flex-1">
              {character.role && (
                <div className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium mb-3">
                  {getLabel('role', 'Role')}: {character.role}
                </div>
              )}
              
              {character.aliases && character.aliases.length > 0 && (
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Also known as: </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {character.aliases.join(', ')}
                  </span>
                </div>
              )}

              {character.quickGlance && (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-lg">
                  {character.quickGlance}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                {character.age && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Age:</span>{' '}
                    <span className="text-gray-600 dark:text-gray-400">{character.age}</span>
                  </div>
                )}
                {character.height && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Height:</span>{' '}
                    <span className="text-gray-600 dark:text-gray-400">{character.height}</span>
                  </div>
                )}
                {character.firstAppearance && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">First Appearance:</span>{' '}
                    <span className="text-gray-600 dark:text-gray-400">Chapter {character.firstAppearance}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Physical Description */}
          {character.physicalDescription && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <ImageIcon size={18} />
                {getLabel('physicalDescription', 'Physical Description')}
              </h3>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {character.physicalDescription}
              </div>
            </div>
          )}

          {/* Appearance Notes */}
          {character.appearanceNotes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {getLabel('appearanceNotes', 'Appearance Notes')}
              </h3>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {character.appearanceNotes}
              </div>
            </div>
          )}

          {/* Backstory */}
          {character.backstory && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <BookOpen size={18} />
                {getLabel('backstory', 'Backstory')}
              </h3>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {character.backstory}
              </div>
            </div>
          )}

          {/* Personality Traits */}
          {character.personalityTraits && character.personalityTraits.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {getLabel('personalityTraits', 'Personality Traits')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {character.personalityTraits.map((trait, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Motivations */}
          {character.motivations && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {getLabel('motivations', 'Motivations')}
              </h3>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {character.motivations}
              </div>
            </div>
          )}

          {/* Character Arc */}
          {character.characterArc && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {getLabel('characterArc', 'Character Arc')}
              </h3>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {character.characterArc}
              </div>
            </div>
          )}

          {/* Fanart Submissions Section */}
          {character.allowUserSubmissions && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <ImageIcon size={18} />
                {getLabel('images', 'Fan Art Gallery')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                The author is accepting fan art submissions for this character!
              </p>
              
              {!showSubmitFanart ? (
                <button
                  onClick={() => setShowSubmitFanart(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Upload size={18} />
                  Submit Fan Art
                </button>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Submit Your Fan Art</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Image URL *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="https://example.com/your-artwork.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Artist Name *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Your name or handle"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Portfolio Link (Optional)
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="https://yourportfolio.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Social Handle (Optional)
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="@yourhandle"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes (Optional)
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Any notes about your artwork..."
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                        Submit
                      </button>
                      <button
                        onClick={() => setShowSubmitFanart(false)}
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
