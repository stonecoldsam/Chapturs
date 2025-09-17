'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/AppLayout'
import { Story, Subscription } from '@/types'
import DataService from '@/lib/api/DataService'
import { useUser } from '@/hooks/useUser'
import { signIn } from 'next-auth/react'
import { 
  BellIcon, 
  BellSlashIcon,
  ClockIcon,
  BookOpenIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

export default function SubscriptionsPage() {
  const { isAuthenticated, userName, isLoading } = useUser()

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
              Your Subscriptions
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Sign in to subscribe to your favorite authors and never miss a new chapter.
            </p>
            <div className="mt-8">
              <button
                onClick={() => signIn('google')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in to view subscriptions
              </button>
            </div>
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              <p>Browse stories without signing in:</p>
              <div className="mt-2 space-x-4">
                <a href="/browse" className="text-blue-600 hover:text-blue-800">
                  Discover Stories
                </a>
                <a href="/" className="text-blue-600 hover:text-blue-800">
                  Reading Feed
                </a>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return <AuthenticatedSubscriptionsView />
}

function AuthenticatedSubscriptionsView() {
  const [subscriptions, setSubscriptions] = useState<(Subscription & { story: Story })[]>([])
  const [sortBy, setSortBy] = useState<'updated' | 'subscribed' | 'alphabetical'>('updated')

  useEffect(() => {
    // TODO: Load real subscription data from database
    setSubscriptions([])
  }, [])

  const toggleNotifications = async (subscriptionId: string) => {
    setSubscriptions(prev => 
      prev.map(sub => 
        sub.id === subscriptionId 
          ? { ...sub, notificationsEnabled: !sub.notificationsEnabled }
          : sub
      )
    )
  }

  const unsubscribe = async (subscriptionId: string) => {
    setSubscriptions(prev => prev.filter(sub => sub.id !== subscriptionId))
  }

  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    switch (sortBy) {
      case 'updated':
        return new Date(b.story.updatedAt).getTime() - new Date(a.story.updatedAt).getTime()
      case 'subscribed':
        return new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime()
      case 'alphabetical':
        return a.story.title.localeCompare(b.story.title)
      default:
        return 0
    }
  })

  const getReadingStatus = (subscription: Subscription & { story: Story }) => {
    const totalChapters = subscription.story.chapters.length
    const lastRead = subscription.lastReadChapter || 0
    
    if (lastRead === 0) {
      return { status: 'unread', text: 'Not started', color: 'text-gray-500' }
    } else if (lastRead >= totalChapters) {
      return { status: 'caught-up', text: 'Caught up', color: 'text-green-600' }
    } else {
      const unreadCount = totalChapters - lastRead
      return { 
        status: 'behind', 
        text: `${unreadCount} chapter${unreadCount > 1 ? 's' : ''} behind`, 
        color: 'text-blue-600' 
      }
    }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subscriptions</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Keep track of your favorite ongoing stories
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="updated">Recently Updated</option>
              <option value="subscribed">Recently Subscribed</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Subscriptions List */}
        {subscriptions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium mb-2">No subscriptions yet</h3>
            <p className="text-sm">
              Start following your favorite stories to see them here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedSubscriptions.map((subscription) => {
              const readingStatus = getReadingStatus(subscription)
              
              return (
                <div key={subscription.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    {/* Story Cover/Thumbnail */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                        <BookOpenIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>

                    {/* Story Information */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {subscription.story.title}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <img
                              src={subscription.story.author.avatar || '/default-avatar.png'}
                              alt={subscription.story.author.username}
                              className="w-5 h-5 rounded-full"
                            />
                            <span>{subscription.story.author.username}</span>
                            <span>•</span>
                            <span className={readingStatus.color}>
                              {readingStatus.text}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                            {subscription.story.description}
                          </p>
                          
                          {/* Genres */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {subscription.story.genres.slice(0, 3).map((genre) => (
                              <span
                                key={genre}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>

                          {/* Stats */}
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <EyeIcon className="w-4 h-4" />
                              <span>{subscription.story.statistics.views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="w-4 h-4" />
                              <span>Updated {new Date(subscription.story.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => toggleNotifications(subscription.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              subscription.notificationsEnabled
                                ? 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                            title={subscription.notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
                          >
                            {subscription.notificationsEnabled ? (
                              <BellIcon className="w-5 h-5" />
                            ) : (
                              <BellSlashIcon className="w-5 h-5" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => unsubscribe(subscription.id)}
                            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            Unsubscribe
                          </button>
                          
                          <button
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            onClick={() => {
                              // Navigate to continue reading
                              console.log('Continue reading:', subscription.story.title)
                            }}
                          >
                            {readingStatus.status === 'unread' ? 'Start Reading' : 'Continue'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
