import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../../auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/works/publish - Convert draft to published work
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { draftId, publishData } = body

    if (!draftId) {
      return NextResponse.json(
        { error: 'Draft ID is required' },
        { status: 400 }
      )
    }

    // Get the author profile for this user
    let author = await prisma.author.findUnique({
      where: { userId: session.user.id }
    })

    if (!author) {
      return NextResponse.json({ error: 'Author profile not found' }, { status: 404 })
    }

    // Find the draft
    const draft = await prisma.work.findFirst({
      where: {
        id: draftId,
        authorId: author.id,
        status: 'unpublished'
      },
      include: {
        sections: true
      }
    })

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found or not owned by user' }, { status: 404 })
    }

    // Check if draft has content
    if (!draft.sections || draft.sections.length === 0) {
      return NextResponse.json(
        { error: 'Cannot publish work without content. Please add at least one chapter or section.' },
        { status: 400 }
      )
    }

    // Check for minimum content requirements
    const totalWordCount = draft.sections.reduce((sum, section) => sum + (section.wordCount || 0), 0)
    if (totalWordCount < 100) {
      return NextResponse.json(
        { error: 'Work must have at least 100 words of content to publish.' },
        { status: 400 }
      )
    }

    // For now, we'll change status to 'pending_review' instead of 'published'
    // This allows for future implementation of content moderation
    const publishedWork = await prisma.work.update({
      where: { id: draftId },
      data: {
        status: 'pending_review', // Will be changed to 'published' after review
        statistics: JSON.stringify({
          likes: 0,
          bookmarks: 0,
          views: 0,
          wordCount: totalWordCount,
          publishedAt: new Date().toISOString()
        })
      }
    })

    // TODO: Here we would add content validation checks:
    // - Plagiarism detection
    // - Similarity to other content
    // - Content safety (abuse, dangerous content)
    // For now, we'll auto-approve for testing
    
    // Auto-approve for testing (remove this in production)
    await prisma.work.update({
      where: { id: draftId },
      data: {
        status: 'published'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Work published successfully!',
      workId: publishedWork.id,
      status: 'published' // In production: 'pending_review'
    })

  } catch (error) {
    console.error('Work publish error:', error)
    return NextResponse.json(
      { error: 'Failed to publish work' },
      { status: 500 }
    )
  }
}
