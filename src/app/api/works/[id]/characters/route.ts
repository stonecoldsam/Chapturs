import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../../../auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// POST /api/works/[id]/characters - Create character profile
export async function POST(request: NextRequest, props: RouteParams) {
  const params = await props.params;
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workId = params.id
    const body = await request.json()
    const {
      name,
      aliases = [],
      role,
      firstAppearance,
      imageUrl,
      physicalDescription,
      age,
      height,
      appearanceNotes,
      backstory,
      personalityTraits = [],
      motivations,
      characterArc,
      developmentTimeline,
      authorNotes,
      metadata = {}
    } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Character name is required' },
        { status: 400 }
      )
    }

    // Verify user owns this work
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: { 
        authorId: true,
        author: {
          select: { userId: true }
        }
      }
    })

    if (!work) {
      return NextResponse.json({ error: 'Work not found' }, { status: 404 })
    }

    if (work.author.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized - You do not own this work' }, { status: 403 })
    }

    // Create character profile using raw SQL to avoid Prisma client conflicts
    const result = await prisma.$queryRaw`
      INSERT INTO character_profiles (
        id, "workId", name, aliases, role, "firstAppearance",
        "imageUrl", "physicalDescription", age, height, "appearanceNotes",
        backstory, "personalityTraits", motivations,
        "characterArc", "developmentTimeline", "authorNotes", metadata,
        "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid()::text, ${workId}, ${name}, 
        ${JSON.stringify(aliases)}, ${role || null}, ${firstAppearance || null},
        ${imageUrl || null}, ${physicalDescription || null}, 
        ${age || null}, ${height || null}, ${appearanceNotes || null},
        ${backstory || null}, ${JSON.stringify(personalityTraits)}, ${motivations || null},
        ${characterArc || null}, ${developmentTimeline ? JSON.stringify(developmentTimeline) : null},
        ${authorNotes || null}, ${JSON.stringify(metadata)},
        NOW(), NOW()
      )
      RETURNING *
    ` as any[]

    const characterProfile = result[0]

    // Create initial version if we have description
    if (firstAppearance && (physicalDescription || backstory)) {
      await prisma.$executeRaw`
        INSERT INTO character_versions (
          id, "characterId", description, "physicalDescription", 
          backstory, "personalityTraits", motivations, "developmentNotes",
          "fromChapter", "createdAt"
        )
        VALUES (
          gen_random_uuid()::text, ${characterProfile.id}, ${null},
          ${physicalDescription || null}, ${backstory || null},
          ${JSON.stringify(personalityTraits)}, ${motivations || null},
          ${'Introduced in chapter ' + firstAppearance},
          ${firstAppearance}, NOW()
        )
      `
    }

    return NextResponse.json({
      success: true,
      character: characterProfile
    })

  } catch (error: any) {
    console.error('Character profile creation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create character profile',
        details: error?.message || 'Unknown error',
        code: error?.code
      },
      { status: 500 }
    )
  }
}

// GET /api/works/[id]/characters?chapter=X - Get work character profiles with chapter-aware data
export async function GET(request: NextRequest, props: RouteParams) {
  const params = await props.params;
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workId = params.id
    const { searchParams } = new URL(request.url)
    const currentChapter = parseInt(searchParams.get('chapter') || '999999')

    // Get all character profiles for this work
    const characters = await prisma.$queryRaw`
      SELECT 
        cp.id,
        cp.name,
        cp.aliases,
        cp.role,
        cp."firstAppearance",
        cp."imageUrl",
        cp."physicalDescription",
        cp.age,
        cp.height,
        cp."appearanceNotes",
        cp.backstory,
        cp."personalityTraits",
        cp.motivations,
        cp."characterArc",
        cp."developmentTimeline",
        cp."authorNotes",
        cp.metadata,
        cp."createdAt",
        cp."updatedAt"
      FROM character_profiles cp
      WHERE cp."workId" = ${workId}
      ORDER BY cp."createdAt" ASC
    ` as any[]

    // For each character, get the most recent applicable version
    const charactersWithVersions = await Promise.all(
      (characters as any[]).map(async (character: any) => {
        const versionResult = await prisma.$queryRaw`
          SELECT 
            description,
            "physicalDescription",
            backstory,
            "personalityTraits",
            motivations,
            "developmentNotes"
          FROM character_versions
          WHERE "characterId" = ${character.id}
            AND "fromChapter" <= ${currentChapter}
            AND ("toChapter" IS NULL OR "toChapter" >= ${currentChapter})
          ORDER BY "fromChapter" DESC
          LIMIT 1
        ` as any[]

        // Merge version data with base character data
        const versionData = versionResult.length > 0 ? versionResult[0] : {}
        
        return {
          id: character.id,
          name: character.name,
          aliases: character.aliases ? JSON.parse(character.aliases) : [],
          role: character.role,
          firstAppearance: character.firstAppearance,
          imageUrl: character.imageUrl,
          physicalDescription: versionData.physicalDescription || character.physicalDescription,
          age: character.age,
          height: character.height,
          appearanceNotes: character.appearanceNotes,
          backstory: versionData.backstory || character.backstory,
          personalityTraits: versionData.personalityTraits 
            ? JSON.parse(versionData.personalityTraits) 
            : (character.personalityTraits ? JSON.parse(character.personalityTraits) : []),
          motivations: versionData.motivations || character.motivations,
          characterArc: character.characterArc,
          developmentTimeline: character.developmentTimeline ? JSON.parse(character.developmentTimeline) : null,
          authorNotes: character.authorNotes,
          metadata: character.metadata ? JSON.parse(character.metadata) : {},
          developmentNotes: versionData.developmentNotes || null,
          createdAt: character.createdAt,
          updatedAt: character.updatedAt
        }
      })
    )

    return NextResponse.json({
      success: true,
      characters: charactersWithVersions
    })

  } catch (error: any) {
    console.error('Character profiles fetch error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch character profiles',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}
