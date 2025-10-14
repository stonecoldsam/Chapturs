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

    console.log('[GET /api/creator/works] Fetching works for userId:', session.user.id)

    // Get author record
    const author = await prisma.author.findFirst({
      where: { userId: session.user.id }
    })

    console.log('[GET /api/creator/works] Author found:', author ? `id=${author.id}` : 'NOT FOUND')

    if (!author) {
      // Create author if they don't exist yet
      console.log('[GET /api/creator/works] Creating author for userId:', session.user.id)
      const newAuthor = await prisma.author.create({
        data: {
          userId: session.user.id,
          verified: false,
          socialLinks: '[]',
        }
      })
      console.log('[GET /api/creator/works] Created author:', newAuthor.id)
      
      // No works yet for new author
      return NextResponse.json({
        success: true,
        works: []
      })
    }

    // Get all works with counts using raw SQL (using correct table names for Supabase)
    console.log('[GET /api/creator/works] Querying works for authorId:', author.id)
    
    const works = await prisma.$queryRaw`
      SELECT 
        w.id,
        w.title,
        w."coverImage",
        (SELECT COUNT(*)::int FROM sections s WHERE s."workId" = w.id) as "chapterCount",
        (SELECT COUNT(*)::int FROM glossary_entries ge WHERE ge."workId" = w.id) as "glossaryCount",
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

    console.log('[GET /api/creator/works] Found', works.length, 'works')
    if (works.length > 0) {
      console.log('[GET /api/creator/works] Sample work:', JSON.stringify(works[0], null, 2))
    }

    // Transform the data to match expected format
    const transformedWorks = works.map(work => {
      const result = {
        id: work.id,
        title: work.title,
        coverImage: work.coverImage,
        _count: {
          chapters: work.chapterCount || 0,
          glossaryTerms: work.glossaryCount || 0,
          characters: work.characterCount || 0
        }
      }
      console.log('[GET /api/creator/works] Transformed work:', result.title, result._count)
      return result
    })

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
