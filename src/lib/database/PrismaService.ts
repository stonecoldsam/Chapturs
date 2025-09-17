// Real Database Service using Prisma
// This replaces the mock data with actual database operations

import { PrismaClient } from '@prisma/client'
import { Work, FeedItem, Author, User } from '@/types'

const prisma = new PrismaClient()

export class DatabaseService {
  // Works Operations
  static async getAllWorks(): Promise<Work[]> {
    const works = await prisma.work.findMany({
      include: {
        author: {
          include: {
            user: true
          }
        },
        sections: true,
        glossaryEntries: true,
        _count: {
          select: {
            bookmarks: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return works.map(work => this.mapPrismaWorkToWork(work))
  }

  static async getWork(id: string): Promise<Work | null> {
    const work = await prisma.work.findUnique({
      where: { id },
      include: {
        author: {
          include: {
            user: true
          }
        },
        sections: true,
        glossaryEntries: true,
        _count: {
          select: {
            bookmarks: true
          }
        }
      }
    })

    if (!work) return null
    return this.mapPrismaWorkToWork(work)
  }

  static async searchWorks(query: string, filters: any = {}): Promise<Work[]> {
    const works = await prisma.work.findMany({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: query } },
              { description: { contains: query } }
            ]
          },
          filters.format ? { formatType: filters.format } : {},
          { status: 'ongoing' } // Only show published works
        ]
      },
      include: {
        author: {
          include: {
            user: true
          }
        },
        sections: true,
        glossaryEntries: true,
        _count: {
          select: {
            bookmarks: true
          }
        }
      },
      take: 20
    })

