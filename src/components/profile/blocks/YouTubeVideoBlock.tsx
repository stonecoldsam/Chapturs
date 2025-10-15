'use client'

import BaseBlock from './BaseBlock'

interface YouTubeVideoBlockData {
  videoId: string
  title?: string
  description?: string
  autoplay?: boolean
  showDescription?: boolean
}

interface YouTubeVideoBlockProps {
  data: YouTubeVideoBlockData
  width?: number
  height?: number
  isOwner?: boolean
  onDelete?: () => void
  onExpand?: (direction: 'width' | 'height') => void
}

/**
 * YouTubeVideoBlock - v0.1
 * Embed a YouTube video with 16:9 aspect ratio
 * Can expand width to take up more horizontal space
 * Height scales proportionally to maintain aspect ratio
 */
export default function YouTubeVideoBlock({
  data,
  width = 2, // Default to 2 wide to accommodate 16:9
  height = 1,
  isOwner = false,
  onDelete,
  onExpand
}: YouTubeVideoBlockProps) {
  const embedUrl = `https://www.youtube.com/embed/${data.videoId}${data.autoplay ? '?autoplay=1' : ''}`

  return (
    <BaseBlock
      width={width}
      height={height}
      isOwner={isOwner}
      onDelete={onDelete}
      onExpand={onExpand}
      canExpandWidth={width < 2}
      canExpandHeight={false} // Video blocks don't expand height
    >
      <div className="h-full flex flex-col">
        {/* Video Embed - 16:9 aspect ratio */}
        <div className="relative aspect-video bg-black">
          <iframe
            src={embedUrl}
            title={data.title || 'YouTube video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>

        {/* Description Area */}
        {data.showDescription && (data.title || data.description) && (
          <div className="p-3 flex-1 bg-gray-800">
            {data.title && (
              <h3 className="font-semibold text-gray-100 text-sm mb-1">
                {data.title}
              </h3>
            )}
            {data.description && (
              <p className="text-xs text-gray-400 line-clamp-2">
                {data.description}
              </p>
            )}
          </div>
        )}
      </div>
    </BaseBlock>
  )
}
