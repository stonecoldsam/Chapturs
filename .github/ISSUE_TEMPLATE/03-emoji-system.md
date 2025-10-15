---
title: "Add Emoji System with Picker and Autocomplete"
labels: ["enhancement", "ux", "priority-medium"]
assignees: []
---

## 📋 Feature Description
Integrate a comprehensive emoji system across the platform with picker UI, autocomplete, and Unicode support for chapters, comments, and community features.

## 🎯 Goals
- Emoji picker in rich text editor
- Autocomplete with `:emoji_name:` syntax
- Support in comments, chapters, and profiles
- Custom platform emojis (optional)
- Mobile-friendly emoji selection

## 📁 Files to Create/Modify

### New Files
- `src/components/EmojiPicker.tsx` - Emoji picker modal
- `src/hooks/useEmojiAutocomplete.ts` - Autocomplete logic
- `src/lib/emoji/emojiData.ts` - Emoji mappings
- `src/lib/emoji/customEmojis.ts` - Platform-specific emojis

### Modified Files
- `src/components/ExperimentalEditor.tsx` - Add emoji picker button
- `src/components/CommentForm.tsx` - Emoji support in comments
- `src/components/TiptapEditor.tsx` - Editor emoji extension

## ✅ Acceptance Criteria
- [ ] Emoji picker opens on button click in editor
- [ ] Search emojis by name
- [ ] Category tabs (Smileys, People, Nature, Food, etc.)
- [ ] Recently used emojis section
- [ ] Autocomplete with `:` trigger (`:smile:` → 😊)
- [ ] Emojis render correctly in all contexts
- [ ] Mobile touch-friendly emoji picker
- [ ] Proper Unicode encoding in database
- [ ] XSS protection (sanitize emoji input)

## 🔧 Technical Implementation

### Emoji Picker Component
```tsx
<EmojiPicker
  onSelect={(emoji) => editor.chain().focus().insertContent(emoji).run()}
  position="bottom-left"
  categories={['recent', 'smileys', 'people', 'nature', 'food', 'activities', 'travel', 'objects', 'symbols']}
  customEmojis={platformEmojis}
/>
```

### Autocomplete Integration
```tsx
// In TiptapEditor.tsx
import { EmojiSuggestion } from '@/lib/editor/extensions/EmojiSuggestion'

const extensions = [
  // ... other extensions
  EmojiSuggestion.configure({
    HTMLAttributes: {
      class: 'emoji-suggestion',
    },
    suggestion: {
      items: ({ query }) => {
        return EMOJI_DATA
          .filter(emoji => 
            emoji.name.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 10)
      },
      render: () => {
        // Render suggestion dropdown
      }
    }
  })
]
```

### Custom Emoji Support (Optional)
```typescript
// src/lib/emoji/customEmojis.ts
export const platformEmojis = [
  {
    id: 'chapturs_fire',
    name: 'Chapturs Fire',
    shortcode: ':chapturs_fire:',
    imageUrl: '/emojis/custom/fire.png'
  }
  // ... more custom emojis
]
```

## 📦 Dependencies

### Recommended Libraries
**Option 1: emoji-picker-react (Recommended)**
```bash
npm install emoji-picker-react
```
- Well-maintained
- TypeScript support
- Customizable categories
- Search functionality built-in

**Option 2: @emoji-mart/react**
```bash
npm install @emoji-mart/data @emoji-mart/react
```
- More customization options
- Larger bundle size

**Option 3: Custom Implementation**
- Use `emoji-datasource` for emoji data
- Build custom picker UI
- More control but more work

### Editor Integration
```bash
npm install @tiptap/extension-emoji
# or use prosemirror-emoji for more control
```

## 🎨 UI Design

### Picker Layout
```
┌─────────────────────────────────┐
│ 🔍 Search emojis...             │
├─────────────────────────────────┤
│ 😊 😂 ❤️ 👍 🔥  ← Recent        │
├─────────────────────────────────┤
│ [😊] [🐶] [🌳] [🍕] [⚽] [✈️]  │ ← Categories
├─────────────────────────────────┤
│ 😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 │
│ 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 │
│ 🤪 🤨 🧐 🤓 😎 🤩 🥳 😏 😒 😞 │
└─────────────────────────────────┘
```

### Autocomplete Dropdown
```
:smile
┌────────────┐
│ 😊 smile   │
│ 😃 smiley  │
│ 😺 smile_cat │
└────────────┘
```

## 🔧 Implementation Steps

### Step 1: Basic Emoji Picker
```tsx
'use client'
import EmojiPicker from 'emoji-picker-react'

export default function EmojiButton({ onSelect }: { onSelect: (emoji: string) => void }) {
  const [showPicker, setShowPicker] = useState(false)
  
  return (
    <div className="relative">
      <button onClick={() => setShowPicker(!showPicker)}>
        😊
      </button>
      {showPicker && (
        <div className="absolute z-50">
          <EmojiPicker onEmojiClick={(emojiData) => {
            onSelect(emojiData.emoji)
            setShowPicker(false)
          }} />
        </div>
      )}
    </div>
  )
}
```

### Step 2: Editor Integration
```tsx
// In ExperimentalEditor toolbar
<EmojiButton 
  onSelect={(emoji) => {
    editor?.chain().focus().insertContent(emoji).run()
  }}
/>
```

### Step 3: Autocomplete
```tsx
import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'

export const EmojiSuggestion = Extension.create({
  name: 'emojiSuggestion',
  
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: ':',
        command: ({ editor, range, props }) => {
          editor
            .chain()
            .focus()
            .insertContentAt(range, props.emoji)
            .run()
        },
        items: async ({ query }) => {
          // Return matching emojis
          return EMOJI_LIST.filter(e => 
            e.name.includes(query.toLowerCase())
          ).slice(0, 10)
        }
      })
    ]
  }
})
```

## 🗄️ Database Considerations
- Store emojis as Unicode text (no special encoding needed)
- Ensure database charset supports Unicode: `utf8mb4` for MySQL/MariaDB
- Postgres handles Unicode natively
- No schema changes needed - emojis are just text

## 🔒 Security
- Sanitize emoji input to prevent XSS
- Use DOMPurify or similar for user-generated content
- Validate that inserted content is valid Unicode emoji
- Rate limit emoji spam (optional)

## 📱 Mobile Optimization
- Touch-friendly picker (larger emoji size on mobile)
- Native emoji keyboard integration
- Responsive picker layout
- Haptic feedback on emoji select (iOS/Android)

## 🚀 Implementation Priority
**Medium** - Nice-to-have, improves UX

## 💡 Extension Ideas
- Emoji reactions on comments (like Discord)
- Custom emoji uploader for verified creators
- Animated emoji support (GIF emojis)
- Emoji analytics (most used emojis)
- Emoji skin tone selector

## 🎯 Success Metrics
- % of comments/chapters using emojis
- Most popular emojis
- Time to select emoji (UX metric)
- Mobile vs desktop emoji usage

## 📝 Testing Checklist
- [ ] Emojis display correctly in editor
- [ ] Emojis save and load from database
- [ ] Autocomplete works with keyboard navigation
- [ ] Picker works on mobile (touch)
- [ ] Emojis render in published content
- [ ] No XSS vulnerabilities
- [ ] Works in all major browsers
- [ ] Accessible (keyboard navigation, screen readers)
