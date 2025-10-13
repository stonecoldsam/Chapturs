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
        <div className="ml-64 min-h-screen flex flex-col">
          <main className={`flex-1 ${pathname.includes('/editor') ? '' : 'p-6'}`}>
            {children}
          </main>
          
          {/* Footer */}
          <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-4 px-6">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-semibold">Chapturs</span>
                <span className="mx-2">·</span>
                <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs font-semibold rounded">
                  BETA
                </span>
              </div>
              <div className="flex items-center gap-4">
                <a 
                  href="/legal/privacy" 
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Privacy
                </a>
                <a 
                  href="/legal/terms" 
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Terms
                </a>
                <a 
                  href="/legal/creator-agreement" 
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Creator Agreement
                </a>
                <a 
                  href="/about/roadmap" 
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Roadmap
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </HubContext.Provider>
  )
}
