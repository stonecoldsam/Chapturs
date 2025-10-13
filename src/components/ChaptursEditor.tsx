'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { ChaptDocument, ContentBlock, BlockType, ProseBlock, HeadingBlock, DividerBlock, DialogueBlock, ChatBlock, PhoneBlock, NarrationBlock, EditorState, ChatPlatform } from '@/types/chapt'
import { ChatBlockEditor, PhoneBlockEditor, DialogueBlockEditor, NarrationBlockEditor } from './BlockEditors'
import { PlusCircle, Save, Eye, Edit3, Type, MessageSquare, Smartphone, Users, SplitSquareVertical } from 'lucide-react'

interface ChaptursEditorProps {
  workId: string
  chapterId?: string
  initialDocument?: ChaptDocument
  onSave?: (document: ChaptDocument) => Promise<void>
  onPublish?: (document: ChaptDocument) => Promise<void>
}

export default function ChaptursEditor({ 
  workId, 
  chapterId, 
  initialDocument,
  onSave,
  onPublish 
}: ChaptursEditorProps) {
  
  // Initialize editor state
  const [editorState, setEditorState] = useState<EditorState>(() => ({
    document: initialDocument || createEmptyDocument(workId, chapterId),
    currentBlockId: null,
    selection: null,
    mode: 'edit',
    language: 'en',
    isDirty: false,
    lastSaved: null
  }))

  const [showBlockMenu, setShowBlockMenu] = useState(false)
  const [blockMenuPosition, setBlockMenuPosition] = useState({ top: 0, left: 0 })
  const [insertAfterBlockId, setInsertAfterBlockId] = useState<string | null>(null)
  
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)

  // Auto-save functionality
  useEffect(() => {
    if (!editorState.isDirty || !onSave) return

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
    }

    autoSaveTimer.current = setTimeout(() => {
      handleSave()
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
    }
  }, [editorState.document, editorState.isDirty])

  // Save handler
  const handleSave = useCallback(async () => {
    if (!onSave) return

    try {
      // Update word count before saving
      const wordCount = calculateWordCount(editorState.document.content)
      const updatedDocument = {
        ...editorState.document,
        metadata: {
          ...editorState.document.metadata,
          wordCount,
          modified: new Date().toISOString()
        }
      }

      await onSave(updatedDocument)
      
      setEditorState(prev => ({
        ...prev,
        document: updatedDocument,
        isDirty: false,
        lastSaved: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Failed to save:', error)
      // TODO: Show error toast
    }
  }, [editorState.document, onSave])

  // Block manipulation
  const addBlock = useCallback((type: BlockType, afterBlockId: string | null = null) => {
    const newBlock = createBlockByType(type)
    
    setEditorState(prev => {
      const content = [...prev.document.content]
      
      if (afterBlockId === null) {
        // Add to end
        content.push(newBlock)
      } else {
        // Insert after specific block
        const index = content.findIndex(b => b.id === afterBlockId)
        if (index !== -1) {
          content.splice(index + 1, 0, newBlock)
        } else {
          content.push(newBlock)
        }
      }

      return {
        ...prev,
        document: {
          ...prev.document,
          content
        },
        currentBlockId: newBlock.id,
        isDirty: true
      }
    })

    setShowBlockMenu(false)
  }, [])

  const updateBlock = useCallback((blockId: string, updates: Partial<ContentBlock>) => {
    setEditorState(prev => ({
      ...prev,
      document: {
        ...prev.document,
        content: prev.document.content.map(block =>
          block.id === blockId ? { ...block, ...updates } as ContentBlock : block
        )
      },
      isDirty: true
    }))
  }, [])

  const deleteBlock = useCallback((blockId: string) => {
    setEditorState(prev => ({
      ...prev,
      document: {
        ...prev.document,
        content: prev.document.content.filter(block => block.id !== blockId)
      },
      isDirty: true
    }))
  }, [])

  const moveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
    setEditorState(prev => {
      const content = [...prev.document.content]
      const index = content.findIndex(b => b.id === blockId)
      
      if (index === -1) return prev
      if (direction === 'up' && index === 0) return prev
      if (direction === 'down' && index === content.length - 1) return prev

      const newIndex = direction === 'up' ? index - 1 : index + 1
      const [movedBlock] = content.splice(index, 1)
      content.splice(newIndex, 0, movedBlock)

      return {
        ...prev,
        document: {
          ...prev.document,
          content
        },
        isDirty: true
      }
    })
  }, [])

  // Block menu handlers
  const showBlockMenuAt = (afterBlockId: string | null, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    const menuHeight = 400 // Approximate max height of menu
    const viewportHeight = window.innerHeight
    
    // Calculate position - if menu would overflow bottom, position it above the button
    let top = rect.bottom + 10
    if (top + menuHeight > viewportHeight) {
      top = Math.max(10, viewportHeight - menuHeight - 10)
    }
    
    setBlockMenuPosition({ top, left: rect.left })
    setInsertAfterBlockId(afterBlockId)
    setShowBlockMenu(true)
  }

  // Toggle preview mode
  const toggleMode = () => {
    setEditorState(prev => ({
      ...prev,
      mode: prev.mode === 'edit' ? 'preview' : 'edit'
    }))
  }

  // Calculate word count
  const wordCount = editorState.document.metadata.wordCount

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={editorState.document.metadata.title}
            onChange={(e) => setEditorState(prev => ({
              ...prev,
              document: {
                ...prev.document,
                metadata: { ...prev.document.metadata, title: e.target.value }
              },
              isDirty: true
            }))}
            placeholder="Chapter Title"
            className="text-xl font-semibold border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">{wordCount} words</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMode}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-900 dark:text-gray-100"
          >
            {editorState.mode === 'edit' ? (
              <><Eye size={16} /> Preview</>
            ) : (
              <><Edit3 size={16} /> Edit</>
            )}
          </button>
          
          <button
            onClick={handleSave}
            disabled={!editorState.isDirty}
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save size={16} />
            {editorState.isDirty ? 'Save' : 'Saved'}
          </button>

          {onPublish && (
            <button
              onClick={() => onPublish(editorState.document)}
              className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Publish
            </button>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-4xl mx-auto py-8 px-6 pb-96">
          {editorState.document.content.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-900 dark:text-gray-100 mb-4 font-medium">Start writing your story...</p>
              <button
                onClick={() => addBlock('prose')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <PlusCircle size={18} />
                Add First Block
              </button>
            </div>
          ) : (
            <>
              {editorState.document.content.map((block, index) => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  mode={editorState.mode}
                  isActive={editorState.currentBlockId === block.id}
                  onUpdate={(updates) => updateBlock(block.id, updates)}
                  onDelete={() => deleteBlock(block.id)}
                  onMoveUp={() => moveBlock(block.id, 'up')}
                  onMoveDown={() => moveBlock(block.id, 'down')}
                  onFocus={() => setEditorState(prev => ({ ...prev, currentBlockId: block.id }))}
                  onAddBlockAfter={(e) => showBlockMenuAt(block.id, e)}
                  canMoveUp={index > 0}
                  canMoveDown={index < editorState.document.content.length - 1}
                />
              ))}

              {/* Add block button at the end */}
              {editorState.mode === 'edit' && (
                <button
                  onClick={(e) => showBlockMenuAt(null, e)}
                  className="mt-4 flex items-center gap-2 text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400 font-medium"
                >
                  <PlusCircle size={18} />
                  Add Block
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Block Type Menu */}
      {showBlockMenu && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setShowBlockMenu(false)}
          />
          <div
            className="fixed z-30 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 w-64 max-h-[80vh] overflow-y-auto"
            style={{ top: blockMenuPosition.top, left: blockMenuPosition.left }}
          >
            <BlockTypeMenu onSelectBlock={(type) => addBlock(type, insertAfterBlockId)} />
          </div>
        </>
      )}
    </div>
  )
}

