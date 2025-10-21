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
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Query with a short timeout to prevent hanging
    const user = await Promise.race([
      prisma.user.findUnique({
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
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 3000)
      )
    ])

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Error fetching current user:', error)
    
    // Return error with appropriate status
    if (error instanceof Error && error.message === 'Database query timeout') {
      return NextResponse.json(
        { error: 'Database timeout - try again' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}
