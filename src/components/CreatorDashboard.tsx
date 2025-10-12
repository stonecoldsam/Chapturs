'use client'

import { useUser } from '@/hooks/useUser'
import { useState } from 'react';
import CreatorAnalyticsDashboard from './CreatorAnalyticsDashboard';

export default function CreatorDashboard() {
  const { userId, isAuthenticated, isLoading, userName } = useUser()
  const [tab, setTab] = useState<'dashboard' | 'analytics'>('dashboard');

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Creator Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Please sign in to view your creator dashboard.
        </p>
        <a 
          href="/auth/signin" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Sign In
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex space-x-4 mb-6">
        <button onClick={() => setTab('dashboard')} className={tab === 'dashboard' ? 'font-bold underline' : ''}>Dashboard</button>
        <button onClick={() => setTab('analytics')} className={tab === 'analytics' ? 'font-bold underline' : ''}>Analytics</button>
      </div>
      {tab === 'dashboard' && (
        <>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Creator Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {userName}! Monitor your stories, track analytics, and manage your content.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a 
                href="/creator/upload" 
                className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <span className="text-blue-600 dark:text-blue-400 font-medium">Upload New Content</span>
              </a>
              <button onClick={() => setTab('analytics')} className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                <span className="text-green-600 dark:text-green-400 font-medium">View Analytics</span>
              </button>
              <button className="flex items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                <span className="text-purple-600 dark:text-purple-400 font-medium">Manage Stories</span>
              </button>
              <button className="flex items-center justify-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">Revenue Reports</span>
              </button>
            </div>
          </div>
        </>
      )}
      {tab === 'analytics' && <CreatorAnalyticsDashboard />}
    </div>
  )
}
