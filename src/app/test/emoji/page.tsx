'use client'

import { useState } from 'react'
import EmojiPicker from '@/components/EmojiPicker'
import RichTextEditor from '@/components/RichTextEditor'
import CommentForm from '@/components/CommentForm'

export default function EmojiTestPage() {
  const [showPicker, setShowPicker] = useState(false)
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([])
  const [richTextContent, setRichTextContent] = useState('')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Emoji System Test Page
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the emoji picker and integration across different components
          </p>
        </div>

        {/* Test 1: Basic Emoji Picker */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Test 1: Basic Emoji Picker
          </h2>
          <div className="space-y-4">
            <div className="relative inline-block">
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {showPicker ? 'Close' : 'Open'} Emoji Picker
              </button>
              {showPicker && (
                <EmojiPicker
                  onSelect={(emoji) => {
                    setSelectedEmojis([...selectedEmojis, emoji])
                    setShowPicker(false)
                  }}
                  onClose={() => setShowPicker(false)}
                  position="bottom-left"
                />
              )}
            </div>
            
            {selectedEmojis.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Selected Emojis:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedEmojis.map((emoji, index) => (
                    <span key={index} className="text-3xl">
                      {emoji}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setSelectedEmojis([])}
                  className="mt-2 text-sm text-red-600 hover:text-red-700"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Test 2: RichTextEditor with Emoji */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Test 2: Rich Text Editor with Emoji Button
          </h2>
          <RichTextEditor
            value={richTextContent}
            onChange={setRichTextContent}
            placeholder="Type here and click the emoji button to insert emojis..."
            minHeight="200px"
          />
          {richTextContent && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                HTML Output:
              </h3>
              <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-xs overflow-x-auto">
                {richTextContent}
              </pre>
            </div>
          )}
        </div>

        {/* Test 3: Comment Form with Emoji */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Test 3: Comment Form with Emoji Button
          </h2>
          <CommentForm
            workId="test-work-id"
            onCommentAdded={(comment) => {
              console.log('Comment added:', comment)
              alert('Comment submitted! Check console for details.')
            }}
            placeholder="Write a comment with emojis..."
          />
        </div>

        {/* Test 4: Dark Mode Toggle */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Test 4: Dark Mode
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The emoji picker supports both light and dark modes. Toggle your system theme to test.
          </p>
          <button
            onClick={() => {
              document.documentElement.classList.toggle('dark')
            }}
            className="px-4 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-500"
          >
            Toggle Dark Mode
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Testing Instructions
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200">
            <li>✅ Click emoji buttons to open the picker</li>
            <li>✅ Search for emojis using the search bar</li>
            <li>✅ Browse different emoji categories</li>
            <li>✅ Select emojis to insert them</li>
            <li>✅ Test on mobile devices (touch-friendly)</li>
            <li>✅ Verify recently used emojis appear at the top</li>
            <li>✅ Check dark mode compatibility</li>
            <li>✅ Test click-outside-to-close functionality</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
