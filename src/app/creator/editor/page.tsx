'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import ChaptursEditor from '@/components/ChaptursEditor'
import ConfirmMatureModal from '@/components/ConfirmMatureModal'
import AdvancedUploader from '@/components/AdvancedUploader'
import AppLayout from '@/components/AppLayout'
import { ContentFormat } from '@/types'
import { ChaptDocument } from '@/types/chapt'
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
  const workId = searchParams?.get('workId') || (params?.workId as string | undefined)
  const draftId = searchParams?.get('draftId') || undefined
  const chapterId = params?.chapterId as string | undefined
  const formatType = (searchParams?.get('format') || 'novel') as ContentFormat
  const mode = searchParams?.get('mode') === 'edit' ? 'edit' : 'create'

  console.log('Editor page loaded with:', { formatType, mode, workId, draftId, chapterId })
  console.log('Should use experimental editor?', formatType === 'experimental')

  // UI State
  const [editorMode, setEditorMode] = useState<EditorMode>({ type: 'editor' })
  const [showSettings, setShowSettings] = useState(false)
  const [currentWork, setCurrentWork] = useState({
    id: workId || draftId,
    title: '',
    description: '',
    formatType,
    status: mode === 'create' ? 'unpublished' : 'draft' as 'draft' | 'ongoing' | 'completed' | 'unpublished',
    chaptersCount: 0,
    wordsCount: 0,
    subscribers: 0,
    isDraft: Boolean(draftId), // Track if this is working with a draft
    hasContent: false // Track if work has any content yet
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
    // Load work data if in edit mode, or draft data if working with a draft
    if (mode === 'edit' && workId) {
      loadWorkData(workId)
    } else if (mode === 'create' && draftId) {
      loadDraftData(draftId)
    }
  }, [mode, workId, draftId])

  const loadWorkData = async (workId: string) => {
    try {
      console.log('Loading work data for workId:', workId)
      const response = await fetch(`/api/works/${workId}`)
      if (response.ok) {
        const result = await response.json()
        console.log('Loaded work data:', result)
        setCurrentWork(prev => ({
          ...prev,
          title: result.work.title,
          description: result.work.description,
          formatType: result.work.formatType || prev.formatType,
          status: result.work.status || prev.status,
          chaptersCount: result.work.sections?.length || 0,
          wordsCount: result.work.statistics?.wordCount || 0,
          hasContent: (result.work.sections?.length || 0) > 0
        }))
      } else {
        console.error('Failed to load work data, status:', response.status)
      }
    } catch (error) {
      console.error('Error loading work data:', error)
    }
  }

  const loadDraftData = async (draftId: string) => {
    try {
      console.log('Loading draft data for draftId:', draftId)
      const response = await fetch(`/api/works/drafts`)
      if (response.ok) {
        const result = await response.json()
        const draft = result.drafts.find((d: any) => d.id === draftId)
        if (draft) {
          console.log('Loaded draft data:', draft)
          setCurrentWork(prev => ({
            ...prev,
            title: draft.title,
            description: draft.description,
            formatType: draft.formatType || prev.formatType,
            status: draft.status || prev.status,
            hasContent: false // Drafts start with no content
          }))
        } else {
          console.error('Draft not found with id:', draftId)
        }
      } else {
        console.error('Failed to load drafts, status:', response.status)
      }
    } catch (error) {
      console.error('Error loading draft data:', error)
    }
  }

  const handleSave = async (data: any) => {
    console.log('=== SAVE CLICKED ===')
    console.log('Saving:', data)
    console.log('Current state:', { workId, draftId, isDraft: currentWork.isDraft })
    
    // Update content tracking
    if (data.content && data.content.trim().length > 100) { // Require meaningful content
      setCurrentWork(prev => ({ ...prev, hasContent: true }))
    }
    
    try {
      // If no workId or draftId, create a new draft
      if (!workId && !draftId) {
        console.log('Creating new draft...')
        const response = await fetch('/api/works/drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: currentWork.title || 'Untitled Work',
            description: currentWork.description || 'A new work in progress',
            formatType: currentWork.formatType || 'novel'
          })
        })

        if (response.ok) {
          const result = await response.json()
          console.log('Draft created:', result)
          
          // Update URL with draftId and reload
          const newDraftId = result.draft?.id
          if (newDraftId) {
            alert('Draft created! Reloading to continue editing...')
            window.location.href = `/creator/editor?draftId=${newDraftId}&format=${currentWork.formatType}`
            return
          }
        } else {
          const error = await response.json()
          console.error('Failed to create draft:', error)
          alert(`Failed to save draft: ${error.error}`)
          return
        }
      } else if (draftId) {
        // Update existing draft - save chapter content
        console.log('Saving chapter to draft:', draftId)
        
        // For now, just show success since we need the sections API
        alert('Chapter content saved! (Backend integration pending)')
        setProjectStats(prev => ({
          ...prev,
          lastSaved: new Date(),
          totalWords: data.wordCount || prev.totalWords
        }))
        return
      } else if (workId) {
        // Save chapter to existing work
        console.log('Saving chapter to work:', workId)
        
        const response = await fetch(`/api/works/${workId}/sections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: data.title || 'Untitled Chapter',
            content: data.content,
            wordCount: data.wordCount || 0,
            status: 'draft'
          })
        })

        if (response.ok) {
          const result = await response.json()
          console.log('Chapter saved:', result)
          alert('Chapter saved as draft!')
        } else {
          const error = await response.json()
          console.error('Failed to save chapter:', error)
          alert(`Failed to save chapter: ${error.error}`)
        }
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert('Failed to save. Please try again.')
    }
    
    setProjectStats(prev => ({
      ...prev,
      lastSaved: new Date(),
      totalWords: data.wordCount || prev.totalWords
    }))
  }

  const handlePublish = async (data: any) => {
    console.log('Publishing:', data)
    
    // Check if work has content before publishing
    if (!currentWork.hasContent) {
      alert('Cannot publish work without content. Please add at least one chapter or section first.')
      return
    }

    // If this is a draft, we need to convert it to a published work
    if (currentWork.isDraft && draftId) {
      try {
        const response = await fetch(`/api/works/publish`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            draftId: draftId,
            publishData: data
          })
        })

        if (response.ok) {
          const result = await response.json()
          // If the server says confirmation is required for mature content, prompt the author
            if (result.confirmationRequired) {
              // Open modal with details and wait for user action
              setModalState({
                open: true,
                suggestedRating: result.suggestedRating,
                validationDetails: result.validationDetails || result.validation || result.details || {}
              })
              return
            }

          // Queue quality assessment for first chapter (non-blocking)
          if (result.workId && result.firstSectionId) {
            try {
              await fetch('/api/quality-assessment/queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  workId: result.workId,
                  sectionId: result.firstSectionId,
                  priority: 'normal'
                })
              })
              console.log('Quality assessment queued for:', result.workId)
            } catch (error) {
              console.error('Failed to queue quality assessment:', error)
              // Non-critical, don't block publish flow
            }
          }

          // Normal success path
          alert('Work submitted for review! It will appear in the library once approved.')
          // Redirect to the new published work
          window.location.href = `/work/${result.workId}`
        } else {
          const error = await response.json()
          alert(`Failed to publish: ${error.error}`)
        }
      } catch (error) {
        console.error('Error publishing work:', error)
        alert('Failed to publish work. Please try again.')
      }
    } else {
      // For existing works, just update the content
      alert('Content saved and updated!')
    }
  }

  // Modal state and handlers
  const [modalState, setModalState] = useState({ open: false, suggestedRating: undefined as string | undefined, validationDetails: undefined as any })

  const handleModalConfirm = async () => {
    if (!draftId) return
    setModalState(prev => ({ ...prev, open: false }))
    try {
      const overrideResp = await fetch(`/api/works/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId: draftId, publishData: { authorOverride: true } })
      })
      if (overrideResp.ok) {
        const final = await overrideResp.json()
        alert('Work published successfully!')
        window.location.href = `/work/${final.workId}`
        return
      } else {
        const err = await overrideResp.json()
        alert(`Failed to publish after confirmation: ${err.error || JSON.stringify(err)}`)
        return
      }
    } catch (e) {
      console.error('Error confirming publish:', e)
      alert('Failed to publish after confirmation. Please try again.')
    }
  }

  const handleModalCancel = () => {
    setModalState(prev => ({ ...prev, open: false }))
    alert('Publishing cancelled. You can edit your content or explicitly mark the work as mature in settings.')
  }

  const handleUploadComplete = (results: any[]) => {
    console.log('Upload completed:', results)
    
    // Track if content was uploaded
    if (results.length > 0 && results[0].sections?.length > 0) {
      setCurrentWork(prev => ({ ...prev, hasContent: true }))
      setEditorMode({ type: 'editor' }) // Switch to editor mode to edit uploaded content
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
      <div className="fixed inset-0 left-64 flex flex-col bg-gray-900">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex-shrink-0">
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
                    {currentWork.isDraft && (
                      <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                        DRAFT
                      </span>
                    )}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {mode === 'create' 
                      ? currentWork.isDraft 
                        ? 'Working on draft - not published yet' 
                        : 'Create your next masterpiece'
                      : `${currentWork.chaptersCount} chapters • ${currentWork.wordsCount.toLocaleString()} words`
                    }
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
                {/* Publish Button - only show for drafts with content */}
                {currentWork.isDraft && currentWork.hasContent && (
                  <button
                    onClick={() => handlePublish({ 
                      content: 'current_content', // This would be the actual content from the editor
                      readyForReview: true 
                    })}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-1"
                  >
                    <Upload size={16} />
                    <span>Publish Work</span>
                  </button>
                )}
                
                {/* Content Warning for empty drafts */}
                {currentWork.isDraft && !currentWork.hasContent && (
                  <div className="px-3 py-2 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-lg text-sm">
                    Add content to enable publishing
                  </div>
                )}

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
            <ChaptursEditor
              workId={workId || 'new'}
              chapterId={chapterId}
              onSave={async (document: ChaptDocument) => {
                console.log('Saving chapter:', document)
                
                // Convert ChaptDocument to API format
                const saveData = {
                  title: document.metadata.title,
                  content: JSON.stringify(document.content),
                  wordCount: document.metadata.wordCount,
                  status: document.metadata.status,
                  chaptNumber: document.metadata.chapterNumber
                }
                
                await handleSave(saveData)
              }}
              onPublish={async (document: ChaptDocument) => {
                console.log('=== PUBLISH CLICKED ===')
                console.log('Publishing chapter:', document)
                console.log('Current state:', { workId, draftId, isDraft: currentWork.isDraft, hasContent: currentWork.hasContent })
                
                // Convert ChaptDocument to API format
                const publishData = {
                  title: document.metadata.title,
                  content: JSON.stringify(document.content),
                  wordCount: document.metadata.wordCount,
                  status: 'published',
                  chaptNumber: document.metadata.chapterNumber
                }
                
                console.log('Publish data:', publishData)
                
                // Use handlePublish for drafts, or direct API call for existing works
                if (currentWork.isDraft && draftId) {
                  console.log('Publishing draft via handlePublish...')
                  await handlePublish(publishData)
                } else if (workId) {
                  console.log('Publishing chapter to existing work:', workId)
                  // Publishing a chapter on an existing work
                  try {
                    const response = await fetch(`/api/works/${workId}/sections`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(publishData)
                    })

                    console.log('API response status:', response.status)
                    
                    if (response.ok) {
                      const result = await response.json()
                      console.log('Chapter published successfully:', result)

                      // Queue quality assessment for the published chapter
                      if (result.section?.id) {
                        try {
                          await fetch('/api/quality-assessment/queue', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              workId: workId,
                              sectionId: result.section.id,
                              priority: 'normal'
                            })
                          })
                          console.log('Quality assessment queued for chapter:', result.section.id)
                        } catch (error) {
                          console.error('Failed to queue quality assessment:', error)
                          // Non-critical, don't block publish flow
                        }
                      }

                      alert('Chapter published successfully!')
                      // Optionally reload or redirect
                      window.location.reload()
                    } else {
                      const error = await response.json()
                      console.error('API error response:', error)
                      alert(`Failed to publish chapter: ${error.error}`)
                    }
                  } catch (error) {
                    console.error('Error publishing chapter:', error)
                    alert('Failed to publish chapter. Please try again.')
                  }
                } else {
                  // No workId or draftId - need to create work first
                  console.error('Cannot publish: No workId or draftId')
                  alert('Please save your work as a draft first before publishing.')
                }
              }}
            />
          ) : (
            <div className="h-full overflow-auto p-6">`
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
                  workId={draftId || workId} // Use draftId for new drafts, workId for existing works
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
