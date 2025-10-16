import { NextRequest, NextResponse } from 'next/server'
import DatabaseService, { prisma } from '@/lib/database/PrismaService'
import { auth } from '@/auth'

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

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params

    // Authenticate user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log(`Works API: Updating work ${id} for user ${session.user.id}`)

    // Verify ownership
    const existingWork = await DatabaseService.getWork(id)
    if (!existingWork) {
      return NextResponse.json(
        { error: 'Work not found' },
        { status: 404 }
      )
    }

    console.log(`Works API: Ownership check - Work authorId: ${existingWork.authorId}, Session userId: ${session.user.id}`)
    
    // Get the author ID associated with this user
    const author = await prisma.author.findUnique({
      where: { userId: session.user.id }
    })

    if (!author) {
      console.error(`Works API: No author profile found for user ${session.user.id}`)
      return NextResponse.json(
        { error: 'Author profile not found. Please create an author profile first.' },
        { status: 403 }
      )
    }

    console.log(`Works API: Found author ${author.id} for user ${session.user.id}`)

    if (existingWork.authorId !== author.id) {
      console.error(`Works API: Ownership mismatch - Work authorId: ${existingWork.authorId}, User authorId: ${author.id}`)
      return NextResponse.json(
        { error: 'Forbidden: You do not own this work' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      title,
      description,
      genres,
      tags,
      maturityRating,
      status,
      coverImage
    } = body

    console.log(`Works API: Updating work with data:`, { title, status, genres, tags })

    // Update work
    const updatedWork = await prisma.work.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(genres && { genres: JSON.stringify(genres) }),
        ...(tags && { tags: JSON.stringify(tags) }),
        ...(maturityRating && { maturityRating }),
        ...(status && { status }),
        ...(coverImage !== undefined && { coverImage }),
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        sections: {
          select: {
            id: true,
            title: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        _count: {
          select: {
            sections: true,
            likes: true
          }
        }
      }
    })

    console.log(`Works API: Successfully updated work: ${updatedWork.title}`)
    return NextResponse.json({
      success: true,
      work: updatedWork,
      message: 'Work updated successfully'
    })

  } catch (error) {
    console.error('Works API PUT Error:', error)
    return NextResponse.json(
      { error: 'Failed to update work' },
      { status: 500 }
    )
  }
}
