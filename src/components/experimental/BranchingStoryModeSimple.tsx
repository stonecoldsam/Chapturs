'use client'

import { useState, useCallback } from 'react'
import { 
  ShareIcon, 
  PlusIcon, 
  XMarkIcon,
  PencilIcon,
  TrashIcon 
} from '@heroicons/react/24/outline'

// Types for branching story
interface StoryChoice {
  id: string
  text: string
  targetNodeId?: string
}

interface StoryNode {
  id: string
  title: string
  content: string
  choices: StoryChoice[]
  position: { x: number; y: number }
}

interface BranchingStoryData {
  nodes: StoryNode[]
}

interface BranchingStoryModeProps {
  data?: BranchingStoryData
  onChange: (data: BranchingStoryData) => void
  preview?: boolean
}

// Simple Node Component
function SimpleStoryNode({ node, onEdit, onDelete }: {
  node: StoryNode
  onEdit: (node: StoryNode) => void
  onDelete: (nodeId: string) => void
}) {
  return (
    <div 
      className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 w-64 shadow-lg"
      style={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">
          {node.title || 'Untitled Node'}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(node)}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(node.id)}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
        {node.content || 'No content yet...'}
      </div>
      
      <div className="space-y-1">
        {node.choices.map((choice) => (
          <div key={choice.id} className="text-xs bg-blue-50 dark:bg-blue-900 p-2 rounded border">
            {choice.text}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BranchingStoryModeSimple({ data, onChange, preview }: BranchingStoryModeProps) {
  const [editingNode, setEditingNode] = useState<StoryNode | null>(null)
  const [currentNodeId, setCurrentNodeId] = useState<string>('')

  const currentData: BranchingStoryData = data || {
    nodes: []
  }

  const updateData = (updates: Partial<BranchingStoryData>) => {
    onChange({ ...currentData, ...updates })
  }

  const deleteNode = useCallback((nodeId: string) => {
    const nodes = currentData.nodes.filter(node => node.id !== nodeId)
    const cleanedNodes = nodes.map(node => ({
      ...node,
      choices: node.choices.filter(choice => choice.targetNodeId !== nodeId)
    }))
    updateData({ nodes: cleanedNodes })
  }, [currentData])

  const handleEditNode = useCallback((node: StoryNode) => {
    setEditingNode(node)
  }, [])

  function addNewNode() {
    const existingNodes = currentData.nodes
    const newPosition = {
      x: existingNodes.length * 300 + 100,
      y: 100
    }
    
    const newNode: StoryNode = {
      id: `node_${Date.now()}`,
      title: `Scene ${existingNodes.length + 1}`,
      content: '',
      choices: [
        { id: `choice_${Date.now()}`, text: 'Continue...' }
      ],
      position: newPosition
    }
    
    updateData({ nodes: [...currentData.nodes, newNode] })
    
    // Focus the camera on the new node
    setTimeout(() => {
      setEditingNode(newNode)
    }, 100)
  }

  function saveNodeEdit(editedNode: StoryNode) {
    const nodes = currentData.nodes.map(node => 
      node.id === editedNode.id ? editedNode : node
    )
    updateData({ nodes })
    setEditingNode(null)
  }

  function addChoice(nodeId: string) {
    const nodes = currentData.nodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          choices: [
            ...node.choices,
            { id: `choice_${Date.now()}`, text: `Choice ${node.choices.length + 1}` }
          ]
        }
      }
      return node
    })
    updateData({ nodes })
  }

  function updateChoice(nodeId: string, choiceId: string, text: string) {
    const nodes = currentData.nodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          choices: node.choices.map(choice =>
            choice.id === choiceId ? { ...choice, text } : choice
          )
        }
      }
      return node
    })
    updateData({ nodes })
  }

  function removeChoice(nodeId: string, choiceId: string) {
    const nodes = currentData.nodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          choices: node.choices.filter(choice => choice.id !== choiceId)
        }
      }
      return node
    })
    updateData({ nodes })
  }

  // Preview mode for testing the story
  if (preview) {
    const currentNode = currentData.nodes.find(node => node.id === currentNodeId) || currentData.nodes[0]
    
    if (!currentNode) {
      return (
        <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="text-center p-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No story nodes created yet</p>
            <button 
              onClick={() => addNewNode()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create First Node
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="h-full bg-white dark:bg-gray-800 p-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            {currentNode.title}
          </h2>
          
          <div className="prose dark:prose-invert mb-6">
            <p>{currentNode.content}</p>
          </div>
          
          <div className="space-y-3">
            {currentNode.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => choice.targetNodeId && setCurrentNodeId(choice.targetNodeId)}
                className="block w-full text-left p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
              >
                {choice.text}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentNodeId('')}
            className="mt-6 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Editor
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Branching Story Editor
          </h2>
          <div className="flex gap-2">
            <button
              onClick={addNewNode}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="w-4 h-4" />
              Add Node
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative h-full overflow-auto">
        {currentData.nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create your first story node to get started
              </p>
              <button 
                onClick={addNewNode}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="w-5 h-5 inline mr-2" />
                Create First Node
              </button>
            </div>
          </div>
        ) : (
          <div className="relative min-h-full" style={{ minWidth: '1200px', minHeight: '800px' }}>
            {currentData.nodes.map(node => (
              <SimpleStoryNode
                key={node.id}
                node={node}
                onEdit={handleEditNode}
                onDelete={deleteNode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Edit Story Node
              </h3>
              <button
                onClick={() => setEditingNode(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Node Title
                </label>
                <input
                  type="text"
                  value={editingNode.title}
                  onChange={(e) => setEditingNode({ ...editingNode, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  placeholder="Enter scene title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={editingNode.content}
                  onChange={(e) => setEditingNode({ ...editingNode, content: e.target.value })}
                  rows={6}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  placeholder="Write your scene content here..."
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Choices
                  </label>
                  <button
                    onClick={() => addChoice(editingNode.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Add Choice
                  </button>
                </div>
                
                <div className="space-y-2">
                  {editingNode.choices.map((choice, index) => (
                    <div key={choice.id} className="flex gap-2">
                      <input
                        type="text"
                        value={choice.text}
                        onChange={(e) => {
                          const updatedChoices = [...editingNode.choices]
                          updatedChoices[index] = { ...choice, text: e.target.value }
                          setEditingNode({ ...editingNode, choices: updatedChoices })
                        }}
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        placeholder="Choice text..."
                      />
                      <button
                        onClick={() => {
                          const updatedChoices = editingNode.choices.filter(c => c.id !== choice.id)
                          setEditingNode({ ...editingNode, choices: updatedChoices })
                        }}
                        className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingNode(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => saveNodeEdit(editingNode)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
