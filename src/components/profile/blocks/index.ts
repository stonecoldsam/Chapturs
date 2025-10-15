/**
 * Block Registry - v0.1
 * Central registry for all profile block types
 * Maps block type strings to their corresponding components
 */

import WorkCardBlock from './WorkCardBlock'
import TextBoxBlock from './TextBoxBlock'
import YouTubeVideoBlock from './YouTubeVideoBlock'
import FavoriteAuthorBlock from './FavoriteAuthorBlock'
import ExternalLinkBlock from './ExternalLinkBlock'
import DiscordInviteBlock from './DiscordInviteBlock'
import TwitchChannelBlock from './TwitchChannelBlock'
import YouTubeChannelBlock from './YouTubeChannelBlock'
import TwitterFeedBlock from './TwitterFeedBlock'
import SupportBlock from './SupportBlock'

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
  },
  'favorite-author': {
    component: FavoriteAuthorBlock,
    name: 'Favorite Author',
    description: 'Showcase and promote another creator',
    defaultSize: { width: 1, height: 1 },
    icon: '⭐',
    category: 'community'
  },
  'external-link': {
    component: ExternalLinkBlock,
    name: 'External Link',
    description: 'Link to external sites (Patreon, Ko-fi, etc.)',
    defaultSize: { width: 1, height: 1 },
    icon: '🔗',
    category: 'social'
  },
  'discord-invite': {
    component: DiscordInviteBlock,
    name: 'Discord Server',
    description: 'Invite visitors to your Discord community',
    defaultSize: { width: 1, height: 1 },
    icon: '💬',
    category: 'community'
  },
  'twitch-channel': {
    component: TwitchChannelBlock,
    name: 'Twitch Channel',
    description: 'Show your Twitch stream and live status',
    defaultSize: { width: 2, height: 1 },
    icon: '🎮',
    category: 'social'
  },
  'youtube-channel': {
    component: YouTubeChannelBlock,
    name: 'YouTube Channel',
    description: 'Link to your YouTube channel',
    defaultSize: { width: 2, height: 1 },
    icon: '📺',
    category: 'social'
  },
  'twitter-feed': {
    component: TwitterFeedBlock,
    name: 'Twitter/X Feed',
    description: 'Display your Twitter profile and recent posts',
    defaultSize: { width: 1, height: 2 },
    icon: '🐦',
    category: 'social'
  }
  ,
  'support': {
    component: SupportBlock,
    name: 'Support (Chapturs First)',
    description: 'Prominent support CTA with optional secondary links',
    defaultSize: { width: 2, height: 1 },
    icon: '❤️',
    category: 'social'
  }
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
