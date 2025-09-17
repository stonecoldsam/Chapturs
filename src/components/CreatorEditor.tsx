'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Typography from '@tiptap/extension-typography'
import TextAlign from '@tiptap/extension-text-align'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import ExperimentalEditor from './ExperimentalEditor'
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Save,
  Eye,
  Upload,
  BookOpen,
  Users,
  Calendar,
  Type,
  Palette,
  Settings,
  Plus,
  X,
  FileText,
  Zap,
  Clock,
  ChevronDown,
  ChevronUp,
  Edit3,
  Sparkles
} from 'lucide-react'
import { ContentFormat } from '@/types'

// Enhanced interfaces for the advanced editor
interface GlossaryEntry {
  id: string
  term: string
  definition: string
  chapterIntroduced: number
  chapterLastUsed?: number
  characterProfile?: CharacterProfile
  createdAt: Date
  updatedAt: Date
}

interface CharacterProfile {
  name: string
  description: string
  image?: string
  firstAppearance: number
  traits: string[]
  relationships: string[]
  evolution: ChapterEvolution[]
}

interface ChapterEvolution {
  chapter: number
  description: string
  changes: string[]
}

interface WorkMetadata {
  id?: string
  title: string
  description: string
  formatType: ContentFormat
  genres: string[]
  tags: string[]
  maturityRating: string
  coverImage?: string
  targetWordCount?: number
  updateSchedule?: ScheduleSettings
}

interface ScheduleSettings {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  dayOfWeek?: number
  timeOfDay?: string
  startDate: Date
  autoPublish: boolean
}

interface ChapterData {
  id?: string
  number: number
  title: string
  content: any // Tiptap JSON content
  wordCount: number
  status: 'draft' | 'review' | 'scheduled' | 'published'
  publishDate?: Date
  glossaryEntries: string[] // IDs of glossary entries introduced in this chapter
}

interface CreatorEditorProps {
  workId?: string
  chapterId?: string
  mode: 'create' | 'edit'
  formatType: ContentFormat
  onSave?: (data: any) => void
  onPublish?: (data: any) => void
  onSchedule?: (data: any, schedule: ScheduleSettings) => void
}

