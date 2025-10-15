/**
 * Block Registry - v0.1
 * Central registry for all profile block types
 * Maps block type strings to their corresponding components
 */

import WorkCardBlock from './WorkCardBlock'
import TextBoxBlock from './TextBoxBlock'
import YouTubeVideoBlock from './YouTubeVideoBlock'

export const BLOCK_TYPES = {
  'work-card': {
    component: WorkCardBlock,
    name: 'Work Card',
    description: 'Showcase a work from your portfolio',
    defaultSize: { width: 1, height: 1 },
    icon: '📚',
    category: 'content'
  },
  'text-box': {
    component: TextBoxBlock,
    name: 'Text Box',
    description: 'Add custom text with markdown support',
    defaultSize: { width: 1, height: 1 },
    icon: '📝',
    category: 'content'
  },
  'youtube-video': {
    component: YouTubeVideoBlock,
    name: 'YouTube Video',
    description: 'Embed a YouTube video',
    defaultSize: { width: 2, height: 1 },
    icon: '▶️',
    category: 'social'
  }
  // More blocks will be added in subsequent commits:
  // - twitter-feed
  // - discord-invite
  // - twitch-channel
  // - youtube-channel
  // - favorite-author
  // - external-link
} as const

export type BlockType = keyof typeof BLOCK_TYPES

export function getBlockComponent(type: BlockType) {
  return BLOCK_TYPES[type]?.component || null
}

export function getBlockInfo(type: BlockType) {
  return BLOCK_TYPES[type] || null
}

export function getAllBlockTypes() {
  return Object.entries(BLOCK_TYPES).map(([key, value]) => ({
    type: key as BlockType,
    ...value
  }))
}

export function getBlocksByCategory(category: 'content' | 'social' | 'community') {
  return getAllBlockTypes().filter(block => block.category === category)
}
