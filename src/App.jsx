import { useState, useCallback } from 'react'
import {
  ReactFlowProvider,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
} from '@xyflow/react'

import Navbar       from './components/toolbar/Navbar.jsx'
import LeftSidebar  from './components/sidebar/LeftSidebar.jsx'
import Canvas       from './components/canvas/Canvas.jsx'
import RightSidebar from './components/panels/RightSidebar.jsx'
import BottomPanel  from './components/panels/BottomPanel.jsx'
import {
  useAddCollection,
  useOnConnect,
  useUpdateEdge,
} from './hooks/useSchemaActions.js'
import { generateAllModels } from './utils/generateModels.js'

/* ─── Node factory helper ───────────────────────────────────── */
function makeNode(id, label, color, x, y, extraFields = []) {
  return {
    id,
    type: 'schemaNode',
    position: { x, y },
    data: {
      label,
      color,
      fields: [
        { id: '_id', name: '_id', type: 'ObjectId', required: true, isId: true },
        ...extraFields,
      ],
    },
  }
}

/* ─── Initial canvas state ──────────────────────────────────── */
const DEFAULT_NODES = [
  makeNode('user', 'User', '#7c6af7', 100, 120, [
    { id: 'name',     name: 'name',     type: 'String', required: true  },
    { id: 'email',    name: 'email',    type: 'String', required: true  },
    { id: 'password', name: 'password', type: 'String', required: true  },
  ]),
  makeNode('post', 'Post', '#3dd68c', 460, 120, [
    { id: 'title',     name: 'title',     type: 'String',   required: true  },
    { id: 'body',      name: 'body',      type: 'String',   required: true  },
    { id: 'author',    name: 'author',    type: 'ObjectId', ref: 'User', required: true  },
    { id: 'published', name: 'published', type: 'Boolean',  required: false },
    { id: 'createdAt', name: 'createdAt', type: 'Date',     required: true  },
  ]),
]

const DEFAULT_EDGES = []

/* ═══════════════════════════════════════════════════════════════
   SchemaFlowApp — inner component (inside ReactFlowProvider)
   Must be inside Provider to access useReactFlow()
════════════════════════════════════════════════════════════════ */
function SchemaFlowApp() {
  /* ── Canvas state — single source of truth ── */
  const [nodes, setNodes] = useState(DEFAULT_NODES)
  const [edges, setEdges] = useState(DEFAULT_EDGES)

  /* ── UI state ── */
  const [selectedNodeId,  setSelectedNodeId]  = useState(null)
  const [selectedEdgeId,  setSelectedEdgeId]  = useState(null)
  const [bottomCollapsed, setBottomCollapsed] = useState(false)
  const [generatedCode,   setGeneratedCode]   = useState(null)

  /* ── useReactFlow — gives us getNodes() for live node resolution ── */
  const { getNodes } = useReactFlow()

  /* ── React Flow change handlers ── */
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [],
  )
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [],
  )

  /* ── Add collection ── */
  const addCollection = useAddCollection(setNodes, setSelectedNodeId)

  /*
   * ── onConnect ──────────────────────────────────────────────
   * Called by React Flow when user drags a handle to another node.
   * useOnConnect now receives getNodes so it can resolve collection
   * labels + field names at connect-time, storing them in edge.data:
   *   { relationType, fromCollection, toCollection, fromField,
   *     toField, fieldName }
   * This is the relationship stored in state for later code generation.
   */
  const onConnect = useOnConnect(setEdges, getNodes)

  /* ── Edge data patch (e.g. change relationType) ── */
  const onUpdateEdge = useUpdateEdge(setEdges)

  /* ── Generate Models ──────────────────────────────────────────
   * Runs the pure generator over current nodes + edges,
   * stores the result in state, and expands the bottom panel.
   */
  const handleGenerateModels = useCallback(() => {
    const code = generateAllModels(nodes, edges)
    setGeneratedCode(code)
    setBottomCollapsed(false)   // expand the panel
  }, [nodes, edges])

  /* ── Selection handlers ── */
  const onNodeClick = useCallback((_, node) => {
    setSelectedNodeId(node.id)
    setSelectedEdgeId(null)
  }, [])

  const onEdgeClick = useCallback((_, edge) => {
    setSelectedEdgeId(edge.id)
    setSelectedNodeId(null)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null)
    setSelectedEdgeId(null)
  }, [])

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId) ?? null

  /* ── Node data patcher (for RightSidebar Inspector edits) ── */
  const onUpdateNode = useCallback((nodeId, updater) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id !== nodeId
          ? n
          : {
              ...n,
              data: typeof updater === 'function'
                ? updater(n.data)
                : { ...n.data, ...updater },
            },
      ),
    )
  }, [])

  /* ── Left sidebar collection list (derived) ── */
  const collections = nodes.map((n) => ({
    id:     n.id,
    label:  n.data?.label ?? n.id,
    color:  n.data?.color,
    fields: n.data?.fields,
  }))

  return (
    <div
      className="flex flex-col"
      style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}
    >
      {/* ── Top Navbar ── */}
      <Navbar
        onAddCollection={addCollection}
        onGenerateModels={handleGenerateModels}
        nodeCount={nodes.length}
        edgeCount={edges.length}
      />

      {/* ── Workspace ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <LeftSidebar
          collections={collections}
          selectedId={selectedNodeId}
          onSelect={setSelectedNodeId}
          onAddCollection={addCollection}
        />

        {/* Canvas */}
        <main className="flex-1 relative overflow-hidden">
          <Canvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
          />
        </main>

        {/* Right Properties Panel */}
        <RightSidebar
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onClose={() => { setSelectedNodeId(null); setSelectedEdgeId(null) }}
          onUpdateNode={onUpdateNode}
          onUpdateEdge={onUpdateEdge}
        />
      </div>

      {/* ── Bottom code panel ── */}
      <BottomPanel
        generatedCode={generatedCode}
        collapsed={bottomCollapsed}
        onToggle={() => setBottomCollapsed((v) => !v)}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   App root — ReactFlowProvider must wrap SchemaFlowApp
════════════════════════════════════════════════════════════════ */
export default function App() {
  return (
    <ReactFlowProvider>
      <SchemaFlowApp />
    </ReactFlowProvider>
  )
}
