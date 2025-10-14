import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/database/PrismaService'

// GET /api/creator/works - Get all creator's works with counts (FIXED: 2025-10-14)
export async function GET(request: Request) {
  try {
    const session = await auth()
    console.log('[GET /api/creator/works] ========== START REQUEST ==========')
    console.log('[GET /api/creator/works] Session:', session ? {
      userId: session.user?.id,
      email: session.user?.email,
      name: session.user?.name
    } : 'NO SESSION')
    
    if (!session?.user?.id) {
      console.log('[GET /api/creator/works] ❌ Unauthorized - no session or user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[GET /api/creator/works] Fetching author for userId:', session.user.id)
    console.log('[GET /api/creator/works] Session user:', JSON.stringify({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name
    }))

    // Get author record - using findUnique since userId is @unique
    const author = await prisma.author.findUnique({
      where: { userId: session.user.id }
    })

    console.log('[GET /api/creator/works] Author found:', author ? `id=${author.id}, userId=${author.userId}` : 'NOT FOUND')

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

    // Get all works with counts using Prisma (consistent with dashboard-stats)
    console.log('[GET /api/creator/works] Querying works for authorId:', author.id)
    
    const works = await prisma.work.findMany({
      where: { authorId: author.id },
      select: {
        id: true,
        title: true,
        coverImage: true,
        _count: {
          select: {
            sections: true,
            glossaryEntries: true,
            characterProfiles: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log('[GET /api/creator/works] Found', works.length, 'works')
    if (works.length > 0) {
      console.log('[GET /api/creator/works] First work sample:', {
        id: works[0].id,
        title: works[0].title,
        coverImage: works[0].coverImage,
        counts: works[0]._count
      })
    } else {
      console.log('[GET /api/creator/works] ⚠️  NO WORKS FOUND for authorId:', author.id)
      console.log('[GET /api/creator/works] Checking if there are ANY works in the database...')
      
      // Let's check if there are ANY works in the database at all
      const anyWorks = await prisma.work.findMany({
        take: 10,
        select: { 
          id: true, 
          title: true, 
          authorId: true, 
          status: true,
          createdAt: true 
        },
        orderBy: { createdAt: 'desc' }
      })
      console.log('[GET /api/creator/works] Recent works in ENTIRE database:', JSON.stringify(anyWorks, null, 2))
      
      // Check if any of these works should belong to this user
      if (anyWorks.length > 0) {
        const authorIds = [...new Set(anyWorks.map(w => w.authorId))]
        const allAuthors = await prisma.author.findMany({
          where: { id: { in: authorIds } },
          select: { id: true, userId: true }
        })
        console.log('[GET /api/creator/works] Authors of these works:', JSON.stringify(allAuthors, null, 2))
      }
    }

    // Transform the data to match expected format
    const transformedWorks = works.map((work: any) => {
      const result = {
        id: work.id,
        title: work.title,
        coverImage: work.coverImage,
        _count: {
          chapters: work._count.sections,
          glossaryTerms: work._count.glossaryEntries,
          characters: work._count.characterProfiles
        }
      }
      return result
    })

    console.log('[GET /api/creator/works] Returning', transformedWorks.length, 'transformed works')
    console.log('[GET /api/creator/works] ========== END REQUEST ==========')


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
