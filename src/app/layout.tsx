import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import UsernameGuard from '@/components/auth/UsernameGuard'
import { validateEnvironment } from '@/lib/config'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chapturs - Your Webnovel Platform',
  description: 'Discover and create amazing webnovels on the platform that combines the best of content discovery and creator monetization.',
}

// Validate environment on startup
validateEnvironment();

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Don't call auth() here - let AuthProvider handle it
  // This was causing the entire page to hang if auth was slow
  
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <AuthProvider session={null}>
          <UsernameGuard>
            {children}
          </UsernameGuard>
        </AuthProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
