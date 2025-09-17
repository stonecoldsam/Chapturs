// Database service layer - Production ready
// Replace mock data functions with real database operations

import { Pool } from 'pg'
import { Work, FeedItem, User, Chapter } from '@/types'

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

export class DatabaseService {
  // Works/Content Operations
  static async getWork(id: string): Promise<Work | null> {
    const query = `
      SELECT w.*, a.username as author_username, a.display_name as author_display_name,
             a.avatar_url as author_avatar, a.verified as author_verified
      FROM works w
      JOIN authors a ON w.author_id = a.id
      WHERE w.id = $1
    `
    const result = await pool.query(query, [id])
    if (result.rows.length === 0) return null
    
    return this.mapRowToWork(result.rows[0])
  }

  static async searchWorks(query: string, filters: any = {}): Promise<Work[]> {
    let sql = `
      SELECT w.*, a.username as author_username, a.display_name as author_display_name,
             a.avatar_url as author_avatar, a.verified as author_verified
      FROM works w
      JOIN authors a ON w.author_id = a.id
      WHERE w.status = 'published'
    `
    const params: any[] = []
    let paramCount = 0

    if (query) {
      paramCount++
      sql += ` AND (w.title ILIKE $${paramCount} OR w.description ILIKE $${paramCount})`
      params.push(`%${query}%`)
    }

    if (filters.format) {
      paramCount++
      sql += ` AND w.format_type = $${paramCount}`
      params.push(filters.format)
    }

    if (filters.genres && filters.genres.length > 0) {
      paramCount++
      sql += ` AND w.genres && $${paramCount}`
      params.push(filters.genres)
    }

    sql += ` ORDER BY w.created_at DESC LIMIT 20`

    const result = await pool.query(sql, params)
    return result.rows.map(row => this.mapRowToWork(row))
  }

  // Feed Operations
  static async getFeedItems(userId: string, hubMode: 'reader' | 'creator'): Promise<FeedItem[]> {
    if (hubMode === 'creator') {
      // Return user's own works
      const query = `
        SELECT w.*, a.username as author_username, a.display_name as author_display_name,
               a.avatar_url as author_avatar, a.verified as author_verified,
               'created' as feed_type, 'Your published work' as reason
        FROM works w
        JOIN authors a ON w.author_id = a.id
        JOIN users u ON a.user_id = u.id
        WHERE u.id = $1
        ORDER BY w.updated_at DESC
      `
      const result = await pool.query(query, [userId])
      return result.rows.map(row => this.mapRowToFeedItem(row))
    } else {
      // Return personalized reader feed
      const query = `
        SELECT w.*, a.username as author_username, a.display_name as author_display_name,
               a.avatar_url as author_avatar, a.verified as author_verified,
               CASE 
                 WHEN s.work_id IS NOT NULL THEN 'subscribed'
                 ELSE 'discovery'
               END as feed_type,
               CASE 
                 WHEN s.work_id IS NOT NULL THEN 'New chapter from subscription'
                 ELSE 'Recommended for you'
               END as reason
        FROM works w
        JOIN authors a ON w.author_id = a.id
        LEFT JOIN subscriptions s ON w.id = s.work_id AND s.user_id = $1
        WHERE w.status = 'published'
        ORDER BY s.work_id IS NOT NULL DESC, w.updated_at DESC
        LIMIT 20
      `
      const result = await pool.query(query, [userId])
      return result.rows.map(row => this.mapRowToFeedItem(row))
    }
  }

  // User Operations
  static async createUser(userData: Partial<User>): Promise<User> {
    const query = `
      INSERT INTO users (email, username, display_name, bio, avatar_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `
    const values = [
      userData.email,
      userData.username,
      userData.displayName || userData.username,
      userData.bio || '',
      userData.avatar || null
    ]
    
    const result = await pool.query(query, values)
    return this.mapRowToUser(result.rows[0])
  }

