import { notFound } from 'next/navigation'
import ProfileLayout from '@/components/profile/ProfileLayout'
import ProfileSidebar from '@/components/profile/ProfileSidebar'
import FeaturedSpace from '@/components/profile/FeaturedSpace'
import BlockGrid from '@/components/profile/BlockGrid'
import { prisma } from '@/lib/database/PrismaService'

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params

  // Fetch user and profile data
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      authorProfile: {
        include: {
          creatorProfile: {
            include: {
              blocks: {
                where: { isVisible: true },
                orderBy: { order: 'asc' }
              }
            }
          }
        }
      }
    }
  })

  if (!user) {
    notFound()
  }

  const profile = user.authorProfile?.creatorProfile
  const isPublished = profile?.isPublished ?? false

  // If profile exists but not published, show unpublished state
  if (profile && !isPublished) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-100 mb-2">
            Profile Not Published
          </h1>
          <p className="text-gray-400">
            This creator hasn't published their profile yet.
          </p>
        </div>
      </div>
    )
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
        status: true
      }
    })
  }

  // Track profile view (increment view count)
  if (profile) {
    await prisma.creatorProfile.update({
      where: { id: profile.id },
      data: {
        profileViews: { increment: 1 },
        lastViewedAt: new Date()
      }
    })
  }

  return (
    <ProfileLayout
      sidebar={
        <ProfileSidebar
          profileImage={profile?.profileImage || user.avatar || undefined}
          displayName={profile?.displayName || user.displayName || user.username}
          username={user.username}
          bio={profile?.bio || undefined}
          isOwner={false}
        />
      }
      featured={
        <FeaturedSpace
          type={profile?.featuredType as 'work' | 'block' | 'none' || 'none'}
          workData={featuredWork ? {
            id: featuredWork.id,
            title: featuredWork.title,
            coverImage: featuredWork.coverImage || undefined,
            description: featuredWork.description,
            genres: typeof featuredWork.genres === 'string' 
              ? JSON.parse(featuredWork.genres) 
              : featuredWork.genres,
            status: featuredWork.status
          } : undefined}
          isOwner={false}
        />
      }
      blocks={
        <BlockGrid
          blocks={profile?.blocks || []}
          isOwner={false}
        />
      }
    />
  )
}
