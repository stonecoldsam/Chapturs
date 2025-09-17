# Chapturs - Webnovel Platform

## Project Overview
Chapturs is a modern webnovel platform that combines TikTok-style content discovery with YouTube-style creator monetization. The platform features infinite scroll feeds, dual Reader/Creator hubs, dynamic glossary system, and advanced content management tools.

## Architecture
- **Frontend**: Next.js 14+ with React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js with Express, MongoDB/PostgreSQL
- **Features**: Infinite scroll, real-time updates, file uploads, payment processing
- **UI/UX**: Responsive design with persistent sidebar navigation

## Key Features
1. **Reader Hub**: Infinite scroll feed mixing subscribed, new, and discovery content
2. **Creator Hub**: Upload tools, analytics, revenue management, glossary system
3. **Dynamic Content**: Chapter-aware definitions, smart parsing, bulk uploads
4. **Search & Discovery**: Clean results with advanced filtering options
5. **User Profiles**: Reading history, bookmarks, creator analytics

## Development Guidelines
- Use TypeScript for type safety
- Implement responsive design patterns
- Follow React best practices and hooks
- Use modular component architecture
- Prioritize performance for infinite scroll
- Implement proper error handling and loading states

## File Structure
- `/src/components/` - Reusable UI components
- `/src/pages/` - Next.js pages and API routes
- `/src/lib/` - Utility functions and configurations
- `/src/types/` - TypeScript type definitions
- `/src/styles/` - Global styles and Tailwind config
