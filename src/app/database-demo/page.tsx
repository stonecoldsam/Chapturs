'use client'

import { useState } from 'react'
import AppLayout from '@/components/AppLayout'

export default function DatabaseDemo() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [useDatabase, setUseDatabase] = useState(false)

  const testAPI = async (action: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/database?action=${action}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
    setLoading(false)
  }

  const testCreateWork = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createWork',
          data: {
            title: 'Test Novel from Database',
            description: 'This is a test novel created through the database API to verify the upload workflow.',
            authorId: 'author1',
            formatType: 'novel',
            genres: ['Test', 'Demo'],
            tags: ['database', 'api', 'test']
          }
        })
      })
      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
    setLoading(false)
  }

  const toggleDatabase = async () => {
    // This would require server restart to take effect
    setUseDatabase(!useDatabase)
    alert(`Database mode toggled to: ${!useDatabase ? 'ENABLED' : 'DISABLED'}. ` + 
          'In production, this would be controlled by environment variables.')
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">🗄️ Database Integration Demo</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Database Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-semibold text-green-800 dark:text-green-200">✅ SQLite Database</h3>
              <p className="text-sm text-green-600 dark:text-green-300">Local development database ready</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">📊 Prisma ORM</h3>
              <p className="text-sm text-blue-600 dark:text-blue-300">Type-safe database access</p>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-semibold mb-2">Current Mode:</h3>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                Mock Data (Development)
              </span>
              <button
                onClick={toggleDatabase}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
              >
                Toggle to Database Mode
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🧪 Database Testing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => testAPI('works')}
              disabled={loading}
              className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Get All Works'}
            </button>
            <button
              onClick={() => testAPI('init')}
              disabled={loading}
              className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Initialize DB'}
            </button>
            <button
              onClick={testCreateWork}
              disabled={loading}
              className="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Create Test Work'}
            </button>
          </div>
          
          {results && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold mb-2">API Response:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">📚 Database Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="http://localhost:5555"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              🔍 Open Prisma Studio
            </a>
            <a
              href="/creator/upload"
              className="flex items-center justify-center px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              📝 Test Creator Upload
            </a>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">💡 How to Switch to Database Mode</h3>
          <ol className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>1. Set <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">USE_DATABASE=true</code> in .env.local</li>
            <li>2. Restart the development server</li>
            <li>3. All data operations will use the real SQLite database</li>
            <li>4. Content uploaded through Creator Hub will persist</li>
            <li>5. Subscriptions, bookmarks, and reading history will be saved</li>
          </ol>
        </div>
      </div>
    </AppLayout>
  )
}
