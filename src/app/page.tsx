'use client'

import AppLayout from '@/components/AppLayout'
import InfiniteFeed from '@/components/InfiniteFeed'
import BetaWelcome from '@/components/BetaWelcome'
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

  // Show full beta welcome page for non-authenticated users
  if (!isAuthenticated) {
    return <BetaWelcome isLoggedIn={false} />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Beta Welcome Sidebar for logged-in users */}
      <BetaWelcome isLoggedIn={true} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {userName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Continue your reading journey or discover something new.
        </p>
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
