import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/PrismaService'
import { auth } from '@/auth'

// PATCH /api/comments/[id] - Update comment
export async function PATCH(
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

    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
      include: {
        work: {
          select: {
            authorId: true
          }
        }
      }
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { content, isPinned, isHidden } = body

    // Handle content update (only by comment author within 5 minutes)
    if (content !== undefined) {
      if (comment.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'You can only edit your own comments' },
          { status: 403 }
        )
      }

      // Check if within edit window (5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      if (comment.createdAt < fiveMinutesAgo && !comment.isEdited) {
        return NextResponse.json(
          { error: 'Edit window has expired (5 minutes)' },
          { status: 400 }
        )
      }

      if (!content || content.trim().length === 0) {
        return NextResponse.json(
          { error: 'Comment content is required' },
          { status: 400 }
        )
      }

      if (content.length > 5000) {
        return NextResponse.json(
          { error: 'Comment is too long (max 5000 characters)' },
          { status: 400 }
        )
      }

      const updatedComment = await prisma.comment.update({
        where: { id: params.id },
        data: {
          content: content.trim(),
          isEdited: true,
          editedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true
            }
          },
          likes: true
        }
      })

      return NextResponse.json({
        comment: {
          ...updatedComment,
          likeCount: updatedComment.likes.length
        }
      })
    }

    // Handle pin/hide operations (only by work creator)
    if (isPinned !== undefined || isHidden !== undefined) {
      // Check if user is the work creator
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          authorProfile: true
        }
      })

      const isCreator = user?.authorProfile?.id === comment.work.authorId
      const isModerator = user?.role === 'moderator' || user?.role === 'admin'

      if (!isCreator && !isModerator) {
        return NextResponse.json(
          { error: 'Only the work creator can pin/hide comments' },
          { status: 403 }
        )
      }

      const updateData: any = {}
      if (isPinned !== undefined) updateData.isPinned = isPinned
      if (isHidden !== undefined) updateData.isHidden = isHidden

      const updatedComment = await prisma.comment.update({
        where: { id: params.id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true
            }
          },
          likes: true
        }
      })

      return NextResponse.json({
        comment: {
          ...updatedComment,
          likeCount: updatedComment.likes.length
        }
      })
    }

    return NextResponse.json(
      { error: 'No valid update fields provided' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating comment:', error)
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

// DELETE /api/comments/[id] - Delete comment
export async function DELETE(
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

    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
      include: {
        work: {
          select: {
            authorId: true
          }
        }
      }
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        authorProfile: true
      }
    })

    const isOwner = comment.userId === session.user.id
    const isCreator = user?.authorProfile?.id === comment.work.authorId
    const isModerator = user?.role === 'moderator' || user?.role === 'admin'

    if (!isOwner && !isCreator && !isModerator) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this comment' },
        { status: 403 }
      )
    }

    // Delete comment (cascade will handle replies, likes, reports)
    await prisma.comment.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
