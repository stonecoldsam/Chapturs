'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'

interface CoverUploadFieldProps {
  onUpload: (url: string) => void
  initialImage?: string
  aspectRatio?: '2:3' | '1:1.5'
  maxSizeMB?: number
}

export default function CoverUploadField({
  onUpload,
  initialImage,
  aspectRatio = '2:3',
  maxSizeMB = 5
}: CoverUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(initialImage || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateImage = useCallback((file: File): Promise<{ valid: boolean; error?: string }> => {
    return new Promise((resolve) => {
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        resolve({ valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' })
        return
      }

      // Check file size
      const maxSize = maxSizeMB * 1024 * 1024
      if (file.size > maxSize) {
        resolve({ valid: false, error: `Image must be smaller than ${maxSizeMB}MB` })
        return
      }

      // Check dimensions and aspect ratio
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl)
        
        const width = img.width
        const height = img.height
        const currentRatio = width / height
        
        // Calculate expected ratio with tolerance
        const expectedRatio = aspectRatio === '2:3' ? 2/3 : 1/1.5
        const tolerance = 0.15 // 15% tolerance
        
        if (Math.abs(currentRatio - expectedRatio) > tolerance) {
          resolve({ 
            valid: false, 
            error: `Image aspect ratio should be approximately ${aspectRatio} (current: ${currentRatio.toFixed(2)})` 
          })
          return
        }

        resolve({ valid: true })
      }

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        resolve({ valid: false, error: 'Failed to load image' })
      }

      img.src = objectUrl
    })
  }, [aspectRatio, maxSizeMB])

  const handleFileUpload = useCallback(async (file: File) => {
    setError(null)
    setUploading(true)

    try {
      // Validate image
      const validation = await validateImage(file)
      if (!validation.valid) {
        setError(validation.error || 'Invalid image')
        setUploading(false)
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreview(result)
      }
      reader.readAsDataURL(file)

      // Upload to API
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/cover', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Upload failed')
      }

      const data = await response.json()
      onUpload(data.imageUrl)
      
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload image')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }, [validateImage, onUpload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }, [handleFileUpload])

  const handleRemove = useCallback(() => {
    setPreview(null)
    setError(null)
    onUpload('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onUpload])

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Cover Image
      </label>
      
      {preview ? (
        <div className="relative">
          <div className="relative rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600 max-w-xs">
            <img 
              src={preview} 
              alt="Cover preview" 
              className="w-full h-auto object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white">Uploading...</div>
              </div>
            )}
          </div>
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            disabled={uploading}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <div className="flex flex-col items-center space-y-3">
            <Upload size={40} className="text-gray-400" />
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop your cover image here, or click to browse
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Recommended aspect ratio: {aspectRatio} • Max size: {maxSizeMB}MB • Formats: JPEG, PNG, WebP
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Upload size={16} className="mr-2" />
              Choose File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {preview && !uploading && !error && (
        <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 text-sm">
          <CheckCircle size={16} />
          <span>Cover image ready</span>
        </div>
      )}
    </div>
  )
}
