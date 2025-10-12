"use client"

import React, { useState, useCallback, useMemo } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import ExperimentalEditor from './ExperimentalEditor'
import { ContentFormat } from '@/types'
import { Save, Upload, Bold, Italic, Sparkles, X } from 'lucide-react'

interface CreatorEditorProps {
  workId?: string
  chapterId?: string
  mode?: 'create' | 'edit'
  formatType?: ContentFormat
  onSave?: (data: any) => void
  onPublish?: (data: any) => void
}

export default function CreatorEditor(props: CreatorEditorProps) {
  // Render experimental editor early to avoid initializing the main editor hooks
  if (props.formatType === 'experimental') {
    return (
      <ExperimentalEditor
        workId={props.workId}
        onSave={(content: string, data: any) => props.onSave?.({ content, experimentalData: data, wordCount: content.length })}
      />
    )
  }

  const [title, setTitle] = useState('')
  const [selectedText, setSelectedText] = useState('')
  const [showGlossaryModal, setShowGlossaryModal] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing...' }),
      Image.configure({ inline: true, allowBase64: true }),
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: 'https' }),
    ],
    content: '<h1></h1><p></p>',
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      const text = editor.state.doc.textBetween(from, to, '')
      setSelectedText(text)
    }
  })

  const handleAutoSave = useCallback(() => {
    if (!editor) return
    const data = { title, content: editor.getJSON() }
    props.onSave?.(data)
  }, [editor, title, props])

  const handlePublish = useCallback(() => {
    if (!editor) return
    const data = { title, content: editor.getJSON() }
    props.onPublish?.(data)
  }, [editor, title, props])

  const EditorToolbar = useMemo(() => (
    <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button onClick={() => editor?.chain().focus().toggleBold().run()} className="p-2">
            <Bold size={16} />
          </button>
          <button onClick={() => editor?.chain().focus().toggleItalic().run()} className="p-2">
            <Italic size={16} />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm">{editor?.storage?.characterCount?.words?.() || 0} words</span>
          <button onClick={handleAutoSave} className="px-3 py-1 bg-gray-100 rounded"> <Save size={14} /> Save</button>
          <button onClick={handlePublish} className="px-3 py-1 bg-blue-500 text-white rounded"> <Upload size={14} /> Publish</button>
        </div>
      </div>
    </div>
  ), [editor, handleAutoSave, handlePublish])

  if (!editor) return <div className="p-6">Loading editor...</div>

  return (
    <div className="h-full flex flex-col">
      {EditorToolbar}
      <div className="p-6">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Chapter title" className="w-full text-2xl mb-4" />

        <div>
          <EditorContent editor={editor} />
        </div>

        {selectedText && (
          <div className="fixed bottom-8 right-8 bg-white p-2 rounded shadow">
            <button onClick={() => setShowGlossaryModal(true)} className="p-1"><Sparkles size={14} /></button>
          </div>
        )}

        {showGlossaryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg">Add Glossary Entry</h3>
                <button onClick={() => setShowGlossaryModal(false)}><X size={16} /></button>
              </div>
              <div>
                <p>Term: {selectedText}</p>
                <textarea placeholder="Definition" className="w-full p-2 border" />
                <div className="mt-4 text-right">
                  <button onClick={() => setShowGlossaryModal(false)} className="px-3 py-1 bg-blue-500 text-white rounded">Save</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
