'use client'

import { PlusIcon, Cog6ToothIcon, TrashIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { getBlockComponent, BlockType, getAllBlockTypes } from '../blocks'
import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ProfileBlock {
  id: string
  type: BlockType
  data: any
  gridX: number
  gridY: number
  width: number
  height: number
  title?: string
  order: number
}

interface EditableBlockGridProps {
  blocks?: ProfileBlock[]
  onAddBlock: (position: number) => void
  onEditBlock: (blockId: string) => void
  onDeleteBlock: (blockId: string) => void
  onExpandBlock?: (blockId: string, direction: 'width' | 'height') => void
  onReorderBlocks?: (newBlocks: ProfileBlock[]) => void
  maxSlots?: number
}

/**
 * EditableBlockGrid - WYSIWYG block editing
 * Shows blocks as they appear on the public profile, but with edit controls
 * Empty slots show plus buttons to add new blocks
 */
export default function EditableBlockGrid({
  blocks = [],
  onAddBlock,
  onEditBlock,
  onDeleteBlock,
  onExpandBlock,
  onReorderBlocks,
  maxSlots = 12
}: EditableBlockGridProps) {
  // DnD-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // Sortable ids are block ids
  const blockIds = blocks.map(b => b.id)

  // Handle drag end
  function handleDragEnd(event: any) {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id)
      const newIndex = blocks.findIndex(b => b.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1 && onReorderBlocks) {
        const newBlocks = arrayMove(blocks, oldIndex, newIndex)
        // Update order property for each block
        newBlocks.forEach((b, i) => (b.order = i))
        onReorderBlocks(newBlocks)
      }
    }
  }
  // Calculate which slots are filled
  const filledSlots = new Set<number>()
  blocks.forEach((block) => {
    const startPos = block.order
    const slotsNeeded = block.width * block.height
    for (let i = 0; i < slotsNeeded; i++) {
      filledSlots.add(startPos + i)
    }
  })

  // Create array of slot positions
  const slots = Array.from({ length: maxSlots }, (_, i) => i)

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-100">Blocks</h3>
          <p className="text-xs text-gray-400">
            Drag to reorder • Click + to add blocks • Hover to edit
          </p>
        </div>

        {/* Grid Layout - 2 columns */}
        <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-2 auto-rows-fr gap-4">
            {blocks.length === 0 ? (
              <>
                <EmptySlot position={0} onAdd={onAddBlock} isFirst />
                <EmptySlot position={1} onAdd={onAddBlock} />
              </>
            ) : (
              blocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  onEditBlock={onEditBlock}
                  onDeleteBlock={onDeleteBlock}
                />
              ))
            )}

            {/* Add empty slots after blocks */}
            {blocks.length > 0 && blocks.length < maxSlots && (
              <EmptySlot position={blocks.length} onAdd={onAddBlock} />
            )}
          </div>
        </SortableContext>
      </div>
    </DndContext>
  )
}

interface EmptySlotProps {
  position: number
  onAdd: (position: number) => void
  isFirst?: boolean
}

function EmptySlot({ position, onAdd, isFirst = false }: EmptySlotProps) {
  return (
    <button
      onClick={() => onAdd(position)}
      className="aspect-[3/4] flex flex-col items-center justify-center gap-3 p-6 bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-lg hover:border-blue-500 hover:bg-gray-800 transition-all group"
    >
      <PlusIcon className="w-12 h-12 text-gray-600 group-hover:text-blue-500 transition-colors" />
      <div className="text-center">
        <p className="text-sm font-medium text-gray-300 mb-1">
          {isFirst ? 'Add Your First Block' : 'Add Block'}
        </p>
        <p className="text-xs text-gray-500">
          {isFirst ? 'Showcase works, social links, or custom content' : 'Click to add'}
        </p>
      </div>
    </button>
  )
}

// SortableBlock wraps each block for drag-and-drop
function SortableBlock({ block, onEditBlock, onDeleteBlock }: {
  block: ProfileBlock
  onEditBlock: (blockId: string) => void
  onDeleteBlock: (blockId: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id })

  const BlockComponent = getBlockComponent(block.type as BlockType)
  const blockData = typeof block.data === 'string' ? JSON.parse(block.data) : block.data

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
    gridColumn: `span ${block.width}`,
    gridRow: `span ${block.height}`
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-20 p-1.5 bg-gray-700 text-white rounded hover:bg-blue-600 transition-colors shadow-lg cursor-grab"
        title="Drag to reorder"
      >
        <Bars3Icon className="w-4 h-4" />
      </button>

      {/* Edit Controls Overlay */}
      <div className="absolute top-2 right-2 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEditBlock(block.id)}
          className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-lg"
          title="Configure block"
        >
          <Cog6ToothIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDeleteBlock(block.id)}
          className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors shadow-lg"
          title="Delete block"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Edit mode indicator ring */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/50 rounded-lg pointer-events-none transition-colors" />

      {/* Block Content */}
      {BlockComponent ? (
        <BlockComponent
          data={blockData}
          width={block.width}
          height={block.height}
          isOwner={false}
        />
      ) : (
        <div className="aspect-[3/4] bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center">
          <p className="text-gray-500 text-sm">Unknown block type</p>
        </div>
      )}
    </div>
  )
}
