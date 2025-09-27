'use client'

import { useState } from 'react'
import { 
  PhotoIcon, 
  UserIcon, 
  PlayIcon, 
  PlusIcon,
  XMarkIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

interface Character {
  id: string
  name: string
  portraits: Array<{
    id: string
    url: string
    expression: string
  }>
}

interface Background {
  id: string
  url: string
  name: string
}

interface Scene {
  id: string
  speaker?: string
  portraitId?: string
  backgroundId?: string
  text: string
  order: number
}

interface VisualNovelData {
  characters: Character[]
  backgrounds: Background[]
  scenes: Scene[]
}

interface VisualNovelModeProps {
  data?: VisualNovelData
  onChange: (data: VisualNovelData) => void
  preview: boolean
}

export default function VisualNovelMode({ data, onChange, preview }: VisualNovelModeProps) {
  const [activeTab, setActiveTab] = useState<'characters' | 'backgrounds' | 'scenes'>('scenes')
  const [selectedCharacter, setSelectedCharacter] = useState<string>('')
  const [selectedBackground, setSelectedBackground] = useState<string>('')
  const [previewSceneIndex, setPreviewSceneIndex] = useState(0)

  const currentData: VisualNovelData = data || {
    characters: [],
    backgrounds: [],
    scenes: []
  }

  const updateData = (updates: Partial<VisualNovelData>) => {
    onChange({ ...currentData, ...updates })
  }

  const addCharacter = () => {
    const newCharacter: Character = {
      id: `char_${Date.now()}`,
      name: 'New Character',
      portraits: []
    }
    updateData({ characters: [...currentData.characters, newCharacter] })
  }

  const addBackground = () => {
    const newBackground: Background = {
      id: `bg_${Date.now()}`,
      url: '/placeholder-bg.jpg',
      name: 'New Background'
    }
    updateData({ backgrounds: [...currentData.backgrounds, newBackground] })
  }

  const addScene = () => {
    const newScene: Scene = {
      id: `scene_${Date.now()}`,
      text: '', // Start with empty text so placeholder shows properly
      order: currentData.scenes.length
    }
    updateData({ scenes: [...currentData.scenes, newScene] })
  }

  const updateScene = (sceneId: string, updates: Partial<Scene>) => {
    const scenes = currentData.scenes.map(scene => 
      scene.id === sceneId ? { ...scene, ...updates } : scene
    )
    updateData({ scenes })
  }

  const removeScene = (sceneId: string) => {
    const scenes = currentData.scenes.filter(scene => scene.id !== sceneId)
    updateData({ scenes })
  }

  if (preview) {
    const currentScene = currentData.scenes[previewSceneIndex]
    const character = currentScene?.speaker ? 
      currentData.characters.find(c => c.name === currentScene.speaker) : null
    const portrait = character?.portraits.find(p => p.id === currentScene.portraitId)
    const background = currentData.backgrounds.find(b => b.id === currentScene.backgroundId)

    return (
      <div className="h-full bg-black relative overflow-hidden">
        {/* Background */}
        {background && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${background.url})` }}
          />
        )}

        {/* Character Portrait */}
        {portrait && (
          <div className="absolute bottom-0 right-8 h-96 w-64">
            <img 
              src={portrait.url} 
              alt={`${character?.name} - ${portrait.expression}`}
              className="h-full w-full object-contain"
            />
          </div>
        )}

        {/* Text Box */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 text-white p-6">
          {currentScene?.speaker && (
            <div className="text-lg font-semibold mb-2 text-blue-300">
              {currentScene.speaker}
            </div>
          )}
          <div className="text-base leading-relaxed">
            {currentScene?.text || 'No dialogue set for this scene.'}
          </div>
        </div>

        {/* Navigation */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={() => setPreviewSceneIndex(Math.max(0, previewSceneIndex - 1))}
            disabled={previewSceneIndex === 0}
            className="px-3 py-1 bg-gray-800 bg-opacity-80 text-white rounded disabled:opacity-50"
          >
            ←
          </button>
          <span className="px-3 py-1 bg-gray-800 bg-opacity-80 text-white rounded">
            {previewSceneIndex + 1} / {currentData.scenes.length}
          </span>
          <button
            onClick={() => setPreviewSceneIndex(Math.min(currentData.scenes.length - 1, previewSceneIndex + 1))}
            disabled={previewSceneIndex >= currentData.scenes.length - 1}
            className="px-3 py-1 bg-gray-800 bg-opacity-80 text-white rounded disabled:opacity-50"
          >
            →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white dark:bg-gray-800">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'scenes', name: 'Scenes', icon: PlayIcon },
            { id: 'characters', name: 'Characters', icon: UserIcon },
            { id: 'backgrounds', name: 'Backgrounds', icon: PhotoIcon },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="p-6">
        {/* Scenes Tab */}
        {activeTab === 'scenes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Visual Novel Toolkit</h3>
              <button
                onClick={addScene}
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Scene
              </button>
            </div>

            <div className="space-y-4">
              {currentData.scenes.map((scene, index) => (
                <div key={scene.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Scene {index + 1}
                    </span>
                    <button
                      onClick={() => removeScene(scene.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Speaker */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Speaker
                      </label>
                      <select
                        value={scene.speaker || ''}
                        onChange={(e) => updateScene(scene.id, { speaker: e.target.value || undefined })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="">Narrator</option>
                        {currentData.characters.map(char => (
                          <option key={char.id} value={char.name}>{char.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Portrait */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Portrait
                      </label>
                      <select
                        value={scene.portraitId || ''}
                        onChange={(e) => updateScene(scene.id, { portraitId: e.target.value || undefined })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="">No Portrait</option>
                        {currentData.characters.flatMap(char => 
                          char.portraits.map(portrait => (
                            <option key={portrait.id} value={portrait.id}>
                              {char.name} - {portrait.expression}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* Background */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Background
                      </label>
                      <select
                        value={scene.backgroundId || ''}
                        onChange={(e) => updateScene(scene.id, { backgroundId: e.target.value || undefined })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="">No Background</option>
                        {currentData.backgrounds.map(bg => (
                          <option key={bg.id} value={bg.id}>{bg.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Text */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dialogue/Narration
                    </label>
                    <textarea
                      value={scene.text}
                      onChange={(e) => updateScene(scene.id, { text: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      placeholder="Enter dialogue or narration..."
                    />
                  </div>
                </div>
              ))}

              {currentData.scenes.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <PlayIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No scenes yet. Add your first scene to get started!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Characters Tab */}
        {activeTab === 'characters' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Characters</h3>
              <button
                onClick={addCharacter}
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Character
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentData.characters.map((character) => (
                <div key={character.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <UserIcon className="w-8 h-8 text-gray-400" />
                    <input
                      type="text"
                      value={character.name}
                      onChange={(e) => {
                        const characters = currentData.characters.map(c => 
                          c.id === character.id ? { ...c, name: e.target.value } : c
                        )
                        updateData({ characters })
                      }}
                      className="flex-1 px-2 py-1 bg-transparent border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {character.portraits.length} portrait(s)
                  </div>
                  <button className="mt-2 text-xs text-blue-500 hover:text-blue-700">
                    Manage Portraits
                  </button>
                </div>
              ))}
            </div>

            {currentData.characters.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <UserIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No characters yet. Add characters to assign portraits to dialogue!</p>
              </div>
            )}
          </div>
        )}

        {/* Backgrounds Tab */}
        {activeTab === 'backgrounds' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Backgrounds</h3>
              <button
                onClick={addBackground}
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Background
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentData.backgrounds.map((background) => (
                <div key={background.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-600 rounded-lg mb-3 flex items-center justify-center">
                    <PhotoIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={background.name}
                    onChange={(e) => {
                      const backgrounds = currentData.backgrounds.map(b => 
                        b.id === background.id ? { ...b, name: e.target.value } : b
                      )
                      updateData({ backgrounds })
                    }}
                    className="w-full px-2 py-1 bg-transparent border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>

            {currentData.backgrounds.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <PhotoIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No backgrounds yet. Add scene backgrounds for your visual novel!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