  // Subscription Operations
  static async toggleSubscription(workId: string, userId: string): Promise<boolean> {
    const checkQuery = `SELECT id FROM subscriptions WHERE user_id = $1 AND work_id = $2`
    const checkResult = await pool.query(checkQuery, [userId, workId])
    
    if (checkResult.rows.length > 0) {
      // Unsubscribe
      await pool.query(`DELETE FROM subscriptions WHERE user_id = $1 AND work_id = $2`, [userId, workId])
      return false
    } else {
      // Subscribe
      await pool.query(
        `INSERT INTO subscriptions (user_id, work_id) VALUES ($1, $2)`,
        [userId, workId]
      )
      return true
    }
  }

  // Bookmark Operations
  static async toggleBookmark(workId: string, userId: string): Promise<boolean> {
    const checkQuery = `SELECT id FROM bookmarks WHERE user_id = $1 AND work_id = $2`
    const checkResult = await pool.query(checkQuery, [userId, workId])
    
    if (checkResult.rows.length > 0) {
      // Remove bookmark
      await pool.query(`DELETE FROM bookmarks WHERE user_id = $1 AND work_id = $2`, [userId, workId])
      return false
    } else {
      // Add bookmark
      await pool.query(
        `INSERT INTO bookmarks (user_id, work_id) VALUES ($1, $2)`,
        [userId, workId]
      )
      return true
    }
  }

  // Content Upload Operations
  static async createWork(workData: any, authorId: string): Promise<Work> {
    const query = `
      INSERT INTO works (title, description, author_id, format_type, cover_image_url, 
                        status, maturity_rating, genres, tags, glossary)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `
    const values = [
      workData.title,
      workData.description,
      authorId,
      workData.formatType,
      workData.coverImageUrl,
      workData.status || 'draft',
      workData.maturityRating || 'PG',
      workData.genres || [],
      workData.tags || [],
      JSON.stringify(workData.glossary || [])
    ]
    
    const result = await pool.query(query, values)
    return this.mapRowToWork(result.rows[0])
  }

  static async createSection(sectionData: any, workId: string): Promise<any> {
    const query = `
      INSERT INTO sections (work_id, title, content, word_count, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `
    const values = [
      workId,
      sectionData.title,
      JSON.stringify(sectionData.content),
      sectionData.wordCount || 0,
      sectionData.status || 'draft'
    ]
    
    const result = await pool.query(query, values)
    return result.rows[0]
  }

  // File Upload Operations
  static async saveFileUpload(fileData: any): Promise<any> {
    const query = `
      INSERT INTO file_uploads (user_id, filename, original_name, mime_type, 
                               file_size, storage_path, purpose)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `
    const values = [
      fileData.userId,
      fileData.filename,
      fileData.originalName,
      fileData.mimeType,
      fileData.fileSize,
      fileData.storagePath,
      fileData.purpose
    ]
    
    const result = await pool.query(query, values)
    return result.rows[0]
  }

  // Helper mapping functions
  private static mapRowToWork(row: any): Work {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      author: {
        id: row.author_id,
        username: row.author_username,
        displayName: row.author_display_name,
        avatar: row.author_avatar,
        verified: row.author_verified,
        bio: '',
        socialLinks: [],
        statistics: { totalWorks: 0, totalViews: 0, totalSubscribers: 0, averageRating: 0 }
      },
      formatType: row.format_type,
      coverImage: row.cover_image_url,
      status: row.status,
      maturityRating: row.maturity_rating,
      genres: row.genres || [],
      tags: row.tags || [],
      statistics: JSON.parse(row.statistics || '{}'),
      glossary: JSON.parse(row.glossary || '[]'),
      sections: [], // Load separately if needed
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  private static mapRowToFeedItem(row: any): FeedItem {
    return {
      id: row.id,
      work: this.mapRowToWork(row),
      feedType: row.feed_type,
      reason: row.reason,
      score: 1.0,
      readingStatus: 'unread',
      lastReadChapter: 0,
      addedToFeedAt: new Date(),
      lastInteractionAt: undefined
    }
  }

  private static mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      username: row.username,
      displayName: row.display_name,
      bio: row.bio,
      avatar: row.avatar_url,
      verified: row.verified,
      preferences: [],
      subscriptions: new Set(),
      bookmarks: new Set(),
      readingHistory: new Map(),
      createdWorks: []
    }
  }
}

export default DatabaseService
