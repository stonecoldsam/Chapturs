// ImageUpload Component - Reusable upload UI for all image types
// Free tier optimized with warnings and progress tracking

'use client'

import { useState, useRef, useEffect, ChangeEvent } from 'react'
import { EntityType } from '@/lib/image-processing'

interface ImageUploadProps {
  entityType: EntityType
  entityId?: string
  currentImage?: string
  onUploadComplete: (image: UploadedImage) => void
  onUploadError?: (error: string) => void
  className?: string
  label?: string
  hint?: string
}

interface UploadedImage {
  id: string
  urls: {
    original: string
    thumbnail: string
    optimized: string
  }
  metadata: {
    width: number
    height: number
    size: number
    savedBytes: number
  }
  status: string
  needsReview: boolean
}

interface UsageWarning {
  level: 'safe' | 'warning' | 'critical'
  message?: string
}

export default function ImageUpload({
  entityType,
  entityId,
  currentImage,
  onUploadComplete,
  onUploadError,
  className = '',
  label,
  hint,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [error, setError] = useState<string | null>(null)
  const [usageWarning, setUsageWarning] = useState<UsageWarning | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check usage on mount (client-side only)
  useEffect(() => {
    checkUsageStatus()
  }, [])

  async function checkUsageStatus() {
    // Only run on client-side
    if (typeof window === 'undefined') return
    
    try {
      const res = await fetch('/api/upload/request')
      if (res.ok) {
        const data = await res.json()
        if (data.status === 'critical') {
          setUsageWarning({
            level: 'critical',
            message: 'Storage limit reached. Only essential uploads allowed.',
          })
        } else if (data.status === 'warning') {
          setUsageWarning({
            level: 'warning',
            message: 'Approaching storage limit. Large files may be rejected.',
          })
        }
      }
    } catch (err) {
      console.warn('Failed to check usage:', err)
    }
  }

  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset state
    setError(null)
    setProgress(0)

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPEG, PNG, WebP, or GIF.')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Start upload
    setUploading(true)

    try {
      // 1. Request upload URL
      setProgress(10)
      const requestRes = await fetch('/api/upload/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
          entityType,
          entityId,
        }),
      })

      if (!requestRes.ok) {
        const errorData = await requestRes.json()
        throw new Error(errorData.error || 'Failed to request upload')
      }

      const { uploadUrl, imageId, storageKey } = await requestRes.json()

      // 2. Upload directly to R2
      setProgress(30)
      // Don't set Content-Type - let the browser handle it to avoid CORS preflight issues
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
      })

      if (!uploadRes.ok) {
        throw new Error('Failed to upload to storage')
      }

      setProgress(60)

      // 3. Confirm and process
      const confirmRes = await fetch('/api/upload/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageId,
          storageKey,
          entityType,
          entityId,
        }),
      })

      if (!confirmRes.ok) {
        const errorData = await confirmRes.json()
        throw new Error(errorData.error || 'Failed to process upload')
      }

      const { image } = await confirmRes.json()

      setProgress(100)
      setUploading(false)

      // Callback with result
      onUploadComplete(image)

      // Show warning if moderation needed
      if (image.needsReview) {
        setError('Image uploaded but pending moderation review.')
      }
    } catch (err) {
      setUploading(false)
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      if (onUploadError) {
        onUploadError(errorMessage)
      }
    }
  }

  function handleRemove() {
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const labels = {
    profile: 'Profile Picture',
    cover: 'Book Cover',
    fanart: 'Fan Art',
    chapter: 'Chapter Image',
  }

  const hints = {
    profile: 'Square image, 512x512px recommended. Max 3MB.',
    cover: 'Portrait format, 800x1200px recommended. Max 5MB.',
    fanart: 'Any size, 1200px recommended. Max 8MB.',
    chapter: 'Any size, 1600px recommended. Max 6MB.',
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-200">
          {label}
        </label>
      )}

      {/* Usage Warning */}
      {usageWarning && usageWarning.level !== 'safe' && (
        <div
          className={`p-3 rounded-lg border text-sm ${
            usageWarning.level === 'critical'
              ? 'bg-red-900/20 border-red-700 text-red-400'
              : 'bg-yellow-900/20 border-yellow-700 text-yellow-400'
          }`}
        >
          ⚠️ {usageWarning.message}
        </div>
      )}

      {/* Upload Area */}
      <div className="space-y-2">
        {preview ? (
          // Preview
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto max-h-64 object-contain bg-gray-800 rounded-lg"
            />
            {!uploading && (
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
              >
                Remove
              </button>
            )}
          </div>
        ) : (
          // Upload Button
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 hover:bg-gray-800/50 transition-colors flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm text-gray-300">
              Click to upload {labels[entityType]}
            </span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Progress Bar */}
      {uploading && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Hint */}
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
      {!hint && !error && (
        <p className="text-xs text-gray-500">{hints[entityType]}</p>
      )}
    </div>
  )
}
