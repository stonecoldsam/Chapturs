# Emoji System Visual Guide

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Chapturs Platform                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │ ExperimentalEditor │  │  RichTextEditor  │  │ CommentForm │ │
│  │   (Tiptap-based)   │  │ (ContentEditable)│  │  (Textarea) │ │
│  └─────────┬──────────┘  └────────┬─────────┘  └──────┬──────┘ │
│            │                      │                     │         │
│            └──────────────────────┼─────────────────────┘         │
│                                   │                               │
│                      ┌────────────▼────────────┐                 │
│                      │     EmojiPicker         │                 │
│                      │  ┌──────────────────┐   │                 │
│                      │  │ emoji-picker-react│   │                 │
│                      │  │  - Search         │   │                 │
│                      │  │  - Categories     │   │                 │
│                      │  │  - Recently Used  │   │                 │
│                      │  │  - Dark Mode      │   │                 │
│                      │  └──────────────────┘   │                 │
│                      └────────────┬────────────┘                 │
│                                   │                               │
│                      ┌────────────▼────────────┐                 │
│                      │   Emoji Utilities       │                 │
│                      │  ┌──────────────────┐   │                 │
│                      │  │ emojiData.ts     │   │                 │
│                      │  │ - 300+ emojis    │   │                 │
│                      │  │ - Search function│   │                 │
│                      │  │ - Recent storage │   │                 │
│                      │  └──────────────────┘   │                 │
│                      │  ┌──────────────────┐   │                 │
│                      │  │ customEmojis.ts  │   │                 │
│                      │  │ - Platform emojis│   │                 │
│                      │  │ - Future custom  │   │                 │
│                      │  └──────────────────┘   │                 │
│                      └─────────────────────────┘                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            localStorage (Recently Used Emojis)            │  │
│  │  ["😊", "🔥", "❤️", "👍", "��", ...]                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 📍 UI Integration Points

### 1. ExperimentalEditor Toolbar

```
┌─────────────────────────────────────────────────────────────────┐
│ [B] [I] [U] [H1][H2][H3] [•][1.][""]  [←][↔][→]  [📷][🔗][😊]    │
│                                                          ▲        │
│                                                          │        │
│                                                  Emoji button     │
└─────────────────────────────────────────────────────────────────┘
                                                          │
                                                          ▼
                            ┌─────────────────────────────────┐
                            │ 🔍 Search emojis...             │
                            ├─────────────────────────────────┤
                            │ 😊 😂 ❤️ 👍 🔥  ← Recent        │
                            ├─────────────────────────────────┤
                            │ [😊] [🐶] [🌳] [🍕] [⚽] [✈️]  │
                            ├─────────────────────────────────┤
                            │ 😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 │
                            │ 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 │
                            └─────────────────────────────────┘
```

### 2. RichTextEditor Toolbar

```
┌─────────────────────────────────────────────────────────────────┐
│ [B] [I] [U] [S] [^] [_]  |  [🔗] [📷] [😊]                      │
│                                        ▲                          │
│                                        │                          │
│                                 Emoji button                      │
└─────────────────────────────────────────────────────────────────┘
```

### 3. CommentForm with Emoji Button

```
┌─────────────────────────────────────────────────────────────────┐
│ Write a comment...                                          😊   │
│                                                              ▲   │
│                                                              │   │
│                                                      Emoji button│
│                                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
│                                                                  │
│                   ┌─────────────────────────────────┐          │
│                   │ Emoji Picker (opens above)      │          │
│                   │ ┌─────────────────────────────┐ │          │
│                   │ │ 🔍 Search...                 │ │          │
│                   │ ├─────────────────────────────┤ │          │
│                   │ │ 😊 😂 ❤️ 👍 🔥              │ │          │
│                   │ └─────────────────────────────┘ │          │
│                   └─────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────────┘
```

## 🔄 User Flow Diagram

```
┌─────────────┐
│  User clicks│
│ emoji button│
└──────┬──────┘
       │
       ▼
┌──────────────┐
│ Picker opens │
│ with search  │
│ & categories │
└──────┬───────┘
       │
       ▼
┌───────────────┐
│ User searches │◄───┐
│ or browses    │    │
└──────┬────────┘    │
       │             │
       ▼             │
┌───────────────┐    │
│ Emoji visible?│    │
└──────┬────────┘    │
       │             │
       ├─── No ──────┘
       │
       Yes
       │
       ▼
┌──────────────┐
│ User selects │
│    emoji     │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Emoji inserted   │
│ at cursor        │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Saved to recent  │
│ (localStorage)   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Picker closes    │
│ Focus on editor  │
└──────────────────┘
```

