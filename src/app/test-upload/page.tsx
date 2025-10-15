// Test page for image upload system
'use client'

import { useState } from 'react'
import ImageUpload from '@/components/upload/ImageUpload'

export default function TestUploadPage() {
  const [uploadedImage, setUploadedImage] = useState<any>(null)
  const [usageStats, setUsageStats] = useState<any>(null)

  async function checkUsage() {
    const res = await fetch('/api/upload/request')
    const data = await res.json()
    setUsageStats(data.usage)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Image Upload Test</h1>
          <p className="text-gray-400">
            Test the free-tier optimized image upload system
          </p>
        </div>

        {/* Usage Stats */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Storage Usage</h2>
            <button
              onClick={checkUsage}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
            >
              Check Usage
            </button>
          </div>

          {usageStats && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Storage</span>
                  <span>
                    {usageStats.storage.used.toFixed(2)} / {usageStats.storage.limit} GB
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      usageStats.storage.percent > 90
                        ? 'bg-red-500'
                        : usageStats.storage.percent > 75
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(usageStats.storage.percent, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {usageStats.storage.percent.toFixed(1)}% used ({usageStats.storage.images}{' '}
                  images)
                </p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Operations (This Month)</span>
                  <span>
                    {usageStats.operations.count.toLocaleString()} /{' '}
                    {usageStats.operations.limit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(usageStats.operations.percent, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {usageStats.operations.percent.toFixed(1)}% used
                </p>
              </div>

              <div
                className={`mt-4 p-3 rounded-lg ${
                  usageStats.status === 'critical'
                    ? 'bg-red-900/20 border border-red-700'
                    : usageStats.status === 'warning'
                    ? 'bg-yellow-900/20 border border-yellow-700'
                    : 'bg-green-900/20 border border-green-700'
                }`}
              >
                <p className="text-sm font-medium">
                  Status:{' '}
                  <span className="uppercase">{usageStats.status}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Upload Tests */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Profile Upload</h2>
            <ImageUpload
              entityType="profile"
              onUploadComplete={(image) => {
                console.log('Profile uploaded:', image)
                setUploadedImage(image)
              }}
              onUploadError={(error) => {
                console.error('Upload error:', error)
              }}
              label="Profile Picture"
            />
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Cover Upload</h2>
            <ImageUpload
              entityType="cover"
              onUploadComplete={(image) => {
                console.log('Cover uploaded:', image)
                setUploadedImage(image)
              }}
              label="Book Cover"
            />
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Fan Art Upload</h2>
            <ImageUpload
              entityType="fanart"
              onUploadComplete={(image) => {
                console.log('Fan art uploaded:', image)
                setUploadedImage(image)
              }}
              label="Fan Art"
            />
          </div>
        </div>

        {/* Result */}
        {uploadedImage && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Result ✅</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-2">Thumbnail</p>
                  <img
                    src={uploadedImage.urls.thumbnail}
                    alt="Thumbnail"
                    className="w-full rounded border border-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {uploadedImage.urls.thumbnail.split('/').pop()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-2">Optimized</p>
                  <img
                    src={uploadedImage.urls.optimized}
                    alt="Optimized"
                    className="w-full rounded border border-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {uploadedImage.urls.optimized.split('/').pop()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-2">Original</p>
                  <img
                    src={uploadedImage.urls.original}
                    alt="Original"
                    className="w-full rounded border border-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {uploadedImage.urls.original.split('/').pop()}
                  </p>
                </div>
              </div>

              <div className="bg-gray-900 rounded p-4">
                <p className="text-xs text-gray-400 mb-2">Metadata</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">ID:</span> {uploadedImage.id}
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span> {uploadedImage.status}
                  </div>
                  <div>
                    <span className="text-gray-400">Size:</span>{' '}
                    {(uploadedImage.metadata.size / 1024).toFixed(0)} KB
                  </div>
                  <div>
                    <span className="text-gray-400">Saved:</span>{' '}
                    {(uploadedImage.metadata.savedBytes / 1024).toFixed(0)} KB (
                    {(
                      (uploadedImage.metadata.savedBytes /
                        (uploadedImage.metadata.size + uploadedImage.metadata.savedBytes)) *
                      100
                    ).toFixed(0)}
                    %)
                  </div>
                  <div>
                    <span className="text-gray-400">Dimensions:</span>{' '}
                    {uploadedImage.metadata.width} × {uploadedImage.metadata.height}
                  </div>
                  <div>
                    <span className="text-gray-400">Needs Review:</span>{' '}
                    {uploadedImage.needsReview ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded p-4">
                <p className="text-xs text-gray-400 mb-2">URLs</p>
                <div className="space-y-2 text-xs font-mono">
                  <div>
                    <span className="text-gray-400">Thumbnail:</span>
                    <br />
                    <a
                      href={uploadedImage.urls.thumbnail}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline break-all"
                    >
                      {uploadedImage.urls.thumbnail}
                    </a>
                  </div>
                  <div>
                    <span className="text-gray-400">Optimized:</span>
                    <br />
                    <a
                      href={uploadedImage.urls.optimized}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline break-all"
                    >
                      {uploadedImage.urls.optimized}
                    </a>
                  </div>
                  <div>
                    <span className="text-gray-400">Original:</span>
                    <br />
                    <a
                      href={uploadedImage.urls.original}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline break-all"
                    >
                      {uploadedImage.urls.original}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
