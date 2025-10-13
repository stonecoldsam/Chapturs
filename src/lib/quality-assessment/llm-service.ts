// ============================================================================
// LLM SERVICE FOR QUALITY ASSESSMENT
// ============================================================================

import OpenAI from 'openai'
import type {
  AssessmentPromptContext,
  LLMAssessmentResponse,
  QualityScores,
  AssessmentConfig,
} from './types'

// Initialize Groq client (OpenAI-compatible)
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
})

// Default configuration
export const DEFAULT_ASSESSMENT_CONFIG: AssessmentConfig = {
  maxContentLength: 50000,  // ~10k words
  minContentLength: 1000,   // ~200 words minimum
  
  model: 'llama-3.3-70b-versatile',  // Using Groq Llama 3.3 70B for superior quality
  temperature: 0.3,  // Lower temperature for consistent grading
  maxTokens: 800,    // Reduced - just scores and tags
  
  weights: {
    writingQuality: 0.25,
    storytelling: 0.20,
    characterization: 0.15,
    worldBuilding: 0.15,
    engagement: 0.15,
    originality: 0.10,
  },
  
  boostThresholds: {
    exceptional: 85,
    strong: 70,
    developing: 50,
    needs_work: 0,
  },
  
  boostMultipliers: {
    exceptional: 1.5,   // 50% boost
    strong: 1.2,        // 20% boost
    developing: 1.0,    // No boost
    needs_work: 0.8,    // 20% suppression
  },
  
  boostDurationDays: 30,
}

/**
 * Generate assessment prompt for LLM
 */
function generateAssessmentPrompt(context: AssessmentPromptContext): string {
  const { title, genres, tags, formatType, maturityRating, wordCount, content } = context

  return `You are an AI quality assessor for a creative writing platform. Your job is to evaluate stories and help great content get discovered by readers.

CONTENT:
Title: ${title}
Format: ${formatType}
Declared Genres: ${genres.join(', ')}
Declared Tags: ${tags.join(', ')}
Rating: ${maturityRating}
Word Count: ${wordCount}

${content}

TASK: Evaluate this work with SCORES ONLY (0-100) and DISCOVERY TAGS.

SCORES (0-100):
1. WRITING_QUALITY: Grammar, prose, clarity
2. STORYTELLING: Plot, pacing, structure
3. CHARACTERIZATION: Character depth & development
4. WORLD_BUILDING: Setting, atmosphere, immersion
5. ENGAGEMENT: Hook, emotional impact, readability
6. ORIGINALITY: Unique voice, fresh ideas

DISCOVERY TAGS:
Your most important job is helping readers find stories they'll love. Analyze the content and suggest DISCOVERY TAGS - these are additional genres, themes, comparisons, tropes, or descriptors that will help the right readers find this story.

Examples:
- "harry-potter-like" if it has similar magical school vibes
- "slow-burn-romance" if romance builds gradually
- "found-family" if that's a theme
- "lgbtq+" if relevant
- "dark-fantasy", "cozy-mystery", "enemies-to-lovers", etc.
- Mood tags: "atmospheric", "action-packed", "emotional", "humorous"
- Audience: "young-adult", "new-adult", "adult"

Be creative and specific. Add 5-15 tags that accurately represent the content and will help it reach the right audience.

AUTHOR FEEDBACK:
If overall score >= 70: Provide ONE encouraging sentence about what's working well
If overall score < 70: Provide ONE constructive tip (gentle, specific, actionable)

GUIDELINES:
- "Exceptional" (85+): Rare, standout work
- "Strong" (70-84): Good publication potential
- "Developing" (50-69): Shows promise, needs polish
- "Needs work" (<50): Significant improvement needed
- Focus on storytelling over perfect grammar
- Consider genre conventions
- Look for potential in new writers

Respond ONLY with valid JSON:
{
  "scores": {
    "writingQuality": number,
    "storytelling": number,
    "characterization": number,
    "worldBuilding": number,
    "engagement": number,
    "originality": number
  },
  "discoveryTags": [array of 5-15 string tags],
  "qualityTier": "exceptional" | "strong" | "developing" | "needs_work",
  "feedbackMessage": "one sentence for author",
  "confidence": number (0-1)
}`
}

/**
 * Call LLM to assess content quality
 */
