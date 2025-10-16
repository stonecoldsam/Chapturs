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

    // Get all works with counts for glossary and characters pages
    console.log('[GET /api/creator/works] Querying works for authorId:', author.id)
    
    const works = await prisma.work.findMany({
      where: { authorId: author.id },
      select: { 
        id: true, 
        title: true, 
        coverImage: true,
        status: true,
        genres: true,
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
      console.log('[GET /api/creator/works] First work:', {
        id: works[0].id,
        title: works[0].title,
        coverImage: works[0].coverImage,
        counts: works[0]._count
      })
    }

    console.log('[GET /api/creator/works] Returning', works.length, 'works')
    console.log('[GET /api/creator/works] ========== END REQUEST ==========')

    return NextResponse.json({
      success: true,
      works: works.map((work: any) => ({
        id: work.id,
        title: work.title,
        coverImage: work.coverImage,
        status: work.status || 'Ongoing',
        genres: work.genres || [],
        _count: {
          chapters: work._count.sections,
          glossaryTerms: work._count.glossaryEntries,
          characters: work._count.characterProfiles
        }
      }))
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
