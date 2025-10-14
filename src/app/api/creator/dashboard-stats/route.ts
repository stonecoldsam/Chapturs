import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/database/PrismaService'

/**
 * GET /api/creator/dashboard-stats
 * 
 * Aggregated stats for Creator Dashboard showing:
 * - Overview metrics (works, chapters, reads, likes, bookmarks, subscribers)
 * - Recent activity (new reads, likes, comments, pending fanart)
 * - Quality scores (average score, tier, boost multiplier)
 * - Revenue data (this month, last month, pending)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    console.log('[GET /api/creator/dashboard-stats] Fetching stats for userId:', userId)

    // Get user's author profile - using findUnique since userId is @unique
    const author = await prisma.author.findUnique({
      where: { userId },
      select: { id: true, userId: true }
    })

    console.log('[GET /api/creator/dashboard-stats] Author found:', author ? `id=${author.id}, userId=${author.userId}` : 'NOT FOUND')

    if (!author) {
      return NextResponse.json({ error: 'Author profile not found' }, { status: 404 })
    }

    // Fetch all data in parallel
    const [
      works,
      totalChapters,
      totalReads,
      totalLikes,
      totalBookmarks,
      totalSubscriptions,
      recentReads,
      recentLikes,
      recentComments,
      pendingFanart,
      qualityAssessments,
      adRevenue
    ] = await Promise.all([
      // Total works
      prisma.work.findMany({
        where: { authorId: author.id },
        select: { id: true, title: true }
      }),

      // Total chapters (sections)
      prisma.section.count({
        where: {
          work: { authorId: author.id }
        }
      }),

      // Total reads (reading history entries)
      prisma.readingHistory.count({
        where: {
          work: { authorId: author.id }
        }
      }),

      // Total likes
      prisma.like.count({
        where: {
          work: { authorId: author.id }
        }
      }),

      // Total bookmarks
      prisma.bookmark.count({
        where: {
          work: { authorId: author.id }
        }
      }),

      // Total subscriptions (to the author)
      prisma.subscription.count({
        where: { authorId: author.id }
      }),

      // Recent reads (last 7 days)
      prisma.readingHistory.count({
        where: {
          work: { authorId: author.id },
          lastReadAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Recent likes (last 7 days) - using work filter instead
      prisma.$queryRaw`
        SELECT COUNT(*)::int as count
        FROM likes l
        JOIN works w ON w.id = l."workId"
        WHERE w."authorId" = ${author.id}
        AND l."createdAt" >= NOW() - INTERVAL '7 days'
      ` as Promise<Array<{ count: number }>>,

      // Recent comments (last 7 days) - placeholder, assuming comments exist
      // TODO: Implement when Comment model exists
      Promise.resolve([{ count: 0 }]),

      // Pending fanart submissions
      prisma.imageSubmission.count({
        where: {
          character: {
            work: { authorId: author.id }
          },
          status: 'pending'
        }
      }),

      // Quality assessments - using raw SQL
      prisma.$queryRaw`
        SELECT 
          qa."overallScore",
          qa."qualityTier",
          qa."boostMultiplier"
        FROM quality_assessments qa
        JOIN works w ON w.id = qa."workId"
        WHERE w."authorId" = ${author.id}
        AND qa.status = 'active'
      ` as Promise<Array<{
        overallScore: number
        qualityTier: string
        boostMultiplier: number
      }>>,

      // Ad revenue (last 60 days)
      prisma.$queryRaw`
        SELECT 
          apm.revenue,
          apm."lastUpdated" as date,
          apm."isPaid"
        FROM ad_placement_metrics apm
        JOIN ad_placements ap ON ap.id = apm."placementId"
        JOIN works w ON w.id = ap."workId"
        WHERE w."authorId" = ${author.id}
        AND apm."lastUpdated" >= NOW() - INTERVAL '60 days'
      ` as Promise<Array<{
        revenue: number
        date: Date
        isPaid: boolean
      }>>
    ])

    // Calculate quality scores
    const avgQualityScore = qualityAssessments.length > 0
      ? Math.round(qualityAssessments.reduce((sum, qa) => sum + qa.overallScore, 0) / qualityAssessments.length)
      : 0

    const avgBoostMultiplier = qualityAssessments.length > 0
      ? Number((qualityAssessments.reduce((sum, qa) => sum + qa.boostMultiplier, 0) / qualityAssessments.length).toFixed(2))
      : 1.0

    const dominantTier = qualityAssessments.length > 0
      ? qualityAssessments
          .map(qa => qa.qualityTier)
          .sort((a, b) => 
            qualityAssessments.filter(q => q.qualityTier === b).length -
            qualityAssessments.filter(q => q.qualityTier === a).length
          )[0]
      : 'developing'

    // Calculate revenue
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    const recentLikesCount = Array.isArray(recentLikes) && recentLikes.length > 0 ? recentLikes[0].count : 0
    const recentCommentsCount = Array.isArray(recentComments) && recentComments.length > 0 ? recentComments[0].count : 0

    const thisMonthRevenue = adRevenue
      .filter(m => m.date >= thisMonthStart)
      .reduce((sum, m) => sum + Number(m.revenue), 0)

    const lastMonthRevenue = adRevenue
      .filter(m => m.date >= lastMonthStart && m.date <= lastMonthEnd)
      .reduce((sum, m) => sum + Number(m.revenue), 0)

    const pendingRevenue = adRevenue
      .filter(m => !m.isPaid)
      .reduce((sum, m) => sum + Number(m.revenue), 0)

    // Build response
    return NextResponse.json({
      success: true,
      overview: {
        totalWorks: works.length,
        totalChapters,
        totalReads,
        totalLikes,
        totalBookmarks,
        totalSubscriptions
      },
      recentActivity: {
        newReads: recentReads,
        newLikes: recentLikesCount,
        newComments: recentCommentsCount,
        pendingFanart
      },
      qualityScores: {
        averageScore: avgQualityScore,
        tier: dominantTier,
        boostMultiplier: avgBoostMultiplier
      },
      revenue: {
        thisMonth: Number(thisMonthRevenue.toFixed(2)),
        lastMonth: Number(lastMonthRevenue.toFixed(2)),
        pending: Number(pendingRevenue.toFixed(2))
      },
      works: works.map(w => ({
        id: w.id,
        title: w.title
      }))
    })

  } catch (error: any) {
    console.error('Dashboard stats error:', {
      error: error.message,
      stack: error.stack
    })

    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard stats',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}
