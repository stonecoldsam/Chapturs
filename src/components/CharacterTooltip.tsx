'use client'

import { useState, useEffect, useRef } from 'react'

interface CharacterTooltipProps {
  name: string
  role?: string
  imageUrl?: string
  description?: string
  children: React.ReactNode
}

export function CharacterTooltip({ 
  name, 
  role, 
  imageUrl, 
  description, 
  children 
}: CharacterTooltipProps) {
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
        className="cursor-help border-b-2 border-dotted border-green-500 text-green-600 dark:text-green-400 hover:border-solid transition-all font-medium"
      >
        {children}
      </span>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 w-80 p-4 bg-gray-900 text-white rounded-lg shadow-xl pointer-events-none"
          style={{ 
            left: position.x, 
            top: position.y,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="flex items-start gap-3">
            {imageUrl && (
              <div className="flex-shrink-0">
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-lg mb-1">{name}</div>
              {role && (
                <div className="text-xs text-green-400 mb-2 uppercase tracking-wide">
                  {role}
                </div>
              )}
              {description && (
                <div className="text-sm text-gray-300 line-clamp-3">
                  {description}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </span>
  )
}
