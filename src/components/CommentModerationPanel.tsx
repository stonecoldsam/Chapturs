'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { AlertTriangle, Eye, Check, X } from 'lucide-react'

interface CommentReport {
  id: string
  commentId: string
  userId: string
  reason: string
  details: string | null
  status: string
  createdAt: string
  comment: {
    id: string
    content: string
    createdAt: string
    user: {
      id: string
      username: string
      displayName: string | null
    }
    work: {
      id: string
      title: string
    }
    section: {
      id: string
      title: string
    } | null
  }
  user: {
    id: string
    username: string
    displayName: string | null
  }
}

export default function CommentModerationPanel() {
  const [reports, setReports] = useState<CommentReport[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'pending' | 'reviewed' | 'actioned' | 'all'>('pending')
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchReports()
  }, [status])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status, limit: '50' })
      const response = await fetch(`/api/creator/moderation/comments?${params}`)
      const data = await response.json()

      if (response.ok) {
        setReports(data.reports)
        setCounts(data.counts)
      } else {
        console.error('Failed to fetch reports:', data.error)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleHideComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHidden: true })
      })

      if (response.ok) {
        fetchReports() // Refresh list
      }
    } catch (error) {
      console.error('Error hiding comment:', error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchReports() // Refresh list
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'spam':
        return 'bg-yellow-100 text-yellow-800'
      case 'harassment':
        return 'bg-red-100 text-red-800'
      case 'spoiler':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Comment Moderation</h1>
        <p className="text-gray-600">Manage reported comments on your works</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-orange-600">{counts.pending || 0}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Reviewed</div>
          <div className="text-2xl font-bold text-blue-600">{counts.reviewed || 0}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Actioned</div>
          <div className="text-2xl font-bold text-green-600">{counts.actioned || 0}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold text-gray-900">
            {Object.values(counts).reduce((sum, count) => sum + count, 0)}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {(['pending', 'reviewed', 'actioned', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatus(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              status === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Reports list */}
      {reports.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AlertTriangle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No reports found</p>
          <p className="text-sm text-gray-400 mt-1">
            {status === 'pending'
              ? 'No pending reports at the moment'
              : `No ${status} reports to show`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg border border-gray-200 p-6 space-y-4"
            >
              {/* Report header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReasonColor(report.reason)}`}>
                      {report.reason}
                    </span>
                    <span className="text-sm text-gray-500">
                      Reported {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Reported by{' '}
                    <span className="font-medium">
                      {report.user.displayName || report.user.username}
                    </span>
                  </div>
                </div>
              </div>

              {/* Work & section info */}
              <div className="text-sm text-gray-600">
                <span className="font-medium">{report.comment.work.title}</span>
                {report.comment.section && (
                  <> - {report.comment.section.title}</>
                )}
              </div>

              {/* Comment content */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {report.comment.user.displayName || report.comment.user.username}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(report.comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {report.comment.content}
                </p>
              </div>

              {/* Report details */}
              {report.details && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Details:</span> {report.details}
                </div>
              )}

              {/* Actions */}
              {report.status === 'pending' && (
                <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => handleHideComment(report.comment.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700"
                  >
                    <Eye className="w-4 h-4" />
                    Hide Comment
                  </button>
                  <button
                    onClick={() => handleDeleteComment(report.comment.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                    Delete Comment
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Check className="w-4 h-4" />
                    Dismiss Report
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
