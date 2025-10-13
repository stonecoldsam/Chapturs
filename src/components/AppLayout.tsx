'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

interface HubContextType {
  currentHub: 'reader' | 'creator'
  setCurrentHub: (hub: 'reader' | 'creator') => void
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
}

const HubContext = createContext<HubContextType | undefined>(undefined)

export const useHub = () => {
  const context = useContext(HubContext)
  if (context === undefined) {
    throw new Error('useHub must be used within a HubProvider')
  }
  return context
}

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  // Determine current hub based on URL
  const currentHub: 'reader' | 'creator' = pathname.startsWith('/creator') ? 'creator' : 'reader'
  
  const setCurrentHub = (hub: 'reader' | 'creator') => {
    // Navigation is handled by the sidebar buttons now
    // This is just for compatibility with existing code
  }

  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (systemPrefersDark) {
      setTheme('dark')
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const handleThemeChange = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const handleHubChange = (hub: 'reader' | 'creator') => {
    // Navigation is handled by the sidebar buttons now
    // This just updates any hub-aware components
  }

  return (
    <HubContext.Provider value={{ currentHub, setCurrentHub, theme, setTheme }}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar
          currentHub={currentHub}
          onHubChange={handleHubChange}
          theme={theme}
          onThemeChange={handleThemeChange}
        />
        
        {/* Main Content */}
        <div className="ml-64 min-h-screen">
          <main className={pathname.includes('/editor') ? '' : 'p-6'}>
            {children}
          </main>
        </div>
      </div>
    </HubContext.Provider>
  )
}
