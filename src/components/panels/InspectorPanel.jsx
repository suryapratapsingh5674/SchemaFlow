import { Settings2, X, Layers, Info } from 'lucide-react'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'
import { useSchemaStore } from '../../store/schemaStore.jsx'
import { FIELD_TYPE_MAP } from '../../constants/fieldTypes.js'

/* ─── Section Heading ──────────────────────────────────────── */
function SectionHeading({ children }) {
  return (
    <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] px-4 pt-4 pb-1">
      {children}
    </h3>
  )
}

/* ─── Property Row ─────────────────────────────────────────── */
function PropRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between px-4 py-1.5 hover:bg-[var(--color-bg-overlay)] transition-colors rounded-none">
      <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
      <span className={`text-xs font-medium text-[var(--color-text-primary)] ${mono ? 'font-mono' : ''}`}>
        {value ?? '—'}
      </span>
    </div>
  )
}

/* ─── No Selection State ───────────────────────────────────── */
function EmptyInspector() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-overlay)] flex items-center justify-center opacity-40">
        <Info size={22} className="text-[var(--color-text-secondary)]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--color-text-secondary)]">Nothing selected</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Click a collection node or relation to inspect its properties.
        </p>
      </div>
    </div>
  )
}

/* ─── Node Inspector ───────────────────────────────────────── */
function NodeInspector({ node }) {
  const { data } = node
  const fields = data?.fields ?? []

  return (
    <>
      {/* Header chip */}
      <div className="px-4 py-3 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ background: data?.color ?? '#6c63ff' }}
          />
          <span className="text-sm font-bold text-[var(--color-text-primary)] truncate">
            {data?.label}
          </span>
        </div>
        <p className="text-[10px] text-[var(--color-text-muted)] mt-1">MongoDB Collection</p>
      </div>

      <SectionHeading>Properties</SectionHeading>
      <PropRow label="Collection name" value={data?.label} />
      <PropRow label="Node ID" value={node.id} mono />
      <PropRow label="Position" value={`${Math.round(node.position?.x ?? 0)}, ${Math.round(node.position?.y ?? 0)}`} />
      <PropRow label="Field count" value={fields.length} />
      <PropRow label="Required fields" value={fields.filter((f) => f.required).length} />

      <SectionHeading>Fields</SectionHeading>
      <div className="px-2 space-y-1">
        {fields.length === 0 && (
          <p className="text-xs text-[var(--color-text-muted)] italic px-2 py-2 text-center">No fields</p>
        )}
        {fields.map((field, i) => {
          const meta = FIELD_TYPE_MAP[field.type] ?? { color: '#8b92a8', shorthand: '?' }
          return (
            <div
              key={field.id ?? i}
              className="flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-md)] hover:bg-[var(--color-bg-overlay)] transition-colors"
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: field.required ? 'var(--color-accent-green)' : 'var(--color-border)' }}
              />
              <span className="flex-1 text-xs text-[var(--color-text-primary)] truncate font-medium">
                {field.name}
              </span>
              <Badge color={meta.color}>{meta.shorthand}</Badge>
            </div>
          )
        })}
      </div>
    </>
  )
}

/* ─── Inspector Panel ──────────────────────────────────────── */
export default function InspectorPanel() {
  const { state, dispatch } = useSchemaStore()
  const { selectedNodeId, inspectorCollapsed, nodes } = state

  const selectedNode = nodes.find((n) => n.id === selectedNodeId)

  if (inspectorCollapsed) return null

  return (
    <aside
      className={[
        'w-64 shrink-0 flex flex-col',
        'bg-[var(--color-bg-surface)] border-l border-[var(--color-border)]',
        'animate-fade-slide-in',
      ].join(' ')}
    >
      {/* ── Panel Header ── */}
      <div className="h-10 px-4 flex items-center gap-2 border-b border-[var(--color-border)]">
        <Settings2 size={14} className="text-[var(--color-brand)]" />
        <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider flex-1">
          Inspector
        </span>
        <Button
          variant="ghost"
          size="xs"
          icon={<X size={13} />}
          onClick={() => dispatch({ type: 'TOGGLE_INSPECTOR' })}
          aria-label="Close inspector"
        />
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        {selectedNode ? (
          <NodeInspector node={selectedNode} />
        ) : (
          <EmptyInspector />
        )}
      </div>

      {/* ── Footer ── */}
      <div className="p-3 border-t border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2 px-1">
          <Layers size={12} className="text-[var(--color-text-muted)]" />
          <span className="text-[10px] text-[var(--color-text-muted)]">
            {selectedNode ? `Inspecting: ${selectedNode.data?.label}` : 'Select a node to inspect'}
          </span>
        </div>
      </div>
    </aside>
  )
}
