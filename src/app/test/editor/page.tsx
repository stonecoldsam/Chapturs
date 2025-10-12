'use client'

import { useState } from 'react'
import ChaptursEditor from '@/components/ChaptursEditor'
import { ChaptDocument } from '@/types/chapt'

export default function EditorDemoPage() {
  const [document, setDocument] = useState<ChaptDocument | undefined>(undefined)

  const handleSave = async (doc: ChaptDocument) => {
    console.log('Saving document:', doc)
    // TODO: Implement actual save to database
    setDocument(doc)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  const handlePublish = async (doc: ChaptDocument) => {
    console.log('Publishing document:', doc)
    // TODO: Implement publish workflow with validation
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Chapter published successfully!')
  }

  return (
    <div className="h-screen">
      <ChaptursEditor
        workId="demo-work-123"
        chapterId="demo-chapter-456"
        initialDocument={document}
        onSave={handleSave}
        onPublish={handlePublish}
      />
    </div>
  )
}
