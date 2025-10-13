/**
 * Development Queue Processor
 * 
 * Runs in the background during development to process quality assessments.
 * In production, use Vercel Cron instead (/api/cron/process-assessments).
 * 
 * Usage: node scripts/process-queue.js
 */

const INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function processQueue() {
  try {
    const response = await fetch(`${API_URL}/api/quality-assessment/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: 10 })
    })

    if (!response.ok) {
      console.error(`❌ Process failed: ${response.status} ${response.statusText}`)
      return
    }

    const result = await response.json()
    const timestamp = new Date().toISOString()
    
    if (result.processed > 0) {
      console.log(`✅ [${timestamp}] Processed ${result.processed} assessment(s)`)
      if (result.failed > 0) {
        console.log(`   ⚠️  ${result.failed} failed`)
      }
    } else {
      console.log(`ℹ️  [${timestamp}] Queue empty, waiting...`)
    }

    if (result.remaining > 0) {
      console.log(`   📋 ${result.remaining} remaining in queue`)
    }
  } catch (error) {
    console.error(`❌ Error processing queue:`, error.message)
  }
}

// Initial run
console.log('🚀 Quality Assessment Queue Processor started')
console.log(`   Processing every ${INTERVAL_MS / 1000}s`)
console.log(`   API: ${API_URL}`)
console.log('')

processQueue()

// Schedule periodic processing
setInterval(processQueue, INTERVAL_MS)

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down queue processor...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down queue processor...')
  process.exit(0)
})
