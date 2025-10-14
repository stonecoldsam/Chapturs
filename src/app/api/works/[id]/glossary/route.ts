import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../../../auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// POST /api/works/[id]/glossary - Create/update glossary entry with chapter versioning
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
      currentChapter, // Chapter number where this definition is being created
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

    // Find or create the base glossary entry
    let glossaryEntry = await prisma.glossaryEntry.findFirst({
      where: {
        workId,
        term: {
          equals: term,
          mode: 'insensitive'
        }
      }
    })

    if (!glossaryEntry) {
      // Create new glossary entry with initial definition
      glossaryEntry = await prisma.glossaryEntry.create({
        data: {
          workId,
          term,
          definition,
          chapterIntroduced: currentChapter || 1
        }
      })
    }

    // Create a new definition version for this chapter
    await prisma.glossaryDefinitionVersion.create({
      data: {
        glossaryEntryId: glossaryEntry.id,
        definition,
        fromChapter: currentChapter || 1,
        notes: `Updated in chapter ${currentChapter || 1}`
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

// GET /api/works/[id]/glossary?chapter=X - Get work glossary entries with chapter-aware definitions
export async function GET(request: NextRequest, props: RouteParams) {
  const params = await props.params;
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workId = params.id
    const { searchParams } = new URL(request.url)
    const currentChapter = parseInt(searchParams.get('chapter') || '999999')

    // Fetch all glossary entries for this work with their definition versions
    const glossaryEntries = await prisma.glossaryEntry.findMany({
      where: { workId },
      include: {
        definitions: {
          where: {
            fromChapter: { lte: currentChapter }
          },
          orderBy: { fromChapter: 'desc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Map entries to include the correct definition for the current chapter
    const entriesWithCorrectDefinitions = glossaryEntries.map(entry => {
      // Get the most recent definition version for this chapter
      const applicableDefinition = entry.definitions[0] // Already sorted desc, so first is most recent
      
      return {
        id: entry.id,
        term: entry.term,
        definition: applicableDefinition?.definition || entry.definition, // Use versioned or fallback to base
        chapterIntroduced: entry.chapterIntroduced,
        type: entry.type,
        createdAt: entry.createdAt
      }
    })

    return NextResponse.json({
      success: true,
      entries: entriesWithCorrectDefinitions
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
