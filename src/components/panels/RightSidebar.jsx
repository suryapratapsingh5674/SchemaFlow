import { useCallback } from 'react'
import {
  X, Database, Plus, Trash2, GripVertical, Key,
  ChevronDown, ToggleLeft, ToggleRight, Link2,
  ArrowRight, GitMerge,
} from 'lucide-react'

/* ─── Relation types ────────────────────────────────────────── */
const RELATION_TYPES = [
  { value: 'ref',     label: 'ref',      color: '#7c6af7', desc: 'ObjectId reference (populate)' },
  { value: 'embed',   label: 'embed',    color: '#3dd68c', desc: 'Embedded sub-document'         },
  { value: 'virtual', label: 'virtual',  color: '#f5a623', desc: 'Virtual populate (no field)'    },
  { value: 'hasmany', label: 'has many', color: '#4da6ff', desc: 'Array of ObjectId references'   },
]

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════════════ */
const FIELD_TYPES = [
  { value: 'String',     label: 'String',     color: '#4da6ff' },
  { value: 'Number',     label: 'Number',     color: '#3dd68c' },
  { value: 'Boolean',    label: 'Boolean',    color: '#f5a623' },
  { value: 'Date',       label: 'Date',       color: '#c084fc' },
  { value: 'ObjectId',   label: 'ObjectId',   color: '#f25f5c' },
  { value: 'Array',      label: 'Array',      color: '#7c6af7' },
  { value: 'Mixed',      label: 'Mixed',      color: '#8b8d96' },
  { value: 'Map',        label: 'Map',        color: '#fb923c' },
  { value: 'Buffer',     label: 'Buffer',     color: '#2dd4bf' },
  { value: 'Decimal128', label: 'Decimal128', color: '#a3e635' },
]

const TYPE_COLOR = Object.fromEntries(FIELD_TYPES.map((t) => [t.value, t.color]))

/* ═══════════════════════════════════════════════════════════════
   PRIMITIVE UI ATOMS
════════════════════════════════════════════════════════════════ */

/** Thin section divider with label */
function SectionLabel({ children }) {
  return (
    <div
      className="flex items-center gap-2 px-4 pt-5 pb-2.5"
    >
      <span
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        {children}
      </span>
    </div>
  )
}

/** Inline text input */
function InlineInput({ value, onChange, placeholder, mono = false, style = {} }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      spellCheck={false}
      className="w-full outline-none"
      style={{
        background: 'var(--bg-input)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--r-md)',
        padding: '0 12px',
        height: 34,
        fontSize: 12,
        color: 'var(--text-primary)',
        fontFamily: mono ? "'JetBrains Mono', 'Fira Code', monospace" : 'inherit',
        transition: 'border-color 0.12s',
        ...style,
      }}
      onFocus={(e) => (e.target.style.borderColor = 'var(--brand)')}
      onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
    />
  )
}

/** Boolean toggle pill */
function Toggle({ value, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center gap-2 cursor-pointer select-none"
      title={`${label}: ${value ? 'on' : 'off'}`}
    >
      {value ? (
        <ToggleRight size={17} style={{ color: 'var(--brand)', flexShrink: 0 }} />
      ) : (
        <ToggleLeft size={17} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      )}
      <span style={{ fontSize: 11, fontWeight: 500, color: value ? 'var(--text-primary)' : 'var(--text-muted)' }}>
        {label}
      </span>
    </button>
  )
}

