// Emoji data and utilities for autocomplete and quick access
export interface EmojiData {
  emoji: string
  name: string
  shortcode: string
  category: string
  keywords: string[]
}

// Common emoji mappings for autocomplete (shortcode -> emoji)
export const EMOJI_MAP: Record<string, string> = {
  // Smileys & Emotion
  'smile': '😊',
  'smiley': '😃',
  'grin': '😁',
  'laughing': '😆',
  'joy': '😂',
  'rofl': '🤣',
  'heart_eyes': '😍',
  'kissing_heart': '😘',
  'relaxed': '☺️',
  'blush': '😊',
  'thinking': '🤔',
  'neutral_face': '😐',
  'expressionless': '😑',
  'no_mouth': '😶',
  'smirk': '😏',
  'unamused': '😒',
  'grimacing': '😬',
  'lying_face': '🤥',
  'relieved': '😌',
  'pensive': '😔',
  'sleepy': '��',
  'drooling_face': '🤤',
  'sleeping': '😴',
  'mask': '😷',
  'face_with_thermometer': '🤒',
  'face_with_head_bandage': '��',
  'nauseated_face': '🤢',
  'sneezing_face': '🤧',
  'dizzy_face': '😵',
  'cowboy_hat_face': '🤠',
  'sunglasses': '😎',
  'nerd_face': '🤓',
  'confused': '😕',
  'worried': '😟',
  'slightly_frowning_face': '🙁',
  'frowning_face': '☹️',
  'persevere': '😣',
  'confounded': '😖',
  'tired_face': '😫',
  'weary': '😩',
  'triumph': '😤',
  'angry': '😠',
  'rage': '😡',
  'sob': '😭',
  'disappointed': '😞',
  'sweat': '😓',
  'cry': '😢',
  'scream': '😱',
  'fearful': '😨',
  'cold_sweat': '😰',
  'hushed': '😯',
  'flushed': '😳',
  'astonished': '😲',
  'zipper_mouth_face': '🤐',
  'star_struck': '🤩',
  'yum': '😋',
  'stuck_out_tongue': '😛',
  'stuck_out_tongue_winking_eye': '😜',
  'zany_face': '🤪',
  'stuck_out_tongue_closed_eyes': '😝',
  'money_mouth_face': '🤑',
  'hugs': '🤗',
  'hand_over_mouth': '🤭',
  'shushing_face': '🤫',
  
  // Hearts
  'heart': '❤️',
  'orange_heart': '🧡',
  'yellow_heart': '💛',
  'green_heart': '💚',
  'blue_heart': '💙',
  'purple_heart': '💜',
  'black_heart': '🖤',
  'brown_heart': '🤎',
  'white_heart': '🤍',
  'broken_heart': '💔',
  'sparkling_heart': '💖',
  'heartpulse': '💗',
  'heartbeat': '💓',
  'revolving_hearts': '💞',
  'two_hearts': '💕',
  'heart_decoration': '💟',
  'cupid': '💘',
  
  // People & Body
  'wave': '👋',
  'raised_hand': '✋',
  'hand': '✋',
  'ok_hand': '👌',
  'thumbsup': '👍',
  'thumbsdown': '👎',
  'fist': '✊',
  'facepunch': '👊',
  'clap': '👏',
  'pray': '🙏',
  'muscle': '💪',
  'eyes': '👀',
  'brain': '🧠',
  
  // Animals & Nature
  'dog': '🐶',
  'cat': '🐱',
  'mouse': '🐭',
  'hamster': '🐹',
  'rabbit': '🐰',
  'fox': '🦊',
  'bear': '🐻',
  'panda_face': '🐼',
  'koala': '🐨',
  'tiger': '🐯',
  'lion': '🦁',
  'cow': '🐮',
  'pig': '🐷',
  'frog': '🐸',
  'monkey_face': '🐵',
  'see_no_evil': '🙈',
  'hear_no_evil': '🙉',
  'speak_no_evil': '🙊',
  'unicorn': '🦄',
  'dragon': '🐉',
  'dragon_face': '🐲',
  'fire': '🔥',
  'sparkles': '✨',
  'star': '⭐',
  'boom': '💥',
  'zap': '⚡',
  'comet': '☄️',
  'sunny': '☀️',
  'cloud': '☁️',
  'rainbow': '🌈',
  'snowflake': '❄️',
  'snowman': '⛄',
  'rose': '🌹',
  'tulip': '🌷',
  'blossom': '🌼',
  'sunflower': '🌻',
  'cherry_blossom': '🌸',
  'leaves': '🍃',
  'four_leaf_clover': '🍀',
  'seedling': '🌱',
  'evergreen_tree': '🌲',
  'deciduous_tree': '🌳',
  'palm_tree': '🌴',
  'cactus': '🌵',
  'mushroom': '🍄',
  
  // Food & Drink
  'pizza': '🍕',
  'hamburger': '🍔',
  'fries': '🍟',
  'hotdog': '🌭',
  'taco': '🌮',
  'burrito': '🌯',
  'sushi': '🍣',
  'ramen': '🍜',
  'curry': '🍛',
  'rice': '🍚',
  'spaghetti': '🍝',
  'bread': '🍞',
  'cake': '🍰',
  'birthday': '🎂',
  'cupcake': '🧁',
  'cookie': '🍪',
  'chocolate_bar': '🍫',
  'candy': '🍬',
  'lollipop': '🍭',
  'doughnut': '🍩',
  'ice_cream': '🍨',
  'shaved_ice': '🍧',
  'apple': '🍎',
  'banana': '🍌',
  'grapes': '🍇',
  'strawberry': '🍓',
  'watermelon': '🍉',
  'peach': '🍑',
  'cherries': '🍒',
  'lemon': '🍋',
  'avocado': '🥑',
  'eggplant': '🍆',
  'corn': '🌽',
  'carrot': '🥕',
  'broccoli': '��',
  'coffee': '☕',
  'tea': '🍵',
  'beer': '🍺',
  'wine_glass': '🍷',
  'cocktail': '🍸',
  'tropical_drink': '🍹',
  
  // Activities
  'soccer': '⚽',
  'basketball': '🏀',
  'football': '🏈',
  'baseball': '⚾',
  'tennis': '🎾',
  'volleyball': '🏐',
  '8ball': '🎱',
  'trophy': '🏆',
  'medal': '🏅',
  'guitar': '🎸',
  'violin': '🎻',
  'musical_note': '🎵',
  'notes': '🎶',
  'microphone': '🎤',
  'headphones': '🎧',
  'art': '🎨',
  'game_die': '🎲',
  'dart': '🎯',
  'clapper': '🎬',
  'movie_camera': '🎥',
  'camera': '📷',
  'video_camera': '📹',
  
  // Travel & Places
  'rocket': '🚀',
  'airplane': '✈️',
  'car': '🚗',
  'taxi': '🚕',
  'bus': '🚌',
  'train': '🚆',
  'bike': '🚲',
  'scooter': '🛴',
  'ship': '🚢',
  'anchor': '⚓',
  'sailboat': '⛵',
  'mountain': '⛰️',
  'camping': '🏕️',
  'beach': '🏖️',
  'desert': '🏜️',
  'island': '🏝️',
  'cityscape': '🏙️',
  'house': '🏠',
  'building': '🏢',
  'castle': '🏰',
  'hotel': '🏨',
  'church': '⛪',
  'mosque': '🕌',
  'statue_of_liberty': '🗽',
  
  // Objects
  'watch': '⌚',
  'phone': '📱',
  'computer': '💻',
  'keyboard': '⌨️',
  'desktop': '🖥️',
  'printer': '🖨️',
  'mouse_three_button': '🖱️',
  'joystick': '🕹️',
  'book': '📖',
  'books': '📚',
  'notebook': '📓',
  'ledger': '��',
  'page_facing_up': '📄',
  'newspaper': '📰',
  'bookmark': '🔖',
  'label': '🏷️',
  'moneybag': '💰',
  'gem': '💎',
  'hourglass': '⌛',
  'hourglass_flowing_sand': '⏳',
  'alarm_clock': '⏰',
  'stopwatch': '⏱️',
  'timer': '⏲️',
  'mag': '🔍',
  'mag_right': '🔎',
  'bulb': '💡',
  'flashlight': '🔦',
  'candle': '🕯️',
  'fire_extinguisher': '🧯',
  'key': '🔑',
  'lock': '🔒',
  'unlock': '🔓',
  'bell': '🔔',
  'gift': '🎁',
  'ribbon': '🎀',
  'balloon': '🎈',
  'tada': '🎉',
  'confetti_ball': '🎊',
  
  // Symbols
  'check': '✅',
  'x': '❌',
  'bangbang': '‼️',
  'question': '❓',
  'grey_question': '❔',
  'grey_exclamation': '❕',
  'exclamation': '❗',
  'warning': '⚠️',
  'no_entry': '⛔',
  'white_check_mark': '✅',
  'heavy_check_mark': '✔️',
  'cross_mark': '❌',
  'plus': '➕',
  'minus': '➖',
  'heavy_multiplication_x': '✖️',
  'heavy_division_sign': '➗',
  'arrow_right': '➡️',
  'arrow_left': '⬅️',
  'arrow_up': '⬆️',
  'arrow_down': '⬇️',
  'arrow_upper_right': '↗️',
  'arrow_lower_right': '↘️',
  'arrow_lower_left': '↙️',
  'arrow_upper_left': '↖️',
  'arrow_up_down': '↕️',
  'left_right_arrow': '↔️',
  'recycle': '♻️',
  'radioactive': '☢️',
  'biohazard': '☣️',
  'peace': '☮️',
  'atom': '⚛️',
  'yin_yang': '☯️',
  'star_of_david': '✡️',
  'wheel_of_dharma': '☸️',
  'infinity': '♾️',
  'copyright': '©️',
  'registered': '®️',
  'tm': '™️'
}

