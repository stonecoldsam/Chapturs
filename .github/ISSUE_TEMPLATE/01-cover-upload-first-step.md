---
title: "Move Cover Image Upload to First Step of Work Creation"
labels: ["enhancement", "creator-tools", "priority-high"]
assignees: []
---

## 📋 Feature Description
Move cover image upload from the editor/later stages to the very first step of work creation. This improves the submission workflow by collecting all metadata before content upload.

## 🎯 Goals
- Cover selection happens at work creation time
- Supports drag-and-drop upload
- Image preview before save
- Validates image format and dimensions
- Better UX for creators

## 📁 Files to Modify
- `src/app/create/page.tsx` or equivalent work creation page
- `src/components/WorkCreationForm.tsx` (if exists)
- `src/app/api/works/route.ts` - POST endpoint
- `src/app/api/upload/cover/route.ts` - Image upload endpoint

## ✅ Acceptance Criteria
- [ ] Cover upload is the first or second field in work creation form
- [ ] Drag-and-drop support with preview
- [ ] Image validation (format: JPEG/PNG/WebP, max size: 5MB, aspect ratio: 2:3 or 1:1.5)
- [ ] Optional cropping tool for aspect ratio
- [ ] Cover image persists when saving as draft
- [ ] Existing works can update cover from settings
- [ ] Mobile-responsive upload UI

## 🔧 Technical Implementation

### API Endpoint: POST /api/upload/cover
```typescript
interface CoverUploadRequest {
  file: File
  workId?: string // Optional if updating existing work
}

interface CoverUploadResponse {
  success: boolean
  imageUrl: string
  thumbnailUrl?: string
}
```

### UI Component Structure
```tsx
<CoverUploadField
  onUpload={(url) => setFormData({...formData, coverImage: url})}
  initialImage={formData.coverImage}
  aspectRatio="2:3"
  maxSizeMB={5}
/>
```

## 📦 Dependencies
- Image upload library: `react-dropzone` or `@uploadthing/react`
- Image cropper: `react-easy-crop` (optional)
- CDN/Storage: Current image storage solution

## 🚀 Priority
**High** - Improves first-time creator experience

## 💡 Notes
- Consider using CDN for optimized delivery
- Generate thumbnail versions (small/medium/large)
- Store original for future re-cropping
- Add alt text field for accessibility
