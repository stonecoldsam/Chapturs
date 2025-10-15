'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'

interface UsernameSelectionModalProps {
  currentUsername: string
  userEmail: string
  onComplete?: () => void
}

export default function UsernameSelectionModal({ 
  currentUsername, 
  userEmail,
  onComplete 
}: UsernameSelectionModalProps) {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null)

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (checkTimeout) {
        clearTimeout(checkTimeout)
      }
    }
  }, [checkTimeout])

  const validateUsername = (value: string): string | null => {
    if (!value) return 'Username is required'
    if (value.length < 3) return 'Username must be at least 3 characters'
    if (value.length > 20) return 'Username must be less than 20 characters'
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Username can only contain letters, numbers, and underscores'
    }
    if (/^[0-9]/.test(value)) {
      return 'Username cannot start with a number'
    }
    return null
  }

  const checkAvailability = async (value: string) => {
    const validationError = validateUsername(value)
    if (validationError) {
      setError(validationError)
      setIsAvailable(null)
      return
    }

    setIsChecking(true)
    setError(null)

    try {
      const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(value)}`)
      const data = await response.json()

      if (response.ok) {
        setIsAvailable(data.available)
        if (!data.available) {
          setError('Username is already taken')
        }
      } else {
        setError(data.error || 'Failed to check username availability')
        setIsAvailable(null)
      }
    } catch (err) {
      setError('Failed to check username availability')
      setIsAvailable(null)
    } finally {
      setIsChecking(false)
    }
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUsername(value)
    setIsAvailable(null)
    setError(null)

    // Clear existing timeout
    if (checkTimeout) {
      clearTimeout(checkTimeout)
    }

    // Debounce the availability check
    if (value) {
      const timeout = setTimeout(() => {
        checkAvailability(value)
      }, 500)
      setCheckTimeout(timeout)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateUsername(username)
    if (validationError) {
      setError(validationError)
      return
    }

    if (!isAvailable) {
      setError('Please choose an available username')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/set-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      })

      const data = await response.json()

      if (response.ok) {
        // Success! Refresh the page to update session
        if (onComplete) {
          onComplete()
        } else {
          router.refresh()
          router.push('/')
        }
      } else {
        setError(data.error || 'Failed to set username')
        setIsAvailable(null)
      }
    } catch (err) {
      setError('Failed to set username. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 border border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-2">
            Choose Your Username
          </h2>
          <p className="text-gray-400 text-sm">
            Welcome to Chapturs! Please select a username for your account.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Signed in as: {userEmail}
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">@</span>
              </div>
              <input
                type="text"
                id="username"
                value={username}
                onChange={handleUsernameChange}
                className={`
                  block w-full pl-8 pr-12 py-3 bg-gray-900 border rounded-lg
                  text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                  transition-all
                  ${error 
                    ? 'border-red-500 focus:ring-red-500/50' 
                    : isAvailable 
                    ? 'border-green-500 focus:ring-green-500/50'
                    : 'border-gray-600 focus:ring-blue-500/50'
                  }
                `}
                placeholder="your_username"
                autoComplete="off"
                autoFocus
                disabled={isSubmitting}
              />
              {/* Status Icon */}
              {isChecking && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              )}
              {!isChecking && isAvailable === true && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
              )}
              {!isChecking && isAvailable === false && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                <XCircleIcon className="h-4 w-4" />
                {error}
              </p>
            )}

            {/* Success Message */}
            {!error && isAvailable && (
              <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
                <CheckCircleIcon className="h-4 w-4" />
                Username is available!
              </p>
            )}

            {/* Validation Rules */}
            <div className="mt-3 text-xs text-gray-500 space-y-1">
              <p>• 3-20 characters</p>
              <p>• Letters, numbers, and underscores only</p>
              <p>• Cannot start with a number</p>
            </div>
          </div>

          {/* Current temporary username */}
          <div className="mb-6 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
            <p className="text-xs text-yellow-200/70 mb-1">Current temporary username:</p>
            <p className="text-sm text-yellow-200 font-mono">@{currentUsername}</p>
          </div>

          {/* Actions */}
          <button
            type="submit"
            disabled={!isAvailable || isSubmitting || isChecking}
            className={`
              w-full py-3 px-4 rounded-lg font-medium transition-all
              ${isAvailable && !isSubmitting 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Setting username...
              </span>
            ) : (
              'Confirm Username'
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="px-6 pb-6">
          <p className="text-xs text-gray-500 text-center">
            You can change your username later in your account settings.
          </p>
        </div>
      </div>
    </div>
  )
}
