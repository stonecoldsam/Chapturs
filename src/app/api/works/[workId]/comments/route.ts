import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/PrismaService'
import { auth } from '@/auth'

// GET /api/works/[workId]/comments - List comments
export async function GET(
  request: NextRequest,
  { params }: { params: { workId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const sectionId = searchParams.get('sectionId')
    const sort = searchParams.get('sort') || 'newest'
    const limit = parseInt(searchParams.get('limit') || '20')
    const cursor = searchParams.get('cursor')

    const where: any = {
      workId: params.workId,
      parentId: null, // Only top-level comments
      isHidden: false
    }

    if (sectionId) {
      where.sectionId = sectionId
    } else {
      where.sectionId = null // Work-level comments only
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' }
    }

    // Add cursor-based pagination
    if (cursor) {
      where.id = { lt: cursor }
    }

    // Fetch comments with user info and like counts
    const comments = await prisma.comment.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        },
        likes: {
          select: {
            userId: true
          }
        },
        replies: {
          where: { isHidden: false },
          take: 3, // Show first 3 replies
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true
              }
            },
            likes: {
              select: {
                userId: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            replies: {
              where: { isHidden: false }
            }
          }
        }
      }
    })

    // Transform data to include like counts
    const transformedComments = comments.map((comment: any) => ({
      ...comment,
      likeCount: comment.likes.length,
      replyCount: comment._count.replies,
      hasMoreReplies: comment._count.replies > 3,
      replies: comment.replies.map((reply: any) => ({
        ...reply,
        likeCount: reply.likes.length
      }))
    }))

    return NextResponse.json({
      comments: transformedComments,
      hasMore: comments.length === limit,
      nextCursor: comments.length === limit ? comments[comments.length - 1].id : null
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/works/[workId]/comments - Create new comment
export async function POST(
  request: NextRequest,
  { params }: { params: { workId: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { sectionId, content, parentId } = body

    // Validation
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

    // Verify work exists
    const work = await prisma.work.findUnique({
      where: { id: params.workId }
    })

    if (!work) {
      return NextResponse.json(
        { error: 'Work not found' },
        { status: 404 }
      )
    }

    // If sectionId provided, verify it exists and belongs to this work
    if (sectionId) {
      const section = await prisma.section.findFirst({
        where: {
          id: sectionId,
          workId: params.workId
        }
      })

      if (!section) {
        return NextResponse.json(
          { error: 'Section not found' },
          { status: 404 }
        )
      }
    }

    // If parentId provided, verify parent comment exists and depth limit
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        include: {
          parent: {
            include: {
              parent: true
            }
          }
        }
      })

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        )
      }

      // Check depth (max 3 levels)
      let depth = 1
      let current = parentComment
      while (current.parent && depth < 3) {
        current = current.parent
        depth++
      }

      if (depth >= 3) {
        return NextResponse.json(
          { error: 'Maximum reply depth reached' },
          { status: 400 }
        )
      }
    }

    // Rate limiting check (3 comments per minute)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
    const recentComments = await prisma.comment.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: oneMinuteAgo
        }
      }
    })

    if (recentComments >= 3) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before posting again.' },
        { status: 429 }
      )
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        workId: params.workId,
        sectionId: sectionId || null,
        userId: session.user.id,
        content: content.trim(),
        parentId: parentId || null
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
        ...comment,
        likeCount: 0,
        replyCount: 0
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
