'use client'

import { ReactNode } from 'react'

interface ProfileLayoutProps {
  sidebar: ReactNode
  featured: ReactNode
  blocks: ReactNode
}

/**
 * ProfileLayout - v0.1
 * Three-section layout for creator profiles:
 * 1. Left Sidebar: Profile photo + bio (~50% width of featured)
 * 2. Center: Featured/prominent content space
 * 3. Right: Block grid (ghost area) for customizable blocks
 */
export default function ProfileLayout({
  sidebar,
  featured,
  blocks
}: ProfileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Profile Photo + Bio */}
          <div className="col-span-12 lg:col-span-3">
            {sidebar}
          </div>

          {/* Center - Featured Content Space */}
          <div className="col-span-12 lg:col-span-5">
            {featured}
          </div>

          {/* Right - Block Grid (Ghost Area) */}
          <div className="col-span-12 lg:col-span-4">
            {blocks}
          </div>
        </div>
      </div>
    </div>
  )
}
