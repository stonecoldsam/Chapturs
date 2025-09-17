'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
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
  ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { 
  ShareIcon, 
  PlusIcon, 
  XMarkIcon,
  PencilIcon,
  PlayIcon,
  EyeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

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
  preview: boolean
}

// Custom Node Component
function StoryNodeComponent({ data, selected }: { data: any; selected: boolean }) {
  const { node, onEdit, onDelete } = data

  return (
    <div className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-3 min-w-48 max-w-64 ${
      selected ? 'border-blue-500 shadow-lg' : 'border-gray-300 dark:border-gray-600'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
          {node.title}
        </h4>
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(node)
            }}
            className="p-1 text-gray-500 hover:text-blue-500"
          >
            <PencilIcon className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(node.id)
            }}
            className="p-1 text-gray-500 hover:text-red-500"
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
        {node.content || 'Click to edit content...'}
      </p>
      
      {/* Choice Outputs */}
      <div className="text-xs text-gray-500">
        {node.choices.length} choice(s)
      </div>
      
      {/* Output Connection Points */}
      {node.choices.map((choice: StoryChoice, index: number) => (
        <div
          key={choice.id}
          className="absolute w-2 h-2 bg-blue-500 rounded-full border border-white"
          style={{
            right: -4,
            top: 30 + (index * 15),
          }}
          title={choice.text}
        />
      ))}
      
      {/* Input Connection Point */}
      <div
        className="absolute w-2 h-2 bg-green-500 rounded-full border border-white"
        style={{
          left: -4,
          top: 30,
        }}
      />
    </div>
  )
}

const nodeTypes = {
  storyNode: StoryNodeComponent,
}

