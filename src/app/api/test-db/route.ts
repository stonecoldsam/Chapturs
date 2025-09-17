import { NextRequest, NextResponse } from 'next/server'
import DatabaseService from '@/lib/database/PrismaService'

export async function GET() {
  try {
    console.log('Testing database connection...')
    const works = await DatabaseService.getAllWorks()
    console.log(`Found ${works.length} works in database`)
    
    return NextResponse.json({ 
      success: true,
      worksCount: works.length,
      works: works.slice(0, 2) // Return first 2 works as sample
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
