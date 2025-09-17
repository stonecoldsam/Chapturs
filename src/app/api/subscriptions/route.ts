import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../auth'
import DatabaseService from '@/lib/database/PrismaService'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { authorId } = await request.json()
    
    if (!authorId) {
      return NextResponse.json({ error: 'Author ID required' }, { status: 400 })
    }

    // Toggle subscription
    const isSubscribed = await DatabaseService.toggleSubscription(authorId, session.user.id)
    
    return NextResponse.json({ 
      success: true, 
      subscribed: isSubscribed,
      message: isSubscribed ? 'Subscribed successfully' : 'Unsubscribed successfully'
    })
  } catch (error) {
    console.error('Subscription toggle error:', error)
    return NextResponse.json({ 
      error: 'Failed to toggle subscription',
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
    const authorId = searchParams.get('authorId')
    
    if (!authorId) {
      return NextResponse.json({ error: 'Author ID required' }, { status: 400 })
    }

    // Check subscription status
    const isSubscribed = await DatabaseService.checkUserSubscription(session.user.id, authorId)
    
    return NextResponse.json({ 
      subscribed: isSubscribed
    })
  } catch (error) {
    console.error('Check subscription error:', error)
    return NextResponse.json({ 
      error: 'Failed to check subscription',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
