import { NextResponse } from 'next/server'
import { auth } from '../../../../../auth'
import { prisma } from '@/lib/database/PrismaService'

/**
 * GET /api/auth/current-user
 * 
 * Returns the current user's full profile including username.
 * Used by UsernameGuard to check if username needs to be set.
 */
export async function GET() {
  try {
    // Set a 5-second timeout for the entire request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    try {
      const session = await auth()

      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatar: true,
          verified: true,
          createdAt: true
        }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ user })

    } finally {
      clearTimeout(timeoutId)
    }

  } catch (error) {
    console.error('Error fetching current user:', error)
    
    // Return 503 (Service Unavailable) instead of 500 if it looks like a timeout
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}
