# Chapturs - Modern Webnovel Platform

A cutting-edge webnovel platform that combines TikTok-style infinite scroll content discovery with YouTube-style creator monetization and subscription systems.

## 🚀 Features

### Reader Hub
- **Infinite Scroll Feed**: Mixed content from subscriptions, new releases, and algorithmic discoveries
- **Smart Content Cards**: Different card types (📌 subscribed, 🆕 new, 🎲 discovery) with contextual previews
- **Advanced Search & Browse**: Raw search results first, then algorithmic recommendations with comprehensive filters
- **Subscription Management**: Track reading progress, enable notifications, and manage your reading list
- **Responsive Reading Experience**: Full-featured story and chapter pages with progress tracking

### Creator Hub
- **Creator Dashboard**: Comprehensive analytics showing views, subscribers, revenue, and engagement metrics
- **Bulk Upload System**: Smart document parsing (.docx, .txt, .odt) with auto-chapter detection
- **Chapter Scheduling**: Automated publishing with customizable schedules
- **Dynamic Glossary**: Chapter-aware definitions and tooltips that evolve with your story
- **Revenue Tracking**: Monitor earnings and subscriber growth

### Advanced Features
- **Dynamic Glossary System**: Hover tooltips for terms/characters with chapter-aware definitions
- **Mobile-Optimized**: Responsive design with collapsible sidebar and mobile reading modes
- **Dark/Light Mode**: Theme switching with system preference detection
- **Progress Tracking**: Reading history and chapter progress
- **Hub Switching**: Seamless toggle between Reader and Creator modes

## 🛠 Tech Stack

- **Frontend**: Next.js 14 with React 18, TypeScript
- **Styling**: Tailwind CSS with custom components
- **Icons**: Heroicons
- **Architecture**: App Router with server components
- **Type Safety**: Full TypeScript implementation

## 🎨 UI/UX Features

- **Persistent Sidebar**: Always accessible navigation with collapsible mode
- **Infinite Scroll**: Performant lazy loading of content in batches
- **Smart Cards**: Contextual previews based on reading status
- **Glossary Tooltips**: Interactive definitions that appear on hover
- **Progress Indicators**: Visual reading progress and completion tracking
- **Responsive Design**: Optimized for all screen sizes

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── browse/            # Search and discovery
│   ├── subscriptions/     # User subscriptions
│   ├── creator/           # Creator Hub
│   │   ├── dashboard/     # Analytics and overview
│   │   └── upload/        # Content upload interface
│   └── story/[id]/        # Story pages
│       └── chapter/[chapterId]/  # Chapter reading
├── components/            # Reusable UI components
│   ├── AppLayout.tsx      # Main layout wrapper
│   ├── Sidebar.tsx        # Navigation sidebar
│   ├── FeedCard.tsx       # Content cards
│   ├── InfiniteFeed.tsx   # Infinite scroll feed
│   └── GlossarySystem.tsx # Dynamic tooltips
├── lib/                   # Utilities and mock data
├── types/                 # TypeScript definitions
└── styles/               # Global styles
```

## 🚦 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your actual values:
   - Get Google OAuth credentials from [Google Cloud Console](https://console.developers.google.com/)
   - Generate a secure NextAuth secret

3. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### For Readers
1. **Home Feed**: Infinite scroll through mixed content from your subscriptions and discoveries
2. **Browse**: Use advanced filters to find new stories by genre, status, popularity, etc.
3. **Subscriptions**: Manage your followed stories and reading progress
4. **Reading**: Click any card to start reading with dynamic glossary tooltips

### For Creators
1. **Switch to Creator Hub**: Use the toggle in the sidebar
2. **Dashboard**: View your analytics, revenue, and recent activity
3. **Upload**: Create single chapters or bulk upload documents with auto-parsing
4. **Manage**: Schedule publications and maintain story glossaries

## 🎯 Key Interactions

- **Feed Cards**: Show chapter previews for ongoing reads, story summaries for new content
- **Smart Navigation**: "Continue from next chapter" vs "Jump to selected chapter" prompts
- **Glossary**: Hover over terms for definitions that evolve with story progression
- **Mobile Experience**: Collapsible sidebar, full-window reading mode

## 🔧 Development

- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Type Check**: Built into the build process

## 📊 Analytics & Features

- **Engagement Metrics**: Read time, completion rates, comments
- **Revenue Tracking**: Creator earnings and subscriber growth
- **Content Discovery**: Algorithm-driven recommendations
- **User Experience**: Progress tracking, bookmarks, reading history

## 🎨 Design Philosophy

- **TikTok-inspired Discovery**: Endless, mixed, surprising content
- **YouTube-inspired Structure**: Subscriptions, monetization, analytics
- **Clean & Functional**: Always-accessible sidebar, respect for user intent
- **Mobile-First**: Responsive design for all devices

This platform represents the future of digital reading, combining the best aspects of modern content consumption with traditional storytelling.