export async function assessContentQuality(
  context: AssessmentPromptContext,
  config: AssessmentConfig = DEFAULT_ASSESSMENT_CONFIG
): Promise<LLMAssessmentResponse> {
  const startTime = Date.now()

  try {
    // Truncate content if too long
    const truncatedContent = context.content.length > config.maxContentLength
      ? context.content.substring(0, config.maxContentLength) + '\n\n[Content truncated...]'
      : context.content

    const truncatedContext = { ...context, content: truncatedContent }

    // Call Groq API (OpenAI-compatible)
    const response = await groq.chat.completions.create({
      model: config.model,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      messages: [
        {
          role: 'system',
          content: 'You are an AI quality assessor that evaluates creative writing and suggests discovery tags. Respond only with JSON.',
        },
        {
          role: 'user',
          content: generateAssessmentPrompt(truncatedContext),
        },
      ],
      response_format: { type: 'json_object' },
    })

    const processingTime = Date.now() - startTime
    const usage = response.usage

    if (!usage) {
      throw new Error('No usage data returned from Groq')
    }

    // Parse response
    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content in Groq response')
    }

    const parsed = JSON.parse(content)

    // Calculate overall score
    const scores: QualityScores = parsed.scores
    const overallScore = calculateOverallScore(scores, config.weights)
    scores.overallScore = overallScore

    // Return structured response
    return {
      scores: { ...scores, overallScore },
      discoveryTags: parsed.discoveryTags || [],
      qualityTier: parsed.qualityTier,
      feedbackMessage: parsed.feedbackMessage,
      confidence: parsed.confidence || 0.8,
      processingTime,
      tokenCount: usage.total_tokens,
    }
  } catch (error) {
    console.error('LLM assessment error:', error)
    throw new Error(`Failed to assess content quality: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Calculate weighted overall score
 */
function calculateOverallScore(
  scores: Omit<QualityScores, 'overallScore'>,
  weights: AssessmentConfig['weights']
): number {
  return Math.round(
    scores.writingQuality * weights.writingQuality +
    scores.storytelling * weights.storytelling +
    scores.characterization * weights.characterization +
    scores.worldBuilding * weights.worldBuilding +
    scores.engagement * weights.engagement +
    scores.originality * weights.originality
  )
}

/**
 * Determine quality tier from score
 */
export function determineQualityTier(
  score: number,
  thresholds: AssessmentConfig['boostThresholds']
): 'exceptional' | 'strong' | 'developing' | 'needs_work' {
  if (score >= thresholds.exceptional) return 'exceptional'
  if (score >= thresholds.strong) return 'strong'
  if (score >= thresholds.developing) return 'developing'
  return 'needs_work'
}

/**
 * Get boost multiplier for quality tier
 */
export function getBoostMultiplier(
  tier: 'exceptional' | 'strong' | 'developing' | 'needs_work',
  multipliers: AssessmentConfig['boostMultipliers']
): number {
  return multipliers[tier] || 1.0
}

/**
 * Calculate boost expiry date
 */
export function calculateBoostExpiry(durationDays: number): Date {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + durationDays)
  return expiry
}

/**
 * Generate boost reason based on assessment
 */
export function generateBoostReason(
  tier: 'exceptional' | 'strong' | 'developing' | 'needs_work',
  overallScore: number
): string {
  switch (tier) {
    case 'exceptional':
      return `Exceptional quality (score: ${overallScore}). Standout work with high reader engagement potential.`
    case 'strong':
      return `Strong quality (score: ${overallScore}). Well-crafted work with clear publication potential.`
    case 'developing':
      return `Developing (score: ${overallScore}). Shows promise with room for growth.`
    case 'needs_work':
      return `Needs development (score: ${overallScore}). Significant improvement needed before recommendation.`
    default:
      return `Quality tier: ${tier}, score: ${overallScore}`
  }
}

/**
 * Estimate cost of assessment
 */
export function estimateCost(tokenCount: number, model: string): number {
  // Groq Llama 3.3 70B pricing: $0.59/1M input tokens, $0.79/1M output tokens
  // Rough estimate: 70% input, 30% output
  const inputTokens = Math.round(tokenCount * 0.7)
  const outputTokens = Math.round(tokenCount * 0.3)
  
  const inputCost = (inputTokens / 1000000) * 0.59
  const outputCost = (outputTokens / 1000000) * 0.79
  
  return inputCost + outputCost
}
