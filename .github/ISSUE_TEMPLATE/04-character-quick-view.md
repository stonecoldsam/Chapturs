---
title: "Character Profile Quick View Hover Tooltip"
labels: ["enhancement", "reader-experience", "priority-medium"]
assignees: []
---

## 📋 Feature Description
Create a hover tooltip component that shows character quick info when readers hover over character names in chapters, complementing the existing full character profile system.

## 🎯 Goals
- Quick character reference without leaving the reading flow
- Hover-triggered tooltip on desktop
- Tap-triggered modal on mobile
- Spoiler-safe information display
- "View Full Profile" link to detailed page

## 📁 Files to Create/Modify

### New Files
- `src/components/CharacterQuickView.tsx` - Hover tooltip component
- `src/components/CharacterMentionHighlight.tsx` - Clickable character names
- `src/hooks/useCharacterTooltip.ts` - Tooltip positioning logic
- `src/lib/content/characterMentionParser.ts` - Detect character names in content

### Modified Files
- `src/components/TiptapRenderer.tsx` - Parse and highlight character mentions
- `src/app/work/[id]/section/[sectionId]/page.tsx` - Add tooltip context
- `src/components/WorkCharactersPage.tsx` - Add public/private field toggles

## ✅ Acceptance Criteria

### Desktop (Hover)
- [ ] Hover over character name shows tooltip after 300ms delay
- [ ] Tooltip follows cursor or anchors to text
- [ ] Tooltip stays open when hovering over it
- [ ] Closes on mouse leave after 200ms delay
- [ ] ESC key closes tooltip

### Mobile (Tap)
- [ ] Tap character name opens modal
- [ ] Modal has close button
- [ ] Tap outside closes modal
- [ ] Swipe down to dismiss

### Tooltip Content
- [ ] Character portrait/avatar
- [ ] Character name + aliases
- [ ] Quick glance summary (2-3 lines)
- [ ] First appearance link ("First seen in Chapter 3")
- [ ] "View Full Profile" button
- [ ] Spoiler-safe mode (hide info past current chapter)

### Creator Controls
- [ ] Toggle which fields are public vs private
- [ ] Spoiler-free cutoff (hide info until chapter X)
- [ ] Enable/disable quick view per character
- [ ] Custom quick view override text

## 🎨 UI Design

### Tooltip Layout (Desktop)
```
┌─────────────────────────────┐
│  [Avatar]  Elena Stormborn  │
│            (Storm Princess)  │
├─────────────────────────────┤
│ A fierce warrior princess   │
│ wielding ancient lightning  │
│ magic.                      │
├─────────────────────────────┤
│ 👁️ First seen: Chapter 1    │
│ [View Full Profile →]       │
└─────────────────────────────┘
```

### Mobile Modal
```
┌─────────────────────────────┐
│          Elena Stormborn    │
│              ✕              │
├─────────────────────────────┤
│      [Character Image]      │
│                             │
│ Also known as:              │
│ Storm Princess, The Chosen  │
│                             │
│ A fierce warrior princess   │
│ wielding ancient lightning  │
│ magic from her ancestors.   │
│                             │
│ 👁️ First appeared: Chapter 1 │
│                             │
│  [View Full Profile]        │
└─────────────────────────────┘
```

## 🔧 Technical Implementation

### CharacterQuickView Component
```tsx
interface CharacterQuickViewProps {
  characterId: string
  anchorEl?: HTMLElement | null  // For desktop positioning
  onClose: () => void
  currentChapter?: number  // For spoiler filtering
  isMobile?: boolean
}

export default function CharacterQuickView({
  characterId,
  anchorEl,
  onClose,
  currentChapter,
  isMobile
}: CharacterQuickViewProps) {
  const [character, setCharacter] = useState(null)
  
  useEffect(() => {
    // Fetch character with spoiler filtering
    fetch(`/api/characters/${characterId}?chapter=${currentChapter}`)
      .then(res => res.json())
      .then(data => setCharacter(data))
  }, [characterId, currentChapter])

  if (isMobile) {
    return <MobileCharacterModal character={character} onClose={onClose} />
  }

  return (
    <Tooltip anchorEl={anchorEl} onClose={onClose}>
      <div className="character-quick-view">
        {character.imageUrl && (
          <img src={character.imageUrl} alt={character.name} />
        )}
        <h3>{character.name}</h3>
        {character.aliases?.length > 0 && (
          <p className="text-sm text-gray-500">
            ({character.aliases.join(', ')})
          </p>
        )}
        <p className="quick-glance">{character.quickGlance}</p>
        {character.firstAppearance && (
          <p className="text-xs">
            👁️ First seen: Chapter {character.firstAppearance}
          </p>
        )}
        <Link href={`/characters/${characterId}`}>
          View Full Profile →
        </Link>
      </div>
    </Tooltip>
  )
}
```

