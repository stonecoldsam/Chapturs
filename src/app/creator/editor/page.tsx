'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import CreatorEditor from '@/components/CreatorEditor'
import ExperimentalEditor from '@/components/ExperimentalEditor'
import AdvancedUploader from '@/components/AdvancedUploader'
import AppLayout from '@/components/AppLayout'
import { ContentFormat } from '@/types'
import {
  ArrowLeft,
  Save,
  Eye,
  Settings,
  Upload,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Palette,
  Users,
  Calendar,
  Zap,
  Download,
  Share,
  MoreHorizontal
} from 'lucide-react'

interface EditorMode {
  type: 'editor' | 'uploader'
  subMode?: 'text' | 'file' | 'bulk'
}

export default function CreatorEditorPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  
  // URL parameters
  const workId = params?.workId as string | undefined
  const chapterId = params?.chapterId as string | undefined
  const formatType = (searchParams?.get('format') || 'novel') as ContentFormat
  const mode = searchParams?.get('mode') === 'edit' ? 'edit' : 'create'

  console.log('Editor page loaded with:', { formatType, mode, workId })
  console.log('Should use experimental editor?', formatType === 'experimental')

  // UI State
  const [editorMode, setEditorMode] = useState<EditorMode>({ type: 'editor' })
  const [showSettings, setShowSettings] = useState(false)
  const [currentWork, setCurrentWork] = useState({
    id: workId,
    title: '',
    description: '',
    formatType,
    status: 'draft' as 'draft' | 'ongoing' | 'completed',
    chaptersCount: 0,
    wordsCount: 0,
    subscribers: 0
  })

  // Project statistics
  const [projectStats, setProjectStats] = useState({
    totalWords: 0,
    chaptersWritten: 0,
    timeSpent: 0, // in minutes
    lastSaved: new Date(),
    targetWords: 0, // default off - enabled via settings
    dailyGoal: 1000
  })

  // Quick actions state
  const [quickActions, setQuickActions] = useState({
    autoSave: true,
    livePreview: false,
    focusMode: false,
    darkMode: false,
    goalMode: false // NaNoWriMo-style goal tracking
  })

  useEffect(() => {
    // Load work data if in edit mode
    if (mode === 'edit' && workId) {
      loadWorkData(workId)
    }
  }, [mode, workId])

  const loadWorkData = async (workId: string) => {
    // In production, this would fetch from API
    console.log('Loading work data for:', workId)
    // Mock data loading
    setCurrentWork(prev => ({
      ...prev,
      title: 'Sample Novel',
      description: 'A thrilling adventure story',
      chaptersCount: 5,
      wordsCount: 12500
    }))
  }

  const handleSave = async (data: any) => {
    console.log('Saving:', data)
    setProjectStats(prev => ({
      ...prev,
      lastSaved: new Date(),
      totalWords: data.wordCount || prev.totalWords
    }))
  }

  const handlePublish = async (data: any) => {
    console.log('Publishing:', data)
    // In production, this would call the publish API
    alert('Chapter published successfully!')
  }

  const handleUploadComplete = (results: any[]) => {
    console.log('Upload completed:', results)
    // Switch to editor mode to edit uploaded content
    if (results.length > 0 && results[0].sections?.length > 0) {
      setEditorMode({ type: 'editor' })
    }
  }

  const getFormatIcon = (format: ContentFormat) => {
    switch (format) {
      case 'novel': return <BookOpen size={20} />
      case 'article': return <FileText size={20} />
      case 'comic': return <ImageIcon size={20} />
      case 'hybrid': return <Palette size={20} />
      default: return <FileText size={20} />
    }
  }

  const getProgressPercentage = () => {
    if (projectStats.targetWords === 0) return 0
    return Math.min((projectStats.totalWords / projectStats.targetWords) * 100, 100)
  }

  return (
    <AppLayout>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  {getFormatIcon(formatType)}
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {mode === 'create' ? `New ${formatType}` : currentWork.title || 'Untitled Work'}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {mode === 'create' ? 'Create your next masterpiece' : `${currentWork.chaptersCount} chapters • ${currentWork.wordsCount.toLocaleString()} words`}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Mode Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setEditorMode({ type: 'editor' })}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    editorMode.type === 'editor'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FileText size={14} className="inline mr-1" />
                  Editor
                </button>
                <button
                  onClick={() => setEditorMode({ type: 'uploader' })}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    editorMode.type === 'uploader'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Upload size={14} className="inline mr-1" />
                  Upload
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuickActions(prev => ({ ...prev, autoSave: !prev.autoSave }))}
                  className={`p-2 rounded-lg transition-colors ${
                    quickActions.autoSave 
                      ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="Auto-save"
                >
                  <Save size={16} />
                </button>
                
                <button
                  onClick={() => setQuickActions(prev => ({ ...prev, livePreview: !prev.livePreview }))}
                  className={`p-2 rounded-lg transition-colors ${
                    quickActions.livePreview 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="Live preview"
                >
                  <Eye size={16} />
                </button>

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  title="Settings"
                >
                  <Settings size={16} />
                </button>

                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar - NaNoWriMo Style Goal Tracking */}
          {formatType === 'novel' && quickActions.goalMode && projectStats.targetWords > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  Progress: {projectStats.totalWords.toLocaleString()} / {projectStats.targetWords.toLocaleString()} words
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {getProgressPercentage().toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                <BookOpen size={14} />
                <span>{projectStats.chaptersWritten} chapters</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                <FileText size={14} />
                <span>{projectStats.totalWords.toLocaleString()} words</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                <Users size={14} />
                <span>{currentWork.subscribers} subscribers</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                <Calendar size={14} />
                <span>Last saved: {projectStats.lastSaved.toLocaleTimeString()}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-green-600 dark:text-green-400">
                Daily goal: {projectStats.dailyGoal} words
              </div>
              <div className="text-blue-600 dark:text-blue-400">
                Time: {Math.floor(projectStats.timeSpent / 60)}h {projectStats.timeSpent % 60}m
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {editorMode.type === 'editor' ? (
            <>
              <div>
                <h1 style={{ color: 'red', fontSize: '24px', padding: '20px' }}>
                  🧪 FORCING EXPERIMENTAL EDITOR - FORMAT: {formatType}
                </h1>
                <ExperimentalEditor
                  workId={workId}
                  onSave={async (content: string, data: any) => {
                    // Adapt the ExperimentalEditor save format to our handleSave function
                    await handleSave({ content, experimentalData: data })
                  }}
                />
              </div>
            </>
          ) : (
            <div className="h-full overflow-auto p-6">
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Upload Content
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Upload documents, images, or archives to automatically parse and create {formatType} content
                  </p>
                </div>

                <AdvancedUploader
                  formatType={formatType}
                  workId={workId}
                  onUploadComplete={handleUploadComplete}
                  maxFileSize={100} // 100MB
                />
              </div>
            </div>
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Project Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Settings */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Work Title
                      </label>
                      <input
                        type="text"
                        value={currentWork.title}
                        onChange={(e) => setCurrentWork(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Format Type
                      </label>
                      <select
                        value={currentWork.formatType}
                        onChange={(e) => setCurrentWork(prev => ({ ...prev, formatType: e.target.value as ContentFormat }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                      >
                        <option value="novel">Novel</option>
                        <option value="article">Article</option>
                        <option value="comic">Comic</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={currentWork.description}
                      onChange={(e) => setCurrentWork(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>

                {/* Writing Goals */}
                {/* Writing Goals - only show when goal mode is enabled */}
                {formatType === 'novel' && quickActions.goalMode && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Writing Goals</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Target Word Count
                        </label>
                        <input
                          type="number"
                          value={projectStats.targetWords}
                          onChange={(e) => setProjectStats(prev => ({ ...prev, targetWords: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Daily Word Goal
                        </label>
                        <input
                          type="number"
                          value={projectStats.dailyGoal}
                          onChange={(e) => setProjectStats(prev => ({ ...prev, dailyGoal: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Editor Preferences */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Editor Preferences</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={quickActions.autoSave}
                        onChange={(e) => setQuickActions(prev => ({ ...prev, autoSave: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Auto-save changes</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={quickActions.livePreview}
                        onChange={(e) => setQuickActions(prev => ({ ...prev, livePreview: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Live preview mode</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={quickActions.focusMode}
                        onChange={(e) => setQuickActions(prev => ({ ...prev, focusMode: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Focus mode (hide distractions)</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={quickActions.goalMode}
                        onChange={(e) => {
                          setQuickActions(prev => ({ ...prev, goalMode: e.target.checked }))
                          // Set default target when enabling goal mode
                          if (e.target.checked && projectStats.targetWords === 0) {
                            setProjectStats(prev => ({ 
                              ...prev, 
                              targetWords: formatType === 'novel' ? 50000 : 10000 
                            }))
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Goal Mode (NaNoWriMo-style progress tracking)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-8">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Save settings
                    console.log('Saving settings:', { currentWork, projectStats, quickActions })
                    setShowSettings(false)
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
