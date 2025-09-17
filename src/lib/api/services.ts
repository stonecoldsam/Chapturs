// API Service Layer - Bridge between Mock Data and Real Database
// This shows how to transition from mock data to production database

import { Work, FeedItem, User } from '@/types'

// Environment flag to toggle between mock and real data
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' || !process.env.DATABASE_URL

// Import mock data as fallback
import * as MockData from '@/lib/mockData'

/**
 * Content Service - Handles all content-related operations
 * Can switch between mock data and real database seamlessly
 */
export class ContentService {
  static async getWork(id: string): Promise<Work | null> {
    if (USE_MOCK_DATA) {
      // Use mock data during development
      return MockData.mockWorks.find(work => work.id === id) || null
    } else {
      // TODO: Replace with real database query
      // return await DatabaseService.getWork(id)
      throw new Error('Database not configured yet')
    }
  }

  static async searchWorks(query: string, filters: any = {}): Promise<Work[]> {
    if (USE_MOCK_DATA) {
      return MockData.searchWorks(query, filters)
    } else {
      // TODO: Replace with real database query
      // return await DatabaseService.searchWorks(query, filters)
      throw new Error('Database not configured yet')
    }
  }

  static async getFeedItems(hubMode: 'reader' | 'creator', userId?: string): Promise<FeedItem[]> {
    if (USE_MOCK_DATA) {
      return MockData.fetchFeedItems(hubMode, userId)
    } else {
      // TODO: Replace with real database query
      // return await DatabaseService.getFeedItems(userId, hubMode)
      throw new Error('Database not configured yet')
    }
  }

  static async createWork(workData: any, authorId: string): Promise<Work> {
    if (USE_MOCK_DATA) {
      // Simulate creating a work in mock data
      const newWork: Work = {
        id: `work-${Date.now()}`,
        title: workData.title,
        description: workData.description,
        author: MockData.mockAuthors.find(a => a.id === authorId) || MockData.mockAuthors[0],
        formatType: workData.formatType,
        coverImage: workData.coverImage,
        status: 'draft',
        maturityRating: workData.maturityRating || 'PG',
        genres: workData.genres || [],
        tags: workData.tags || [],
        statistics: {
          views: 0,
          subscribers: 0,
          bookmarks: 0,
          likes: 0,
          comments: 0,
          averageRating: 0,
          ratingCount: 0,
          completionRate: 0
        },
        glossary: [],
        sections: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // Add to mock data (in production, this would be saved to database)
      MockData.mockWorks.push(newWork)
      return newWork
    } else {
      // TODO: Replace with real database insert
      // return await DatabaseService.createWork(workData, authorId)
      throw new Error('Database not configured yet')
    }
  }

  static async uploadFile(file: File, purpose: string, userId: string): Promise<string> {
    if (USE_MOCK_DATA) {
      // Simulate file upload - in production this would go to cloud storage
      const mockUrl = `/uploads/${purpose}/${userId}/${Date.now()}-${file.name}`
      console.log(`Mock file upload: ${file.name} -> ${mockUrl}`)
      return mockUrl
    } else {
      // TODO: Replace with real file upload (AWS S3, Cloudinary, etc.)
      // const uploadResult = await FileUploadService.upload(file, purpose, userId)
      // return uploadResult.url
      throw new Error('File upload not configured yet')
    }
  }
}

/**
 * User Service - Handles user-related operations
 */
export class UserService {
  static async toggleSubscription(workId: string, userId: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      return MockData.toggleSubscription(workId, userId)
    } else {
      // TODO: Replace with real database operation
      // return await DatabaseService.toggleSubscription(workId, userId)
      throw new Error('Database not configured yet')
    }
  }

  static async toggleBookmark(workId: string, userId: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      return MockData.toggleBookmark(workId, userId)
    } else {
      // TODO: Replace with real database operation
      // return await DatabaseService.toggleBookmark(workId, userId)
      throw new Error('Database not configured yet')
    }
  }

  static async getUserPreferences(userId: string): Promise<any> {
    if (USE_MOCK_DATA) {
      return MockData.getUserPreferences(userId)
    } else {
      // TODO: Replace with real database query
      // return await DatabaseService.getUserPreferences(userId)
      throw new Error('Database not configured yet')
    }
  }

  static async updateReadingProgress(userId: string, workId: string, sectionId: string, progress: number): Promise<void> {
    if (USE_MOCK_DATA) {
      // Update mock reading history
      const userHistory = MockData.getUserReadingHistory(userId)
      userHistory.set(workId, sectionId)
    } else {
      // TODO: Replace with real database update
      // await DatabaseService.updateReadingProgress(userId, workId, sectionId, progress)
      throw new Error('Database not configured yet')
    }
  }
}

/**
 * Migration utilities for transitioning from mock to real data
 */
export class MigrationService {
  static async migrateToDatabase(): Promise<void> {
    console.log('Starting migration from mock data to database...')
    
    // TODO: Implement migration logic
    // 1. Create database tables from schema
    // 2. Migrate mock authors to database
    // 3. Migrate mock works to database
    // 4. Migrate mock user data to database
    // 5. Set up file storage
    // 6. Update environment variables
    
    console.log('Migration complete!')
  }

  static async seedDatabase(): Promise<void> {
    console.log('Seeding database with sample data...')
    
    // TODO: Create sample data in database for testing
    // This would replace the mock data with actual database records
    
    console.log('Database seeded!')
  }
}

export default {
  ContentService,
  UserService,
  MigrationService
}