    return works.map(work => this.mapPrismaWorkToWork(work))
  }

  // User Operations
  static async createUser(userData: {
    email: string
    username: string
    displayName?: string
    bio?: string
    avatar?: string
  }): Promise<User> {
    const user = await prisma.user.create({
      data: userData
    })

    return this.mapPrismaUserToUser(user)
  }

  static async getUser(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        subscriptions: {
          include: {
            work: true
          }
        },
        bookmarks: {
          include: {
            work: true
          }
        },
        readingHistory: {
          include: {
            work: true,
            section: true
          }
        }
      }
    })

    if (!user) return null
    return this.mapPrismaUserToUser(user)
  }

  static async getUserWorks(userId: string): Promise<Work[]> {
    const works = await prisma.work.findMany({
      where: { authorId: userId },
      include: {
        author: true,
        sections: true,
        glossaryEntries: true,
        _count: {
          select: {
            bookmarks: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return works.map(work => this.mapPrismaWorkToWork(work))
  }

  // Content Creation
  static async createWork(data: {
    title: string
    description: string
    authorId: string
    formatType: string
    coverImage?: string
    genres: string[]
    tags: string[]
  }): Promise<Work> {
    const work = await prisma.work.create({
      data: {
        title: data.title,
        description: data.description,
        authorId: data.authorId,
        formatType: data.formatType,
        coverImage: data.coverImage,
        genres: JSON.stringify(data.genres),
        tags: JSON.stringify(data.tags),
        statistics: JSON.stringify({
          views: 0,
          subscribers: 0,
          bookmarks: 0,
          likes: 0,
          comments: 0,
          averageRating: 0,
          ratingCount: 0,
          completionRate: 0
        })
      },
      include: {
        author: {
          include: {
            user: true
          }
        },
        sections: true,
        glossaryEntries: true,
        _count: {
          select: {
            bookmarks: true
          }
        }
      }
    })

    return this.mapPrismaWorkToWork(work)
  }

  static async createSection(data: {
    workId: string
    title: string
    content: any
    wordCount?: number
  }): Promise<any> {
    return await prisma.section.create({
      data: {
        workId: data.workId,
        title: data.title,
        content: JSON.stringify(data.content),
        wordCount: data.wordCount || 0,
        status: 'published',
        publishedAt: new Date()
      }
    })
  }

  // Subscription Operations (temporary implementation to bypass Prisma type issues)
  static async toggleSubscription(authorId: string, userId: string): Promise<boolean> {
    console.log(`Subscription toggle requested: userId=${userId}, authorId=${authorId}`)
    
    try {
      // Use raw SQL query as workaround for Prisma type issues
      const existing = await prisma.$queryRaw`
        SELECT * FROM subscriptions 
        WHERE userId = ${userId} AND authorId = ${authorId}
        LIMIT 1
      ` as any[]

      if (existing.length > 0) {
        await prisma.$executeRaw`
          DELETE FROM subscriptions 
          WHERE userId = ${userId} AND authorId = ${authorId}
        `
        console.log(`Subscription removed: userId=${userId}, authorId=${authorId}`)
        return false
      } else {
        const subscriptionId = Date.now().toString()
        const now = new Date().toISOString()
        await prisma.$executeRaw`
          INSERT INTO subscriptions (id, userId, authorId, notificationsEnabled, subscribedAt)
          VALUES (${subscriptionId}, ${userId}, ${authorId}, true, ${now})
        `
        console.log(`Subscription created: userId=${userId}, authorId=${authorId}`)
        return true
      }
    } catch (error) {
      console.error('Subscription toggle error:', error)
      return false
    }
  }

  static async checkUserSubscription(userId: string, authorId: string): Promise<boolean> {
    console.log(`Subscription check requested: userId=${userId}, authorId=${authorId}`)
    
    try {
      // Use raw SQL query as workaround for Prisma type issues
      const result = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM subscriptions 
        WHERE userId = ${userId} AND authorId = ${authorId}
      ` as any[]

      const isSubscribed = result[0]?.count > 0
      console.log(`Subscription status: userId=${userId}, authorId=${authorId}, subscribed=${isSubscribed}`)
      return isSubscribed
    } catch (error) {
      console.error('Subscription check error:', error)
      return false
    }
  }

  // Bookmark Operations
  static async toggleBookmark(workId: string, userId: string): Promise<boolean> {
    console.log(`Bookmark toggle requested: userId=${userId}, workId=${workId}`)
    
    try {
      // Use raw SQL query for consistency with other operations
      const existing = await prisma.$queryRaw`
        SELECT * FROM bookmarks 
        WHERE userId = ${userId} AND workId = ${workId}
        LIMIT 1
      ` as any[]

      if (existing.length > 0) {
        await prisma.$executeRaw`
          DELETE FROM bookmarks 
          WHERE userId = ${userId} AND workId = ${workId}
        `
        console.log(`Bookmark removed: userId=${userId}, workId=${workId}`)
        return false
      } else {
        const bookmarkId = Date.now().toString()
        const now = new Date().toISOString()
        await prisma.$executeRaw`
          INSERT INTO bookmarks (id, userId, workId, bookmarkedAt)
          VALUES (${bookmarkId}, ${userId}, ${workId}, ${now})
        `
        console.log(`Bookmark created: userId=${userId}, workId=${workId}`)
        return true
      }
    } catch (error) {
      console.error('Bookmark toggle error:', error)
      return false
    }
  }

  static async checkUserBookmark(userId: string, workId: string): Promise<boolean> {
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_workId: {
          userId,
          workId
        }
      }
    })

    return !!bookmark
  }

  // Like Operations
  static async toggleLike(workId: string, userId: string): Promise<boolean> {
    console.log(`Like toggle requested: userId=${userId}, workId=${workId}`)
    
    try {
      // Use raw SQL query for consistency with other operations
      const existing = await prisma.$queryRaw`
        SELECT * FROM likes 
        WHERE userId = ${userId} AND workId = ${workId}
        LIMIT 1
      ` as any[]

      if (existing.length > 0) {
        await prisma.$executeRaw`
          DELETE FROM likes 
          WHERE userId = ${userId} AND workId = ${workId}
        `
        console.log(`Like removed: userId=${userId}, workId=${workId}`)
        return false
      } else {
        const likeId = Date.now().toString()
        const now = new Date().toISOString()
        await prisma.$executeRaw`
          INSERT INTO likes (id, userId, workId, likedAt)
          VALUES (${likeId}, ${userId}, ${workId}, ${now})
        `
        console.log(`Like created: userId=${userId}, workId=${workId}`)
        return true
      }
    } catch (error) {
      console.error('Like toggle error:', error)
      return false
    }
  }

  static async checkUserLike(userId: string, workId: string): Promise<boolean> {
    console.log(`Like check requested: userId=${userId}, workId=${workId}`)
    
    try {
      // Use raw SQL query for consistency with other operations
      const result = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM likes 
        WHERE userId = ${userId} AND workId = ${workId}
      ` as any[]

      const isLiked = result[0]?.count > 0
      console.log(`Like status: userId=${userId}, workId=${workId}, liked=${isLiked}`)
      return isLiked
    } catch (error) {
      console.error('Like check error:', error)
      return false
    }
  }

  // Seed database with sample data
  static async seedDatabase(): Promise<void> {
    console.log('Seeding database with sample data...')

    // Create sample users
    const user1 = await prisma.user.upsert({
      where: { email: 'maya@example.com' },
      update: {},
      create: {
        email: 'maya@example.com',
        username: 'storyteller_maya',
        displayName: 'Maya Chen',
        bio: 'Fantasy novelist and worldbuilder. Creating epic adventures one chapter at a time.',
        verified: true
      }
    })

    // Create author profile
    const author1 = await prisma.author.upsert({
      where: { userId: user1.id },
      update: {},
      create: {
        userId: user1.id,
        verified: true,
        socialLinks: JSON.stringify([
          { platform: 'twitter', url: 'https://twitter.com/storyteller_maya', handle: '@storyteller_maya' }
        ])
      }
    })

    // Create sample work
    const work1 = await prisma.work.upsert({
      where: { id: 'work1' },
      update: {},
      create: {
        id: 'work1',
        title: 'The Crystal Nexus Chronicles',
        description: 'In a world where magic flows through crystalline networks, young mage Aria discovers she can manipulate the very foundation of reality. But with great power comes ancient enemies who will stop at nothing to control the nexus.',
        authorId: author1.id,
        formatType: 'novel',
        status: 'ongoing',
        maturityRating: 'PG-13',
        genres: JSON.stringify(['Fantasy', 'Adventure', 'Young Adult']),
        tags: JSON.stringify(['magic', 'crystals', 'coming-of-age', 'epic-fantasy']),
        statistics: JSON.stringify({
          views: 15420,
          subscribers: 2341,
          bookmarks: 892,
          likes: 1456,
          comments: 234,
          averageRating: 4.7,
          ratingCount: 156,
          completionRate: 0.73
        })
      }
    })

    // Create sample sections
    await prisma.section.upsert({
      where: { id: 'work1-chapter-1' },
      update: {},
      create: {
        id: 'work1-chapter-1',
        workId: work1.id,
        title: 'The Awakening',
        content: JSON.stringify({
          text: 'The crystal hummed with an energy Aria had never felt before. As her fingers traced its surface, the world around her began to shimmer and change...'
        }),
        wordCount: 2500,
        status: 'published',
        publishedAt: new Date('2024-01-15')
      }
    })

    console.log('Database seeded successfully!')
  }

  // Helper mapping functions
  private static mapPrismaWorkToWork(prismaWork: any): Work {
    return {
      id: prismaWork.id,
      title: prismaWork.title,
      description: prismaWork.description,
      authorId: prismaWork.authorId,
      author: {
        id: prismaWork.author.id,
        username: prismaWork.author.user.username,
        displayName: prismaWork.author.user.displayName || prismaWork.author.user.username,
        bio: prismaWork.author.user.bio || '',
        avatar: prismaWork.author.user.avatar,
        verified: prismaWork.author.verified,
        socialLinks: prismaWork.author.socialLinks ? JSON.parse(prismaWork.author.socialLinks) : [],
        statistics: {
          totalWorks: 0,
          totalViews: 0,
          totalSubscribers: 0,
          averageRating: 0,
          worksCompleted: 0,
          monthlyViews: 0,
          growthRate: 0
        }
      },
      formatType: prismaWork.formatType as any,
      coverImage: prismaWork.coverImage,
      status: prismaWork.status as any,
      maturityRating: prismaWork.maturityRating as any,
      genres: JSON.parse(prismaWork.genres || '[]'),
      tags: JSON.parse(prismaWork.tags || '[]'),
      languages: ['en'], // default language
      thumbnails: [], // empty for now
      statistics: JSON.parse(prismaWork.statistics || '{}'),
      glossary: prismaWork.glossaryEntries?.map((entry: any) => ({
        id: entry.id,
        term: entry.term,
        definition: entry.definition,
        isAutoGenerated: false
      })) || [],
      sections: prismaWork.sections?.map((section: any) => ({
        id: section.id,
        title: section.title,
        content: JSON.parse(section.content || '{}'),
        wordCount: section.wordCount,
        publishedAt: section.publishedAt,
        status: section.status
      })) || [],
      createdAt: prismaWork.createdAt,
      updatedAt: prismaWork.updatedAt
    }
  }

  private static mapPrismaUserToUser(prismaUser: any): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.username,
      image: prismaUser.avatar,
      createdAt: prismaUser.createdAt,
      subscriptions: prismaUser.subscriptions?.map((sub: any) => sub.workId) || [],
      bookmarks: prismaUser.bookmarks?.map((bookmark: any) => bookmark.workId) || [],
      preferences: {
        preferredFormats: ['novel'],
        mutedFormats: [],
        readingMode: 'scroll',
        theme: 'light',
        autoPlayComics: false,
        glossaryTooltips: true,
        contentFilters: {
          maturityLevel: 'all',
          languages: ['en'],
          excludedGenres: []
        }
      },
      readingHistory: prismaUser.readingHistory?.map((history: any) => ({
        workId: history.workId,
        lastReadSectionId: history.sectionId || '',
        lastReadAt: history.lastReadAt,
        readingProgress: history.progress / 100,
        timeSpent: 0,
        bookmarkedSections: []
      })) || []
    }
  }

  // Library Operations
  static async getUserBookmarks(userId: string): Promise<any[]> {
    try {
      const bookmarks = await prisma.bookmark.findMany({
        where: { userId },
        include: {
          work: {
            include: {
              author: {
                include: {
                  user: true
                }
              }
            }
          }
        },
        orderBy: { bookmarkedAt: 'desc' }
      })
      return bookmarks
    } catch (error) {
      console.error('Error fetching user bookmarks:', error)
      return []
    }
  }

  static async getUserSubscriptions(userId: string): Promise<any[]> {
    try {
      const subscriptions = await prisma.subscription.findMany({
        where: { userId },
        include: {
          author: {
            include: {
              user: true
            }
          }
        },
        orderBy: { subscribedAt: 'desc' }
      })
      return subscriptions
    } catch (error) {
      console.error('Error fetching user subscriptions:', error)
      return []
    }
  }
}

export default DatabaseService
