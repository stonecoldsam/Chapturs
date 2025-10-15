---
title: "Implement Comment System with Reply Threads and Moderation"
labels: ["feature", "community", "priority-high"]
assignees: []
---

## 📋 Feature Description
Build a comprehensive comment system for works with support for chapter-level and inline comments, reply threads, likes, and creator moderation tools.

## 🎯 Goals
- Enable reader-creator interaction
- Chapter-specific discussions
- Optional inline/paragraph-level comments
- Moderation tools for creators
- Mobile-responsive comment UI

## 📁 Files to Create/Modify

### New Files
- `src/components/CommentSection.tsx` - Main comment display component
- `src/components/CommentForm.tsx` - Comment submission form
- `src/components/CommentThread.tsx` - Nested reply display
- `src/components/CommentModerationPanel.tsx` - Creator moderation UI
- `src/app/api/comments/route.ts` - List/create comments
- `src/app/api/comments/[id]/route.ts` - Edit/delete comment
- `src/app/api/comments/[id]/like/route.ts` - Like comment

### Modified Files
- `src/app/work/[id]/page.tsx` - Add comment section
- `src/app/work/[id]/section/[sectionId]/page.tsx` - Chapter comments
- `prisma/schema.prisma` - Verify Comment model

## ✅ Acceptance Criteria

### Reader Features
- [ ] Post top-level comments on works and chapters
- [ ] Reply to comments (max 3 levels deep)
- [ ] Like comments
- [ ] Edit own comments within 5 minutes
- [ ] Delete own comments
- [ ] Report inappropriate comments
- [ ] Sort by: newest, oldest, most liked

### Creator Features
- [ ] Enable/disable comments per work
- [ ] Pin important comments
- [ ] Delete any comment on their works
- [ ] Hide comments without deleting
- [ ] Block users from commenting
- [ ] View moderation queue (reported comments)

### Optional Advanced Features
- [ ] Inline comments (highlight paragraph to comment)
- [ ] Paragraph-specific threading
- [ ] Spoiler tags
- [ ] Mention users with @username
- [ ] Email notifications for replies

## 🗄️ Database Schema

### Verify/Enhance Prisma Schema
```prisma
model Comment {
  id            String   @id @default(cuid())
  workId        String
  sectionId     String?  // null = work-level comment
  userId        String
  content       String   @db.Text
  parentId      String?  // For reply threads
  
  // Inline comment positioning (optional feature)
  paragraphIndex Int?
  textStart     Int?
  textEnd       Int?
  highlightedText String? @db.Text
  
  isEdited      Boolean  @default(false)
  isPinned      Boolean  @default(false)
  isHidden      Boolean  @default(false)
  editedAt      DateTime?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  work          Work     @relation(fields: [workId], references: [id], onDelete: Cascade)
  section       Section? @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent        Comment? @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies       Comment[] @relation("CommentReplies")
  likes         CommentLike[]
  reports       CommentReport[]
  
  @@index([workId])
  @@index([sectionId])
  @@index([userId])
  @@index([parentId])
  @@index([createdAt])
  @@map("comments")
}

model CommentLike {
  id        String   @id @default(cuid())
  commentId String
  userId    String
  createdAt DateTime @default(now())
  
  comment   Comment  @relation(fields: [commentId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([commentId, userId])
  @@map("comment_likes")
}

model CommentReport {
  id        String   @id @default(cuid())
  commentId String
  userId    String
  reason    String   // 'spam', 'harassment', 'spoiler', 'other'
  details   String?  @db.Text
  status    String   @default("pending") // 'pending', 'reviewed', 'actioned'
  createdAt DateTime @default(now())
  
  comment   Comment  @relation(fields: [commentId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("comment_reports")
}
```

## 🔧 API Endpoints

### GET /api/works/[workId]/comments
Query params: `?sectionId=X&sort=newest&limit=20&cursor=X`
Returns paginated comments with nested replies

### POST /api/works/[workId]/comments
Create new comment
```json
{
  "sectionId": "optional-chapter-id",
  "content": "Great chapter!",
  "parentId": "optional-reply-to-id"
}
```

### PATCH /api/comments/[id]
Update own comment (within edit window)
```json
{
  "content": "Updated comment text"
}
```

### DELETE /api/comments/[id]
Delete own comment or creator deletes on their work

### POST /api/comments/[id]/like
Toggle like on comment

### POST /api/comments/[id]/report
Report inappropriate comment

### GET /api/creator/moderation/comments
Get reported/flagged comments for creator's works

## 🎨 UI Components

### CommentSection.tsx
```tsx
<CommentSection
  workId={work.id}
  sectionId={section?.id}
  canComment={user.isAuthenticated}
  isCreator={user.id === work.authorId}
/>
```

Features:
- Sort dropdown (newest/oldest/most liked)
- Load more pagination
- Real-time comment count
- Empty state when no comments

### CommentThread.tsx
```tsx
<CommentThread
  comment={comment}
  depth={0}
  maxDepth={3}
  onReply={handleReply}
  onLike={handleLike}
  onReport={handleReport}
  canModerate={isCreator}
/>
```

Features:
- Nested replies with indentation
- Like button with count
- Reply button
- Timestamp (relative: "2 hours ago")
- Edit/delete for own comments
- Pin/hide/delete for creators

## 🚀 Implementation Phases

### Phase 1: Basic Comments (Week 1)
- [ ] Database migration
- [ ] API endpoints (create, list, delete)
- [ ] Basic UI component
- [ ] Top-level comments only

### Phase 2: Replies & Likes (Week 2)
- [ ] Reply threading (max 3 levels)
- [ ] Like functionality
- [ ] Sort and pagination
- [ ] Edit comment feature

### Phase 3: Moderation (Week 3)
- [ ] Creator moderation panel
- [ ] Pin/hide/delete
- [ ] Report system
- [ ] Block user feature

### Phase 4: Advanced Features (Week 4)
- [ ] Inline paragraph comments (optional)
- [ ] Mention system
- [ ] Email notifications
- [ ] Spoiler tags

## 📦 Dependencies
- Rich text parsing: `markdown-it` or `DOMPurify` (sanitization)
- Relative time: `date-fns` or `dayjs`
- Infinite scroll: `react-intersection-observer`

## 🔒 Security Considerations
- Sanitize all comment content (prevent XSS)
- Rate limit comment creation (3 comments/minute)
- Validate comment length (max 5000 characters)
- Require authentication for all comment actions
- Verify creator ownership for moderation actions

## 🚀 Priority
**High** - Critical for community engagement

## 💡 Notes
- Consider implementing comment editing with version history
- Add "edited" indicator on modified comments
- Store deleted comments as "soft delete" for moderation review
- Consider real-time updates with WebSocket for active discussions
