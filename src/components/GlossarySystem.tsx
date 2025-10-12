'use client'

import { useState, useEffect, useRef } from 'react'
import { GlossaryTerm } from '@/types'

interface GlossaryTooltipProps {
  term: string
  definition: string
  children: React.ReactNode
}

export function GlossaryTooltip({ term, definition, children }: GlossaryTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isVisible && tooltipRef.current) {
        const tooltipRect = tooltipRef.current.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        
        let x = e.clientX + 10
        let y = e.clientY - 10
        
        // Adjust if tooltip would go off screen
        if (x + tooltipRect.width > viewportWidth) {
          x = e.clientX - tooltipRect.width - 10
        }
        if (y - tooltipRect.height < 0) {
          y = e.clientY + 20
        }
        
        setPosition({ x, y })
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [isVisible])

  return (
    <span className="relative">
      <span
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help border-b border-dotted border-blue-500 text-blue-600 dark:text-blue-400 hover:border-solid transition-all"
      >
        {children}
      </span>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 max-w-sm p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg pointer-events-none"
          style={{ 
            left: position.x, 
            top: position.y,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="font-semibold mb-1">{term}</div>
          <div className="text-gray-200">{definition}</div>
        </div>
      )}
    </span>
  )
}

interface ChapterContentProps {
  content: string
  glossaryTerms: GlossaryTerm[] | undefined
  currentChapter: number
}

export default function ChapterContent({ content, glossaryTerms, currentChapter }: ChapterContentProps) {
  const [processedContent, setProcessedContent] = useState<React.ReactNode[]>([])

  useEffect(() => {
    // Use all available glossary terms (chapter filtering removed for now)
    const availableTerms = glossaryTerms || []

    // Sort by term length (descending) to handle overlapping terms correctly
    const sortedTerms = availableTerms.sort((a, b) => b.term.length - a.term.length)

    // Process content and wrap glossary terms
    let processed = content
    const termReplacements: { term: string; definition: string; placeholder: string }[] = []

    sortedTerms.forEach((glossaryTerm, index) => {
      const placeholder = `__GLOSSARY_${index}__`
      const regex = new RegExp(`\\b${glossaryTerm.term}\\b`, 'gi')
      
      if (regex.test(processed)) {
        termReplacements.push({
          term: glossaryTerm.term,
          definition: glossaryTerm.definition,
          placeholder
        })
        processed = processed.replace(regex, placeholder)
      }
    })

    // Split content and create React nodes
    const parts = processed.split(/(__GLOSSARY_\d+__)/)
    const contentNodes = parts.map((part, index) => {
      const replacement = termReplacements.find(r => r.placeholder === part)
      
      if (replacement) {
        return (
          <GlossaryTooltip
            key={index}
            term={replacement.term}
            definition={replacement.definition}
          >
            {replacement.term}
          </GlossaryTooltip>
        )
      }
      
      return part
    })

    setProcessedContent(contentNodes)
  }, [content, glossaryTerms, currentChapter])

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <div className="whitespace-pre-wrap leading-relaxed">
        {processedContent}
      </div>
    </div>
  )
}
