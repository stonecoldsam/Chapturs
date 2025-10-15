import { redirect } from 'next/navigation'
import { auth } from '@/auth'

/**
 * Creator Profile Editor - v0.1
 * Placeholder page for editing creator profiles
 * Full editing interface will be implemented in v0.4
 */
export default async function CreatorProfileEditPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-gray-800 border border-gray-700 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-4">
          Profile Editor
        </h1>
        <div className="space-y-4 text-gray-300">
          <p>
            Welcome to the Creator Profile Editor! This feature is currently under development.
          </p>
          
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-300 mb-2">
              🚧 Coming in v0.4 - v0.6
            </h2>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Edit profile info (photo, bio, featured work)</li>
              <li>• Add and arrange content blocks</li>
              <li>• Customize colors and fonts</li>
              <li>• Live preview of your profile</li>
              <li>• Choose from starter templates</li>
            </ul>
          </div>

          <div className="pt-4">
            <h3 className="font-semibold text-gray-200 mb-2">Current Implementation:</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>✅ v0.1 - Profile layout structure</li>
              <li>✅ v0.1 - Database schema</li>
              <li>✅ v0.1 - Public profile viewing</li>
              <li>⏳ v0.2 - Block components</li>
              <li>⏳ v0.3 - Social integrations</li>
              <li>⏳ v0.4 - Editor interface</li>
            </ul>
          </div>

          <div className="pt-4">
            <a
              href="/creator/dashboard"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
