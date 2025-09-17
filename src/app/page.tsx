'use client'

import AppLayout from '@/components/AppLayout'
import InfiniteFeed from '@/components/InfiniteFeed'
import { useUser } from '@/hooks/useUser'
import { signIn } from 'next-auth/react'

function ReaderHomePage() {
  const { isAuthenticated, userName, isLoading } = useUser()

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        {isAuthenticated ? (
          <>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {userName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Continue your reading journey or discover something new.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to Chapturs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Discover amazing stories across novels, articles, comics, and hybrid content.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 text-xl">✨</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Sign in to unlock the full experience
                  </h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    Bookmark stories, subscribe to authors, track your reading progress, and get personalized recommendations.
                  </p>
                  <button
                    onClick={() => signIn('google')}
                    className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Sign in with Google
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Infinite Feed */}
      <InfiniteFeed hubMode="reader" />
    </div>
  )
}

export default function Home() {
  return (
    <AppLayout>
      <ReaderHomePage />
    </AppLayout>
  )
}
