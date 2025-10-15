'use client'

import { useState, useEffect } from 'react'
import { MessageSquare } from 'lucide-react'
import CommentForm from './CommentForm'
import CommentItem from './CommentItem'

interface Comment {
  id: string
  workId: string
  sectionId: string | null
  userId: string
  content: string
  parentId: string | null
  isEdited: boolean
  isPinned: boolean
  isHidden: boolean
  editedAt: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    username: string
    displayName: string | null
    avatar: string | null
  }
  likeCount: number
  replyCount: number
  hasMoreReplies: boolean
  replies: Comment[]
}

interface CommentSectionProps {
  workId: string
  sectionId?: string
  canComment: boolean
  isCreator: boolean
  currentUserId?: string
}

export default function CommentSection({
  workId,
  sectionId,
  canComment,
  isCreator,
  currentUserId
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<'newest' | 'oldest' | 'most-liked'>('newest')
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchComments = async (cursor?: string) => {
    try {
      const params = new URLSearchParams({
        sort: sort === 'most-liked' ? 'newest' : sort, // API doesn't support most-liked yet
        limit: '20'
      })

      if (sectionId) {
        params.append('sectionId', sectionId)
      }

      if (cursor) {
        params.append('cursor', cursor)
      }

      const response = await fetch(`/api/works/${workId}/comments?${params}`)
      const data = await response.json()

      if (response.ok) {
        if (cursor) {
          setComments(prev => [...prev, ...data.comments])
        } else {
          setComments(data.comments)
        }
        setHasMore(data.hasMore)
        setNextCursor(data.nextCursor)
      } else {
        console.error('Failed to fetch comments:', data.error)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchComments()
  }, [workId, sectionId, sort])

  const handleCommentAdded = (newComment: Comment) => {
    setComments(prev => [newComment, ...prev])
  }

  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments(prev =>
      prev.map(comment =>
        comment.id === updatedComment.id ? updatedComment : comment
      )
    )
  }

  const handleCommentDeleted = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId))
  }

  const handleReplyAdded = (parentId: string, reply: Comment) => {
    setComments(prev =>
      prev.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), reply],
            replyCount: comment.replyCount + 1
          }
        }
        return comment
      })
    )
  }

  const loadMoreComments = () => {
    if (nextCursor && !loadingMore) {
      setLoadingMore(true)
      fetchComments(nextCursor)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900">
            Comments ({comments.length})
          </h2>
        </div>

        {/* Sort dropdown */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="most-liked">Most Liked</option>
        </select>
      </div>

      {/* Comment form */}
      {canComment && (
        <CommentForm
          workId={workId}
          sectionId={sectionId}
          onCommentAdded={handleCommentAdded}
        />
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No comments yet</p>
          <p className="text-sm text-gray-400 mt-1">
            {canComment ? 'Be the first to comment!' : 'Sign in to leave a comment'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              workId={workId}
              isCreator={isCreator}
              currentUserId={currentUserId}
              onCommentUpdated={handleCommentUpdated}
              onCommentDeleted={handleCommentDeleted}
              onReplyAdded={handleReplyAdded}
            />
          ))}
        </div>
      )}

      {/* Load more button */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={loadMoreComments}
            disabled={loadingMore}
            className="px-6 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            {loadingMore ? 'Loading...' : 'Load More Comments'}
          </button>
        </div>
      )}
    </div>
  )
}
