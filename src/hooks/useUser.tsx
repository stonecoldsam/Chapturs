'use client'

import { useSession } from 'next-auth/react'
import { createContext, useContext } from 'react'

interface UserContextType {
  userId: string | null
  userEmail: string | null
  userName: string | null
  userAvatar: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

const UserContext = createContext<UserContextType>({
  userId: null,
  userEmail: null,
  userName: null,
  userAvatar: null,
  isAuthenticated: false,
  isLoading: true
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  
  const userContextValue: UserContextType = {
    userId: session?.user?.id || null, // Using the proper user ID from auth
    userEmail: session?.user?.email || null,
    userName: session?.user?.name || null,
    userAvatar: session?.user?.image || null,
    isAuthenticated: !!session,
    isLoading: status === 'loading'
  }

  return (
    <UserContext.Provider value={userContextValue}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

// Hook for getting user ID specifically
export const useUserId = () => {
  const { userId } = useUser()
  return userId
}

// Helper hook for authentication status
export const useAuth = () => {
  const { isAuthenticated, isLoading } = useUser()
  return { isAuthenticated, isLoading }
}