/** Type selector dropdown */
function TypeSelect({ value, onChange }) {
  const color = TYPE_COLOR[value] ?? '#8b8d96'
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none outline-none cursor-pointer pr-8"
        style={{
          background: `${color}18`,
          border: `1px solid ${color}40`,
          borderRadius: 'var(--r-md)',
          padding: '0 12px',
          height: 34,
          fontSize: 11.5,
          fontWeight: 600,
          color: color,
          transition: 'border-color 0.12s',
        }}
        onFocus={(e) => (e.target.style.borderColor = color)}
        onBlur={(e) => (e.target.style.borderColor = `${color}40`)}
      >
        {FIELD_TYPES.map((t) => (
          <option key={t.value} value={t.value} style={{ background: '#1a1b1e', color: t.color }}>
            {t.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color }}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   FIELD ROW — one editable field entry
════════════════════════════════════════════════════════════════ */
function FieldRow({ field, index, onUpdate, onDelete, isOnly }) {
  const isId = field.isId
  const set = (key) => (val) => onUpdate(index, { [key]: val })

  return (
    <div
      className="group mx-3.5 mb-2.5 rounded-lg border transition-all"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderColor: 'var(--border-subtle)',
        padding: '10px 12px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.035)'
        e.currentTarget.style.borderColor = 'var(--border-base)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
        e.currentTarget.style.borderColor = 'var(--border-subtle)'
      }}
    >
      {/* ── Top row: name + delete button ── */}
      <div className="flex items-center gap-2 mb-2.5">
        {isId ? (
          <Key size={13} style={{ color: 'var(--amber)', flexShrink: 0 }} title="Primary key" />
        ) : (
          <GripVertical
            size={13}
            className="shrink-0 opacity-0 group-hover:opacity-40 transition-opacity"
            style={{ color: 'var(--text-muted)', cursor: 'grab' }}
          />
        )}

        <div className="flex-1 min-w-0">
          <InlineInput
            value={field.name}
            onChange={set('name')}
            placeholder="field_name"
            mono
            style={{ width: '100%', height: 32 }}
          />
        </div>

        {!isId && (
          <button
            onClick={() => onDelete(index)}
            title="Delete field"
            className="w-7 h-7 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
            style={{ color: 'var(--red)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(242,95,92,0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* ── Type Selector ── */}
      <div className="mb-2">
        <TypeSelect value={field.type} onChange={set('type')} />
      </div>

      {/* ── Options: Required & Unique ── */}
      <div className="flex items-center gap-5 pt-0.5">
        <Toggle value={!!field.required} onChange={set('required')} label="Required" />
        <Toggle value={!!field.unique}   onChange={set('unique')}   label="Unique"   />
      </div>

      {/* ── Default value row (if not _id) ── */}
      {!isId && (
        <div className="flex items-center gap-2 pt-2 border-t mt-2" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize: 10.5, color: 'var(--text-muted)', flexShrink: 0, width: 44 }}>
            default
          </span>
          <InlineInput
            value={field.default ?? ''}
            onChange={set('default')}
            placeholder="undefined"
            mono
            style={{ flex: 1, fontSize: 11, height: 30 }}
          />
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
════════════════════════════════════════════════════════════════ */
function EmptyPanel() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-base)' }}
      >
        <Database size={18} style={{ color: 'var(--text-muted)' }} />
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
          No selection
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          Click a collection node to edit its schema.
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   RIGHT SIDEBAR — main export
════════════════════════════════════════════════════════════════ */
export default function RightSidebar({
  selectedNode,
  selectedEdge,
  onClose,
  onUpdateNode,
  onUpdateEdge,
}) {
  /* Show edge inspector when an edge is selected */
  if (selectedEdge) {
    return <EdgeInspector edge={selectedEdge} onClose={onClose} onUpdateEdge={onUpdateEdge} />
  }

  if (!selectedNode) return null

  const { id, data } = selectedNode
  const fields  = data?.fields ?? []
  const accent  = data?.color  ?? 'var(--brand)'

  /* ── Collection name ── */
  const setLabel = useCallback(
    (value) => onUpdateNode(id, { label: value }),
    [id, onUpdateNode],
  )

  /* ── Field operations ── */
  const updateField = useCallback(
    (index, patch) =>
      onUpdateNode(id, (d) => {
        const updated = [...d.fields]
        updated[index] = { ...updated[index], ...patch }
        return { ...d, fields: updated }
      }),
    [id, onUpdateNode],
  )

  const deleteField = useCallback(
    (index) =>
      onUpdateNode(id, (d) => ({
        ...d,
        fields: d.fields.filter((_, i) => i !== index),
      })),
    [id, onUpdateNode],
  )

  const addField = useCallback(
    () =>
      onUpdateNode(id, (d) => ({
        ...d,
        fields: [
          ...d.fields,
          {
            id:       `f-${Date.now()}`,
            name:     '',
            type:     'String',
            required: false,
            unique:   false,
            default:  '',
          },
        ],
      })),
    [id, onUpdateNode],
  )

  return (
    <aside
      className="flex flex-col shrink-0 anim-slide-right"
      style={{
        width:       'var(--rsidebar-w)',
        borderLeft:  '1px solid var(--border-base)',
        background:  'var(--bg-panel)',
        minWidth:    0,
      }}
    >
      {/* ══ HEADER ═══════════════════════════════════════════════ */}
      <div
        className="flex items-center gap-3 px-4 shrink-0"
        style={{
          height:       44,
          borderBottom: '1px solid var(--border-base)',
          background:   `${accent}0a`,
        }}
      >
        <span
          style={{ width: 9, height: 9, borderRadius: '50%', background: accent, flexShrink: 0 }}
        />
        <span
          style={{
            flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          {data?.label ?? 'Collection'}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
          {fields.length} {fields.length === 1 ? 'field' : 'fields'}
        </span>
        <button
          onClick={onClose}
          title="Close"
          className="w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer shrink-0"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-active)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* ══ SCROLLABLE BODY ══════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Collection Name ── */}
        <SectionLabel>Collection</SectionLabel>
        <div className="px-4 pb-3.5">
          <label
            style={{ fontSize: 10.5, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}
          >
            Name
          </label>
          <InlineInput
            value={data?.label ?? ''}
            onChange={setLabel}
            placeholder="CollectionName"
          />
          <p style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 6 }}>
            Mongoose model: <span style={{ color: accent, fontFamily: 'monospace', fontWeight: 600 }}>{data?.label ?? ''}Schema</span>
          </p>
        </div>

        {/* ── Fields ── */}
        <SectionLabel>Fields</SectionLabel>

        {/* Field list */}
        <div>
          {fields.map((field, i) => (
            <FieldRow
              key={field.id ?? i}
              field={field}
              index={i}
              onUpdate={updateField}
              onDelete={deleteField}
              isOnly={fields.length === 1}
            />
          ))}
        </div>

        {/* Add field button */}
        <div className="px-4 py-3">
          <button
            onClick={addField}
            className="w-full flex items-center justify-center gap-2 h-9 rounded-lg cursor-pointer transition-all"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: accent,
              background: `${accent}12`,
              border: `1px dashed ${accent}50`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${accent}20`
              e.currentTarget.style.borderColor = accent
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${accent}12`
              e.currentTarget.style.borderColor = `${accent}50`
            }}
          >
            <Plus size={14} />
            Add field
          </button>
        </div>

        {/* ── Stats ── */}
        <SectionLabel>Summary</SectionLabel>
        <div className="px-4 pb-5 grid grid-cols-2 gap-2.5">
          {[
            { label: 'Total',    value: fields.length,                                    color: 'var(--brand)'          },
            { label: 'Required', value: fields.filter((f) => f.required).length,          color: 'var(--green)'          },
            { label: 'Unique',   value: fields.filter((f) => f.unique).length,            color: '#c084fc'               },
            { label: 'Refs',     value: fields.filter((f) => f.type === 'ObjectId').length, color: 'var(--red)'          },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center py-2.5 rounded-lg"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
            >
              <span style={{ fontSize: 18, fontWeight: 700, color: stat.color, lineHeight: 1.2 }}>
                {stat.value}
              </span>
              <span style={{ fontSize: 9.5, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

/* ═══════════════════════════════════════════════════════════════
   EDGE INSPECTOR
   Shows when a relation edge is selected instead of a node.
════════════════════════════════════════════════════════════════ */
function EdgeInspector({ edge, onClose, onUpdateEdge }) {
  const d      = edge.data ?? {}
  const relCfg = RELATION_TYPES.find((r) => r.value === d.relationType) ?? RELATION_TYPES[0]

  return (
    <aside
      className="flex flex-col shrink-0 anim-slide-right"
      style={{
        width:      'var(--rsidebar-w)',
        borderLeft: '1px solid var(--border-base)',
        background: 'var(--bg-panel)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 shrink-0"
        style={{
          height:       44,
          borderBottom: '1px solid var(--border-base)',
          background:   `${relCfg.color}0a`,
        }}
      >
        <GitMerge size={15} style={{ color: relCfg.color, flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          Relation
        </span>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-active)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* From → To */}
        <SectionLabel>Collections</SectionLabel>
        <div
          className="mx-4 mb-3.5 flex items-center gap-3 px-3.5 py-2.5 rounded-lg"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {d.fromCollection ?? '?'}
          </span>
          <ArrowRight size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {d.toCollection ?? '?'}
          </span>
        </div>

        {/* Field info */}
        {(d.fromField || d.toField) && (
          <>
            <SectionLabel>Fields</SectionLabel>
            <div className="px-4 mb-3.5 space-y-1.5">
              {d.fromField && (
                <div className="flex items-center gap-2.5">
                  <span style={{ fontSize: 10.5, color: 'var(--text-muted)', width: 48, flexShrink: 0 }}>from</span>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: relCfg.color }}>{d.fromField}</span>
                </div>
              )}
              {d.toField && (
                <div className="flex items-center gap-2.5">
                  <span style={{ fontSize: 10.5, color: 'var(--text-muted)', width: 48, flexShrink: 0 }}>to</span>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{d.toField}</span>
                </div>
              )}
              {d.fieldName && (
                <div className="flex items-center gap-2.5">
                  <span style={{ fontSize: 10.5, color: 'var(--text-muted)', width: 48, flexShrink: 0 }}>field</span>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#4da6ff' }}>{d.fieldName}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Relation type selector */}
        <SectionLabel>Relation Type</SectionLabel>
        <div className="px-4 mb-3.5 space-y-2">
          {RELATION_TYPES.map((rel) => {
            const active = d.relationType === rel.value
            return (
              <button
                key={rel.value}
                onClick={() => onUpdateEdge(edge.id, { relationType: rel.value })}
                className="w-full flex items-start gap-3 px-3.5 py-2.5 rounded-lg cursor-pointer transition-all text-left"
                style={{
                  background: active ? `${rel.color}18` : 'transparent',
                  border:     `1px solid ${active ? rel.color : 'var(--border-subtle)'}`,
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--bg-hover)' }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <span
                  style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: rel.color, flexShrink: 0, marginTop: 4,
                  }}
                />
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: active ? rel.color : 'var(--text-secondary)' }}>
                    {rel.label}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>
                    {rel.desc}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Generated code preview */}
        <SectionLabel>Code Preview</SectionLabel>
        <div
          className="mx-4 mb-5 px-3.5 py-3 rounded-lg"
          style={{
            background:  '#0d0e10',
            border:      '1px solid var(--border-subtle)',
            fontFamily:  'monospace',
            fontSize:    11,
            lineHeight:  1.7,
            color:       '#9da1af',
          }}
        >
          {d.relationType === 'ref' && (
            <>
              <span style={{ color: '#4da6ff' }}>{d.fieldName ?? 'refId'}</span>
              <span>: &#123;</span><br />
              <span style={{ paddingLeft: 12 }}>type: </span>
              <span style={{ color: '#f25f5c' }}>Schema.Types.ObjectId</span>,<br />
              <span style={{ paddingLeft: 12 }}>ref: </span>
              <span style={{ color: '#3dd68c' }}>'{d.toCollection ?? 'Target'}'</span>,<br />
              <span>&#125;</span>
            </>
          )}
          {d.relationType === 'hasmany' && (
            <>
              <span style={{ color: '#4da6ff' }}>{d.fieldName ?? 'refs'}s</span>
              <span>: [&#123;</span><br />
              <span style={{ paddingLeft: 12 }}>type: </span>
              <span style={{ color: '#f25f5c' }}>Schema.Types.ObjectId</span>,<br />
              <span style={{ paddingLeft: 12 }}>ref: </span>
              <span style={{ color: '#3dd68c' }}>'{d.toCollection ?? 'Target'}'</span>,<br />
              <span>&#125;]</span>
            </>
          )}
          {d.relationType === 'embed' && (
            <>
              <span style={{ color: '#4da6ff' }}>{(d.toCollection ?? 'sub').toLowerCase()}</span>
              <span>: </span>
              <span style={{ color: '#f25f5c' }}>{d.toCollection ?? 'Sub'}Schema</span>
            </>
          )}
          {d.relationType === 'virtual' && (
            <>
              <span style={{ color: '#c084fc' }}>{'// virtual populate'}</span><br />
              <span style={{ color: '#4da6ff' }}>schema.virtual</span>
              <span>('{(d.toCollection ?? 'items').toLowerCase()}s', &#123;</span><br />
              <span style={{ paddingLeft: 12 }}>ref: </span>
              <span style={{ color: '#3dd68c' }}>'{d.toCollection ?? 'Target'}'</span>,<br />
              <span style={{ paddingLeft: 12 }}>localField: </span>
              <span style={{ color: '#f5a623' }}>'_id'</span>,<br />
              <span style={{ paddingLeft: 12 }}>foreignField: </span>
              <span style={{ color: '#f5a623' }}>'{d.fieldName ?? 'userId'}'</span>,<br />
              <span>&#125;)</span>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
