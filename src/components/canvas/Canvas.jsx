import { useEffect, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  MarkerType,
  Panel,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import SchemaNode from './SchemaNode.jsx'
import SchemaEdge from './SchemaEdge.jsx'

/* ─── Static registrations (outside component to avoid re-renders) ── */
const nodeTypes = { schemaNode: SchemaNode }
const edgeTypes = { schemaEdge: SchemaEdge }

const defaultEdgeOptions = {
  type: 'schemaEdge',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#7c6af7',
    width: 14,
    height: 14,
  },
  data: { relationType: 'ref' },
}

const connectionLineStyle = {
  stroke: '#7c6af7',
  strokeWidth: 1.5,
  strokeDasharray: '6 3',
}

const proOptions = { hideAttribution: true }

/* ─── Empty canvas hint ─────────────────────────────────────── */
function EmptyHint() {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-10"
    >
      <div style={{ opacity: 0.2 }} className="flex flex-col items-center gap-3">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5" />
          <path d="M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3" />
        </svg>
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Empty canvas
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Add a collection to get started
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Canvas hint overlay (top-center pill) ────────────────── */
function CanvasHints() {
  return (
    <Panel position="top-center" style={{ marginTop: 14 }}>
      <div
        className="flex items-center gap-2.5 text-[11px] px-4 py-1.5 rounded-full select-none shadow-md backdrop-blur-md"
        style={{
          background: 'rgba(19, 20, 22, 0.85)',
          border: '1px solid var(--border-base)',
          color: 'var(--text-muted)',
        }}
      >
        <span>Drag handles to connect</span>
        <span style={{ color: 'var(--border-strong)' }}>·</span>
        <span>Scroll to zoom</span>
        <span style={{ color: 'var(--border-strong)' }}>·</span>
        <span>Delete to remove</span>
      </div>
    </Panel>
  )
}

/* ─── Main Canvas ───────────────────────────────────────────── */
export default function Canvas({
  nodes = [],
  edges = [],
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onEdgeClick,
  onPaneClick,
}) {
  const { fitView } = useReactFlow()
  const prevCountRef = useRef(nodes.length)

  /* Auto-fitView when a new node is added */
  useEffect(() => {
    if (nodes.length > prevCountRef.current) {
      /* Small delay so the node has mounted in the DOM */
      const t = setTimeout(() => {
        fitView({ padding: 0.25, duration: 400, maxZoom: 1.2 })
      }, 50)
      return () => clearTimeout(t)
    }
    prevCountRef.current = nodes.length
  }, [nodes.length, fitView])

  return (
    <div className="relative w-full h-full">
      {nodes.length === 0 && <EmptyHint />}

      <ReactFlow
        /* ── Data ── */
        nodes={nodes}
        edges={edges}

        /* ── Change handlers ── */
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}

        /* ── Interaction handlers ── */
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}

        /* ── Custom types ── */
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}

        /* ── Connection line styling ── */
        connectionLineStyle={connectionLineStyle}
        connectionLineType="smoothstep"

        /* ── Viewport ── */
        fitView
        fitViewOptions={{ padding: 0.25, maxZoom: 1.2 }}
        minZoom={0.1}
        maxZoom={3}

        /* ── Interaction ── */
        snapToGrid
        snapGrid={[16, 16]}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick={false}
        selectNodesOnDrag={false}

        /* ── Keys ── */
        deleteKeyCode={['Delete', 'Backspace']}
        selectionKeyCode="Shift"
        multiSelectionKeyCode="Meta"

        /* ── Attribution ── */
        proOptions={proOptions}
      >
        {/* ── Grid background ── */}
        <Background
          variant={BackgroundVariant.Lines}
          gap={32}
          size={1}
          color="rgba(255,255,255,0.035)"
          style={{ backgroundColor: 'var(--bg-app)' }}
        />

        {/* ── Controls (zoom in/out/fit/lock) ── */}
        <Controls
          position="bottom-right"
          showInteractive={false}
          style={{ marginBottom: 20, marginRight: 20 }}
        />

        {/* ── MiniMap ── */}
        <MiniMap
          position="bottom-left"
          nodeColor={(n) => n.data?.color ?? '#7c6af7'}
          maskColor="rgba(14,15,17,0.75)"
          nodeStrokeWidth={0}
          pannable
          zoomable
          style={{
            marginBottom: 20,
            marginLeft: 20,
            width: 160,
            height: 104,
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--border-base)',
            background: 'var(--bg-elevated)',
            boxShadow: 'var(--shadow-md)',
          }}
        />

        {/* ── Hints overlay ── */}
        <CanvasHints />
      </ReactFlow>
    </div>
  )
}
