// Platform-specific custom emojis for Chapturs
export interface CustomEmoji {
  id: string
  name: string
  shortcode: string
  imageUrl?: string
  emoji?: string
  category: 'chapturs'
}

// Custom platform emojis (can be expanded in the future)
export const CUSTOM_EMOJIS: CustomEmoji[] = [
  {
    id: 'chapturs_fire',
    name: 'Chapturs Fire',
    shortcode: ':chapturs_fire:',
    emoji: '🔥',
    category: 'chapturs'
  },
  {
    id: 'chapturs_star',
    name: 'Chapturs Star',
    shortcode: ':chapturs_star:',
    emoji: '⭐',
    category: 'chapturs'
  },
  {
    id: 'chapturs_heart',
    name: 'Chapturs Heart',
    shortcode: ':chapturs_heart:',
    emoji: '❤️',
    category: 'chapturs'
  }
  // Future custom emojis with imageUrl can be added here
]

// Get custom emoji by shortcode
export function getCustomEmojiByShortcode(shortcode: string): CustomEmoji | undefined {
  return CUSTOM_EMOJIS.find(e => e.shortcode === shortcode)
}
