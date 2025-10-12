'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { ChaptDocument, ContentBlock, ProseBlock, HeadingBlock, DialogueBlock, ChatBlock, PhoneBlock, NarrationBlock, PacingAnimation } from '@/types/chapt'
import { ChatBlockEditor, PhoneBlockEditor, DialogueBlockEditor, NarrationBlockEditor } from './BlockEditors'
import { MessageCircle, Globe, BookmarkPlus, Share2, MessageSquare, Edit3 } from 'lucide-react'

interface ChaptursReaderProps {
  document: ChaptDocument
  onBookmark?: () => void
  onShare?: (blockId: string, text: string) => void
  onComment?: (blockId: string) => void
  onEditSuggestion?: (blockId: string, originalText: string) => void
  enableTranslation?: boolean
  userLanguage?: string // User's preferred language for dual-language display
}

export default function ChaptursReader({
  document,
  onBookmark,
  onShare,
  onComment,
  onEditSuggestion,
  enableTranslation = false,
  userLanguage = 'en'
}: ChaptursReaderProps) {
  
  const [activeLanguage, setActiveLanguage] = useState<string>(document.metadata.language)
  const [showDualLanguage, setShowDualLanguage] = useState(false)
  const [visibleBlocks, setVisibleBlocks] = useState<Set<string>>(new Set())
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null)
  
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Initialize Intersection Observer for scroll-based animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const blockId = entry.target.getAttribute('data-block-id')
            if (blockId) {
              setVisibleBlocks((prev) => new Set([...prev, blockId]))
            }
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  // Language toggle handler
  const toggleLanguage = () => {
    if (showDualLanguage) {
      setShowDualLanguage(false)
    } else if (activeLanguage === document.metadata.language) {
      setActiveLanguage(userLanguage)
    } else {
      setActiveLanguage(document.metadata.language)
    }
  }

  const toggleDualLanguage = () => {
    setShowDualLanguage(!showDualLanguage)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Reader Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{document.metadata.title}</h1>
              <p className="text-sm text-gray-500">
                by {document.metadata.author.name} · {document.metadata.wordCount} words
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Controls */}
              {enableTranslation && (
                <>
                  <button
                    onClick={toggleLanguage}
                    className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2"
                    title="Switch language"
                  >
                    <Globe size={16} />
                    {activeLanguage.toUpperCase()}
                  </button>
                  
                  <button
                    onClick={toggleDualLanguage}
                    className={`px-3 py-2 text-sm border rounded flex items-center gap-2 ${
                      showDualLanguage 
                        ? 'bg-blue-50 border-blue-300 text-blue-700' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    title="Show both languages"
                  >
                    Dual
                  </button>
                </>
              )}

              {/* Action Buttons */}
              {onBookmark && (
                <button
                  onClick={onBookmark}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                  title="Bookmark"
                >
                  <BookmarkPlus size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reader Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <article className="prose prose-lg max-w-none">
          {document.content.map((block, index) => (
            <ReadableBlock
              key={block.id}
              block={block}
              index={index}
              isVisible={visibleBlocks.has(block.id)}
              isHovered={hoveredBlock === block.id}
              observerRef={observerRef}
              activeLanguage={activeLanguage}
              showDualLanguage={showDualLanguage}
              translations={document.translations}
              onHover={() => setHoveredBlock(block.id)}
              onLeave={() => setHoveredBlock(null)}
              onShare={onShare ? (text) => onShare(block.id, text) : undefined}
              onComment={onComment ? () => onComment(block.id) : undefined}
              onEditSuggestion={onEditSuggestion ? (text) => onEditSuggestion(block.id, text) : undefined}
            />
          ))}
        </article>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-6 py-8 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Published on {new Date(document.metadata.created).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-4">
            <button className="hover:text-gray-900">Report Issue</button>
            <button className="hover:text-gray-900">Suggest Translation</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// READABLE BLOCK COMPONENT
// ============================================================================

interface ReadableBlockProps {
  block: ContentBlock
  index: number
  isVisible: boolean
  isHovered: boolean
  observerRef: React.MutableRefObject<IntersectionObserver | null>
  activeLanguage: string
  showDualLanguage: boolean
  translations?: ChaptDocument['translations']
  onHover: () => void
  onLeave: () => void
  onShare?: (text: string) => void
  onComment?: () => void
  onEditSuggestion?: (text: string) => void
}

function ReadableBlock({
  block,
  index,
  isVisible,
  isHovered,
  observerRef,
  activeLanguage,
  showDualLanguage,
  translations,
  onHover,
  onLeave,
  onShare,
  onComment,
  onEditSuggestion
}: ReadableBlockProps) {
  
  const blockRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = blockRef.current
    if (element && observerRef.current) {
      observerRef.current.observe(element)
    }

    return () => {
      if (element && observerRef.current) {
        observerRef.current.unobserve(element)
      }
    }
  }, [observerRef])

  // Get animation style for this block
  const getAnimationStyle = (animation?: PacingAnimation, delay?: number) => {
    if (!isVisible) {
      return { opacity: 0, transform: 'translateY(20px)' }
    }

    const baseStyle = {
      opacity: 1,
      transform: 'translateY(0)',
      transition: `all ${delay ? delay / 1000 : 0.5}s ease-out`
    }

    switch (animation) {
      case 'fade-in':
        return { ...baseStyle, transitionDelay: `${delay || 0}ms` }
      case 'slide-up':
        return { ...baseStyle, transitionDelay: `${delay || 0}ms` }
      case 'typewriter':
        // Typewriter effect would require character-by-character animation
        // For now, just fade in
        return { ...baseStyle, transitionDelay: `${delay || 0}ms` }
      default:
        return baseStyle
    }
  }

  return (
    <div
      ref={blockRef}
      data-block-id={block.id}
      className="relative group mb-6"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Block Actions (appear on hover) */}
      {isHovered && (
        <div className="absolute -left-12 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onComment && (
            <button
              onClick={onComment}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
              title="Add comment"
            >
              <MessageSquare size={16} />
            </button>
          )}
          {onShare && block.type === 'prose' && (
            <button
              onClick={() => onShare((block as ProseBlock).text)}
              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
              title="Share quote"
            >
              <Share2 size={16} />
            </button>
          )}
          {onEditSuggestion && block.type === 'prose' && (
            <button
              onClick={() => onEditSuggestion((block as ProseBlock).text)}
              className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded"
              title="Suggest edit"
            >
              <Edit3 size={16} />
            </button>
          )}
        </div>
      )}

      {/* Block Content */}
      <div style={block.type === 'prose' ? getAnimationStyle((block as ProseBlock).style?.animation, (block as ProseBlock).style?.delay) : undefined}>
        {block.type === 'prose' && (
          <ReadableProse
            block={block as ProseBlock}
            activeLanguage={activeLanguage}
            showDualLanguage={showDualLanguage}
            translations={translations?.[activeLanguage]?.[block.id]}
          />
        )}
        
        {block.type === 'heading' && (
          <ReadableHeading block={block as HeadingBlock} />
        )}
        
        {block.type === 'dialogue' && (
          <ReadableDialogue block={block as DialogueBlock} />
        )}
        
        {block.type === 'chat' && (
          <ReadableChat block={block as ChatBlock} />
        )}
        
        {block.type === 'phone' && (
          <ReadablePhone block={block as PhoneBlock} />
        )}
        
        {block.type === 'narration' && (
          <ReadableNarration block={block as NarrationBlock} />
        )}
        
        {block.type === 'divider' && (
          <div className="py-8">
            <hr className="border-gray-300" />
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// READABLE BLOCK RENDERERS
// ============================================================================

function ReadableProse({ 
  block, 
  activeLanguage, 
  showDualLanguage, 
  translations 
}: { 
  block: ProseBlock
  activeLanguage: string
  showDualLanguage: boolean
  translations?: any[]
}) {
  // For now, just show the original text
  // In a full implementation, we'd split into sentences and show translations
  return (
    <div className="prose max-w-none">
      <p style={{ textAlign: block.style?.textAlign }}>
        {block.text}
      </p>
      {showDualLanguage && translations && translations.length > 0 && (
        <p className="text-gray-600 italic mt-2 text-sm border-l-2 border-blue-300 pl-4">
          {translations[0]?.text || 'Translation not available'}
        </p>
      )}
    </div>
  )
}

function ReadableHeading({ block }: { block: HeadingBlock }) {
  const HeadingTag = `h${block.level}` as 'h1' | 'h2' | 'h3' | 'h4'
  return <HeadingTag className="font-bold">{block.text}</HeadingTag>
}

function ReadableDialogue({ block }: { block: DialogueBlock }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 my-6 space-y-3 font-mono text-sm">
      {block.lines.map((line, index) => (
        <div key={index} className="flex gap-3">
          <div className="font-bold uppercase min-w-[120px] text-right text-gray-700">
            {line.speaker}
            {line.emotion && <span className="text-gray-500 text-xs ml-2">({line.emotion})</span>}
          </div>
          <div className="flex-1 text-gray-900">{line.text}</div>
        </div>
      ))}
    </div>
  )
}

function ReadableChat({ block }: { block: ChatBlock }) {
  return (
    <div className="my-8">
      <ChatBlockEditor block={block} mode="preview" onUpdate={() => {}} />
    </div>
  )
}

function ReadablePhone({ block }: { block: PhoneBlock }) {
  return (
    <div className="my-8">
      <PhoneBlockEditor block={block} mode="preview" onUpdate={() => {}} />
    </div>
  )
}

function ReadableNarration({ block }: { block: NarrationBlock }) {
  return (
    <div className="my-8">
      <NarrationBlockEditor block={block} mode="preview" onUpdate={() => {}} />
    </div>
  )
}
