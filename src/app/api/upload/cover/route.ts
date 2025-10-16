import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../../auth'
import { 
  createErrorResponse, 
  createSuccessResponse, 
  generateRequestId,
  requireAuth,
  addCorsHeaders
} from '@/lib/api/errorHandling'
import { r2Client, generateStorageKey, getR2PublicUrl } from '@/lib/r2'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME

// POST /api/upload/cover - Upload cover image server-side
export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    // Authentication
    const session = await auth()
    requireAuth(session)

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return createErrorResponse(
        new Error('No file provided'),
        requestId
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      return createErrorResponse(
        new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed'),
        requestId
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return createErrorResponse(
        new Error('File size too large. Maximum size is 5MB'),
        requestId
      )
    }

    // Read file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Generate unique ID and storage key
    const imageId = uuidv4()
    const storageKey = generateStorageKey('cover', file.name, imageId)
    
    // Upload original to R2
    await r2Client.send(new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: storageKey,
      Body: buffer,
      ContentType: file.type,
    }))
    
    // Generate optimized version
    const optimized = await sharp(buffer)
      .webp({ quality: 85 })
      .resize(800, 1200, { fit: 'inside', withoutEnlargement: true })
      .toBuffer()
    
    const optimizedKey = storageKey.replace(/\.[^.]+$/, '-optimized.webp')
    await r2Client.send(new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: optimizedKey,
      Body: optimized,
      ContentType: 'image/webp',
    }))
    
    // Generate thumbnail
    const thumbnail = await sharp(buffer)
      .webp({ quality: 70 })
      .resize(200, 300, { fit: 'cover' })
      .toBuffer()
    
    const thumbnailKey = storageKey.replace(/\.[^.]+$/, '-thumbnail.webp')
    await r2Client.send(new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: thumbnailKey,
      Body: thumbnail,
      ContentType: 'image/webp',
    }))
    
    // Get public URL
    const publicUrl = getR2PublicUrl()
    
    const response = createSuccessResponse({
      original: `${publicUrl}/${storageKey}`,
      optimized: `${publicUrl}/${optimizedKey}`,
      thumbnail: `${publicUrl}/${thumbnailKey}`,
      filename: file.name,
      size: file.size,
      type: file.type
    }, 'Cover image uploaded successfully', requestId)
    
    return addCorsHeaders(response)

  } catch (error) {
    console.error('Cover upload error:', error)
    return createErrorResponse(error, requestId)
  }
}

export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(new NextResponse(null, { status: 200 }))
}
