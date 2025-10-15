// Image Processing Utilities
// Free tier optimized with aggressive compression

import sharp from 'sharp'

// Free tier variants - only 2 per image (thumbnail + optimized)
export const FREE_TIER_VARIANTS = {
  profile: [
    { name: 'thumbnail', width: 128, height: 128, quality: 80, fit: 'cover' as const },
    { name: 'optimized', width: 512, height: 512, quality: 85, fit: 'cover' as const },
  ],
  cover: [
    { name: 'thumbnail', width: 300, height: 450, quality: 75, fit: 'cover' as const },
    { name: 'optimized', width: 800, height: 1200, quality: 80, fit: 'inside' as const },
  ],
  fanart: [
    { name: 'thumbnail', width: 400, height: 400, quality: 75, fit: 'cover' as const },
    { name: 'optimized', width: 1200, height: 1200, quality: 80, fit: 'inside' as const },
  ],
  chapter: [
    { name: 'thumbnail', width: 600, height: 400, quality: 75, fit: 'inside' as const },
    { name: 'optimized', width: 1600, height: 1200, quality: 85, fit: 'inside' as const },
  ],
}

export type EntityType = keyof typeof FREE_TIER_VARIANTS

/**
 * Get image metadata without loading full buffer
 */
export async function getImageMetadata(buffer: Buffer): Promise<{
  width: number
  height: number
  format: string
  size: number
}> {
  const metadata = await sharp(buffer).metadata()
  
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    size: buffer.length,
  }
}

/**
 * Optimize image for free tier
 * Aggressive WebP compression to minimize storage
 */
export async function optimizeImage(
  buffer: Buffer,
  type: EntityType,
  variantName: 'thumbnail' | 'optimized'
): Promise<{
  buffer: Buffer
  width: number
  height: number
  size: number
  savedBytes: number
}> {
  const originalSize = buffer.length
  const variant = FREE_TIER_VARIANTS[type].find(v => v.name === variantName)!

  const sharpInstance = sharp(buffer)
    .resize(variant.width, variant.height, {
      fit: variant.fit,
      withoutEnlargement: true,
      background: { r: 255, g: 255, b: 255, alpha: 1 }, // White background for transparency
    })
    .webp({
      quality: variant.quality,
      effort: 6, // Maximum compression effort (slower but smaller)
    })

  const optimized = await sharpInstance.toBuffer()
  const metadata = await sharp(optimized).metadata()

  return {
    buffer: optimized,
    width: metadata.width || variant.width,
    height: metadata.height || variant.height,
    size: optimized.length,
    savedBytes: originalSize - optimized.length,
  }
}

/**
 * Generate all variants for an image type
 * Returns both thumbnail and optimized versions
 */
export async function generateVariants(
  buffer: Buffer,
  type: EntityType
): Promise<{
  thumbnail: { buffer: Buffer; width: number; height: number; size: number }
  optimized: { buffer: Buffer; width: number; height: number; size: number }
  totalSaved: number
}> {
  const originalSize = buffer.length

  const [thumbnail, optimized] = await Promise.all([
    optimizeImage(buffer, type, 'thumbnail'),
    optimizeImage(buffer, type, 'optimized'),
  ])

  return {
    thumbnail: {
      buffer: thumbnail.buffer,
      width: thumbnail.width,
      height: thumbnail.height,
      size: thumbnail.size,
    },
    optimized: {
      buffer: optimized.buffer,
      width: optimized.width,
      height: optimized.height,
      size: optimized.size,
    },
    totalSaved: originalSize - (thumbnail.size + optimized.size),
  }
}

/**
 * Validate image dimensions for entity type
 */
export function validateDimensions(
  width: number,
  height: number,
  type: EntityType
): { valid: boolean; error?: string } {
  const limits = {
    profile: { min: 200, max: 2048, aspectRatio: [0.8, 1.2] },
    cover: { min: 400, max: 2400, aspectRatio: [0.6, 0.7] }, // Typical book cover ratio
    fanart: { min: 600, max: 3000, aspectRatio: [0.5, 2.0] }, // Flexible for art
    chapter: { min: 400, max: 2400, aspectRatio: [0.5, 2.0] },
  }

  const limit = limits[type]
  
  if (width < limit.min || height < limit.min) {
    return {
      valid: false,
      error: `Image too small. Minimum ${limit.min}x${limit.min}px for ${type}`,
    }
  }

  if (width > limit.max || height > limit.max) {
    return {
      valid: false,
      error: `Image too large. Maximum ${limit.max}x${limit.max}px for ${type}`,
    }
  }

  const aspectRatio = width / height
  if (aspectRatio < limit.aspectRatio[0] || aspectRatio > limit.aspectRatio[1]) {
    return {
      valid: false,
      error: `Invalid aspect ratio for ${type}. Expected ${limit.aspectRatio[0]}-${limit.aspectRatio[1]}`,
    }
  }

  return { valid: true }
}

/**
 * Estimate compressed size before processing
 * WebP typically achieves 30-50% of original JPEG/PNG size
 */
export function estimateCompressedSize(
  originalSize: number,
  format: string
): number {
  const compressionRatio = format === 'webp' ? 0.9 : 0.4 // WebP already compressed
  return Math.ceil(originalSize * compressionRatio)
}

/**
 * Check if image needs moderation (basic heuristics)
 * Returns confidence score 0-1
 */
export async function needsModeration(buffer: Buffer): Promise<{
  needsReview: boolean
  confidence: number
  reason?: string
}> {
  // Get image stats
  const stats = await sharp(buffer).stats()
  
  // Check for suspicious patterns
  // 1. Very dark images (potential NSFW)
  const avgBrightness = (stats.channels[0].mean + stats.channels[1].mean + stats.channels[2].mean) / 3
  if (avgBrightness < 40) {
    return {
      needsReview: true,
      confidence: 0.7,
      reason: 'Unusually dark image',
    }
  }

  // 2. Very high saturation (potential shock content)
  const saturation = stats.channels.reduce((sum, ch) => sum + ch.stdev, 0) / stats.channels.length
  if (saturation > 60) {
    return {
      needsReview: true,
      confidence: 0.6,
      reason: 'High saturation/contrast',
    }
  }

  // Default: no review needed
  return {
    needsReview: false,
    confidence: 0.9,
  }
}
