import { useState, useEffect, useCallback } from 'react'
import { searchEmojis, getEmojiByShortcode, EmojiData } from '@/lib/emoji/emojiData'

interface UseEmojiAutocompleteOptions {
  onSelect?: (emoji: string) => void
  triggerChar?: string
}

export function useEmojiAutocomplete({
  onSelect,
  triggerChar = ':'
}: UseEmojiAutocompleteOptions = {}) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<EmojiData[]>([])
  const [isActive, setIsActive] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Search for emojis when query changes
  useEffect(() => {
    if (query) {
      const results = searchEmojis(query)
      setSuggestions(results)
      setSelectedIndex(0)
    } else {
      setSuggestions([])
      setSelectedIndex(0)
    }
  }, [query])

  // Handle text input
  const handleInput = useCallback((text: string, cursorPosition: number) => {
    // Find trigger character before cursor
    const textBeforeCursor = text.substring(0, cursorPosition)
    const lastTriggerIndex = textBeforeCursor.lastIndexOf(triggerChar)

    if (lastTriggerIndex !== -1) {
      const afterTrigger = textBeforeCursor.substring(lastTriggerIndex + 1)
      
      // Check if there's a space after trigger (if so, autocomplete is not active)
      if (!afterTrigger.includes(' ') && afterTrigger.length > 0) {
        setQuery(afterTrigger)
        setIsActive(true)
        return true
      }
    }

    // Deactivate if no valid trigger found
    if (isActive) {
      setIsActive(false)
      setQuery('')
    }
    return false
  }, [isActive, triggerChar])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive || suggestions.length === 0) return false

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setSelectedIndex(prev => (prev + 1) % suggestions.length)
        return true
      case 'ArrowUp':
        event.preventDefault()
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length)
        return true
      case 'Enter':
      case 'Tab':
        event.preventDefault()
        if (suggestions[selectedIndex]) {
          selectEmoji(suggestions[selectedIndex].emoji)
        }
        return true
      case 'Escape':
        event.preventDefault()
        setIsActive(false)
        setQuery('')
        return true
      default:
        return false
    }
  }, [isActive, suggestions, selectedIndex])

  // Select an emoji
  const selectEmoji = useCallback((emoji: string) => {
    if (onSelect) {
      onSelect(emoji)
    }
    setIsActive(false)
    setQuery('')
    setSuggestions([])
  }, [onSelect])

  // Convert shortcode to emoji
  const convertShortcode = useCallback((text: string): string => {
    return text.replace(/:(\w+):/g, (match, shortcode) => {
      const emoji = getEmojiByShortcode(shortcode)
      return emoji || match
    })
  }, [])

  return {
    isActive,
    query,
    suggestions,
    selectedIndex,
    handleInput,
    handleKeyDown,
    selectEmoji,
    convertShortcode,
    reset: () => {
      setIsActive(false)
      setQuery('')
      setSuggestions([])
      setSelectedIndex(0)
    }
  }
}
