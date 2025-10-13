import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../../auth'
import { prisma } from '@/lib/database/PrismaService'
import { 
  createErrorResponse, 
  createSuccessResponse, 
  generateRequestId,
  requireAuth,
  validateRequest,
  checkRateLimit,
  addCorsHeaders,
  ApiError,
  ApiErrorType
} from '@/lib/api/errorHandling'
import { z } from 'zod'
import { ContentValidationService } from '@/lib/ContentValidationService'

// use shared prisma instance from PrismaService

// Validation schema for publishing
const publishWorkSchema = z.object({
  draftId: z.string().min(1, 'Draft ID is required'),
  publishData: z.object({
    status: z.enum(['published', 'ongoing']).default('published'),
    scheduledPublishAt: z.date().optional()
  }).optional()
})

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
  const totalWordCount = draft.sections.reduce((sum: number, section: any) => sum + (section.wordCount || 0), 0)
    if (totalWordCount < 100) {
      return NextResponse.json(
        { error: 'Work must have at least 100 words of content to publish.' },
        { status: 400 }
      )
    }

    // Validate the first section (comprehensive checks)
    const firstSection = draft.sections[0]
    if (firstSection) {
      try {
        const validationResult = await ContentValidationService.validateContent(
          draftId,
          firstSection.id,
          firstSection.content,
          {
            checkPlagiarism: true,
            checkDuplicates: true,
            checkSafety: true,
            checkQuality: true,
            isFirstChapter: true
          }
        )

        // If validation returns flags other than rating suggestions, block publishing
        const nonRatingFlags = (validationResult.flags || []).filter(f => f !== 'too_short' && f !== 'repetitive_content')
        if (nonRatingFlags.length > 0) {
          return NextResponse.json(
            {
              error: 'Content validation failed. Please review and fix the issues before publishing.',
              validationErrors: validationResult.flags,
              details: validationResult.details
            },
            { status: 400 }
          )
        }

        // Auto-set maturityRating if suggestedRating is R or NC-17 unless authorOverride flag provided
        const suggested = validationResult.details?.suggestedRating
        const authorOverride = body?.publishData?.authorOverride || false
        // If the content is suggested as mature (R/NC-17) and the author has NOT explicitly confirmed,
        // return a response indicating confirmation is required. The client should prompt the author
        // and re-call this endpoint with publishData.authorOverride = true to proceed.
        if (!authorOverride && (suggested === 'R' || suggested === 'NC-17')) {
          return NextResponse.json(
            {
              success: false,
              confirmationRequired: true,
              message: 'Author confirmation required for mature content',
              suggestedRating: suggested,
              validationDetails: validationResult.details,
              validationFlags: validationResult.flags
            },
            { status: 200 }
          )
        }
        // If authorOverride provided, persist the maturity rating automatically and record an audit validation
        if (authorOverride && (suggested === 'R' || suggested === 'NC-17')) {
          await prisma.work.update({ where: { id: draftId }, data: { maturityRating: suggested } })
          try {
            await prisma.contentValidation.create({
              data: {
                workId: draftId,
                sectionId: firstSection.id,
                validationType: 'author_confirmation',
                status: 'passed',
                score: 1.0,
                details: JSON.stringify({ confirmedByAuthorId: session.user.id, suggestedRating: suggested, timestamp: new Date().toISOString(), validationDetails: validationResult.details })
              }
            })
          } catch (e) {
            console.warn('Failed to write author confirmation audit:', e)
          }
        }
      } catch (error) {
        console.error('Content validation error:', error)
        return NextResponse.json(
          { error: 'Content validation failed. Please try again.' },
          { status: 500 }
        )
      }
    }

    // Set status to 'pending_review' for moderation
    const publishedWork = await prisma.work.update({
      where: { id: draftId },
      data: {
        status: 'pending_review', // Will be changed to 'published' after moderation
        statistics: JSON.stringify({
          likes: 0,
          bookmarks: 0,
          views: 0,
          wordCount: totalWordCount,
          publishedAt: new Date().toISOString()
        })
      },
      include: {
        sections: {
          orderBy: {
            createdAt: 'asc'
          },
          take: 1
        }
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
      firstSectionId: publishedWork.sections[0]?.id,
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
