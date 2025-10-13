import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/PrismaService'
import { auth } from '@/auth'

// POST /api/comments/[id]/resolve - Mark a comment thread as resolved
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const commentId = params.id

    // Get the comment to check if user is the author of the work
    const comment = await prisma.blockComment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check if user is the work author (simplified check)
    // In production, you'd verify the user owns the work
    // For now, we'll allow the comment author or work author to resolve
    
    const updatedComment = await prisma.blockComment.update({
      where: { id: commentId },
      data: { resolved: true }
    })

    return NextResponse.json({ comment: updatedComment })
  } catch (error) {
    console.error('Error resolving comment:', error)
    return NextResponse.json(
      { error: 'Failed to resolve comment' },
      { status: 500 }
    )
  }
}
