import { NextResponse, NextRequest } from 'next/server'
import { DatabaseService } from '@/lib/database/PrismaService'
import { FeedItem } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hubMode = searchParams.get('hubMode') || 'reader'
    const userId = searchParams.get('userId')
    
    console.log('Feed API: Starting to fetch feed items...', { hubMode, userId })
    
    // Get all works from database
    const works = await DatabaseService.getAllWorks()
    console.log('Feed API: Found works in database:', works.length)
    
    // Transform works into feed items
    const feedItems: FeedItem[] = works.map(work => ({
      id: `${work.id}-feed`,
      work: work,
      feedType: 'discovery' as const,
      score: Math.random(), // Random score for now
      readingStatus: 'unread' as const,
      liked: false,
      addedToFeedAt: new Date()
    }))
    
    console.log('Feed API: Successfully created feed items:', feedItems.length)
    
    return NextResponse.json({
      success: true,
      count: feedItems.length,
      items: feedItems
    })
  } catch (error) {
    console.error('Feed API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        items: []
      }, 
      { status: 500 }
    )
  }
}