### Character Mention Detection
```tsx
// src/lib/content/characterMentionParser.ts
export function parseCharacterMentions(
  htmlContent: string,
  characters: Character[]
): string {
  let processed = htmlContent
  
  characters.forEach(char => {
    const allNames = [char.name, ...(char.aliases || [])]
    
    allNames.forEach(name => {
      // Replace character names with clickable spans
      const regex = new RegExp(`\\b${escapeRegex(name)}\\b`, 'gi')
      processed = processed.replace(
        regex,
        `<span 
          class="character-mention" 
          data-character-id="${char.id}"
          data-character-name="${char.name}"
        >$&</span>`
      )
    })
  })
  
  return processed
}
```

### Integration in Reader
```tsx
// In section reader page
export default function SectionPage() {
  const [tooltipChar, setTooltipChar] = useState<string | null>(null)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  
  useEffect(() => {
    // Attach event listeners to character mentions
    const mentions = document.querySelectorAll('.character-mention')
    
    mentions.forEach(mention => {
      mention.addEventListener('mouseenter', (e) => {
        setTooltipChar(mention.dataset.characterId)
        setAnchorEl(e.target as HTMLElement)
      })
      
      mention.addEventListener('mouseleave', () => {
        setTimeout(() => {
          setTooltipChar(null)
          setAnchorEl(null)
        }, 200)
      })
    })
  }, [content])

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: processedContent }} />
      
      {tooltipChar && (
        <CharacterQuickView
          characterId={tooltipChar}
          anchorEl={anchorEl}
          onClose={() => setTooltipChar(null)}
          currentChapter={section.number}
        />
      )}
    </>
  )
}
```

## 🗄️ Database Changes

### Update CharacterProfile Schema
```prisma
model CharacterProfile {
  // ... existing fields
  
  // Quick view settings
  showQuickView           Boolean  @default(true)
  quickViewFields         String?  // JSON: {name, aliases, image, quickGlance, firstAppearance}
  spoilerSafeUntilChapter Int?     // Hide details until this chapter
  
  // Public/private field visibility
  publicFields            String   @default("[]") // JSON array of public field names
}
```

### API Endpoint
```typescript
// GET /api/characters/[id]?chapter=X
// Returns character with spoiler filtering
export async function GET(req: NextRequest, { params }: RouteParams) {
  const characterId = params.id
  const chapter = req.nextUrl.searchParams.get('chapter')
  
  const character = await prisma.characterProfile.findUnique({
    where: { id: characterId }
  })
  
  // Filter fields based on spoiler settings and public/private config
  return filterSpoilers(character, parseInt(chapter || '999'))
}
```

## 📦 Dependencies
- Tooltip library: `@floating-ui/react` or `@radix-ui/react-tooltip`
- Mobile detection: `react-device-detect`

## 🎯 Spoiler Safety Logic
```typescript
function filterCharacterForChapter(
  character: CharacterProfile,
  currentChapter: number
): Partial<CharacterProfile> {
  // If reader hasn't reached spoiler-safe chapter, limit info
  if (currentChapter < (character.spoilerSafeUntilChapter || 0)) {
    return {
      id: character.id,
      name: character.name,
      imageUrl: character.imageUrl,
      quickGlance: "Information locked until later chapters",
      firstAppearance: character.firstAppearance
    }
  }
  
  // Otherwise, return fields marked as public
  const publicFields = JSON.parse(character.publicFields || '[]')
  // ... filter logic
}
```

## 🚀 Implementation Phases

### Phase 1: Basic Tooltip (Week 1)
- [ ] Create CharacterQuickView component
- [ ] Basic hover detection
- [ ] Simple tooltip with name + quick glance
- [ ] Link to full profile

### Phase 2: Character Mention Parsing (Week 2)
- [ ] Parse character names in content
- [ ] Highlight mentions with CSS
- [ ] Click/hover handlers
- [ ] Mobile tap support

### Phase 3: Spoiler Safety (Week 3)
- [ ] Add spoiler settings to character profiles
- [ ] Filter API based on chapter progress
- [ ] Creator controls for public/private fields
- [ ] Locked info placeholder UI

### Phase 4: Polish (Week 4)
- [ ] Smooth animations
- [ ] Keyboard navigation
- [ ] Accessibility (ARIA labels)
- [ ] Performance optimization (debounce, caching)

## 🔒 Security & Privacy
- Only show fields creator marked as public
- Respect spoiler-safe chapter settings
- Cache character data client-side (session storage)
- Rate limit API calls

## 📱 Mobile Considerations
- Tap to open modal (not hover)
- Larger touch targets
- Swipe-to-dismiss gesture
- Bottom sheet style modal

## 💡 Future Enhancements
- Character relationship graph on hover
- Quick actions (bookmark character, view timeline)
- Voice actor info (for audiobooks)
- Fan art gallery preview
- Character evolution timeline

## 🎯 Success Metrics
- % of readers using character tooltips
- Most viewed characters
- Average time spent in quick view vs full profile
- Mobile vs desktop usage patterns
