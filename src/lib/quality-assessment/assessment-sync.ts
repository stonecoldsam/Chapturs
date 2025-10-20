// ============================================================================
// SYNCHRONOUS QUALITY ASSESSMENT WITH RATE-LIMIT HANDLING
// ============================================================================

import { prisma } from '@/lib/database/PrismaService'
import { assessContentQuality, RateLimitError } from './llm-service'
import type { AssessmentPromptContext } from './types'
import { DEFAULT_ASSESSMENT_CONFIG } from './llm-service'

/**
 * Extract text content from Chapt document format
 */
function extractTextFromChaptDoc(chaptDoc: any): string {
  if (typeof chaptDoc === 'string') {
    try {
      chaptDoc = JSON.parse(chaptDoc)
    } catch {
      return chaptDoc
    }
  }

  if (!chaptDoc || !chaptDoc.blocks) {
    return ''
  }

  return chaptDoc.blocks
    .map((block: any) => {
      if (block.type === 'prose' && block.content?.text) {
        return block.content.text
      }
      if (block.content?.text) {
        return block.content.text
      }
      return ''
    })
    .filter((text: string) => text)
    .join('\n\n')
}

/**
 * Assess a work synchronously (called during publish)
 * Returns assessment result or null if rate-limited (will queue for retry)
 */
export async function assessWorkSynchronously(
  workId: string,
  sectionId: string
): Promise<{
  success: boolean
  assessment?: any
  rateLimited?: boolean
  message?: string
}> {
  try {
    console.log('[ASSESS_SYNC] Starting sync assessment for work:', workId)

    // Fetch work and section
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        work: {
          select: {
            id: true,
            title: true,
            genres: true,
            tags: true,
            formatType: true,
            maturityRating: true,
          },
        },
      },
    })

    if (!section) {
      throw new Error('Section not found')
    }

    // Extract text from Chapt format
    const textContent = extractTextFromChaptDoc(section.content)

    if (!textContent || textContent.trim().length < 100) {
      throw new Error('Content too short to assess')
    }

    // Build context for LLM
    const context: AssessmentPromptContext = {
      title: section.work.title,
      genres: section.work.genres ? JSON.parse(section.work.genres) : [],
      tags: section.work.tags ? JSON.parse(section.work.tags) : [],
      formatType: section.work.formatType,
      maturityRating: section.work.maturityRating,
      wordCount: section.wordCount || 0,
      content: textContent,
    }

    console.log('[ASSESS_SYNC] Context prepared. Calling Groq...')

    // Call Groq API
    const llmResponse = await assessContentQuality(context, DEFAULT_ASSESSMENT_CONFIG)

    console.log('[ASSESS_SYNC] Groq assessment complete. Score:', llmResponse.scores.overallScore)

    // Save assessment to DB
    const assessment = await prisma.qualityAssessment.upsert({
      where: {
        workId_sectionId: {
          workId,
          sectionId,
        },
      },
      create: {
        workId,
        sectionId,
        overallScore: llmResponse.scores.overallScore,
        writingQuality: llmResponse.scores.writingQuality,
        storytelling: llmResponse.scores.storytelling,
        characterization: llmResponse.scores.characterization,
        worldBuilding: llmResponse.scores.worldBuilding,
        engagement: llmResponse.scores.engagement,
        originality: llmResponse.scores.originality,
        qualityTier: llmResponse.qualityTier,
        discoveryTags: JSON.stringify(llmResponse.discoveryTags),
        feedbackMessage: llmResponse.feedbackMessage,
        model: DEFAULT_ASSESSMENT_CONFIG.model,
        version: '1.0',
        processingTime: llmResponse.processingTime,
        tokenCount: llmResponse.tokenCount,
        status: 'active',
      },
      update: {
        overallScore: llmResponse.scores.overallScore,
        writingQuality: llmResponse.scores.writingQuality,
        storytelling: llmResponse.scores.storytelling,
        characterization: llmResponse.scores.characterization,
        worldBuilding: llmResponse.scores.worldBuilding,
        engagement: llmResponse.scores.engagement,
        originality: llmResponse.scores.originality,
        qualityTier: llmResponse.qualityTier,
        discoveryTags: JSON.stringify(llmResponse.discoveryTags),
        feedbackMessage: llmResponse.feedbackMessage,
        processingTime: llmResponse.processingTime,
        tokenCount: llmResponse.tokenCount,
        updatedAt: new Date(),
      },
    })

    console.log('[ASSESS_SYNC] Assessment saved to DB with tier:', assessment.qualityTier)

    return {
      success: true,
      assessment,
    }
  } catch (error) {
    if (error instanceof RateLimitError) {
      console.warn('[ASSESS_SYNC] Rate limited - queueing for retry')

      // Queue for retry with exponential backoff
      try {
        await prisma.qualityAssessmentQueue.upsert({
          where: {
            workId_sectionId: {
              workId,
              sectionId,
            },
          },
          create: {
            workId,
            sectionId,
            priority: 'high',
            status: 'queued',
            retryAfter: new Date(Date.now() + error.retryAfter * 1000),
          },
          update: {
            status: 'queued',
            retryAfter: new Date(Date.now() + error.retryAfter * 1000),
            attempts: { increment: 1 },
          },
        })

        console.log('[ASSESS_SYNC] Queued for retry after', error.retryAfter, 'seconds')

        return {
          success: false,
          rateLimited: true,
          message: `Rate limited by Groq API. Assessment will be retried in ${Math.round(error.retryAfter / 60)} minutes.`,
        }
      } catch (queueError) {
        console.error('[ASSESS_SYNC] Failed to queue for retry:', queueError)
        throw queueError
      }
    }

    // Other errors
    console.error('[ASSESS_SYNC] Assessment failed:', error)
    throw error
  }
}
