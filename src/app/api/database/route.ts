// API route to test database functionality
import { NextRequest, NextResponse } from 'next/server'
import DataService from '@/lib/api/DataService'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')
    
    switch (action) {
      case 'works':
        const works = await DataService.getAllWorks()
        return NextResponse.json({
          success: true,
          dataSource: DataService.getDataSource(),
          count: works.length,
          works: works.slice(0, 3) // Return first 3 works
        })
        
      case 'init':
        await DataService.initializeDatabase()
        return NextResponse.json({
          success: true,
          message: 'Database initialized',
          dataSource: DataService.getDataSource()
        })
        
      default:
        return NextResponse.json({
          success: true,
          dataSource: DataService.getDataSource(),
          message: 'Database service is running',
          availableActions: ['works', 'init']
        })
    }
  } catch (error) {
    console.error('Database API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      dataSource: DataService.getDataSource()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body
    
    switch (action) {
      case 'createWork':
        const newWork = await DataService.createWork(data)
        return NextResponse.json({
          success: true,
          work: newWork,
          dataSource: DataService.getDataSource()
        })
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Database API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
