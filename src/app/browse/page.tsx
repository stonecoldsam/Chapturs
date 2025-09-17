'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/AppLayout'
import { SearchFilters, Story } from '@/types'
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline'

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [searchResults, setSearchResults] = useState<Story[]>([])
  const [recommendations, setRecommendations] = useState<Story[]>([])
  const [loading, setLoading] = useState(false)

  const genres = ['Fantasy', 'Science Fiction', 'Romance', 'Mystery', 'Thriller', 'Horror', 'Adventure', 'Comedy', 'Drama', 'Historical']
  const tags = ['Magic System', 'AI', 'Time Travel', 'Dragons', 'Space Opera', 'Enemies to Lovers', 'Found Family', 'Epic Fantasy']

  const handleSearch = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock search results - prioritize exact matches
      const mockResults: Story[] = [
        // This would be replaced with actual search API
      ]
      setSearchResults(mockResults)
      
      // Load algorithmic recommendations after search
      const mockRecommendations: Story[] = [
        // This would be replaced with recommendation API
      ]
      setRecommendations(mockRecommendations)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Browse Stories</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Discover your next favorite webnovel
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search stories, authors, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Search
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Filters</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Genres */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Genres
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {genres.map((genre) => (
                    <label key={genre} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.genres?.includes(genre) || false}
                        onChange={(e) => {
                          const current = filters.genres || []
                          if (e.target.checked) {
                            updateFilter('genres', [...current, genre])
                          } else {
                            updateFilter('genres', current.filter(g => g !== genre))
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{genre}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'ongoing', label: 'Ongoing' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'hiatus', label: 'On Hiatus' }
                  ].map((status) => (
                    <label key={status.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status?.includes(status.value as any) || false}
                        onChange={(e) => {
                          const current = filters.status || []
                          if (e.target.checked) {
                            updateFilter('status', [...current, status.value])
                          } else {
                            updateFilter('status', current.filter(s => s !== status.value))
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Maturity Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maturity Rating
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'all-ages', label: 'All Ages' },
                    { value: 'mature', label: 'Mature (16+)' },
                    { value: 'adult', label: 'Adult (18+)' }
                  ].map((rating) => (
                    <label key={rating.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.maturityRating?.includes(rating.value as any) || false}
                        onChange={(e) => {
                          const current = filters.maturityRating || []
                          if (e.target.checked) {
                            updateFilter('maturityRating', [...current, rating.value])
                          } else {
                            updateFilter('maturityRating', current.filter(r => r !== rating.value))
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{rating.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort by Popularity
                </label>
                <select
                  value={filters.popularity || ''}
                  onChange={(e) => updateFilter('popularity', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">No preference</option>
                  <option value="views">Most Views</option>
                  <option value="bookmarks">Most Bookmarked</option>
                  <option value="subscriptions">Most Subscribed</option>
                </select>
              </div>

              {/* Recency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recency
                </label>
                <select
                  value={filters.recency || ''}
                  onChange={(e) => updateFilter('recency', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">No preference</option>
                  <option value="published">Recently Published</option>
                  <option value="updated">Recently Updated</option>
                </select>
              </div>

              {/* Search in Content */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.searchInContent || false}
                    onChange={(e) => updateFilter('searchInContent', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Search inside chapter text
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  May take longer but finds content within chapters
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Searching...</span>
          </div>
        )}

        {searchQuery && !loading && (
          <div className="space-y-6">
            {/* Direct Search Results */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Search Results
                {searchResults.length > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    ({searchResults.length} found)
                  </span>
                )}
              </h2>
              
              {searchResults.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium mb-2">No direct matches found</h3>
                  <p className="text-sm">Try adjusting your search terms or filters</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.map((story) => (
                    <div key={story.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                      {/* Story card content would go here */}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {story.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                        {story.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {story.genres.slice(0, 3).map((genre) => (
                          <span
                            key={genre}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Algorithmic Recommendations */}
            {recommendations.length > 0 && (
              <div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    You might also like
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 font-normal">
                      Based on your preferences
                    </span>
                  </h2>
                  
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {recommendations.map((story) => (
                      <div key={story.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {story.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                          {story.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {story.genres.slice(0, 3).map((genre) => (
                            <span
                              key={genre}
                              className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Default Trending/Popular Content */}
        {!searchQuery && !loading && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Trending Now
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Mock trending stories would be loaded here */}
                <div className="text-center py-12 text-gray-500 dark:text-gray-400 col-span-full">
                  <div className="text-4xl mb-4">📚</div>
                  <h3 className="text-lg font-medium mb-2">Start exploring</h3>
                  <p className="text-sm">Use the search bar above to find your next favorite story</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
