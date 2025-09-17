'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useUser } from '@/hooks/useUser'

export default function TestAuth() {
  const { data: session, status } = useSession()
  const { userId, isAuthenticated, isLoading, userEmail } = useUser()

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">NextAuth Session:</h2>
          <p>Status: {status}</p>
          <p>User ID: {session?.user?.id || 'null'}</p>
          <p>Email: {session?.user?.email || 'null'}</p>
          <p>Name: {session?.user?.name || 'null'}</p>
        </div>

        <div className="bg-blue-100 p-4 rounded">
          <h2 className="font-semibold">useUser Hook:</h2>
          <p>Is Authenticated: {isAuthenticated.toString()}</p>
          <p>Is Loading: {isLoading.toString()}</p>
          <p>User ID: {userId || 'null'}</p>
          <p>User Email: {userEmail || 'null'}</p>
        </div>

        <div className="space-x-4">
          {!session ? (
            <button 
              onClick={() => signIn('google')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Sign In with Google
            </button>
          ) : (
            <button 
              onClick={() => signOut()}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          )}
        </div>

        {session && (
          <div className="bg-green-100 p-4 rounded">
            <h2 className="font-semibold">Test API Calls:</h2>
            <button 
              onClick={async () => {
                console.log('Testing like API...')
                try {
                  const response = await fetch('/api/likes?userId=' + userId + '&workId=work1')
                  const data = await response.json()
                  console.log('Like API response:', data)
                } catch (error) {
                  console.error('Like API error:', error)
                }
              }}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 mr-2"
            >
              Test Like API
            </button>
            <button 
              onClick={async () => {
                console.log('Testing bookmark API...')
                try {
                  const response = await fetch('/api/bookmarks?userId=' + userId + '&workId=work1')
                  const data = await response.json()
                  console.log('Bookmark API response:', data)
                } catch (error) {
                  console.error('Bookmark API error:', error)
                }
              }}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              Test Bookmark API
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
