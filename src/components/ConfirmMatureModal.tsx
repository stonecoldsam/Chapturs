"use client"
import React from 'react'

type Props = {
  open: boolean
  suggestedRating?: string
  validationDetails?: any
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmMatureModal({ open, suggestedRating, validationDetails, onConfirm, onCancel }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-xl">
        <h2 className="text-xl font-semibold mb-2">Confirm Mature Content</h2>
        <p className="text-sm text-gray-600 mb-4">Our automated check suggests this work is rated <strong>{suggestedRating}</strong>. Please confirm you want to publish with this maturity rating.</p>

        <div className="mb-3">
          <h3 className="font-medium">Validation Highlights</h3>
          <pre className="text-xs p-2 bg-gray-100 rounded max-h-40 overflow-auto text-gray-700 dark:bg-gray-900 dark:text-gray-200">{JSON.stringify(validationDetails, null, 2)}</pre>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button onClick={onCancel} className="px-3 py-2 bg-gray-200 rounded">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">Confirm & Publish</button>
        </div>
      </div>
    </div>
  )
}
