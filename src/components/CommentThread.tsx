'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, MoreVertical, Trash2, Edit3, Check, X } from 'lucide-react'

export interface Comment {
  id: string
  blockId: string
  userId: string
  userName: string
  userAvatar?: string
  text: string
  createdAt: string
  updatedAt?: string
  resolved: boolean
  parentId?: string
  replies?: Comment[]
}

interface CommentThreadProps {
  blockId: string
  chapterId: string
  workId: string
  comments: Comment[]
  currentUserId?: string
  onAddComment?: (text: string, parentId?: string) => Promise<void>
  onEditComment?: (commentId: string, newText: string) => Promise<void>
  onDeleteComment?: (commentId: string) => Promise<void>
  onResolveThread?: (commentId: string) => Promise<void>
  position?: { top: number; left: number }
  onClose?: () => void
}

export default function CommentThread({
  blockId,
  chapterId,
  workId,
  comments = [],
  currentUserId,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onResolveThread,
  position,
  onClose
}: CommentThreadProps) {
  
  const [newCommentText, setNewCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const threadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-focus on input when thread opens
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    // Handle clicking outside to close
    const handleClickOutside = (event: MouseEvent) => {
      if (threadRef.current && !threadRef.current.contains(event.target as Node)) {
        onClose?.()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleSubmitComment = async () => {
    if (!newCommentText.trim() || !onAddComment) return

    setLoading(true)
    try {
      await onAddComment(newCommentText)
      setNewCommentText('')
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim() || !onAddComment) return

    setLoading(true)
    try {
      await onAddComment(replyText, parentId)
      setReplyText('')
      setReplyingTo(null)
    } catch (error) {
      console.error('Failed to add reply:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim() || !onEditComment) return

    setLoading(true)
    try {
      await onEditComment(commentId, editText)
      setEditingComment(null)
      setEditText('')
    } catch (error) {
      console.error('Failed to edit comment:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const renderComment = (comment: Comment, isReply = false) => {
    const isEditing = editingComment === comment.id
    const canEdit = currentUserId === comment.userId
    const isResolved = comment.resolved

    return (
      <div
        key={comment.id}
        className={`${isReply ? 'ml-8 pl-3 border-l-2 border-gray-200 dark:border-gray-700' : ''} mb-3`}
      >
        <div className="flex gap-2">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.userAvatar ? (
              <img
                src={comment.userAvatar}
                alt={comment.userName}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                {comment.userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  {comment.userName}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(comment.createdAt)}
                </span>
                {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">(edited)</span>
                )}
                {isResolved && (
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                    Resolved
                  </span>
                )}
              </div>

              {/* Actions Menu */}
              {canEdit && !isResolved && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingComment(comment.id)
                      setEditText(comment.text)
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                    title="Edit"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => onDeleteComment?.(comment.id)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Comment Text or Edit Form */}
            {isEditing ? (
              <div className="mb-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  rows={2}
                  autoFocus
                />
                <div className="flex justify-end gap-2 mt-1">
                  <button
                    onClick={() => {
                      setEditingComment(null)
                      setEditText('')
                    }}
                    className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleEditComment(comment.id)}
                    disabled={!editText.trim()}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 whitespace-pre-wrap">
                {comment.text}
              </p>
            )}

            {/* Reply Button */}
            {!isResolved && !isEditing && (
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Reply
              </button>
            )}

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className="mt-2 mb-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  rows={2}
                  autoFocus
                />
                <div className="flex justify-end gap-2 mt-1">
                  <button
                    onClick={() => {
                      setReplyingTo(null)
                      setReplyText('')
                    }}
                    className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={!replyText.trim() || loading}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Reply
                  </button>
                </div>
              </div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-2">
                {comment.replies.map(reply => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const rootComments = comments.filter(c => !c.parentId)
  const hasUnresolvedComments = comments.some(c => !c.resolved)

  return (
    <div
      ref={threadRef}
      className="w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl flex flex-col max-h-[500px]"
      style={position ? { position: 'absolute', top: position.top, left: position.left } : {}}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-blue-600" />
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Comments</h4>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({comments.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasUnresolvedComments && onResolveThread && (
            <button
              onClick={() => rootComments[0] && onResolveThread(rootComments[0].id)}
              className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
            >
              Resolve
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div>
            {rootComments.map(comment => renderComment(comment))}
          </div>
        )}
      </div>

      {/* New Comment Input */}
      {!comments[0]?.resolved && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex-shrink-0">
          <textarea
            ref={inputRef}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded resize-none mb-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmitComment()
              }
            }}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Cmd/Ctrl + Enter to send
            </span>
            <button
              onClick={handleSubmitComment}
              disabled={!newCommentText.trim() || loading}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Send size={14} />
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
