'use client'

import { useState, useCallback } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { 
  ShareIcon, 
  PlusIcon, 
  XMarkIcon,
  PencilIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

interface StoryChoice {
  id: string
  text: string
  targetNodeId: string
  effects?: Record<string, number>
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
  flags: Record<string, number>
}

interface BranchingStoryModeProps {
  data?: BranchingStoryData
  onChange: (data: BranchingStoryData) => void
  preview: boolean
}

// Custom Node Component
function StoryNodeComponent({ data, selected }: { data: any; selected: boolean }) {
  const { node, onEdit, onDelete } = data

  return (
    <div className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 min-w-64 max-w-80 ${
      selected ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900 dark:text-white truncate">
          {node.title}
        </h4>
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(node)}
            className="p-1 text-gray-500 hover:text-blue-500"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(node.id)}
            className="p-1 text-gray-500 hover:text-red-500"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
        {node.content}
      </p>
      
      <div className="text-xs text-gray-500">
        {node.choices.length} choice(s)
      </div>
    </div>
  )
}

const nodeTypes = {
  storyNode: StoryNodeComponent,
}

export default function BranchingStoryMode({ data, onChange, preview }: BranchingStoryModeProps) {
  const [activeTab, setActiveTab] = useState<'flowchart' | 'editor'>('flowchart')
  const [selectedNode, setSelectedNode] = useState<StoryNode | null>(null)
  const [editingNode, setEditingNode] = useState<StoryNode | null>(null)

  const currentData: BranchingStoryData = data || {
    nodes: [],
    flags: {}
  }

  const updateData = (updates: Partial<BranchingStoryData>) => {
    onChange({ ...currentData, ...updates })
  }

  // Convert story nodes to React Flow nodes
  const flowNodes: Node[] = currentData.nodes.map(node => ({
    id: node.id,
    type: 'storyNode',
    position: node.position,
    data: {
      node,
      onEdit: setEditingNode,
      onDelete: (nodeId: string) => {
        const nodes = currentData.nodes.filter(n => n.id !== nodeId)
        updateData({ nodes })
      }
    },
  }))

  // Convert choices to React Flow edges
  const flowEdges: Edge[] = currentData.nodes.flatMap(node =>
    node.choices.map(choice => ({
      id: `${node.id}-${choice.id}`,
      source: node.id,
      target: choice.targetNodeId,
      label: choice.text,
      type: 'smoothstep',
      style: { stroke: '#3b82f6' },
    }))
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges)

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds))
  }, [setEdges])

  const addNewNode = () => {
    const newNode: StoryNode = {
      id: `node_${Date.now()}`,
      title: 'New Story Node',
      content: '', // Start with empty content so placeholder shows properly
      choices: [],
      position: { x: Math.random() * 500, y: Math.random() * 300 }
    }
    updateData({ nodes: [...currentData.nodes, newNode] })
  }

  const saveNodeEdit = (editedNode: StoryNode) => {
    const nodes = currentData.nodes.map(node => 
      node.id === editedNode.id ? editedNode : node
    )
    updateData({ nodes })
    setEditingNode(null)
  }

  const addChoice = (nodeId: string) => {
    const node = currentData.nodes.find(n => n.id === nodeId)
    if (node) {
      const newChoice: StoryChoice = {
        id: `choice_${Date.now()}`,
        text: 'New choice',
        targetNodeId: ''
      }
      const updatedNode = { ...node, choices: [...node.choices, newChoice] }
      saveNodeEdit(updatedNode)
    }
  }

  const removeChoice = (nodeId: string, choiceId: string) => {
    const node = currentData.nodes.find(n => n.id === nodeId)
    if (node) {
      const updatedNode = { 
        ...node, 
        choices: node.choices.filter(c => c.id !== choiceId) 
      }
      saveNodeEdit(updatedNode)
    }
  }

  if (preview) {
    // Simple branching story player
    const [currentNodeId, setCurrentNodeId] = useState(currentData.nodes[0]?.id || '')
    const currentNode = currentData.nodes.find(n => n.id === currentNodeId)

    if (!currentNode) {
      return (
        <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <ShareIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No story nodes to preview</p>
          </div>
        </div>
      )
    }

    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {currentNode.title}
          </h2>
          
          <div className="prose prose-lg dark:prose-invert mb-8">
            <p>{currentNode.content}</p>
          </div>

          {currentNode.choices.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Choose your path:</h3>
              {currentNode.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => setCurrentNodeId(choice.targetNodeId)}
                  disabled={!choice.targetNodeId}
                  className="w-full p-4 text-left bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-blue-700 dark:text-blue-300">{choice.text}</span>
                  {choice.effects && Object.keys(choice.effects).length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Effects: {Object.entries(choice.effects).map(([key, value]) => 
                        `${key} ${value > 0 ? '+' : ''}${value}`
                      ).join(', ')}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {currentNode.choices.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p>The End</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white dark:bg-gray-800">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'flowchart', name: 'Flowchart', icon: ShareIcon },
            { id: 'editor', name: 'Node Editor', icon: PencilIcon },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Flowchart Tab */}
      {activeTab === 'flowchart' && (
        <div className="h-full relative">
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={addNewNode}
              className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Node
            </button>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background />
          </ReactFlow>
        </div>
      )}

      {/* Node Editor Tab */}
      {activeTab === 'editor' && (
        <div className="p-6">
          {editingNode ? (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                Edit Story Node
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Node Title
                  </label>
                  <input
                    type="text"
                    value={editingNode.title}
                    onChange={(e) => setEditingNode({ ...editingNode, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Story Content
                  </label>
                  <textarea
                    value={editingNode.content}
                    onChange={(e) => setEditingNode({ ...editingNode, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter the story content for this scene..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Choices
                    </label>
                    <button
                      onClick={() => addChoice(editingNode.id)}
                      className="flex items-center px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                    >
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Add Choice
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editingNode.choices.map((choice, index) => (
                      <div key={choice.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Choice {index + 1}
                          </span>
                          <button
                            onClick={() => removeChoice(editingNode.id, choice.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Choice Text
                            </label>
                            <input
                              type="text"
                              value={choice.text}
                              onChange={(e) => {
                                const updatedChoices = editingNode.choices.map(c =>
                                  c.id === choice.id ? { ...c, text: e.target.value } : c
                                )
                                setEditingNode({ ...editingNode, choices: updatedChoices })
                              }}
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Target Node
                            </label>
                            <select
                              value={choice.targetNodeId}
                              onChange={(e) => {
                                const updatedChoices = editingNode.choices.map(c =>
                                  c.id === choice.id ? { ...c, targetNodeId: e.target.value } : c
                                )
                                setEditingNode({ ...editingNode, choices: updatedChoices })
                              }}
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                            >
                              <option value="">Select target...</option>
                              {currentData.nodes.filter(n => n.id !== editingNode.id).map(node => (
                                <option key={node.id} value={node.id}>{node.title}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => saveNodeEdit(editingNode)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingNode(null)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Story Nodes</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentData.nodes.map((node) => (
                  <div key={node.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {node.title}
                      </h4>
                      <button
                        onClick={() => setEditingNode(node)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                      {node.content}
                    </p>
                    <div className="text-xs text-gray-500">
                      {node.choices.length} choice(s)
                    </div>
                  </div>
                ))}
              </div>

              {currentData.nodes.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <ShareIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No story nodes yet. Create your first branching story!</p>
                  <button
                    onClick={addNewNode}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Create First Node
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
