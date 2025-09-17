import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../../../auth'

interface RouteParams {
  params: {
    id: string
  }
}

// POST /api/works/[id]/glossary - Create/update glossary entry
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // For now, return a mock response since we need to implement glossary methods
    const glossaryEntry = {
      id: Date.now().toString(),
      term,
      definition,
      category: category || 'general',
      aliases,
      chapters,
      workId,
      createdAt: new Date().toISOString()
    }

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
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workId = params.id

    // For now, return empty array since we need to implement getWorkGlossary
    const glossaryEntries: any[] = []

    return NextResponse.json({
      success: true,
      glossary: glossaryEntries
    })

  } catch (error) {
    console.error('Glossary fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch glossary' },
      { status: 500 }
    )
  }
}
