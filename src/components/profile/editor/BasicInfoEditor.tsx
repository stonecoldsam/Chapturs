'use client'

import { useState } from 'react'
import { PhotoIcon, PencilIcon } from '@heroicons/react/24/outline'
import ReactMarkdown from 'react-markdown'

interface BasicInfoEditorProps {
  displayName: string
  bio: string
  profileImage?: string
  coverImage?: string
  onUpdate: (field: string, value: string) => void
  onImageUpload: (type: 'profile' | 'cover', file: File) => void
}

/**
 * BasicInfoEditor - v0.1
 * Edit basic profile information: name, bio, images
 */
export default function BasicInfoEditor({
  displayName,
  bio,
  profileImage,
  coverImage,
  onUpdate,
  onImageUpload
}: BasicInfoEditorProps) {
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [bioText, setBioText] = useState(bio)

  const handleBioSave = () => {
    onUpdate('bio', bioText)
    setIsEditingBio(false)
  }

  return (
    <div className="space-y-6">
      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Cover Image
        </label>
        <div className="relative w-full h-32 bg-gray-900 rounded-lg overflow-hidden group">
          {coverImage ? (
            <>
              <img
                src={coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <label className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors">
                  Change Cover
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) onImageUpload('cover', file)
                    }}
                  />
                </label>
              </div>
            </>
          ) : (
            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
              <PhotoIcon className="w-8 h-8 text-gray-500 mb-2" />
              <span className="text-sm text-gray-400">Upload Cover Image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onImageUpload('cover', file)
                }}
              />
            </label>
          )}
        </div>
      </div>

      {/* Profile Image */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Profile Image
        </label>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 bg-gray-900 rounded-full overflow-hidden group">
            {profileImage ? (
              <>
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer">
                    <PencilIcon className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) onImageUpload('profile', file)
                      }}
                    />
                  </label>
                </div>
              </>
            ) : (
              <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
                <PhotoIcon className="w-8 h-8 text-gray-500" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) onImageUpload('profile', file)
                  }}
                />
              </label>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-400">
              Recommended: Square image, at least 200×200px
            </p>
          </div>
        </div>
      </div>

      {/* Display Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Display Name
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => onUpdate('displayName', e.target.value)}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
          placeholder="Your display name"
        />
      </div>

      {/* Bio */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-300">
            Bio
          </label>
          <button
            onClick={() => isEditingBio ? handleBioSave() : setIsEditingBio(true)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            {isEditingBio ? 'Save' : 'Edit'}
          </button>
        </div>
        
        {isEditingBio ? (
          <div>
            <textarea
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none font-mono text-sm"
              placeholder="Write your bio... (Markdown supported)"
              rows={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Supports Markdown formatting
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleBioSave}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setBioText(bio)
                  setIsEditingBio(false)
                }}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg min-h-[100px]">
            {bio ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{bio}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No bio yet. Click Edit to add one.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
