import { useCallback } from 'react'
import {
  Plus, Download, Upload, Zap, GitBranch,
  PanelLeftClose, PanelLeftOpen, LayoutGrid, Moon,
} from 'lucide-react'
import Button from '../ui/Button.jsx'
import Tooltip from '../ui/Tooltip.jsx'
import { useSchemaStore } from '../../store/schemaStore.jsx'
import { DEFAULT_COLLECTION, FIELD_TYPES } from '../../constants/fieldTypes.js'

/* ─── Seed a demo collection node ─────────────────────────── */
function createDemoNode(label, color, x, y) {
  return {
    id: `${label.toLowerCase()}-${Date.now()}`,
    type: 'schemaNode',
    position: { x, y },
    data: {
      label,
      color,
      fields: [
        { id: '_id', name: '_id', type: 'ObjectId', required: true, isId: true },
        { id: 'f1', name: 'createdAt', type: 'Date', required: true },
        { id: 'f2', name: 'updatedAt', type: 'Date', required: true },
      ],
    },
  }
}

export default function Toolbar() {
  const { state, dispatch } = useSchemaStore()
  const { sidebarCollapsed } = state

  const addCollection = useCallback(() => {
    const id = `col-${Date.now()}`
    dispatch({
      type: 'ADD_NODE',
      payload: {
        id,
        type: 'schemaNode',
        position: {
          x: 100 + Math.random() * 300,
          y: 100 + Math.random() * 200,
        },
        data: {
          ...DEFAULT_COLLECTION,
          label: 'NewCollection',
          fields: [
            { id: '_id', name: '_id', type: 'ObjectId', required: true, isId: true },
          ],
        },
      },
    })
    dispatch({ type: 'SELECT_NODE', payload: id })
  }, [dispatch])

  const loadDemo = useCallback(() => {
    const userNode = createDemoNode('User', '#6c63ff', 80, 120)
    const postNode = createDemoNode('Post', '#00d68f', 480, 60)
    const commentNode = createDemoNode('Comment', '#ff5c7a', 480, 280)

    // Add ref field to Post → User
    postNode.data.fields.push({ id: 'author', name: 'author', type: 'ObjectId', ref: 'User', required: true })
    commentNode.data.fields.push({ id: 'post', name: 'post', type: 'ObjectId', ref: 'Post', required: true })
    commentNode.data.fields.push({ id: 'author', name: 'author', type: 'ObjectId', ref: 'User', required: true })

    dispatch({ type: 'SET_NODES', payload: [userNode, postNode, commentNode] })
    dispatch({
      type: 'SET_EDGES',
      payload: [
        {
          id: 'e-post-user',
          type: 'schemaEdge',
          source: postNode.id,
          sourceHandle: 'author-source',
          target: userNode.id,
          targetHandle: '_id-target',
          data: { relationType: 'ref' },
          markerEnd: { type: 'arrowclosed', color: '#6c63ff' },
        },
        {
          id: 'e-comment-post',
          type: 'schemaEdge',
          source: commentNode.id,
          sourceHandle: 'post-source',
          target: postNode.id,
          targetHandle: '_id-target',
          data: { relationType: 'ref' },
          markerEnd: { type: 'arrowclosed', color: '#00d68f' },
        },
      ],
    })
  }, [dispatch])

  return (
    <header
      className={[
        'h-14 shrink-0 flex items-center px-4 gap-3',
        'bg-[var(--color-bg-surface)] border-b border-[var(--color-border)]',
        'shadow-[0_1px_0_var(--color-border-subtle)]',
      ].join(' ')}
    >
      {/* ── Brand ── */}
      <div className="flex items-center gap-2 mr-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #6c63ff, #4ea8f8)' }}
        >
          <GitBranch size={14} className="text-white" />
        </div>
        <span className="text-sm font-bold text-[var(--color-text-primary)] tracking-tight">
          Schema<span className="text-[var(--color-brand)]">Flow</span>
        </span>
      </div>

      <div className="w-px h-6 bg-[var(--color-border)] mx-1" />

      {/* ── Sidebar toggle ── */}
      <Tooltip text={sidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'} placement="bottom">
        <Button
          variant="ghost"
          size="sm"
          icon={sidebarCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          aria-label="Toggle sidebar"
        />
      </Tooltip>

      {/* ── Add Collection ── */}
      <Tooltip text="Add Collection" placement="bottom">
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={15} />}
          onClick={addCollection}
          aria-label="Add collection"
        >
          Add Collection
        </Button>
      </Tooltip>

      <div className="w-px h-6 bg-[var(--color-border)] mx-1" />

      {/* ── Load Demo ── */}
      <Tooltip text="Load demo schema" placement="bottom">
        <Button
          variant="outline"
          size="sm"
          icon={<Zap size={14} />}
          onClick={loadDemo}
          aria-label="Load demo"
        >
          Demo
        </Button>
      </Tooltip>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Right actions ── */}
      <div className="flex items-center gap-1">
        <Tooltip text="Export schema JSON" placement="bottom">
          <Button variant="ghost" size="sm" icon={<Download size={15} />} aria-label="Export" />
        </Tooltip>
        <Tooltip text="Import schema" placement="bottom">
          <Button variant="ghost" size="sm" icon={<Upload size={15} />} aria-label="Import" />
        </Tooltip>
        <Tooltip text="Arrange layout" placement="bottom">
          <Button variant="ghost" size="sm" icon={<LayoutGrid size={15} />} aria-label="Auto layout" />
        </Tooltip>
      </div>

      {/* ── Node count chip ── */}
      <div className="px-2.5 py-1 rounded-full bg-[var(--color-bg-overlay)] border border-[var(--color-border)]">
        <span className="text-[11px] text-[var(--color-text-secondary)]">
          <span className="font-bold text-[var(--color-text-primary)]">{state.nodes.length}</span>
          {' '}collections ·{' '}
          <span className="font-bold text-[var(--color-text-primary)]">{state.edges.length}</span>
          {' '}relations
        </span>
      </div>
    </header>
  )
}
