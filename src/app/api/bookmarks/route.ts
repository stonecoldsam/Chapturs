import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../auth'
import DatabaseService from '@/lib/database/PrismaService'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workId } = await request.json()
    
    if (!workId) {
      return NextResponse.json({ error: 'Work ID required' }, { status: 400 })
    }

    // Toggle bookmark
    const isBookmarked = await DatabaseService.toggleBookmark(workId, session.user.id)
    
    return NextResponse.json({ 
      success: true, 
      bookmarked: isBookmarked,
      message: isBookmarked ? 'Bookmarked successfully' : 'Bookmark removed successfully'
    })
  } catch (error) {
    console.error('Bookmark toggle error:', error)
    return NextResponse.json({ 
      error: 'Failed to toggle bookmark',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workId = searchParams.get('workId')
    
    if (!workId) {
      return NextResponse.json({ error: 'Work ID required' }, { status: 400 })
    }

    // Check bookmark status
    const isBookmarked = await DatabaseService.checkUserBookmark(session.user.id, workId)
    
    return NextResponse.json({ 
      bookmarked: isBookmarked
    })
  } catch (error) {
    console.error('Check bookmark error:', error)
    return NextResponse.json({ 
      error: 'Failed to check bookmark',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
