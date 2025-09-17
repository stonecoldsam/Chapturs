import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../../../auth'
import PrismaService from '../../../../../lib/database/PrismaService'

interface RouteParams {
  params: {
    id: string
  }
}

// POST /api/works/[id]/sections - Create new section/chapter
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workId = params.id
    const body = await request.json()
    const {
      title,
      content,
      wordCount,
      status = 'draft'
    } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Create section using DatabaseService
    const sectionData = {
      title,
      content,
      wordCount: wordCount || 0,
      status
    }

    const section = await PrismaService.createSection({
      workId,
      title,
      content,
      wordCount: wordCount || 0
    })

    return NextResponse.json({
      success: true,
      section
    })

  } catch (error) {
    console.error('Section creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create section' },
      { status: 500 }
    )
  }
}

// GET /api/works/[id]/sections - Get work sections
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workId = params.id

    // For now, return empty array since we need to implement getWorkSections in DatabaseService
    const sections: any[] = []

    return NextResponse.json({
      success: true,
      sections
    })

  } catch (error) {
    console.error('Sections fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    )
  }
}