## 🎨 Component Interaction

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Component (ExperimentalEditor / RichTextEditor / CommentForm)  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ State Management                                        │    │
│  │                                                          │    │
│  │  const [showEmojiPicker, setShowEmojiPicker] = false   │    │
│  │                                                          │    │
│  └────────────┬──────────────────────────────┬────────────┘    │
│               │                               │                  │
│               │ Button Click                  │ Emoji Select     │
│               │                               │                  │
│               ▼                               ▼                  │
│  ┌────────────────────┐          ┌──────────────────────────┐  │
│  │ Toggle Picker      │          │ Insert Emoji             │  │
│  │ setShowEmojiPicker │          │ - Tiptap: chain().insert │  │
│  │   (!showEmojiPicker)│          │ - DOM: execCommand       │  │
│  └────────────────────┘          │ - Textarea: splice       │  │
│                                   │ Close Picker             │  │
│                                   │ Focus Editor             │  │
│                                   └──────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Render
                                ▼
                    ┌──────────────────────┐
                    │   <EmojiPicker />    │
                    │                      │
                    │ Props:               │
                    │ - onSelect           │
                    │ - onClose            │
                    │ - position           │
                    │ - theme (optional)   │
                    └──────────────────────┘
```

## 📱 Mobile vs Desktop View

### Desktop View
```
┌────────────────────────────────────────┐
│ Editor Toolbar                         │
│ [B] [I] [U] ... [😊] ← Emoji Button   │
├────────────────────────────────────────┤
│                                        │
│ Editor Content Area                    │
│                                        │
│                                        │
│                      ┌────────────────┐│
│                      │ Emoji Picker   ││
│                      │ (350x400px)    ││
│                      │                ││
│                      │ Search & Grid  ││
│                      └────────────────┘│
└────────────────────────────────────────┘
```

### Mobile View
```
┌──────────────────────┐
│ Editor Toolbar       │
│ [B][I][U]...[😊]    │
├──────────────────────┤
│                      │
│ Editor Content       │
│                      │
│                      │
├──────────────────────┤
│ ┌──────────────────┐ │
│ │  Emoji Picker    │ │
│ │  (Full width)    │ │
│ │                  │ │
│ │  Touch-friendly  │ │
│ │  Larger targets  │ │
│ └──────────────────┘ │
└──────────────────────┘
```

## 🌓 Dark Mode Support

### Light Theme
```
┌─────────────────────────────────┐
│ 🔍 Search emojis...             │ ← Light gray bg
├─────────────────────────────────┤
│ 😊 😂 ❤️ 👍 🔥                 │ ← White bg
├─────────────────────────────────┤
│ [😊] [🐶] [🌳] ...              │ ← Gray tabs
├─────────────────────────────────┤
│ 😀 😃 😄 😁 😆                 │ ← White bg
└─────────────────────────────────┘
```

### Dark Theme
```
┌─────────────────────────────────┐
│ 🔍 Search emojis...             │ ← Dark gray bg
├─────────────────────────────────┤
│ 😊 😂 ❤️ 👍 🔥                 │ ← Darker bg
├─────────────────────────────────┤
│ [😊] [🐶] [🌳] ...              │ ← Dark tabs
├─────────────────────────────────┤
│ 😀 😃 😄 😁 😆                 │ ← Dark bg
└─────────────────────────────────┘
```

## 🔍 Search Interaction

```
User types: "fire"
     │
     ▼
┌──────────────────────────────┐
│ 🔍 fire█                     │
├──────────────────────────────┤
│ Filtered Results:            │
│ 🔥 fire                      │
│ 🚒 fire engine               │
│ 🧯 fire extinguisher         │
│                              │
│ (No other emojis shown)      │
└──────────────────────────────┘
```

## 📊 Data Flow

```
User Action → Component State → EmojiPicker → emoji-picker-react
                ↓
        onSelect callback
                ↓
        Insert to editor
                ↓
        Update localStorage
                ↓
        Close picker
                ↓
        Focus editor
