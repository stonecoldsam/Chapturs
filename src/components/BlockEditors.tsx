'use client'

import { useState } from 'react'
import { ChatBlock, ChatMessage, ChatPlatform, DialogueBlock, PhoneBlock, NarrationBlock } from '@/types/chapt'
import { MessageCircle, Phone, Users, BookOpen, Plus, Trash2 } from 'lucide-react'

// ============================================================================
// CHAT BLOCK EDITOR
// ============================================================================

interface ChatBlockEditorProps {
  block: ChatBlock
  mode: 'edit' | 'preview' | 'translate'
  onUpdate: (updates: Partial<ChatBlock>) => void
}

export function ChatBlockEditor({ block, mode, onUpdate }: ChatBlockEditorProps) {
  const [newMessage, setNewMessage] = useState({ user: '', text: '' })

  const addMessage = () => {
    if (!newMessage.user || !newMessage.text) return
    
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      user: newMessage.user,
      text: newMessage.text,
      timestamp: new Date().toISOString(),
      status: 'read'
    }

    onUpdate({
      messages: [...block.messages, message]
    })

    setNewMessage({ user: '', text: '' })
  }

  const removeMessage = (messageId: string) => {
    onUpdate({
      messages: block.messages.filter(m => m.id !== messageId)
    })
  }

  const updateMessage = (messageId: string, updates: Partial<ChatMessage>) => {
    onUpdate({
      messages: block.messages.map(m =>
        m.id === messageId ? { ...m, ...updates } : m
      )
    })
  }

  // Render chat UI based on platform
  const renderChatPreview = () => {
    const platformStyles = getPlatformStyles(block.platform)

    return (
      <div className={`rounded-lg overflow-hidden ${platformStyles.container}`}>
        {/* Platform Header */}
        <div className={platformStyles.header}>
          <div className="flex items-center gap-2">
            <MessageCircle size={16} />
            <span className="font-medium">
              {block.platform === 'discord' ? '#general' : 'Chat'}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className={`${platformStyles.body} space-y-2 p-4 max-h-96 overflow-y-auto`}>
          {block.messages.map((message) => (
            <div key={message.id} className="flex items-start gap-2">
              {block.platformStyle?.showAvatars && (
                <div className="w-8 h-8 rounded-full bg-gray-400 flex-shrink-0 flex items-center justify-center text-white text-xs">
                  {message.user[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className={platformStyles.username}>{message.user}</span>
                  {block.platformStyle?.showTimestamps && (
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp || '').toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  )}
                </div>
                <div className={platformStyles.message}>{message.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (mode === 'preview' || mode === 'translate') {
    return renderChatPreview()
  }

  // Edit Mode
  return (
    <div className="border border-gray-300 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} className="text-gray-600" />
          <span className="font-medium">Chat Block</span>
        </div>
        <select
          value={block.platform}
          onChange={(e) => onUpdate({ platform: e.target.value as ChatPlatform })}
          className="px-3 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="discord">Discord</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="sms">SMS</option>
          <option value="telegram">Telegram</option>
          <option value="slack">Slack</option>
          <option value="generic">Generic</option>
        </select>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 rounded p-2">
        {renderChatPreview()}
      </div>

      {/* Message List */}
      <div className="space-y-2">
        {block.messages.map((message, index) => (
          <div key={message.id} className="flex items-start gap-2 bg-white p-3 rounded border border-gray-200">
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={message.user}
                onChange={(e) => updateMessage(message.id, { user: e.target.value })}
                placeholder="Username"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <textarea
                value={message.text}
                onChange={(e) => updateMessage(message.id, { text: e.target.value })}
                placeholder="Message text"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded resize-none"
                rows={2}
              />
            </div>
            <button
              onClick={() => removeMessage(message.id)}
              className="p-1 text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Message Form */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage.user}
          onChange={(e) => setNewMessage({ ...newMessage, user: e.target.value })}
          placeholder="Username"
          className="px-3 py-2 text-sm border border-gray-300 rounded"
        />
        <input
          type="text"
          value={newMessage.text}
          onChange={(e) => setNewMessage({ ...newMessage, text: e.target.value })}
          placeholder="Message text"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded"
          onKeyDown={(e) => e.key === 'Enter' && addMessage()}
        />
        <button
          onClick={addMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Add
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// PHONE UI BLOCK EDITOR
// ============================================================================

interface PhoneBlockEditorProps {
  block: PhoneBlock
  mode: 'edit' | 'preview' | 'translate'
  onUpdate: (updates: Partial<PhoneBlock>) => void
}

export function PhoneBlockEditor({ block, mode, onUpdate }: PhoneBlockEditorProps) {
  const [newMessage, setNewMessage] = useState({ user: '', text: '' })

  const addMessage = () => {
    if (!newMessage.user || !newMessage.text) return
    
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      user: newMessage.user,
      text: newMessage.text,
      timestamp: new Date().toISOString(),
      status: 'read'
    }

    onUpdate({
      content: [...block.content, message]
    })

    setNewMessage({ user: '', text: '' })
  }

  const removeMessage = (messageId: string) => {
    onUpdate({
      content: block.content.filter(m => m.id !== messageId)
    })
  }

  const renderPhonePreview = () => {
    const isIOS = block.phoneType === 'ios'

    return (
      <div className="mx-auto max-w-sm">
        {/* Phone Frame */}
        <div className={`rounded-3xl overflow-hidden shadow-2xl ${isIOS ? 'bg-black' : 'bg-gray-900'}`}>
          {/* Notch/Status Bar */}
          <div className={`${isIOS ? 'h-8' : 'h-6'} bg-black flex items-center justify-between px-6 text-white text-xs`}>
            <span>{block.ui?.time || '9:41'}</span>
            <div className="flex items-center gap-2">
              <span>{block.ui?.carrier || 'Carrier'}</span>
              <span>📶 {block.ui?.signalStrength || 4}/5</span>
              <span>🔋 {block.ui?.batteryLevel || 85}%</span>
            </div>
          </div>

          {/* Screen Content */}
          <div className="bg-white h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <Phone size={20} />
                </div>
                <div>
                  <div className="font-medium">Messages</div>
                  <div className="text-xs text-gray-500">Online</div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {block.content.map((message) => {
                const isSent = message.user === 'You'
                
                return (
                  <div key={message.id} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isSent 
                        ? 'bg-blue-500 text-white rounded-br-sm' 
                        : 'bg-gray-200 text-gray-900 rounded-bl-sm'
                    }`}>
                      {!isSent && (
                        <div className="text-xs font-medium mb-1 opacity-70">{message.user}</div>
                      )}
                      <div className="text-sm">{message.text}</div>
                      {block.ui && (
                        <div className={`text-xs mt-1 ${isSent ? 'text-blue-100' : 'text-gray-500'}`}>
                          {new Date(message.timestamp || '').toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                          {isSent && message.status === 'read' && ' ✓✓'}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Input Bar */}
            <div className="border-t border-gray-200 p-3 bg-gray-50">
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-300">
                <span className="text-gray-400">iMessage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'preview' || mode === 'translate') {
    return renderPhonePreview()
  }

  // Edit Mode
  return (
    <div className="border border-gray-300 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Phone size={18} className="text-gray-600" />
          <span className="font-medium">Phone UI Block</span>
        </div>
        <select
          value={block.phoneType || 'ios'}
          onChange={(e) => onUpdate({ phoneType: e.target.value as 'ios' | 'android' | 'generic' })}
          className="px-3 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="ios">iOS</option>
          <option value="android">Android</option>
          <option value="generic">Generic</option>
        </select>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 rounded p-4">
        {renderPhonePreview()}
      </div>

      {/* Message Editor (similar to ChatBlock) */}
      <div className="space-y-2">
        {block.content.map((message) => (
          <div key={message.id} className="flex items-start gap-2 bg-white p-3 rounded border border-gray-200">
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={message.user}
                onChange={(e) => {
                  onUpdate({
                    content: block.content.map(m =>
                      m.id === message.id ? { ...m, user: e.target.value } : m
                    )
                  })
                }}
                placeholder="Sender (use 'You' for sent messages)"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <textarea
                value={message.text}
                onChange={(e) => {
                  onUpdate({
                    content: block.content.map(m =>
                      m.id === message.id ? { ...m, text: e.target.value } : m
                    )
                  })
                }}
                placeholder="Message text"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded resize-none"
                rows={2}
              />
            </div>
            <button
              onClick={() => removeMessage(message.id)}
              className="p-1 text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage.user}
          onChange={(e) => setNewMessage({ ...newMessage, user: e.target.value })}
          placeholder="Sender"
          className="px-3 py-2 text-sm border border-gray-300 rounded"
        />
        <input
          type="text"
          value={newMessage.text}
          onChange={(e) => setNewMessage({ ...newMessage, text: e.target.value })}
          placeholder="Message text"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded"
          onKeyDown={(e) => e.key === 'Enter' && addMessage()}
        />
        <button
          onClick={addMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Add
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// DIALOGUE BLOCK EDITOR
// ============================================================================

interface DialogueBlockEditorProps {
  block: DialogueBlock
  mode: 'edit' | 'preview' | 'translate'
  onUpdate: (updates: Partial<DialogueBlock>) => void
}

export function DialogueBlockEditor({ block, mode, onUpdate }: DialogueBlockEditorProps) {
  const addLine = () => {
    onUpdate({
      lines: [...block.lines, { speaker: '', text: '', emotion: undefined }]
    })
  }

  const updateLine = (index: number, updates: Partial<DialogueBlock['lines'][0]>) => {
    const newLines = [...block.lines]
    newLines[index] = { ...newLines[index], ...updates }
    onUpdate({ lines: newLines })
  }

  const removeLine = (index: number) => {
    onUpdate({
      lines: block.lines.filter((_, i) => i !== index)
    })
  }

  if (mode === 'preview' || mode === 'translate') {
    return (
      <div className="bg-gray-50 rounded-lg p-6 space-y-3 font-mono text-sm">
        {block.lines.map((line, index) => (
          <div key={index} className="flex gap-3">
            <div className="font-bold uppercase min-w-[120px] text-right">
              {line.speaker}
              {line.emotion && <span className="text-gray-500 text-xs ml-2">({line.emotion})</span>}
            </div>
            <div className="flex-1">{line.text}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="border border-gray-300 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-gray-600" />
          <span className="font-medium">Dialogue Block</span>
        </div>
      </div>

      <div className="space-y-2">
        {block.lines.map((line, index) => (
          <div key={index} className="flex items-start gap-2 bg-white p-3 rounded border border-gray-200">
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={line.speaker}
                  onChange={(e) => updateLine(index, { speaker: e.target.value })}
                  placeholder="Speaker"
                  className="w-40 px-2 py-1 text-sm border border-gray-300 rounded font-medium"
                />
                <input
                  type="text"
                  value={line.emotion || ''}
                  onChange={(e) => updateLine(index, { emotion: e.target.value || undefined })}
                  placeholder="Emotion (optional)"
                  className="w-32 px-2 py-1 text-sm border border-gray-300 rounded text-gray-600"
                />
              </div>
              <textarea
                value={line.text}
                onChange={(e) => updateLine(index, { text: e.target.value })}
                placeholder="Dialogue text"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded resize-none"
                rows={2}
              />
            </div>
            <button
              onClick={() => removeLine(index)}
              className="p-1 text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addLine}
        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded hover:border-gray-400 text-gray-600 flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        Add Line
      </button>
    </div>
  )
}

// ============================================================================
// NARRATION BLOCK EDITOR
// ============================================================================

interface NarrationBlockEditorProps {
  block: NarrationBlock
  mode: 'edit' | 'preview' | 'translate'
  onUpdate: (updates: Partial<NarrationBlock>) => void
}

export function NarrationBlockEditor({ block, mode, onUpdate }: NarrationBlockEditorProps) {
  const variant = block.style?.variant || 'box'
  const position = block.style?.position || 'center'

  if (mode === 'preview' || mode === 'translate') {
    return (
      <div className={`my-6 ${position === 'center' ? 'mx-auto max-w-2xl' : ''}`}>
        <div className={`
          ${variant === 'box' ? 'border-2 border-gray-400 bg-gray-50 p-4 rounded' : ''}
          ${variant === 'overlay' ? 'bg-black/80 text-white p-6 rounded-lg' : ''}
          ${variant === 'inline' ? 'italic text-gray-600 border-l-4 border-gray-400 pl-4' : ''}
          text-center
        `}>
          <BookOpen className="inline-block mb-2 text-gray-500" size={20} />
          <div className="font-serif text-sm leading-relaxed">
            {block.text}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-gray-300 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-gray-600" />
          <span className="font-medium">Narration Block</span>
        </div>
        <div className="flex gap-2">
          <select
            value={variant}
            onChange={(e) => onUpdate({ 
              style: { ...block.style, variant: e.target.value as 'box' | 'overlay' | 'inline' }
            })}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="box">Box</option>
            <option value="overlay">Overlay</option>
            <option value="inline">Inline</option>
          </select>
          <select
            value={position}
            onChange={(e) => onUpdate({ 
              style: { ...block.style, position: e.target.value as 'top' | 'center' | 'bottom' }
            })}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="top">Top</option>
            <option value="center">Center</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>
      </div>

      <textarea
        value={block.text}
        onChange={(e) => onUpdate({ text: e.target.value })}
        placeholder="Narrator commentary..."
        className="w-full min-h-[100px] px-3 py-2 text-sm border border-gray-300 rounded resize-none font-serif"
      />

      {/* Preview */}
      <div className="bg-gray-50 rounded p-4">
        {mode === 'edit' && (
          <div className={`
            ${variant === 'box' ? 'border-2 border-gray-400 bg-white p-4 rounded' : ''}
            ${variant === 'overlay' ? 'bg-black/80 text-white p-6 rounded-lg' : ''}
            ${variant === 'inline' ? 'italic text-gray-600 border-l-4 border-gray-400 pl-4' : ''}
            text-center
          `}>
            <BookOpen className="inline-block mb-2 text-gray-500" size={20} />
            <div className="font-serif text-sm leading-relaxed">
              {block.text || 'Preview will appear here...'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getPlatformStyles(platform: ChatPlatform) {
  const styles = {
    discord: {
      container: 'bg-[#36393f]',
      header: 'bg-[#2f3136] text-gray-100 px-4 py-2 text-sm',
      body: 'bg-[#36393f]',
      username: 'font-semibold text-blue-400 text-sm',
      message: 'text-gray-100 text-sm'
    },
    whatsapp: {
      container: 'bg-[#efeae2]',
      header: 'bg-[#075e54] text-white px-4 py-2 text-sm',
      body: 'bg-[#efeae2]',
      username: 'font-semibold text-gray-700 text-sm',
      message: 'bg-white rounded-lg px-3 py-2 text-sm shadow-sm'
    },
    sms: {
      container: 'bg-white',
      header: 'bg-gray-100 text-gray-900 px-4 py-2 text-sm border-b border-gray-200',
      body: 'bg-white',
      username: 'font-semibold text-gray-700 text-sm',
      message: 'text-gray-900 text-sm'
    },
    telegram: {
      container: 'bg-white',
      header: 'bg-[#0088cc] text-white px-4 py-2 text-sm',
      body: 'bg-[#f4f4f5]',
      username: 'font-semibold text-blue-500 text-sm',
      message: 'bg-white rounded-lg px-3 py-2 text-sm shadow-sm'
    },
    slack: {
      container: 'bg-white',
      header: 'bg-[#4a154b] text-white px-4 py-2 text-sm',
      body: 'bg-white',
      username: 'font-bold text-gray-900 text-sm',
      message: 'text-gray-900 text-sm'
    },
    generic: {
      container: 'bg-gray-50',
      header: 'bg-gray-200 text-gray-900 px-4 py-2 text-sm',
      body: 'bg-gray-50',
      username: 'font-semibold text-gray-700 text-sm',
      message: 'text-gray-900 text-sm'
    }
  }

  return styles[platform] || styles.generic
}
