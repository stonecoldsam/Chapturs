'use client'

import { useState } from 'react'
import { 
  ClockIcon, 
  PlusIcon, 
  TagIcon,
  LinkIcon,
  XMarkIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface WorldEvent {
  id: string
  title: string
  date: string
  description: string
  tags: string[]
  linkedContent?: string[]
}

interface Relationship {
  id: string
  fromEntity: string
  toEntity: string
  relationship: string
}

interface WorldbuildingData {
  events: WorldEvent[]
  relationships: Relationship[]
}

interface WorldbuildingModeProps {
  data?: WorldbuildingData
  onChange: (data: WorldbuildingData) => void
  preview: boolean
}

export default function WorldbuildingMode({ data, onChange, preview }: WorldbuildingModeProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'relationships'>('timeline')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [timelineView, setTimelineView] = useState<'list' | 'visual'>('list')

  const currentData: WorldbuildingData = data || {
    events: [],
    relationships: []
  }

  const updateData = (updates: Partial<WorldbuildingData>) => {
    onChange({ ...currentData, ...updates })
  }

  const addEvent = () => {
    const newEvent: WorldEvent = {
      id: `event_${Date.now()}`,
      title: 'New Historical Event',
      date: new Date().toISOString().split('T')[0],
      description: '', // Start with empty description so placeholder shows properly
      tags: []
    }
    updateData({ events: [...currentData.events, newEvent] })
  }

  const updateEvent = (eventId: string, updates: Partial<WorldEvent>) => {
    const events = currentData.events.map(event => 
      event.id === eventId ? { ...event, ...updates } : event
    )
    updateData({ events })
  }

  const removeEvent = (eventId: string) => {
    const events = currentData.events.filter(event => event.id !== eventId)
    updateData({ events })
  }

  const addTag = (eventId: string, tag: string) => {
    if (!tag.trim()) return
    const event = currentData.events.find(e => e.id === eventId)
    if (event && !event.tags.includes(tag)) {
      updateEvent(eventId, { tags: [...event.tags, tag] })
    }
  }

  const removeTag = (eventId: string, tagToRemove: string) => {
    const event = currentData.events.find(e => e.id === eventId)
    if (event) {
      updateEvent(eventId, { tags: event.tags.filter(tag => tag !== tagToRemove) })
    }
  }

  const getAllTags = () => {
    const tags = new Set<string>()
    currentData.events.forEach(event => {
      event.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags)
  }

  const getFilteredEvents = () => {
    if (selectedTags.length === 0) return currentData.events
    return currentData.events.filter(event => 
      selectedTags.some(tag => event.tags.includes(tag))
    )
  }

  const sortedEvents = getFilteredEvents().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (preview) {
    return (
      <div className="h-full bg-white dark:bg-gray-800 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            World Timeline
          </h2>

          {/* Timeline Visualization */}
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200 dark:bg-blue-800"></div>
            
            {sortedEvents.map((event, index) => (
              <div key={event.id} className="relative flex items-start mb-8">
                <div className="absolute left-6 w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-gray-800"></div>
                <div className="ml-16 bg-gray-50 dark:bg-gray-700 rounded-lg p-6 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {event.title}
                    </h3>
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {event.description}
                  </p>
                  {event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {sortedEvents.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <ClockIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No events in your timeline yet.</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white dark:bg-gray-800">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'timeline', name: 'Timeline', icon: ClockIcon },
            { id: 'relationships', name: 'Relationships', icon: LinkIcon },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="p-6">
        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">World Timeline</h3>
              <div className="flex items-center space-x-3">
                <select
                  value={timelineView}
                  onChange={(e) => setTimelineView(e.target.value as 'list' | 'visual')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="list">List View</option>
                  <option value="visual">Visual Timeline</option>
                </select>
                <button
                  onClick={addEvent}
                  className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Event
                </button>
              </div>
            </div>

            {/* Tag Filter */}
            {getAllTags().length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <TagIcon className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getAllTags().map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTags(prev => 
                          prev.includes(tag) 
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                        )
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Events List */}
            <div className="space-y-4">
              {sortedEvents.map((event) => (
                <div key={event.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Event Title
                          </label>
                          <input
                            type="text"
                            value={event.title}
                            onChange={(e) => updateEvent(event.id, { title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            value={event.date}
                            onChange={(e) => updateEvent(event.id, { date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <textarea
                          value={event.description}
                          onChange={(e) => updateEvent(event.id, { description: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                          placeholder="Describe what happened during this event..."
                        />
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {event.tags.map(tag => (
                            <span 
                              key={tag}
                              className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                            >
                              {tag}
                              <button
                                onClick={() => removeTag(event.id, tag)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                <XMarkIcon className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Add tag (press Enter)"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addTag(event.id, e.currentTarget.value)
                              e.currentTarget.value = ''
                            }
                          }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => removeEvent(event.id)}
                      className="ml-4 text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              {currentData.events.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No events yet. Start building your world's history!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Relationships Tab */}
        {activeTab === 'relationships' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Entity Relationships</h3>
            </div>

            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <LinkIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Relationship mapping coming soon!</p>
              <p className="text-sm mt-2">This will allow you to connect characters, locations, and events.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