// ============================================================================
// BLOCK CONVERSION HELPER
// ============================================================================

function convertBlockType(block: ContentBlock, newType: BlockType): Partial<ContentBlock> {
  // If converting to the same type, no change needed
  if (block.type === newType) return {}

  const baseBlock = {
    type: newType,
    id: block.id,
  }

  // Extract text content from current block if applicable
  let textContent = ''
  if (block.type === 'prose') {
    textContent = (block as ProseBlock).text || ''
  } else if (block.type === 'heading') {
    textContent = (block as HeadingBlock).text || ''
  } else if (block.type === 'narration') {
    textContent = (block as NarrationBlock).text || ''
  } else if (block.type === 'dialogue') {
    // Get first line of dialogue
    const dialogueBlock = block as DialogueBlock
    if (dialogueBlock.lines && dialogueBlock.lines.length > 0) {
      textContent = dialogueBlock.lines[0].text || ''
    }
  }

  // Create appropriate structure for new type
  switch (newType) {
    case 'prose':
      return { ...baseBlock, text: textContent } as Partial<ProseBlock>
    
    case 'heading':
      return { ...baseBlock, text: textContent, level: 2 } as Partial<HeadingBlock>
    
    case 'narration':
      return { 
        ...baseBlock, 
        text: textContent,
        style: { variant: 'box' }
      } as Partial<NarrationBlock>
    
    case 'dialogue':
      return {
        ...baseBlock,
        lines: textContent ? [{
          speaker: 'Speaker',
          text: textContent
        }] : []
      } as Partial<DialogueBlock>
    
    case 'chat':
      return {
        ...baseBlock,
        platform: 'generic' as ChatPlatform,
        messages: textContent ? [{
          id: crypto.randomUUID(),
          user: 'User',
          text: textContent,
          timestamp: new Date().toISOString(),
          status: 'sent'
        }] : []
      } as Partial<ChatBlock>
    
    case 'phone':
      return {
        ...baseBlock,
        phoneType: 'generic',
        content: textContent ? [{
          id: crypto.randomUUID(),
          user: 'Contact',
          text: textContent,
          timestamp: new Date().toISOString()
        }] : []
      } as Partial<PhoneBlock>
    
    case 'divider':
      return { ...baseBlock, style: 'line' } as Partial<DividerBlock>
    
    default:
      return baseBlock as Partial<ContentBlock>
  }
}

