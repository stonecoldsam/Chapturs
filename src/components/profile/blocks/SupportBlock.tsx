'use client'

import BaseBlock from './BaseBlock'
import { HeartIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'

interface SecondaryLink {
  title: string
  url: string
  icon?: string // emoji or short label
}

export interface SupportBlockData {
  chaptursUrl: string // Primary first-party support URL (required)
  title?: string // Headline, defaults to "Support My Work"
  subtitle?: string // Short supporting copy
  buttonLabel?: string // CTA text, defaults to "Support on Chapturs"
  accentColor?: string // CSS color for gradients/badges
  backgroundImage?: string // Optional background image for tall variant
  secondaryLinks?: SecondaryLink[] // Patreon / Ko-fi etc.; visually de-emphasized
}

interface SupportBlockProps {
  data: SupportBlockData
  width?: number
  height?: number
  isOwner?: boolean
  onDelete?: () => void
  onExpand?: (direction: 'width' | 'height') => void
}

/**
 * SupportBlock - v0.1
 * Platform-first support CTA with optional secondary links.
 * Size: 2x1 default, expandable in height to 2x2 (mega).
 * Expansion rule: height only.
 */
export default function SupportBlock({
  data,
  width = 2,
  height = 1,
  isOwner = false,
  onDelete,
  onExpand
}: SupportBlockProps) {
  const accent = data.accentColor || '#ec4899' // tailwind pink-500
  const buttonLabel = data.buttonLabel || 'Support on Chapturs'
  const title = data.title || 'Support My Work'
  const subtitle = data.subtitle || 'Your support helps me create more chapters, faster.'

  // Only allow height expansion (already consumes full width)
  const canExpandHeight = height < 2

  const bgStyle: React.CSSProperties = height > 1 && data.backgroundImage
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url(${data.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        backgroundImage: `linear-gradient(135deg, ${accent}33 0%, ${accent}11 100%)`,
      }

  return (
    <BaseBlock
      width={width}
      height={height}
      isOwner={isOwner}
      onDelete={onDelete}
      onExpand={onExpand}
      canExpandWidth={false}
      canExpandHeight={canExpandHeight}
      className="overflow-hidden"
    >
      <div className="h-full w-full relative flex flex-col" style={bgStyle}>
        {/* Decorative accent blob */}
        <div
          aria-hidden
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-2xl"
          style={{ background: accent }}
        />

        {/* Content */}
        <div className="relative z-10 flex-1 p-5 md:p-6 flex flex-col">
          <div className="flex items-center gap-2 text-pink-300/90" style={{ color: accent }}>
            <HeartIcon className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>
              Support
            </span>
          </div>

          <h3 className="mt-2 text-lg md:text-xl font-bold text-gray-100">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-300 line-clamp-2 md:line-clamp-3">{subtitle}</p>
          )}

          {/* Primary CTA */}
          <div className="mt-4">
            {data.chaptursUrl ? (
              <a
                href={data.chaptursUrl}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm hover:opacity-95 transition-opacity"
                style={{ background: accent }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {buttonLabel}
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </a>
            ) : (
              <span className="inline-flex px-4 py-2 rounded-lg text-sm font-medium text-white/60 bg-gray-700 cursor-not-allowed">
                Configure Chapturs support link
              </span>
            )}
          </div>

          {/* Secondary links (de-emphasized) */}
          {data.secondaryLinks && data.secondaryLinks.length > 0 && (
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              {data.secondaryLinks.slice(0, 3).map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-gray-300 hover:text-gray-100 transition-colors"
                >
                  {link.icon ? (
                    <span className="text-base leading-none">{link.icon}</span>
                  ) : (
                    <ArrowTopRightOnSquareIcon className="w-3 h-3 text-gray-400" />
                  )}
                  <span className="underline/10 underline-offset-2">{link.title}</span>
                </a>
              ))}
            </div>
          )}

          {/* Tall variant extras */}
          {height > 1 && (
            <div className="mt-auto pt-4 text-[11px] text-gray-300/80">
              Tip: Prioritize your Chapturs link. External links are secondary.
            </div>
          )}
        </div>
      </div>
    </BaseBlock>
  )
}