```

## 🎯 Positioning Options

```
Position: "bottom-left"        Position: "bottom-right"
┌─────────┐                              ┌─────────┐
│ [Button]│                              │ [Button]│
└────┬────┘                              └────┬────┘
     │                                        │
┌────▼────────┐                    ┌─────────▼────┐
│   Picker    │                    │   Picker     │
└─────────────┘                    └──────────────┘

Position: "top-left"           Position: "top-right"
┌────▲────────┐                    ┌─────────▲────┐
│   Picker    │                    │   Picker     │
└────┬────────┘                    └──────────┬───┘
     │                                        │
┌────▼────┐                              ┌───▼─────┐
│ [Button]│                              │ [Button]│
└─────────┘                              └─────────┘
```

## 🧩 Component Props

```typescript
// EmojiPicker Component
interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  //        ▲
  //        │
  //        Called when user clicks emoji
  //        Returns the Unicode emoji string
  
  onClose?: () => void
  //        ▲
  //        │
  //        Called when picker should close
  //        (click outside, escape key)
  
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  //         ▲
  //         │
  //         Where picker appears relative to button
  
  theme?: 'light' | 'dark' | 'auto'
  //      ▲
  //      │
  //      Color theme (auto detects system)
}
```

## 🎨 Category Breakdown

```
┌─────────────────────────────────────────────────────────────┐
│                      Emoji Categories                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [😊]  Smileys & Emotion    😊 😂 😍 😭 😎 🤔            │
│  [👋]  People & Body        👋 👍 👎 💪 👀 🧠            │
│  [🐶]  Animals & Nature     🐶 🐱 🦊 🐻 🔥 ⭐            │
│  [🍕]  Food & Drink         🍕 🍔 🍰 🍎 ☕ 🍺            │
│  [⚽]  Activities           ⚽ 🏀 🎸 🎮 🎨 🎬            │
│  [✈️]  Travel & Places      ✈️ 🚗 🏠 🗽 🌍 🏖️            │
│  [⌚]  Objects               ⌚ 📱 💻 📚 💡 🔑            │
│  [❤️]  Symbols              ❤️ ✅ ❌ ⭐ 🔥 ✨            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📝 Recently Used Section

```
┌─────────────────────────────────────────────────────────────┐
│ Recently Used (from localStorage)                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Last used → 😊 🔥 ❤️ 👍 🎉 😂 ✅ 🚀 💪 ⭐              │
│              ▲                                               │
│              │                                               │
│              Most recent (added to front of array)          │
│                                                              │
│  Stored in: localStorage['chapturs_recent_emojis']         │
│  Max count: 20 emojis                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 State Management Flow

```
Component Mount
      │
      ▼
Initialize State
showEmojiPicker = false
      │
      ▼
User Clicks Button
      │
      ▼
Toggle State
showEmojiPicker = true
      │
      ▼
Render EmojiPicker
      │
      ├─── User Selects Emoji ──────┐
      │                              │
      │                              ▼
      │                        onSelect(emoji)
      │                              │
      │                              ▼
      │                      Insert to Editor
      │                              │
      │                              ▼
      │                      addRecentEmoji(emoji)
      │                              │
      │                              ▼
      │                    setShowEmojiPicker(false)
      │                              │
      │                              ▼
      │                        Editor Focus
      │
      └─── User Clicks Outside ─────┐
                                     │
                                     ▼
                               onClose()
                                     │
                                     ▼
                         setShowEmojiPicker(false)
```

## 🎬 Animation & UX

```
Button Click
     │
     ▼
Picker Appears (instant)
     │
     ▼
┌─────────────────────┐
│ Fade In Animation   │ ← Smooth appearance
│ (CSS transition)    │
└─────────────────────┘
     │
     ▼
User Interaction
     │
     ▼
Emoji Selected
     │
     ▼
┌─────────────────────┐
│ Inserted to Editor  │ ← Immediate feedback
│ Cursor moves after  │
└─────────────────────┘
     │
     ▼
┌─────────────────────┐
│ Picker Closes       │ ← Quick close
│ (no animation)      │
└─────────────────────┘
```

This visual guide provides a comprehensive overview of the emoji system architecture, user interactions, and integration points across the Chapturs platform! 🎨
