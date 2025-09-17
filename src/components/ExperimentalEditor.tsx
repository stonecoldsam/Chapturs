'use client'

import { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { 
  BeakerIcon,
  EyeIcon,
  Bars3Icon,
  PhotoIcon,
  ClockIcon,
  ShareIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

// Import mode components
import VisualNovelMode from './experimental/VisualNovelMode'
import WorldbuildingMode from './experimental/WorldbuildingMode'
import BranchingStoryMode from './experimental/BranchingStoryMode'

export type ExperimentalMode = 'normal' | 'visual-novel' | 'worldbuilding' | 'branching-story' | 'placeholder'

interface ExperimentalData {
  visualNovel?: {
    characters: Array<{
      id: string
      name: string
      portraits: Array<{
        id: string
        url: string
        expression: string
      }>
    }>
    backgrounds: Array<{
      id: string
      url: string
      name: string
    }>
    scenes: Array<{
      id: string
      speaker?: string
      portraitId?: string
      backgroundId?: string
      text: string
      order: number
    }>
  }
  worldbuilding?: {
    events: Array<{
      id: string
      title: string
      date: string
      description: string
      tags: string[]
      linkedContent?: string[]
    }>
    relationships: Array<{
      id: string
      fromEntity: string
      toEntity: string
      relationship: string
    }>
  }
  branchingStory?: {
    nodes: Array<{
      id: string
      title: string
      content: string
      choices: Array<{
        id: string
        text: string
        targetNodeId: string
        effects?: Record<string, number>
      }>
      position: { x: number; y: number }
    }>
    flags: Record<string, number>
  }
}

interface ExperimentalEditorProps {
  workId?: string
  initialContent?: string
  initialData?: ExperimentalData
  onSave?: (content: string, data: ExperimentalData) => void
}

export default function ExperimentalEditor({ 
  workId, 
  initialContent = '', 
  initialData = {},
  onSave 
}: ExperimentalEditorProps) {
  const [currentMode, setCurrentMode] = useState<ExperimentalMode>('normal')
  const [experimentalData, setExperimentalData] = useState<ExperimentalData>(initialData)
  const [showPreview, setShowPreview] = useState(false)

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your experimental content...',
      }),
      CharacterCount,
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none p-6',
      },
    },
  })

  const handleModeChange = (mode: ExperimentalMode) => {
    setCurrentMode(mode)
    setShowPreview(false)
  }

  const handleSave = () => {
    if (editor && onSave) {
      onSave(editor.getHTML(), experimentalData)
    }
  }

  const modes = [
    { id: 'normal', name: 'Normal Writing', icon: Bars3Icon, description: 'Standard rich text editing' },
    { id: 'visual-novel', name: 'Visual Novel', icon: PhotoIcon, description: 'Character portraits & backgrounds' },
    { id: 'worldbuilding', name: 'Worldbuilding', icon: ClockIcon, description: 'Timeline & relationship mapping' },
    { id: 'branching-story', name: 'Branching Story', icon: ShareIcon, description: 'Interactive choice-based narrative' },
    { id: 'placeholder', name: 'Future Mode', icon: PlusIcon, description: 'Reserved for new features' },
  ]

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BeakerIcon className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Experimental Editor
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Mode: {modes.find(m => m.id === currentMode)?.name}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="mt-4 flex space-x-2 overflow-x-auto">
          {modes.map((mode) => {
            const Icon = mode.icon
            return (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id as ExperimentalMode)}
                className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  currentMode === mode.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={mode.description}
              >
                <Icon className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">{mode.name}</span>
                {mode.id === 'placeholder' && (
                  <span className="ml-2 text-xs bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                    Soon
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        <div className="flex-1 flex flex-col">
          {/* Rich Text Editor */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <EditorContent editor={editor} className="min-h-[300px]" />
            {editor && (
              <div className="px-6 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
                {editor.storage.characterCount.characters()} characters, {editor.storage.characterCount.words()} words
              </div>
            )}
          </div>

          {/* Mode-Specific Content */}
          <div className="flex-1 overflow-y-auto">
            {currentMode === 'visual-novel' && (
              <VisualNovelMode
                data={experimentalData.visualNovel}
                onChange={(data: any) => setExperimentalData(prev => ({ ...prev, visualNovel: data }))}
                preview={showPreview}
              />
            )}
            
            {currentMode === 'worldbuilding' && (
              <WorldbuildingMode
                data={experimentalData.worldbuilding}
                onChange={(data: any) => setExperimentalData(prev => ({ ...prev, worldbuilding: data }))}
                preview={showPreview}
              />
            )}
            
            {currentMode === 'branching-story' && (
              <BranchingStoryMode
                data={experimentalData.branchingStory}
                onChange={(data: any) => setExperimentalData(prev => ({ ...prev, branchingStory: data }))}
                preview={showPreview}
              />
            )}

            {currentMode === 'normal' && (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <BeakerIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Normal writing mode. Use the rich text editor above to write your content.</p>
              </div>
            )}

            {currentMode === 'placeholder' && (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <PlusIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Future Experimental Mode</h3>
                <p>This slot is reserved for future experimental storytelling features.</p>
                <p className="mt-2 text-sm">Ideas: Poetry Mode, Audio Mode, Collaboration Mode</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
