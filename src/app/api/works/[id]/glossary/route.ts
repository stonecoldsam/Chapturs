import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../../../auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// POST /api/works/[id]/glossary - Create/update glossary entry
export async function POST(request: NextRequest, props: RouteParams) {
  const params = await props.params;
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workId = params.id
    const body = await request.json()
    const {
      term,
      definition,
      category,
      aliases = [],
      chapters = []
    } = body

    if (!term || !definition) {
      return NextResponse.json(
        { error: 'Term and definition are required' },
        { status: 400 }
      )
    }

    // Verify user owns this work
    // Need to check: User -> Author -> Work ownership
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: { 
        authorId: true,
        author: {
          select: { userId: true }
        }
      }
    })

    if (!work) {
      return NextResponse.json({ error: 'Work not found' }, { status: 404 })
    }

    if (work.author.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized - You do not own this work' }, { status: 403 })
    }

    // Create glossary entry
    // Note: updatedAt will be set by database DEFAULT CURRENT_TIMESTAMP
    const glossaryEntry = await prisma.glossaryEntry.create({
      data: {
        workId,
        term,
        definition
      }
    })

    return NextResponse.json({
      success: true,
      entry: glossaryEntry
    })

  } catch (error: any) {
    console.error('Glossary entry creation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create glossary entry',
        details: error?.message || 'Unknown error',
        code: error?.code
      },
      { status: 500 }
    )
  }
}

// GET /api/works/[id]/glossary - Get work glossary entries
export async function GET(request: NextRequest, props: RouteParams) {
  const params = await props.params;
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workId = params.id

    // Fetch all glossary entries for this work
    const glossaryEntries = await prisma.glossaryEntry.findMany({
      where: { workId },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({
      success: true,
      entries: glossaryEntries
    })

  } catch (error: any) {
    console.error('Glossary fetch error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch glossary',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}