export default function CreatorEditor({
  workId,
  chapterId,
  mode = 'create',
  formatType = 'novel',
  onSave,
  onPublish,
  onSchedule
}: CreatorEditorProps) {
  // Handle experimental format with dedicated editor
  if (formatType === 'experimental') {
    return (
      <ExperimentalEditor
        workId={workId}
        onSave={(content: string, data: any) => {
          if (onSave) {
            onSave({ content, experimentalData: data, wordCount: content.length })
          }
        }}
      />
    )
  }

  // Core editor states
  const [currentChapter, setCurrentChapter] = useState<ChapterData>({
    number: 1,
    title: '',
    content: null,
    wordCount: 0,
    status: 'draft',
    glossaryEntries: []
  })
  
  const [workMetadata, setWorkMetadata] = useState<WorkMetadata>({
    title: '',
    description: '',
    formatType,
    genres: [],
    tags: [],
    maturityRating: 'PG'
  })

  // UI States
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<'chapters' | 'glossary' | 'settings'>('chapters')
  const [showToolbar, setShowToolbar] = useState(true)
  const [fontFamily, setFontFamily] = useState('Inter')
  const [fontSize, setFontSize] = useState(16)

  // Content states
  const [chapters, setChapters] = useState<ChapterData[]>([])
  const [glossaryEntries, setGlossaryEntries] = useState<GlossaryEntry[]>([])
  const [selectedText, setSelectedText] = useState('')
  const [showGlossaryModal, setShowGlossaryModal] = useState(false)
  const [currentGlossaryEntry, setCurrentGlossaryEntry] = useState<Partial<GlossaryEntry>>({})

  // Upload states
  const [uploadMode, setUploadMode] = useState<'text' | 'file'>('text')
  const [fileUploads, setFileUploads] = useState<File[]>([])
  const [processingFiles, setProcessingFiles] = useState(false)

  // Curated font families for readability
  const fontFamilies = [
    'Inter',
    'Source Serif Pro', 
    'Merriweather',
    'Georgia',
    'Times New Roman',
    'Crimson Text',
    'Libre Baskerville',
    'Lora',
    'PT Serif',
    'Playfair Display'
  ]

  // Initialize Tiptap editor with all extensions
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Typography,
      TextStyle, // Required for FontFamily and Color
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
      CharacterCount.configure({
        limit: formatType === 'article' ? 10000 : undefined,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return `What's the title of this ${formatType === 'novel' ? 'chapter' : 'section'}?`
          }
          return `Start writing your ${formatType}...`
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      }),
    ],
    content: currentChapter.content || `<h1></h1><p></p>`,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const wordCount = editor.storage.characterCount.words()
      setCurrentChapter(prev => ({
        ...prev,
        content: editor.getJSON(),
        wordCount
      }))
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      const text = editor.state.doc.textBetween(from, to, '')
      setSelectedText(text)
    },
  })

  // Auto-save functionality
  useEffect(() => {
    if (!editor) return

    const interval = setInterval(() => {
      if (currentChapter.title || currentChapter.wordCount > 0) {
        handleAutoSave()
      }
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(interval)
  }, [editor, currentChapter])

  // Glossary processing - highlight defined terms in editor
  useEffect(() => {
    if (!editor || glossaryEntries.length === 0) return

    // Process content to highlight glossary terms
    const content = editor.getHTML()
    const availableTerms = glossaryEntries.filter(
      entry => entry.chapterIntroduced <= currentChapter.number
    )

    // This would be implemented with a custom extension for better performance
    // For now, we'll handle it in the UI layer
  }, [editor, glossaryEntries, currentChapter.number])

  const handleAutoSave = useCallback(async () => {
    if (!editor) return
    
    const data = {
      ...currentChapter,
      content: editor.getJSON(),
      wordCount: editor.storage.characterCount.words()
    }
    
    // Call auto-save API
    console.log('Auto-saving:', data)
    onSave?.(data)
  }, [editor, currentChapter, onSave])

  const handleAddGlossaryEntry = useCallback((term: string) => {
    if (!term.trim()) return
    
    setCurrentGlossaryEntry({
      term: term.trim(),
      definition: '',
      chapterIntroduced: currentChapter.number,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    setShowGlossaryModal(true)
  }, [currentChapter.number])

  const handleSaveGlossaryEntry = useCallback((entry: GlossaryEntry) => {
    setGlossaryEntries(prev => [...prev, entry])
    setCurrentChapter(prev => ({
      ...prev,
      glossaryEntries: [...prev.glossaryEntries, entry.id]
    }))
    setShowGlossaryModal(false)
    setCurrentGlossaryEntry({})
  }, [])

  const handleInsertImage = useCallback(() => {
    const url = window.prompt('Enter image URL:')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const handleInsertLink = useCallback(() => {
    const url = window.prompt('Enter link URL:')
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }, [editor])

  const handleFileUpload = useCallback(async (files: FileList) => {
    setProcessingFiles(true)
    const fileArray = Array.from(files)
    
    // Process files based on format type
    try {
      for (const file of fileArray) {
        if (formatType === 'comic' && file.type.startsWith('image/')) {
          // Handle comic page uploads
          const url = URL.createObjectURL(file)
          editor?.chain().focus().setImage({ src: url }).run()
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          // Handle .docx files (would need proper parser)
          console.log('Processing DOCX file:', file.name)
          // Implement document parsing logic
        }
      }
    } catch (error) {
      console.error('File upload error:', error)
    } finally {
      setProcessingFiles(false)
    }
  }, [editor, formatType])

  const handlePublish = useCallback(async () => {
    if (!editor) return
    
    const data = {
      work: workMetadata,
      chapter: {
        ...currentChapter,
        content: editor.getJSON(),
        wordCount: editor.storage.characterCount.words(),
        status: 'published' as const,
        publishDate: new Date()
      },
      glossary: glossaryEntries
    }
    
    onPublish?.(data)
  }, [editor, workMetadata, currentChapter, glossaryEntries, onPublish])

  const EditorToolbar = useMemo(() => (
    <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Format toggles */}
          <div className="flex items-center space-x-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`p-2 rounded ${editor?.isActive('bold') ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`p-2 rounded ${editor?.isActive('italic') ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <Italic size={16} />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              className={`p-2 rounded ${editor?.isActive('strike') ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <Underline size={16} />
            </button>
          </div>

          {/* Heading controls */}
          <div className="flex items-center space-x-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 rounded ${editor?.isActive('heading', { level: 1 }) ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <Heading1 size={16} />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <Heading2 size={16} />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2 rounded ${editor?.isActive('heading', { level: 3 }) ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <Heading3 size={16} />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center space-x-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded ${editor?.isActive('bulletList') ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded ${editor?.isActive('orderedList') ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <ListOrdered size={16} />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded ${editor?.isActive('blockquote') ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <Quote size={16} />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center space-x-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
            <button
              onClick={() => editor?.chain().focus().setTextAlign('left').run()}
              className={`p-2 rounded ${editor?.isActive({ textAlign: 'left' }) ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <AlignLeft size={16} />
            </button>
            <button
              onClick={() => editor?.chain().focus().setTextAlign('center').run()}
              className={`p-2 rounded ${editor?.isActive({ textAlign: 'center' }) ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <AlignCenter size={16} />
            </button>
            <button
              onClick={() => editor?.chain().focus().setTextAlign('right').run()}
              className={`p-2 rounded ${editor?.isActive({ textAlign: 'right' }) ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <AlignRight size={16} />
            </button>
          </div>

          {/* Media */}
          <div className="flex items-center space-x-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
            <button
              onClick={handleInsertImage}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ImageIcon size={16} />
            </button>
            <button
              onClick={handleInsertLink}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <LinkIcon size={16} />
            </button>
          </div>

          {/* Font controls */}
          <select
            value={fontFamily}
            onChange={(e) => {
              setFontFamily(e.target.value)
              editor?.chain().focus().setFontFamily(e.target.value).run()
            }}
            className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-sm"
          >
            {fontFamilies.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          {/* Word count */}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {editor?.storage.characterCount.words() || 0} words
          </span>

          {/* View mode toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1 text-sm rounded ${viewMode === 'edit' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}
            >
              <Edit3 size={14} className="inline mr-1" />
              Edit
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 text-sm rounded ${viewMode === 'preview' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}
            >
              <Eye size={14} className="inline mr-1" />
              Preview
            </button>
          </div>

          {/* Action buttons */}
          <button
            onClick={handleAutoSave}
            className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-sm flex items-center"
          >
            <Save size={14} className="mr-1" />
            Save
          </button>
          
          <button
            onClick={handlePublish}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center"
          >
            <Upload size={14} className="mr-1" />
            Publish
          </button>
        </div>
      </div>
    </div>
  ), [editor, fontFamily, viewMode, handleAutoSave, handlePublish, handleInsertImage, handleInsertLink])

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Toolbar */}
      {showToolbar && EditorToolbar}

      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Chapter Title */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <input
              type="text"
              value={currentChapter.title}
              onChange={(e) => setCurrentChapter(prev => ({ ...prev, title: e.target.value }))}
              placeholder={`${formatType === 'novel' ? 'Chapter' : 'Section'} title...`}
              className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500"
            />
            <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{formatType === 'novel' ? 'Chapter' : 'Section'} {currentChapter.number}</span>
              <span className="mx-2">•</span>
              <span>{currentChapter.status}</span>
              <span className="mx-2">•</span>
              <span>{currentChapter.wordCount} words</span>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 relative">
            {viewMode === 'edit' ? (
              <div className="h-full overflow-auto">
                <div className="max-w-4xl mx-auto p-8">
                  {/* Writing Area Container */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-sm min-h-[600px] p-8 focus-within:border-blue-300 dark:focus-within:border-blue-600 transition-colors">
                    <EditorContent 
                      editor={editor}
                      className="prose prose-lg dark:prose-invert max-w-none min-h-[500px] focus:outline-none"
                      style={{ fontFamily: fontFamily }}
                    />
                  </div>
                  
                  {/* Custom Selection Toolbar */}
                  {selectedText && (
                    <div className="fixed bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-2 flex items-center space-x-1 z-50"
                         style={{ 
                           top: '50%', 
                           left: '50%', 
                           transform: 'translate(-50%, -50%)'
                         }}>
                      <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-1 rounded ${editor.isActive('bold') ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                        <Bold size={14} />
                      </button>
                      <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-1 rounded ${editor.isActive('italic') ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                        <Italic size={14} />
                      </button>
                      <button
                        onClick={() => handleAddGlossaryEntry(selectedText)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Add to glossary"
                      >
                        <Sparkles size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full overflow-auto bg-white dark:bg-gray-800">
                <div className="max-w-4xl mx-auto p-8">
                  <h1 className="text-3xl font-bold mb-4">{currentChapter.title}</h1>
                  <div 
                    className="prose prose-lg dark:prose-invert max-w-none"
                    style={{ fontFamily: fontFamily }}
                    dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('chapters')}
                    className={`px-3 py-1 text-sm rounded ${activeTab === 'chapters' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                  >
                    <BookOpen size={14} className="inline mr-1" />
                    Chapters
                  </button>
                  <button
                    onClick={() => setActiveTab('glossary')}
                    className={`px-3 py-1 text-sm rounded ${activeTab === 'glossary' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                  >
                    <Sparkles size={14} className="inline mr-1" />
                    Glossary
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-3 py-1 text-sm rounded ${activeTab === 'settings' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                  >
                    <Settings size={14} className="inline mr-1" />
                    Settings
                  </button>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-auto p-4">
              {activeTab === 'chapters' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">Chapters</h3>
                    <button className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                      <Plus size={14} />
                    </button>
                  </div>
                  {chapters.map((chapter, index) => (
                    <div
                      key={chapter.id || index}
                      className={`p-3 rounded-lg border cursor-pointer ${
                        currentChapter.number === chapter.number
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setCurrentChapter(chapter)}
                    >
                      <div className="font-medium text-sm">{chapter.title || `Chapter ${chapter.number}`}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {chapter.wordCount} words • {chapter.status}
                      </div>
                    </div>
                  ))}
                  <button className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500">
                    <Plus size={16} className="mx-auto mb-1" />
                    Add Chapter
                  </button>
                </div>
              )}

              {activeTab === 'glossary' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">Glossary</h3>
                    <button 
                      onClick={() => setShowGlossaryModal(true)}
                      className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  {glossaryEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="font-medium text-sm">{entry.term}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {entry.definition}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Ch. {entry.chapterIntroduced}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Work Title
                    </label>
                    <input
                      type="text"
                      value={workMetadata.title}
                      onChange={(e) => setWorkMetadata(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={workMetadata.description}
                      onChange={(e) => setWorkMetadata(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Format Type
                    </label>
                    <select
                      value={workMetadata.formatType}
                      onChange={(e) => setWorkMetadata(prev => ({ ...prev, formatType: e.target.value as ContentFormat }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    >
                      <option value="novel">Novel</option>
                      <option value="article">Article</option>
                      <option value="comic">Comic</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Maturity Rating
                    </label>
                    <select
                      value={workMetadata.maturityRating}
                      onChange={(e) => setWorkMetadata(prev => ({ ...prev, maturityRating: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    >
                      <option value="G">G - General</option>
                      <option value="PG">PG - Parental Guidance</option>
                      <option value="PG-13">PG-13 - Parents Strongly Cautioned</option>
                      <option value="R">R - Restricted</option>
                      <option value="NC-17">NC-17 - Adults Only</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Glossary Modal */}
        {showGlossaryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Add Glossary Entry</h3>
                <button
                  onClick={() => setShowGlossaryModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Term
                  </label>
                  <input
                    type="text"
                    value={currentGlossaryEntry.term || ''}
                    onChange={(e) => setCurrentGlossaryEntry(prev => ({ ...prev, term: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Definition
                  </label>
                  <textarea
                    value={currentGlossaryEntry.definition || ''}
                    onChange={(e) => setCurrentGlossaryEntry(prev => ({ ...prev, definition: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Introduced in Chapter
                  </label>
                  <input
                    type="number"
                    value={currentGlossaryEntry.chapterIntroduced || currentChapter.number}
                    onChange={(e) => setCurrentGlossaryEntry(prev => ({ ...prev, chapterIntroduced: parseInt(e.target.value) }))}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowGlossaryModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (currentGlossaryEntry.term && currentGlossaryEntry.definition) {
                      handleSaveGlossaryEntry({
                        ...currentGlossaryEntry,
                        id: Date.now().toString(),
                        createdAt: new Date(),
                        updatedAt: new Date()
                      } as GlossaryEntry)
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating sidebar toggle when closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed right-4 top-1/2 -translate-y-1/2 p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 z-40"
        >
          <ChevronDown size={16} style={{ transform: 'rotate(-90deg)' }} />
        </button>
      )}
    </div>
  )
}
