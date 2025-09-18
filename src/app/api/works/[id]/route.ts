import { NextRequest, NextResponse } from 'next/server'
import DatabaseService from '@/lib/database/PrismaService'

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params

    console.log(`Works API: Fetching work with ID: ${id}`)

    const work = await DatabaseService.getWork(id)

    if (!work) {
      console.log(`Works API: Work not found with ID: ${id}`)
      return NextResponse.json(
        { error: 'Work not found' },
        { status: 404 }
      )
    }

    console.log(`Works API: Successfully fetched work: ${work.title}`)
    return NextResponse.json(work)

  } catch (error) {
    console.error('Works API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch work' },
      { status: 500 }
    )
  }
}
