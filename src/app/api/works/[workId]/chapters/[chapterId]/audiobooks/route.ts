import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/PrismaService'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workId: string; chapterId: string }> }
) {
  try {
    const { workId, chapterId } = await params

    // Fetch all audiobooks for this chapter
    const audiobooks = await prisma.fanAudiobook.findMany({
      where: {
        workId,
        chapterId,
        status: 'active',
      },
      include: {
        narrator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
      orderBy: [
        { tier: 'asc' }, // TIER_1_OFFICIAL comes first
        { qualityOverall: 'desc' },
      ],
    })

    // Determine current default
    const section = await prisma.section.findUnique({
      where: { id: chapterId },
      select: { defaultAudiobookId: true },
    })

    const currentDefault = section?.defaultAudiobookId || audiobooks[0]?.id || null

    // Format response
    const formattedAudiobooks = audiobooks.map((a: any) => ({
      id: a.id,
      tier: a.tier,
      narratorName:
        a.tier === 'TIER_1_OFFICIAL'
          ? 'Official AI Voice'
          : a.narrator?.displayName || a.narrator?.username || 'Anonymous',
      narratorId: a.narratorId,
      durationSeconds: a.durationSeconds,
      qualityOverall: a.qualityOverall,
      ratingCount: a.ratingCount,
      isDefault: a.id === currentDefault,
      isPlaying: false, // Will be set by client based on current state
    }))

    return NextResponse.json({
      currentDefault,
      audiobooks: formattedAudiobooks,
    })
  } catch (error) {
    console.error('Failed to fetch audiobooks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audiobooks' },
      { status: 500 }
    )
  }
}