// ============================================================================
// BLOCK RENDERER
// ============================================================================

interface BlockRendererProps {
  block: ContentBlock
  mode: 'edit' | 'preview' | 'translate'
  isActive: boolean
  onUpdate: (updates: Partial<ContentBlock>) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onFocus: () => void
  onAddBlockAfter: (e: React.MouseEvent) => void
  canMoveUp: boolean
  canMoveDown: boolean
}

function BlockRenderer({ 
  block, 
  mode, 
  isActive, 
  onUpdate, 
  onDelete, 
  onMoveUp, 
  onMoveDown,
  onFocus,
  onAddBlockAfter,
  canMoveUp,
  canMoveDown
}: BlockRendererProps) {
  
  const [showControls, setShowControls] = useState(false)
  const [showTypeMenu, setShowTypeMenu] = useState(false)

  // Show controls when block is active (focused) OR when hovering
  const controlsVisible = (mode === 'edit' && (showControls || isActive))

  return (
    <div
      className={`group relative mb-4 ${isActive ? 'ring-2 ring-blue-500 rounded' : ''}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={onFocus}
    >
      {/* Block Controls */}
      {controlsVisible && (
        <div className="absolute -left-12 top-0 flex flex-col gap-1 bg-white dark:bg-gray-800 rounded shadow-sm p-1 border border-gray-200 dark:border-gray-700">
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="p-1 text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400 disabled:opacity-30 font-bold"
            title="Move up"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="p-1 text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400 disabled:opacity-30 font-bold"
            title="Move down"
          >
            ↓
          </button>
          <button
            onClick={() => setShowTypeMenu(!showTypeMenu)}
            className="p-1 text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
            title="Change block type"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={onAddBlockAfter}
            className="p-1 text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
            title="Add block"
          >
            <PlusCircle size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-bold"
            title="Delete"
          >
            ×
          </button>
        </div>
      )}

      {/* Block Type Change Menu */}
      {showTypeMenu && (
        <div className="absolute -left-48 top-0 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg p-2 z-10">
          <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-2">Change to:</div>
          <button
            onClick={() => {
              onUpdate(convertBlockType(block, 'prose'))
              setShowTypeMenu(false)
            }}
            disabled={block.type === 'prose'}
            className="w-full text-left px-2 py-1 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Type size={14} className="inline mr-2" />
            Prose
          </button>
          <button
            onClick={() => {
              onUpdate(convertBlockType(block, 'heading'))
              setShowTypeMenu(false)
            }}
            disabled={block.type === 'heading'}
            className="w-full text-left px-2 py-1 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Type size={14} className="inline mr-2" />
            Heading
          </button>
          <button
            onClick={() => {
              onUpdate(convertBlockType(block, 'narration'))
              setShowTypeMenu(false)
            }}
            disabled={block.type === 'narration'}
            className="w-full text-left px-2 py-1 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SplitSquareVertical size={14} className="inline mr-2" />
            Narration Box
          </button>
          <button
            onClick={() => {
              onUpdate(convertBlockType(block, 'dialogue'))
              setShowTypeMenu(false)
            }}
            disabled={block.type === 'dialogue'}
            className="w-full text-left px-2 py-1 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Users size={14} className="inline mr-2" />
            Dialogue
          </button>
          <button
            onClick={() => {
              onUpdate(convertBlockType(block, 'chat'))
              setShowTypeMenu(false)
            }}
            disabled={block.type === 'chat'}
            className="w-full text-left px-2 py-1 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageSquare size={14} className="inline mr-2" />
            Chat
          </button>
          <button
            onClick={() => {
              onUpdate(convertBlockType(block, 'phone'))
              setShowTypeMenu(false)
            }}
            disabled={block.type === 'phone'}
            className="w-full text-left px-2 py-1 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Smartphone size={14} className="inline mr-2" />
            Phone UI
          </button>
          <hr className="my-1 border-gray-200 dark:border-gray-700" />
          <button
            onClick={() => setShowTypeMenu(false)}
            className="w-full text-left px-2 py-1 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Block Content */}
      <div className="min-h-[40px]">
        {block.type === 'prose' && (
          <ProseBlockEditor block={block as ProseBlock} mode={mode} onUpdate={onUpdate} />
        )}
        {block.type === 'heading' && (
          <HeadingBlockEditor block={block as HeadingBlock} mode={mode} onUpdate={onUpdate} />
        )}
        {block.type === 'divider' && (
          <DividerBlockEditor block={block as DividerBlock} mode={mode} />
        )}
        {block.type === 'dialogue' && (
          <DialogueBlockEditor block={block as DialogueBlock} mode={mode} onUpdate={onUpdate} />
        )}
        {block.type === 'chat' && (
          <ChatBlockEditor block={block as ChatBlock} mode={mode} onUpdate={onUpdate} />
        )}
        {block.type === 'phone' && (
          <PhoneBlockEditor block={block as PhoneBlock} mode={mode} onUpdate={onUpdate} />
        )}
        {block.type === 'narration' && (
          <NarrationBlockEditor block={block as NarrationBlock} mode={mode} onUpdate={onUpdate} />
        )}
      </div>
    </div>
  )
}

// ============================================================================
// BLOCK TYPE EDITORS
// ============================================================================

function ProseBlockEditor({ 
  block, 
  mode, 
  onUpdate 
}: { 
  block: ProseBlock
  mode: 'edit' | 'preview' | 'translate'
  onUpdate: (updates: Partial<ProseBlock>) => void
}) {
  if (mode === 'preview' || mode === 'translate') {
    return (
      <p className="prose max-w-none text-gray-900 dark:text-gray-100" style={{ textAlign: block.style?.textAlign }}>
        {block.text}
      </p>
    )
  }

  return (
    <textarea
      value={block.text}
      onChange={(e) => onUpdate({ text: e.target.value })}
      placeholder="Write something..."
      className="w-full min-h-[80px] border-none outline-none resize-none prose max-w-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
      style={{ textAlign: block.style?.textAlign }}
    />
  )
}

function HeadingBlockEditor({ 
  block, 
  mode, 
  onUpdate 
}: { 
  block: HeadingBlock
  mode: 'edit' | 'preview' | 'translate'
  onUpdate: (updates: Partial<HeadingBlock>) => void
}) {
  const className = "font-bold"
  const textSizeClass = block.level === 1 ? 'text-4xl' : 
                        block.level === 2 ? 'text-3xl' : 
                        block.level === 3 ? 'text-2xl' : 'text-xl'

  if (mode === 'preview' || mode === 'translate') {
    const HeadingComponent = block.level === 1 ? 'h1' :
                            block.level === 2 ? 'h2' :
                            block.level === 3 ? 'h3' : 'h4'
    
    return <HeadingComponent className={`${className} ${textSizeClass} text-gray-900 dark:text-gray-100`}>{block.text}</HeadingComponent>
  }

  return (
    <input
      type="text"
      value={block.text}
      onChange={(e) => onUpdate({ text: e.target.value })}
      placeholder={`Heading ${block.level}`}
      className={`w-full border-none outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${className} ${textSizeClass}`}
    />
  )
}

function DividerBlockEditor({ block }: { block: DividerBlock; mode: 'edit' | 'preview' | 'translate' }) {
  return (
    <div className="py-4">
      <hr className="border-gray-300" />
    </div>
  )
}

// ============================================================================
// BLOCK TYPE MENU
// ============================================================================

function BlockTypeMenu({ onSelectBlock }: { onSelectBlock: (type: BlockType) => void }) {
  const blockTypes: Array<{ type: BlockType; label: string; icon: any; description: string }> = [
    { type: 'prose', label: 'Prose', icon: Type, description: 'Traditional paragraph text' },
    { type: 'heading', label: 'Heading', icon: Type, description: 'Chapter or section heading' },
    { type: 'dialogue', label: 'Dialogue', icon: Users, description: 'Character dialogue' },
    { type: 'chat', label: 'Chat', icon: MessageSquare, description: 'Messaging UI simulation' },
    { type: 'phone', label: 'Phone UI', icon: Smartphone, description: 'Phone screen interface' },
    { type: 'narration', label: 'Narration', icon: SplitSquareVertical, description: 'Narrator box' },
    { type: 'divider', label: 'Divider', icon: SplitSquareVertical, description: 'Scene break' },
  ]

  return (
    <div className="space-y-1">
      {blockTypes.map(({ type, label, icon: Icon, description }) => (
        <button
          key={type}
          onClick={() => onSelectBlock(type)}
          className="w-full flex items-start gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-left"
        >
          <Icon size={18} className="mt-0.5 flex-shrink-0 text-gray-900 dark:text-gray-100" />
          <div>
            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{label}</div>
            <div className="text-xs text-gray-700 dark:text-gray-300">{description}</div>
          </div>
        </button>
      ))}
    </div>
  )
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createEmptyDocument(workId: string, chapterId?: string): ChaptDocument {
  return {
    type: 'chapter',
    version: '1.0.0',
    metadata: {
      id: chapterId || crypto.randomUUID(),
      title: 'Untitled Chapter',
      author: {
        id: '', // Will be filled by parent component
        name: ''
      },
      language: 'en',
      wordCount: 0,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      status: 'draft'
    },
    content: []
  }
}

function createBlockByType(type: BlockType): ContentBlock {
  const baseBlock = {
    id: crypto.randomUUID(),
    metadata: {
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    }
  }

  switch (type) {
    case 'prose':
      return { ...baseBlock, type: 'prose', text: '' }
    case 'heading':
      return { ...baseBlock, type: 'heading', text: '', level: 2 }
    case 'divider':
      return { ...baseBlock, type: 'divider' }
    case 'dialogue':
      return { ...baseBlock, type: 'dialogue', lines: [] }
    case 'chat':
      return { ...baseBlock, type: 'chat', platform: 'generic', messages: [] }
    case 'phone':
      return { ...baseBlock, type: 'phone', content: [], phoneType: 'ios' }
    case 'narration':
      return { ...baseBlock, type: 'narration', text: '', style: { variant: 'box', position: 'center' } }
    case 'image':
      return { ...baseBlock, type: 'image', url: '', alt: '' }
    default:
      return { ...baseBlock, type: 'prose', text: '' }
  }
}

function calculateWordCount(blocks: ContentBlock[]): number {
  let count = 0
  
  for (const block of blocks) {
    if (block.type === 'prose') {
      count += (block as ProseBlock).text.split(/\s+/).filter(w => w.length > 0).length
    } else if (block.type === 'heading') {
      count += (block as HeadingBlock).text.split(/\s+/).filter(w => w.length > 0).length
    } else if (block.type === 'dialogue') {
      const dialogueBlock = block as DialogueBlock
      dialogueBlock.lines.forEach(line => {
        count += line.text.split(/\s+/).filter(w => w.length > 0).length
      })
    } else if (block.type === 'chat') {
      const chatBlock = block as ChatBlock
      chatBlock.messages.forEach(msg => {
        count += msg.text.split(/\s+/).filter(w => w.length > 0).length
      })
    } else if (block.type === 'phone') {
      const phoneBlock = block as PhoneBlock
      phoneBlock.content.forEach(msg => {
        count += msg.text.split(/\s+/).filter(w => w.length > 0).length
      })
    } else if (block.type === 'narration') {
      count += (block as NarrationBlock).text.split(/\s+/).filter(w => w.length > 0).length
    }
  }
  
  return count
}
