import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/PrismaService'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workId: string; chapterId: string }> }
) {
  try {
    const { workId, chapterId } = await params
    const { searchParams } = new URL(request.url)
    const languageCode = searchParams.get('languageCode') || 'en'

    // Fetch all translations for this chapter and language
    const translations = await prisma.fanTranslation.findMany({
      where: {
        workId,
        chapterId,
        languageCode,
        status: 'active',
      },
      include: {
        translator: {
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
      orderBy: {
        qualityOverall: 'desc',
      },
    })

    // Determine current default
    const section = await prisma.section.findUnique({
      where: { id: chapterId },
      select: { defaultTranslationIdByLanguage: true },
    })

    let currentDefault = null
    if (section?.defaultTranslationIdByLanguage) {
      try {
        const defaults =
          typeof section.defaultTranslationIdByLanguage === 'string'
            ? JSON.parse(section.defaultTranslationIdByLanguage)
            : section.defaultTranslationIdByLanguage
        currentDefault = defaults[languageCode] || null
      } catch (e) {
        console.error('Failed to parse default translations:', e)
      }
    }

    // Format response
    const formattedTranslations = translations.map((t: any) => ({
      id: t.id,
      tier: t.tier,
      title: t.translatedTitle,
      translatorName:
        t.tier === 'TIER_2_COMMUNITY'
          ? 'Community Edits'
          : t.translator?.displayName || t.translator?.username || 'Anonymous',
      qualityOverall: t.qualityOverall,
      ratingCount: t.ratingCount,
      editCount: t.editCount,
      isDefault: t.id === currentDefault,
    }))

    return NextResponse.json({
      languageCode,
      currentDefault,
      translations: formattedTranslations,
    })
  } catch (error) {
    console.error('Failed to fetch translations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch translations' },
      { status: 500 }
    )
  }
}
