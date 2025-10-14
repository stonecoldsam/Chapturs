'use client'

import { useUser } from '@/hooks/useUser'
import { useState, useEffect } from 'react'
import { 
  BookOpen, TrendingUp, Users, DollarSign, Star, 
  Upload, Edit, Settings, Image, MessageSquare, 
  Award, BarChart3, Zap, Clock, Eye, Heart,
  FileText, Globe, Shield, Sparkles, CheckCircle, AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  overview: {
    totalWorks: number
    totalChapters: number
    totalReads: number
    totalLikes: number
    totalBookmarks: number
    totalSubscriptions: number
  }
  recentActivity: {
    newReads: number
    newLikes: number
    newComments: number
    pendingFanart: number
  }
  qualityScores: {
    averageScore: number
    tier: string
    boostMultiplier: number
  }
  revenue: {
    thisMonth: number
    lastMonth: number
    pending: number
  }
}

// Helper function to format tier names
const formatTierName = (tier: string) => {
  return tier
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export default function CreatorDashboardNew() {
  const { userId, isAuthenticated, isLoading, userName } = useUser()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardStats()
    }
  }, [isAuthenticated])

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch('/api/creator/dashboard-stats')
      if (!res.ok) {
        throw new Error('Failed to fetch stats')
      }
      const data = await res.json()
      if (data.success) {
        setStats({
          overview: data.overview,
          recentActivity: data.recentActivity,
          qualityScores: data.qualityScores,
          revenue: data.revenue
        })
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Creator Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Please sign in to access your creator dashboard and manage your stories.
        </p>
        <Link 
          href="/auth/signin" 
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Sign In to Continue
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Sparkles className="text-blue-500" />
            Creator Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {userName}! Here's your creative empire at a glance.
          </p>
        </div>
        <Link
          href="/creator/upload"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium shadow-lg"
        >
          <Upload size={20} />
          New Chapter
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen className="text-blue-500" />}
          label="Total Works"
          value={stats?.overview.totalWorks || 0}
          subtitle={`${stats?.overview.totalChapters || 0} chapters`}
        />
        <StatCard
          icon={<Eye className="text-green-500" />}
          label="Total Reads"
          value={stats?.overview.totalReads || 0}
          subtitle={`${stats?.recentActivity.newReads || 0} this week`}
          change={stats?.recentActivity.newReads ? `+${stats.recentActivity.newReads} this week` : undefined}
          trend={stats?.recentActivity.newReads ? 'up' : 'neutral'}
        />
        <StatCard
          icon={<Heart className="text-pink-500" />}
          label="Engagement"
          value={`${stats?.overview.totalLikes || 0}`}
          subtitle={`${stats?.overview.totalBookmarks || 0} bookmarks, ${stats?.overview.totalSubscriptions || 0} subscribers`}
          change={stats?.recentActivity.newLikes ? `+${stats.recentActivity.newLikes} likes this week` : undefined}
          trend={stats?.recentActivity.newLikes ? 'up' : 'neutral'}
        />
        <StatCard
          icon={<DollarSign className="text-yellow-500" />}
          label="Revenue (MTD)"
          value={`$${stats?.revenue.thisMonth?.toFixed(2) || '0.00'}`}
          subtitle={`$${stats?.revenue.pending?.toFixed(2) || '0.00'} pending`}
          change={
            stats?.revenue.thisMonth && stats?.revenue.lastMonth && stats.revenue.lastMonth > 0
              ? `${stats.revenue.thisMonth > stats.revenue.lastMonth ? '+' : ''}${(((stats.revenue.thisMonth - stats.revenue.lastMonth) / stats.revenue.lastMonth) * 100).toFixed(1)}% vs last month`
              : undefined
          }
          trend={
            stats?.revenue.thisMonth && stats?.revenue.lastMonth
              ? stats.revenue.thisMonth > stats.revenue.lastMonth ? 'up' : stats.revenue.thisMonth < stats.revenue.lastMonth ? 'down' : 'neutral'
              : 'neutral'
          }
        />
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickActionCard
          icon={<Edit className="text-blue-500" />}
          title="Manage Stories"
          description="Edit chapters, glossary, characters"
          href="/creator/dashboard?tab=stories"
          badge={stats?.overview.totalWorks}
        />
        <QuickActionCard
          icon={<Image className="text-purple-500" />}
          title="Fanart Approvals"
          description="Review pending fanart submissions"
          href="/creator/fanart"
          badge={stats?.recentActivity.pendingFanart}
          badgeColor="red"
        />
        <QuickActionCard
          icon={<Award className="text-yellow-500" />}
          title="Quality Scores"
          description="View AI assessments & boost status"
          href="/creator/quality"
          badge={stats?.qualityScores.averageScore ? `${stats.qualityScores.averageScore}/100` : undefined}
        />
        <QuickActionCard
          icon={<BarChart3 className="text-green-500" />}
          title="Analytics"
          description="Reader insights, drop-off rates"
          href="/creator/dashboard?tab=analytics"
        />
        <QuickActionCard
          icon={<Globe className="text-indigo-500" />}
          title="Translations"
          description="Manage community translations"
          href="/creator/translations"
        />
        <QuickActionCard
          icon={<DollarSign className="text-emerald-500" />}
          title="Monetization"
          description="Ads, tips, premium settings"
          href="/creator/monetization"
        />
      </div>

      {/* Recent Activity & Quality Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="text-blue-500" size={20} />
            Recent Activity
          </h2>
          <div className="space-y-3">
                        {stats && stats.recentActivity.newReads > 0 && (
              <ActivityItem
                icon={<Eye size={16} />}
                text={`${stats.recentActivity.newReads} new ${stats.recentActivity.newReads === 1 ? 'read' : 'reads'} in the last 7 days`}
                time="This week"
              />
            )}
            {stats && stats.recentActivity.newLikes > 0 && (
              <ActivityItem
                icon={<Heart size={16} />}
                text={`${stats.recentActivity.newLikes} new ${stats.recentActivity.newLikes === 1 ? 'like' : 'likes'} across your stories`}
                time="This week"
              />
            )}
            {stats && stats.recentActivity.pendingFanart > 0 && (
              <ActivityItem
                icon={<Image size={16} />}
                text={`${stats.recentActivity.pendingFanart} fanart ${stats.recentActivity.pendingFanart === 1 ? 'submission' : 'submissions'} awaiting review`}
                time="Pending"
                actionable
              />
            )}
            {stats && stats.recentActivity.newComments > 0 && (
              <ActivityItem
                icon={<MessageSquare size={16} />}
                text={`${stats.recentActivity.newComments} new ${stats.recentActivity.newComments === 1 ? 'comment' : 'comments'} across your stories`}
                time="This week"
              />
            )}
            {(!stats || (stats.recentActivity.newReads === 0 && stats.recentActivity.newLikes === 0 && stats.recentActivity.pendingFanart === 0 && stats.recentActivity.newComments === 0)) && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Clock size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
                <p className="text-xs mt-1">Share your stories to get started!</p>
              </div>
            )}
          </div>
          <Link
            href="/creator/activity"
            className="mt-4 block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View all activity →
          </Link>
        </div>

        {/* Quality Insights */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-lg border border-blue-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="text-purple-500" size={20} />
            Quality Insights
          </h2>
          
          {stats && stats.qualityScores.averageScore > 0 ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Average Quality Score</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.qualityScores.averageScore}/100
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats.qualityScores.averageScore}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Tier</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatTierName(stats.qualityScores.tier)}
                  </p>
                </div>
                <Zap className="text-yellow-500" size={24} />
              </div>

              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Visibility Boost</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {stats.qualityScores.boostMultiplier.toFixed(1)}x
                  </p>
                </div>
                <TrendingUp className={`${stats.qualityScores.boostMultiplier > 1 ? 'text-green-500' : stats.qualityScores.boostMultiplier < 1 ? 'text-orange-500' : 'text-gray-500'}`} size={24} />
              </div>

              <Link
                href="/creator/quality"
                className="mt-4 block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View detailed analysis →
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <Sparkles size={32} className="mx-auto mb-3 text-purple-400 opacity-50" />
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">No Quality Assessment Yet</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                Publish your first chapter to get AI-powered quality insights and visibility boosts!
              </p>
              <Link
                href="/creator/upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Upload size={16} />
                Upload First Chapter
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Content Management Tools */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Settings className="text-gray-500" size={20} />
          Content Management Tools
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ToolCard
            icon={<FileText className="text-blue-500" />}
            title="Glossary System"
            description="Chapter-aware definitions"
            href="/creator/glossary"
          />
          <ToolCard
            icon={<Users className="text-purple-500" />}
            title="Character Profiles"
            description="Interactive character database"
            href="/creator/characters"
          />
          <ToolCard
            icon={<Shield className="text-green-500" />}
            title="Content Moderation"
            description="Safety & quality controls"
            href="/creator/moderation"
          />
          <ToolCard
            icon={<BarChart3 className="text-orange-500" />}
            title="Ad Placements"
            description="Revenue optimization"
            href="/creator/ads"
          />
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ 
  icon, 
  label, 
  value, 
  subtitle, 
  change, 
  trend 
}: { 
  icon: React.ReactNode
  label: string
  value: string | number
  subtitle?: string
  change?: string
  trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          {icon}
        </div>
        {change && (
          <span className={`text-xs font-medium ${
            trend === 'up' ? 'text-green-600 dark:text-green-400' : 
            trend === 'down' ? 'text-red-600 dark:text-red-400' : 
            'text-gray-600 dark:text-gray-400'
          }`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  )
}

// Quick Action Card
function QuickActionCard({ 
  icon, 
  title, 
  description, 
  href,
  badge,
  badgeColor = 'blue'
}: { 
  icon: React.ReactNode
  title: string
  description: string
  href: string
  badge?: string | number
  badgeColor?: 'blue' | 'red' | 'green'
}) {
  const badgeColors = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
  }

  return (
    <Link href={href} className="group">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg group-hover:scale-110 transition-transform">
            {icon}
          </div>
          {badge !== undefined && (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeColors[badgeColor]}`}>
              {badge}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </Link>
  )
}

// Activity Item
function ActivityItem({ 
  icon, 
  text, 
  time, 
  actionable 
}: { 
  icon: React.ReactNode
  text: string
  time: string
  actionable?: boolean
}) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${
      actionable ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' : 'bg-gray-50 dark:bg-gray-700'
    }`}>
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-white">{text}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{time}</p>
      </div>
    </div>
  )
}

// Tool Card
function ToolCard({ 
  icon, 
  title, 
  description, 
  href 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  href: string
}) {
  return (
    <Link href={href} className="group">
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500 border border-transparent transition-all">
        <div className="mb-2">{icon}</div>
        <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">{title}</h4>
        <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </Link>
  )
}
