import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import SchemaNode from './SchemaNode.jsx'
import SchemaEdge from './SchemaEdge.jsx'
import { useSchemaStore } from '../../store/schemaStore.jsx'

/* ─── Node / Edge type registrations ──────────────────────── */
const nodeTypes = { schemaNode: SchemaNode }
const edgeTypes = { schemaEdge: SchemaEdge }

const defaultEdgeOptions = {
  type: 'schemaEdge',
  markerEnd: { type: MarkerType.ArrowClosed, color: '#6c63ff', width: 16, height: 16 },
  data: { relationType: 'ref' },
}

const proOptions = { hideAttribution: true }

/* ─── Empty Canvas Placeholder ─────────────────────────────── */
function EmptyHint() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-10">
      <div className="flex flex-col items-center gap-4 opacity-30">
        <div
          className="w-20 h-20 rounded-2xl border-2 border-dashed border-[var(--color-border)] flex items-center justify-center"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
            <line x1="9" y1="9" x2="9" y2="21" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-[var(--color-text-secondary)]">Empty Canvas</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Add a collection from the sidebar to get started
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Canvas ───────────────────────────────────────────── */
export default function SchemaCanvas() {
  const { state, dispatch, onNodesChange, onEdgesChange, onConnect } = useSchemaStore()
  const { nodes, edges } = state

  const onNodeClick = useCallback(
    (_, node) => dispatch({ type: 'SELECT_NODE', payload: node.id }),
    [dispatch],
  )
  const onEdgeClick = useCallback(
    (_, edge) => dispatch({ type: 'SELECT_EDGE', payload: edge.id }),
    [dispatch],
  )
  const onPaneClick = useCallback(
    () => dispatch({ type: 'DESELECT_ALL' }),
    [dispatch],
  )

  const isEmpty = nodes.length === 0

  return (
    <div className="relative w-full h-full">
      {isEmpty && <EmptyHint />}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={proOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        snapToGrid
        snapGrid={[16, 16]}
        deleteKeyCode="Delete"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="rgba(255,255,255,0.05)"
        />
        <Controls position="bottom-right" showInteractive={false} />
        <MiniMap
          position="bottom-left"
          nodeColor={(n) => n.data?.color ?? '#6c63ff'}
          maskColor="rgba(13,15,20,0.75)"
          nodeStrokeWidth={0}
        />
      </ReactFlow>
    </div>
  )
}
