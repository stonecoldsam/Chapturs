import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/PrismaService'
import { auth } from '@/auth'

// GET /api/translations?workId=xxx&sectionId=xxx&language=xx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workId = searchParams.get('workId')
    const sectionId = searchParams.get('sectionId')
    const language = searchParams.get('language')
    const blockId = searchParams.get('blockId')

    if (!workId || !sectionId || !language) {
      return NextResponse.json(
        { error: 'Missing required parameters: workId, sectionId, language' },
        { status: 400 }
      )
    }

    const where: any = {
      workId,
      sectionId,
      language,
      status: 'approved' // Only return approved translations
    }

    if (blockId) {
      where.blockId = blockId
    }

    const translations = await prisma.translation.findMany({
      where,
      orderBy: [
        { rank: 'desc' },
        { upvotes: 'desc' },
        { createdAt: 'asc' }
      ]
    })

    return NextResponse.json({ translations })
  } catch (error) {
    console.error('Error fetching translations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch translations' },
      { status: 500 }
    )
  }
}

// POST /api/translations - Submit a new translation
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      workId,
      sectionId,
      blockId,
      sentenceId,
      language,
      text
    } = body

    // Validate required fields
    if (!workId || !sectionId || !blockId || !sentenceId || !language || !text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user is a translator
    const translatorProfile = await prisma.translatorProfile.findUnique({
      where: { userId: session.user.id }
    })

    // Get the latest version number for this sentence
    const latestTranslation = await prisma.translation.findFirst({
      where: { blockId, sentenceId, language },
      orderBy: { version: 'desc' }
    })

    const nextVersion = latestTranslation ? latestTranslation.version + 1 : 1

    // Create new translation
    const translation = await prisma.translation.create({
      data: {
        workId,
        sectionId,
        blockId,
        sentenceId,
        language,
        text,
        translatorId: session.user.id,
        version: nextVersion,
        status: translatorProfile?.trustLevel === 'trusted' || translatorProfile?.trustLevel === 'expert' 
          ? 'approved' 
          : 'pending',
        rank: translatorProfile?.trustLevel === 'expert' ? 5 : 
              translatorProfile?.trustLevel === 'trusted' ? 4 : null
      }
    })

    // Update translator profile stats
    if (translatorProfile) {
      await prisma.translatorProfile.update({
        where: { id: translatorProfile.id },
        data: {
          translationCount: { increment: 1 }
        }
      })
    }

    return NextResponse.json({ translation }, { status: 201 })
  } catch (error) {
    console.error('Error creating translation:', error)
    return NextResponse.json(
      { error: 'Failed to create translation' },
      { status: 500 }
    )
  }
}

// PATCH /api/translations/:id - Update translation status or votes
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Translation ID required' },
        { status: 400 }
      )
    }

    const { action, status } = body

    if (action === 'vote') {
      const { vote } = body // 1 for upvote, -1 for downvote

      if (vote !== 1 && vote !== -1) {
        return NextResponse.json(
          { error: 'Invalid vote value' },
          { status: 400 }
        )
      }

      // Update translation votes
      const translation = await prisma.translation.update({
        where: { id },
        data: {
          upvotes: vote === 1 ? { increment: 1 } : undefined,
          downvotes: vote === -1 ? { increment: 1 } : undefined
        }
      })

      return NextResponse.json({ translation })
    }

    if (action === 'update-status') {
      // Only moderators/admins can approve/reject
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
      })

      if (user?.role !== 'moderator' && user?.role !== 'admin') {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      const translation = await prisma.translation.update({
        where: { id },
        data: { status }
      })

      return NextResponse.json({ translation })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating translation:', error)
    return NextResponse.json(
      { error: 'Failed to update translation' },
      { status: 500 }
    )
  }
}
