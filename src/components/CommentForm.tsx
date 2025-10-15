'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

interface CommentFormProps {
  workId: string
  sectionId?: string
  parentId?: string
  onCommentAdded: (comment: any) => void
  onCancel?: () => void
  placeholder?: string
  autoFocus?: boolean
}

export default function CommentForm({
  workId,
  sectionId,
  parentId,
  onCommentAdded,
  onCancel,
  placeholder = 'Write a comment...',
  autoFocus = false
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      setError('Comment cannot be empty')
      return
    }

    if (content.length > 5000) {
      setError('Comment is too long (max 5000 characters)')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/works/${workId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          sectionId: sectionId || null,
          parentId: parentId || null
        })
      })

      const data = await response.json()

      if (response.ok) {
        onCommentAdded(data.comment)
        setContent('')
        onCancel?.()
      } else {
        setError(data.error || 'Failed to post comment')
      }
    } catch (error) {
      console.error('Error posting comment:', error)
      setError('Failed to post comment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={3}
          maxLength={5000}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">
            {content.length}/5000 characters
          </span>
          {error && (
            <span className="text-xs text-red-600">{error}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Posting...' : parentId ? 'Reply' : 'Comment'}
        </button>
      </div>
    </form>
  )
}
