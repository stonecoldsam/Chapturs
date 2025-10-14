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
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: { authorId: true }
    })

    if (!work) {
      return NextResponse.json({ error: 'Work not found' }, { status: 404 })
    }

    if (work.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Create glossary entry with chapter-aware definition
    const currentChapter = chapters && chapters.length > 0 ? chapters[0] : 1
    
    const glossaryEntry = await prisma.glossaryEntry.create({
      data: {
        workId,
        term,
        definition,
        type: category === 'character' ? 'character' : 'term',
        category,
        chapterIntroduced: currentChapter,
        aliases: aliases && aliases.length > 0 ? JSON.stringify(aliases) : null,
        definitions: {
          create: {
            definition,
            fromChapter: currentChapter,
            notes: `Initial definition from chapter ${currentChapter}`
          }
        }
      },
      include: {
        definitions: true
      }
    })

    return NextResponse.json({
      success: true,
      entry: glossaryEntry
    })

  } catch (error) {
    console.error('Glossary entry creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create glossary entry' },
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

  } catch (error) {
    console.error('Glossary fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch glossary' },
      { status: 500 }
    )
  }
}
