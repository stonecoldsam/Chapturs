'use client'

import { useState, useEffect } from 'react'
import { Edit3, Check, X, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react'

export interface EditSuggestion {
  id: string
  blockId: string
  chapterId: string
  originalText: string
  suggestedText: string
  reason?: string
  status: 'pending' | 'approved' | 'rejected'
  suggestedBy: string
  suggestedByName: string
  createdAt: string
  votes: number
  userVote?: 'up' | 'down' | null
}

interface EditSuggestionModalProps {
  blockId: string
  chapterId: string
  workId: string
  selectedText: string
  selectionRange?: { start: number; end: number }
  currentUserId?: string
  currentUserName?: string
  onClose: () => void
  onSubmit?: (suggestion: Omit<EditSuggestion, 'id' | 'createdAt' | 'votes' | 'userVote' | 'status'>) => Promise<void>
  position?: { top: number; left: number }
}

export default function EditSuggestionModal({
  blockId,
  chapterId,
  workId,
  selectedText,
  selectionRange,
  currentUserId,
  currentUserName,
  onClose,
  onSubmit,
  position
}: EditSuggestionModalProps) {
  
  const [suggestedText, setSuggestedText] = useState(selectedText)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Reset when selected text changes
    setSuggestedText(selectedText)
    setReason('')
    setError('')
  }, [selectedText])

  const handleSubmit = async () => {
    if (!suggestedText.trim()) {
      setError('Please provide a suggested correction')
      return
    }

    if (suggestedText === selectedText) {
      setError('Your suggestion is the same as the original text')
      return
    }

    if (!currentUserId) {
      setError('Please sign in to submit suggestions')
      return
    }

    setLoading(true)
    setError('')

    try {
      const suggestion: Omit<EditSuggestion, 'id' | 'createdAt' | 'votes' | 'userVote' | 'status'> = {
        blockId,
        chapterId,
        originalText: selectedText,
        suggestedText: suggestedText.trim(),
        reason: reason.trim() || undefined,
        suggestedBy: currentUserId,
        suggestedByName: currentUserName || 'Anonymous'
      }

      if (onSubmit) {
        await onSubmit(suggestion)
      } else {
        // Default: call API directly
        const response = await fetch('/api/edit-suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...suggestion,
            workId
          })
        })

        if (!response.ok) {
          throw new Error('Failed to submit suggestion')
        }
      }

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit suggestion')
    } finally {
      setLoading(false)
    }
  }

  const getDiff = () => {
    // Simple diff highlighting - can be enhanced with a proper diff library
    if (selectedText === suggestedText) return null

    return (
      <div className="text-sm space-y-2">
        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
          <div className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">Original:</div>
          <div className="text-gray-900 dark:text-gray-100 line-through">{selectedText}</div>
        </div>
        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
          <div className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Suggested:</div>
          <div className="text-gray-900 dark:text-gray-100 font-medium">{suggestedText}</div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4"
      style={position ? { position: 'absolute', top: position.top, left: position.left, zIndex: 50 } : {}}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Edit3 size={18} className="text-blue-600" />
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Suggest Edit</h4>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
        >
          <X size={18} />
        </button>
      </div>

      {/* Original Text (Read-only) */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Original text:
        </label>
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
          {selectedText}
        </div>
      </div>

      {/* Suggested Text */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Your suggestion:
        </label>
        <textarea
          value={suggestedText}
          onChange={(e) => setSuggestedText(e.target.value)}
          placeholder="Enter your suggested correction..."
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          rows={3}
          autoFocus
        />
      </div>

      {/* Reason */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Reason (optional):
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g., Grammar error, typo, better phrasing..."
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {/* Diff Preview */}
      {getDiff()}

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !suggestedText.trim() || suggestedText === selectedText}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? 'Submitting...' : (
            <>
              <Check size={16} />
              Submit Suggestion
            </>
          )}
        </button>
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
        The author will review your suggestion and can choose to accept or reject it.
      </p>
    </div>
  )
}

// ============================================================================
// EDIT SUGGESTION DISPLAY COMPONENT (for author review)
// ============================================================================

interface EditSuggestionCardProps {
  suggestion: EditSuggestion
  onApprove?: (suggestionId: string) => Promise<void>
  onReject?: (suggestionId: string) => Promise<void>
  onVote?: (suggestionId: string, vote: 'up' | 'down') => Promise<void>
  isAuthor?: boolean
  showActions?: boolean
}

export function EditSuggestionCard({
  suggestion,
  onApprove,
  onReject,
  onVote,
  isAuthor = false,
  showActions = true
}: EditSuggestionCardProps) {
  
  const [loading, setLoading] = useState(false)

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(true)
    try {
      if (action === 'approve' && onApprove) {
        await onApprove(suggestion.id)
      } else if (action === 'reject' && onReject) {
        await onReject(suggestion.id)
      }
    } catch (error) {
      console.error(`Failed to ${action} suggestion:`, error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (vote: 'up' | 'down') => {
    if (onVote) {
      await onVote(suggestion.id, vote)
    }
  }

  const getStatusBadge = () => {
    switch (suggestion.status) {
      case 'approved':
        return <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full flex items-center gap-1"><Check size={10} /> Approved</span>
      case 'rejected':
        return <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full flex items-center gap-1"><X size={10} /> Rejected</span>
      case 'pending':
      default:
        return <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">Pending</span>
    }
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {suggestion.suggestedByName}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(suggestion.createdAt).toLocaleDateString()}
          </span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Diff */}
      <div className="space-y-2 mb-3">
        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
          <div className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">Original:</div>
          <div className="text-sm text-gray-900 dark:text-gray-100 line-through">{suggestion.originalText}</div>
        </div>
        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
          <div className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Suggested:</div>
          <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">{suggestion.suggestedText}</div>
        </div>
      </div>

      {/* Reason */}
      {suggestion.reason && (
        <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Reason:</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{suggestion.reason}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        {/* Voting (for non-authors or pending suggestions) */}
        {(!isAuthor || suggestion.status === 'pending') && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVote('up')}
              className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
                suggestion.userVote === 'up' ? 'text-blue-600' : 'text-gray-400'
              }`}
              disabled={isAuthor}
            >
              <ThumbsUp size={16} />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[24px] text-center">
              {suggestion.votes}
            </span>
            <button
              onClick={() => handleVote('down')}
              className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
                suggestion.userVote === 'down' ? 'text-red-600' : 'text-gray-400'
              }`}
              disabled={isAuthor}
            >
              <ThumbsDown size={16} />
            </button>
          </div>
        )}

        {/* Author Actions */}
        {isAuthor && showActions && suggestion.status === 'pending' && (
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => handleAction('reject')}
              disabled={loading}
              className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 rounded hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
            >
              Reject
            </button>
            <button
              onClick={() => handleAction('approve')}
              disabled={loading}
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
            >
              <Check size={14} />
              {loading ? 'Approving...' : 'Approve'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