// Get emoji by shortcode
export function getEmojiByShortcode(shortcode: string): string | undefined {
  return EMOJI_MAP[shortcode.toLowerCase().replace(/:/g, '')]
}

// Search emojis by query
export function searchEmojis(query: string): EmojiData[] {
  if (!query) return []
  
  const lowerQuery = query.toLowerCase().replace(/:/g, '')
  const results: EmojiData[] = []
  
  Object.entries(EMOJI_MAP).forEach(([shortcode, emoji]) => {
    if (shortcode.includes(lowerQuery)) {
      results.push({
        emoji,
        name: shortcode.replace(/_/g, ' '),
        shortcode: `:${shortcode}:`,
        category: 'general',
        keywords: [shortcode]
      })
    }
  })
  
  return results.slice(0, 10) // Limit to 10 results
}

// Get recently used emojis from localStorage
export function getRecentEmojis(): string[] {
  if (typeof window === 'undefined') return []
  
  try {
    const recent = localStorage.getItem('chapturs_recent_emojis')
    return recent ? JSON.parse(recent) : []
  } catch {
    return []
  }
}

// Add emoji to recently used
export function addRecentEmoji(emoji: string): void {
  if (typeof window === 'undefined') return
  
  try {
    let recent = getRecentEmojis()
    // Remove if already exists
    recent = recent.filter(e => e !== emoji)
    // Add to front
    recent.unshift(emoji)
    // Keep only last 20
    recent = recent.slice(0, 20)
    
    localStorage.setItem('chapturs_recent_emojis', JSON.stringify(recent))
  } catch {
    // Ignore localStorage errors
  }
}
