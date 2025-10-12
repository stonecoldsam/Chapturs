'use client'

import { useState } from 'react'

export default function TestModerationPage() {
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isFirstChapter, setIsFirstChapter] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testValidation = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, imageUrl, isFirstChapter })
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Test failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Content Moderation Test
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Test Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter content to test validation..."
            className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cover Image URL (optional)
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isFirstChapter}
              onChange={(e) => setIsFirstChapter(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              First Chapter (enables plagiarism and duplicate checks)
            </span>
          </label>
        </div>

        <button
          onClick={testValidation}
          disabled={loading || !content.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing...' : 'Test Validation'}
        </button>
      </div>

      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Validation Result
          </h2>

          {result.error ? (
            <div className="text-red-600 dark:text-red-400">
              Error: {result.error}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Overall Result:</span>
                <span className={`px-2 py-1 text-sm rounded ${
                  result.validation?.passed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {result.validation?.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>

              {result.validation?.details?.suggestedRating && (
                <div>
                  <span className="font-medium">Suggested Rating:</span>
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">
                    {result.validation.details.suggestedRating}
                  </span>
                </div>
              )}

              {result.validation?.score !== undefined && (
                <div>
                  <span className="font-medium">Score:</span> {(result.validation.score * 100).toFixed(1)}%
                </div>
              )}

              {result.validation?.flags && result.validation.flags.length > 0 && (
                <div>
                  <span className="font-medium">Flags:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.validation.flags.map((flag: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded">
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.validation?.details && (
                <div>
                  <span className="font-medium">Details:</span>
                  <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm overflow-x-auto">
                    {JSON.stringify(result.validation.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-8 text-sm text-gray-600 dark:text-gray-400">
        <h3 className="font-medium mb-2">Test Examples:</h3>
        <ul className="space-y-1">
          <li>• Try content with profanity (should fail safety check)</li>
          <li>• Try very short content (should fail quality check)</li>
          <li>• Try normal content (should pass)</li>
          <li>• Check "First Chapter" for plagiarism simulation</li>
          <li>• Test image URLs: valid .jpg/.png URLs should pass, invalid URLs should fail</li>
          <li>• Try URLs with unsupported extensions (should fail)</li>
        </ul>
      </div>
    </div>
  )
}