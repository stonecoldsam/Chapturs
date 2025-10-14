import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/creator/works - Get all creator's works with counts
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get author record
    const author = await prisma.author.findFirst({
      where: { userId: session.user.id }
    })

    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 })
    }

    // Get all works with counts using raw SQL
    const works = await prisma.$queryRaw`
      SELECT 
        w.id,
        w.title,
        w."coverImage",
        (SELECT COUNT(*)::int FROM chapters c WHERE c."workId" = w.id) as "chapterCount",
        (SELECT COUNT(*)::int FROM glossary_terms gt WHERE gt."workId" = w.id) as "glossaryCount",
        (SELECT COUNT(*)::int FROM character_profiles cp WHERE cp."workId" = w.id) as "characterCount"
      FROM works w
      WHERE w."authorId" = ${author.id}
      ORDER BY w."createdAt" DESC
    ` as Array<{
      id: string
      title: string
      coverImage: string | null
      chapterCount: number
      glossaryCount: number
      characterCount: number
    }>

    // Transform the data to match expected format
    const transformedWorks = works.map(work => ({
      id: work.id,
      title: work.title,
      coverImage: work.coverImage,
      _count: {
        chapters: work.chapterCount,
        glossaryTerms: work.glossaryCount,
        characters: work.characterCount
      }
    }))

    return NextResponse.json({
      success: true,
      works: transformedWorks
    })

  } catch (error: any) {
    console.error('Fetch creator works error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch works',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}
