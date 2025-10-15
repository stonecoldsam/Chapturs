import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../../../../auth'
import DatabaseService, { prisma } from '../../../../../../lib/database/PrismaService'

interface RouteParams {
  params: Promise<{
    id: string
    sectionId: string
  }>
}

// PATCH /api/works/[id]/sections/[sectionId] - Update existing section
export async function PATCH(request: NextRequest, props: RouteParams) {
  const params = await props.params
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workId = params.id
    const sectionId = params.sectionId
    const body = await request.json()
    const { title, content, wordCount, status } = body

    // Verify the work belongs to the user
    const work = await prisma.work.findUnique({
      where: { id: workId },
      include: { author: true }
    })

    if (!work || work.author.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Verify the section belongs to this work
    const section = await prisma.section.findFirst({
      where: {
        id: sectionId,
        workId: workId
      }
    })

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    // Update the section
    const updatedSection = await prisma.section.update({
      where: { id: sectionId },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(wordCount !== undefined && { wordCount }),
        ...(status !== undefined && { status }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      section: updatedSection
    })

  } catch (error) {
    console.error('Section update error:', error)
    return NextResponse.json(
      { error: 'Failed to update section' },
      { status: 500 }
    )
  }
}

// DELETE /api/works/[id]/sections/[sectionId] - Delete section
export async function DELETE(request: NextRequest, props: RouteParams) {
  const params = await props.params
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workId = params.id
    const sectionId = params.sectionId

    // Verify the work belongs to the user
    const work = await prisma.work.findUnique({
      where: { id: workId },
      include: { author: true }
    })

    if (!work || work.author.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Verify the section belongs to this work
    const section = await prisma.section.findFirst({
      where: {
        id: sectionId,
        workId: workId
      }
    })

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    // Delete the section
    await prisma.section.delete({
      where: { id: sectionId }
    })

    return NextResponse.json({
      success: true,
      message: 'Section deleted successfully'
    })

  } catch (error) {
    console.error('Section deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete section' },
      { status: 500 }
    )
  }
}
