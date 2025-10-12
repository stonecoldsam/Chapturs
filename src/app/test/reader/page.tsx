'use client'

import { useState } from 'react'
import ChaptursReader from '@/components/ChaptursReader'
import { ChaptDocument } from '@/types/chapt'

export default function ReaderDemoPage() {
  // Sample document with various block types
  const sampleDocument: ChaptDocument = {
    type: 'chapter',
    version: '1.0.0',
    metadata: {
      id: 'demo-chapter-1',
      title: 'The Mysterious Message',
      chapterNumber: 1,
      author: {
        id: 'author-1',
        name: 'Jane Doe'
      },
      language: 'en',
      wordCount: 450,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      status: 'published',
      tags: ['mystery', 'thriller', 'modern']
    },
    content: [
      {
        id: 'block-1',
        type: 'heading',
        text: 'Chapter 1: The Mysterious Message',
        level: 1
      },
      {
        id: 'block-2',
        type: 'prose',
        text: 'It was a dark and stormy night when Sarah received the cryptic text message. Her phone buzzed on the nightstand, illuminating the room with an eerie blue glow.',
        style: {
          animation: 'fade-in',
          delay: 200
        }
      },
      {
        id: 'block-3',
        type: 'phone',
        phoneType: 'ios',
        content: [
          {
            id: 'msg-1',
            user: 'Unknown',
            text: 'They know about the package.',
            timestamp: '11:47 PM',
            status: 'delivered'
          },
          {
            id: 'msg-2',
            user: 'Unknown',
            text: 'Meet me at the old pier. Midnight. Come alone.',
            timestamp: '11:47 PM',
            status: 'delivered'
          },
          {
            id: 'msg-3',
            user: 'You',
            text: 'Who is this?',
            timestamp: '11:48 PM',
            status: 'read'
          }
        ],
        ui: {
          time: '11:48',
          batteryLevel: 42,
          signalStrength: 4,
          carrier: 'AT&T'
        }
      },
      {
        id: 'block-4',
        type: 'prose',
        text: 'Sarah\'s hands trembled as she read the messages. How did they know? She had been so careful...',
        style: {
          animation: 'fade-in',
          delay: 300
        }
      },
      {
        id: 'block-5',
        type: 'narration',
        text: 'Little did Sarah know, this message would change her life forever. The events set in motion that night would lead her down a path she never could have imagined.',
        style: {
          variant: 'box',
          position: 'center'
        }
      },
      {
        id: 'block-6',
        type: 'prose',
        text: 'She grabbed her coat and keys, her mind racing. The rational part of her brain screamed that this was a terrible idea, but curiosity—and fear—drove her forward.',
        style: {
          animation: 'slide-up',
          delay: 200
        }
      },
      {
        id: 'block-7',
        type: 'dialogue',
        lines: [
          {
            speaker: 'SARAH',
            text: 'I must be crazy...',
            emotion: 'nervous'
          },
          {
            speaker: 'SARAH',
            text: 'But if I don\'t go, I\'ll never know the truth.',
            emotion: 'determined'
          }
        ]
      },
      {
        id: 'block-8',
        type: 'divider'
      },
      {
        id: 'block-9',
        type: 'heading',
        text: 'At the Pier',
        level: 2
      },
      {
        id: 'block-10',
        type: 'prose',
        text: 'The old pier was deserted, save for the sound of waves crashing against the wooden posts. A fog had rolled in, making it nearly impossible to see more than a few feet ahead.',
        style: {
          animation: 'fade-in',
          delay: 400
        }
      },
      {
        id: 'block-11',
        type: 'chat',
        platform: 'discord',
        messages: [
          {
            id: 'chat-1',
            user: 'Observer_77',
            text: 'She\'s here.',
            timestamp: '11:59 PM'
          },
          {
            id: 'chat-2',
            user: 'Shadow_Protocol',
            text: 'Good. Phase 2 is a go.',
            timestamp: '12:00 AM'
          },
          {
            id: 'chat-3',
            user: 'The_Architect',
            text: 'Remember, we need her alive. She\'s the only one who can access the vault.',
            timestamp: '12:00 AM'
          }
        ],
        platformStyle: {
          theme: 'dark',
          showTimestamps: true,
          showAvatars: false
        }
      },
      {
        id: 'block-12',
        type: 'prose',
        text: 'A figure emerged from the mist, their face obscured by a hood. Sarah\'s heart pounded in her chest.',
        style: {
          animation: 'fade-in',
          delay: 500
        }
      },
      {
        id: 'block-13',
        type: 'narration',
        text: 'To be continued...',
        style: {
          variant: 'overlay',
          position: 'bottom'
        }
      }
    ]
  }

  const handleBookmark = () => {
    alert('Chapter bookmarked!')
  }

  const handleShare = (blockId: string, text: string) => {
    console.log('Sharing quote:', text)
    navigator.clipboard.writeText(text)
    alert('Quote copied to clipboard!')
  }

  const handleComment = (blockId: string) => {
    console.log('Adding comment to block:', blockId)
    alert('Comment feature coming soon!')
  }

  const handleEditSuggestion = (blockId: string, text: string) => {
    console.log('Suggesting edit for block:', blockId)
    alert('Edit suggestion feature coming soon!')
  }

  return (
    <div className="min-h-screen">
      <ChaptursReader
        document={sampleDocument}
        onBookmark={handleBookmark}
        onShare={handleShare}
        onComment={handleComment}
        onEditSuggestion={handleEditSuggestion}
        enableTranslation={true}
        userLanguage="es"
      />
    </div>
  )
}
