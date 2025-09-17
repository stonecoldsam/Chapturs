import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../auth'
import PrismaService from '../../../lib/database/PrismaService'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/works - Create new work with auto Author profile creation
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      formatType,
      coverImage,
      genres = [],
      tags = [],
      maturityRating = 'PG',
      status = 'draft'
    } = body

    if (!title || !description || !formatType) {
      return NextResponse.json(
        { error: 'Title, description, and format type are required' },
        { status: 400 }
      )
    }

    // Get the author profile for this user
    let author = await prisma.author.findUnique({
      where: { userId: session.user.id }
    })

    // If no author profile exists, create one
    if (!author) {
      author = await prisma.author.create({
        data: {
          userId: session.user.id,
          verified: false,
          socialLinks: '[]',
        }
      })
    }

    // Create work using DatabaseService
    const workData = {
      title,
      description,
      formatType,
      coverImageUrl: coverImage,
      status,
      maturityRating,
      genres,
      tags,
      glossary: []
    }

    const work = await PrismaService.createWork({
      title,
      description,
      authorId: author.id, // Use author.id, not user.id
      formatType,
      coverImage,
      genres,
      tags
    })

    return NextResponse.json({
      success: true,
      work
    })

  } catch (error) {
    console.error('Work creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create work' },
      { status: 500 }
    )
  }
}

// GET /api/works - Get user's works
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the author profile for this user
    let author = await prisma.author.findUnique({
      where: { userId: session.user.id }
    })

    // If no author profile exists, create one
    if (!author) {
      author = await prisma.author.create({
        data: {
          userId: session.user.id,
          verified: false,
          socialLinks: '[]',
        }
      })
    }

    const works = await PrismaService.getUserWorks(author.id)

    return NextResponse.json({
      success: true,
      works
    })

  } catch (error) {
    console.error('Works fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch works' },
      { status: 500 }
    )
  }
}