export default function BranchingStoryMode({ data, onChange, preview }: BranchingStoryModeProps) {
  const [editingNode, setEditingNode] = useState<StoryNode | null>(null)
  const [currentNodeId, setCurrentNodeId] = useState<string>('')

  const currentData: BranchingStoryData = data || {
    nodes: []
  }

  // Stable callbacks that don't cause re-renders
  const deleteNode = useCallback((nodeId: string) => {
    const nodes = currentData.nodes.filter(node => node.id !== nodeId)
    // Also remove any choices that target this deleted node
    const cleanedNodes = nodes.map(node => ({
      ...node,
      choices: node.choices.filter(choice => choice.targetNodeId !== nodeId)
    }))
    onChange({ ...currentData, nodes: cleanedNodes })
  }, [currentData, onChange])

  const handleEditNode = useCallback((node: StoryNode) => {
    setEditingNode(node)
  }, [])

  // Convert story data to React Flow format directly (no useState needed)
  const flowNodes: Node[] = useMemo(() => 
    currentData.nodes.map(node => ({
      id: node.id,
      type: 'storyNode',
      position: node.position,
      data: {
        node,
        onEdit: handleEditNode,
        onDelete: deleteNode,
      },
    })), [currentData.nodes, handleEditNode, deleteNode])

  const flowEdges: Edge[] = useMemo(() => 
    currentData.nodes.flatMap(node =>
      node.choices
        .filter(choice => choice.targetNodeId) // Only include choices with targets
        .map(choice => ({
          id: `${node.id}-${choice.id}`,
          source: node.id,
          target: choice.targetNodeId!,
          label: choice.text,
          type: 'smoothstep',
          style: { stroke: '#3b82f6' },
        }))
    ), [currentData.nodes])

  // Use React Flow's built-in state management
  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges)

  // Sync React Flow state when our data changes
  useEffect(() => {
    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [flowNodes, flowEdges, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  function addNewNode() {
    const existingNodes = currentData.nodes
    const newPosition = {
      x: existingNodes.length * 300 + 100,
      y: 100 + Math.floor(existingNodes.length / 3) * 200,
    }

    const newNode: StoryNode = {
      id: `node_${Date.now()}`,
      title: 'New Story Node',
      content: '', // Start with empty content so placeholder shows properly
      choices: [
        { id: `choice_${Date.now()}`, text: 'Continue...' }
      ],
      position: newPosition
    }
    
    onChange({ ...currentData, nodes: [...currentData.nodes, newNode] })
    
    // Focus the camera on the new node
    setTimeout(() => {
      setEditingNode(newNode)
    }, 100)
  }

  function saveNodeEdit(editedNode: StoryNode) {
    const nodes = currentData.nodes.map(node => 
      node.id === editedNode.id ? editedNode : node
    )
    onChange({ ...currentData, nodes })
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
    onChange({ ...currentData, nodes })
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
    onChange({ ...currentData, nodes })
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
    onChange({ ...currentData, nodes })
  }

  // Preview mode for testing the story
  if (preview) {
    const currentNode = currentData.nodes.find(node => node.id === currentNodeId) || currentData.nodes[0]
    
    if (!currentNode) {
      return (
        <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <PlayIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No story nodes created yet.</p>
            <p>Exit preview mode to start building your story!</p>
          </div>
        </div>
      )
    }

    return (
      <div className="h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          {/* Story Content */}
          <div className="bg-black bg-opacity-50 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">{currentNode.title}</h2>
            <p className="text-lg leading-relaxed whitespace-pre-wrap">
              {currentNode.content}
            </p>
          </div>

          {/* Choices */}
          {currentNode.choices.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">What do you do?</h3>
              {currentNode.choices.map((choice: StoryChoice) => (
                <button
                  key={choice.id}
                  onClick={() => choice.targetNodeId && setCurrentNodeId(choice.targetNodeId)}
                  disabled={!choice.targetNodeId}
                  className={`w-full p-4 rounded-lg text-left transition-colors ${
                    choice.targetNodeId
                      ? 'bg-blue-600 hover:bg-blue-700 border border-blue-500'
                      : 'bg-gray-600 cursor-not-allowed border border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{choice.text}</span>
                    {choice.targetNodeId && <ArrowRightIcon className="w-5 h-5" />}
                    {!choice.targetNodeId && <span className="text-sm opacity-75">(No target)</span>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={() => setCurrentNodeId(currentData.nodes[0]?.id || '')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              Restart Story
            </button>
            <span className="text-sm opacity-75">
              Node: {currentNode.title}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white dark:bg-gray-800">
      {/* Main Flow Chart */}
      <div className="h-full relative">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50 dark:bg-gray-900"
          >
            <Controls />
            <MiniMap />
            <Background gap={12} size={1} />
          </ReactFlow>
        </ReactFlowProvider>

        {/* Add Node Button */}
        <button
          onClick={addNewNode}
          className="absolute top-4 left-4 z-10 flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Story Node
        </button>

        {/* Instructions */}
        {currentData.nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <ShareIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Create Your Branching Story</p>
              <p>Click "Add Story Node" to get started!</p>
            </div>
          </div>
        )}
      </div>

      {/* Node Editor Modal */}
      {editingNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Edit Story Node
              </h3>
              <button
                onClick={() => setEditingNode(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editingNode.title}
                  onChange={(e) => setEditingNode({...editingNode, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter node title..."
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Story Content
                </label>
                <textarea
                  value={editingNode.content}
                  onChange={(e) => setEditingNode({...editingNode, content: e.target.value})}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter the story content for this scene..."
                />
              </div>

              {/* Choices */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Choices ({editingNode.choices.length})
                  </label>
                  <button
                    onClick={() => addChoice(editingNode.id)}
                    className="text-sm text-blue-500 hover:text-blue-700"
                  >
                    + Add Choice
                  </button>
                </div>
                
                <div className="space-y-2">
                  {editingNode.choices.map((choice: StoryChoice, index: number) => (
                    <div key={choice.id} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                      <input
                        type="text"
                        value={choice.text}
                        onChange={(e) => updateChoice(editingNode.id, choice.id, e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        placeholder="Choice text..."
                      />
                      <button
                        onClick={() => removeChoice(editingNode.id, choice.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setEditingNode(null)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveNodeEdit(editingNode)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Save Node
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
