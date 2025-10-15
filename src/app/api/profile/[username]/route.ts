import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/PrismaService'

interface RouteParams {
  params: Promise<{
    username: string
  }>
}

// GET /api/profile/[username] - Get public profile data
export async function GET(request: NextRequest, props: RouteParams) {
  const params = await props.params
  try {
    const { username } = params

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        verified: true,
        authorProfile: {
          select: {
            id: true,
            verified: true,
            creatorProfile: {
              select: {
                id: true,
                displayName: true,
                bio: true,
                profileImage: true,
                coverImage: true,
                featuredType: true,
                featuredWorkId: true,
                featuredBlockId: true,
                accentColor: true,
                fontStyle: true,
                backgroundStyle: true,
                profileViews: true,
                isPublished: true,
                blocks: {
                  where: { isVisible: true },
                  orderBy: { order: 'asc' },
                  select: {
                    id: true,
                    type: true,
                    data: true,
                    gridX: true,
                    gridY: true,
                    width: true,
                    height: true,
                    title: true,
                    order: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const profile = user.authorProfile?.creatorProfile

    // If profile not published, return limited data
    if (profile && !profile.isPublished) {
      return NextResponse.json({
        user: {
          username: user.username,
          displayName: user.displayName
        },
        profile: {
          isPublished: false
        }
      })
    }

    // Fetch featured work if applicable
    let featuredWork = null
    if (profile?.featuredType === 'work' && profile.featuredWorkId) {
      featuredWork = await prisma.work.findUnique({
        where: { id: profile.featuredWorkId },
        select: {
          id: true,
          title: true,
          description: true,
          coverImage: true,
          genres: true,
          status: true,
          _count: {
            select: {
              likes: true,
              bookmarks: true
            }
          }
        }
      })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        verified: user.verified
      },
      author: user.authorProfile ? {
        id: user.authorProfile.id,
        verified: user.authorProfile.verified
      } : null,
      profile: profile ? {
        id: profile.id,
        displayName: profile.displayName,
        bio: profile.bio,
        profileImage: profile.profileImage,
        coverImage: profile.coverImage,
        featuredType: profile.featuredType,
        accentColor: profile.accentColor,
        fontStyle: profile.fontStyle,
        backgroundStyle: profile.backgroundStyle,
        profileViews: profile.profileViews,
        isPublished: profile.isPublished,
        blocks: profile.blocks
      } : null,
      featuredWork
    })

  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
