import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import {
  Database,
  Key,
  Hash,
  Type,
  ToggleLeft,
  Calendar,
  Link2,
  List,
  Map,
  Binary,
  Rows3,
  CircleDot,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   TYPE REGISTRY
   Each Mongoose type gets a display label, color, and icon.
════════════════════════════════════════════════════════════════ */
const TYPES = {
  ObjectId: { label: 'ObjectId', color: '#f25f5c', icon: Key },
  String: { label: 'String', color: '#4da6ff', icon: Type },
  Number: { label: 'Number', color: '#3dd68c', icon: Hash },
  Boolean: { label: 'Boolean', color: '#f5a623', icon: ToggleLeft },
  Date: { label: 'Date', color: '#c084fc', icon: Calendar },
  Array: { label: 'Array', color: '#7c6af7', icon: List },
  Mixed: { label: 'Mixed', color: '#8b8d96', icon: CircleDot },
  Map: { label: 'Map', color: '#fb923c', icon: Map },
  Buffer: { label: 'Buffer', color: '#2dd4bf', icon: Binary },
  Decimal128: { label: 'Decimal128', color: '#a3e635', icon: Hash },
}

/* ═══════════════════════════════════════════════════════════════
   SHARED HANDLE STYLE
════════════════════════════════════════════════════════════════ */
const handleBase = {
  width: 10,
  height: 10,
  borderRadius: '50%',
  border: '2px solid #1a1b1e',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
}

/* ═══════════════════════════════════════════════════════════════
   FIELD ROW
   Renders one field with name, type icon, and type badge.
   Source / Target handles appear on hover.
════════════════════════════════════════════════════════════════ */
const FieldRow = memo(function FieldRow({ field, index, accent }) {
  const typeMeta = TYPES[field.type] ?? { label: field.type ?? '?', color: '#8b8d96', icon: CircleDot }
  const TypeIcon = typeMeta.icon
  const fid = field.id ?? `f${index}`
  const isKey = field.isId

  return (
    <div
      className="group relative"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '0 16px',
        height: 36,
        borderTop: '1px solid rgba(255,255,255,0.04)',
        transition: 'background 0.1s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {/* ── LEFT TARGET HANDLE (appears on hover) ── */}
      <Handle
        type="target"
        position={Position.Left}
        id={`${fid}-t`}
        style={{
          ...handleBase,
          left: -6,
          top: '50%',
          transform: 'translateY(-50%)',
          background: typeMeta.color,
          opacity: 0,
          boxShadow: `0 0 6px ${typeMeta.color}80`,
        }}
        className="!opacity-0 group-hover:!opacity-100 hover:!scale-125"
      />

      {/* ── PRIMARY KEY ICON ── */}
      {isKey ? (
        <Key
          size={13}
          style={{ color: '#f5a623', flexShrink: 0, filter: 'drop-shadow(0 0 4px #f5a62380)' }}
        />
      ) : (
        /* Indented spacer so non-key fields align */
        <span style={{ width: 13, flexShrink: 0 }} />
      )}

      {/* ── FIELD NAME ── */}
      <span
        style={{
          flex: 1,
          fontSize: 12.5,
          fontWeight: isKey ? 600 : 400,
          color: isKey ? '#e8e9ec' : '#9da1af',
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          letterSpacing: '-0.02em',
        }}
      >
        {field.name || 'unnamed'}
      </span>

      {/* ── REF ARROW (for ObjectId references) ── */}
      {field.ref && (
        <Link2
          size={11}
          style={{ color: typeMeta.color, flexShrink: 0, opacity: 0.7 }}
          title={`References ${field.ref}`}
        />
      )}

      {/* ── TYPE CHIP ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4.5,
          padding: '3px 8px',
          borderRadius: 5,
          background: `${typeMeta.color}18`,
          border: `1px solid ${typeMeta.color}28`,
          flexShrink: 0,
        }}
      >
        <TypeIcon size={10} style={{ color: typeMeta.color }} />
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            color: typeMeta.color,
            letterSpacing: '0.02em',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {typeMeta.label}
        </span>
      </div>

      {/* ── REQUIRED DOT ── */}
      <span
        style={{
          width: 5.5,
          height: 5.5,
          borderRadius: '50%',
          flexShrink: 0,
          background: field.required ? '#3dd68c' : 'rgba(255,255,255,0.1)',
          boxShadow: field.required ? '0 0 4px #3dd68c80' : 'none',
        }}
        title={field.required ? 'Required field' : 'Optional field'}
      />

      {/* ── RIGHT SOURCE HANDLE (appears on hover) ── */}
      <Handle
        type="source"
        position={Position.Right}
        id={`${fid}-s`}
        style={{
          ...handleBase,
          right: -6,
          top: '50%',
          transform: 'translateY(-50%)',
          background: typeMeta.color,
          opacity: 0,
          boxShadow: `0 0 6px ${typeMeta.color}80`,
        }}
        className="!opacity-0 group-hover:!opacity-100 hover:!scale-125"
      />
    </div>
  )
})

/* ═══════════════════════════════════════════════════════════════
   COLUMN HEADER ROW
   Shows "Field" and "Type" column labels like a DB table.
════════════════════════════════════════════════════════════════ */
function ColumnHeaderRow() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px 0 38px',
        height: 26,
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <span
        style={{
          flex: 1,
          fontSize: 9.5,
          fontWeight: 700,
          color: '#50535e',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        Field
      </span>
      <span
        style={{
          fontSize: 9.5,
          fontWeight: 700,
          color: '#50535e',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginRight: 16,
        }}
      >
        Type
      </span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SCHEMA NODE  —  the main exported component
════════════════════════════════════════════════════════════════ */
const SchemaNode = memo(function SchemaNode({ data, selected }) {
  const accent = data.color ?? '#7c6af7'
  const fields = data.fields ?? []

  return (
    <div
      style={{
        /* Sizing */
        minWidth: 260,
        width: 280,

        /* Shape */
        borderRadius: 12,
        overflow: 'hidden',

        /* Colors */
        background: '#131416',
        border: `1px solid ${selected ? accent : 'rgba(255,255,255,0.08)'}`,

        /* Shadow */
        boxShadow: selected
          ? `0 0 0 2px ${accent}40, 0 12px 32px rgba(0,0,0,0.6)`
          : '0 4px 24px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.4)',

        /* Transition */
        transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
      }}
    >
      {/* ══ TOP ACCENT BAR ══════════════════════════════════════ */}
      <div
        style={{
          height: 3.5,
          background: `linear-gradient(90deg, ${accent}, ${accent}88)`,
        }}
      />

      {/* ══ HEADER ═════════════════════════════════════════════ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          background: `${accent}0e`,
          borderBottom: `1px solid ${accent}22`,
          position: 'relative',
        }}
      >
        {/* Node-level target handle */}
        <Handle
          type="target"
          position={Position.Left}
          id="node-t"
          style={{
            ...handleBase,
            left: -6,
            top: '50%',
            transform: 'translateY(-50%)',
            background: accent,
            boxShadow: `0 0 8px ${accent}80`,
          }}
        />

        {/* Database icon with accent background */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `${accent}22`,
            border: `1px solid ${accent}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Database size={16} style={{ color: accent }} />
        </div>

        {/* Collection name */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#e8e9ec',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              letterSpacing: '-0.01em',
            }}
          >
            {data.label ?? 'Collection'}
          </div>
          <div
            style={{
              fontSize: 11,
              color: '#50535e',
              marginTop: 2,
            }}
          >
            {fields.length} {fields.length === 1 ? 'field' : 'fields'}
          </div>
        </div>

        {/* Node-level source handle */}
        <Handle
          type="source"
          position={Position.Right}
          id="node-s"
          style={{
            ...handleBase,
            right: -6,
            top: '50%',
            transform: 'translateY(-50%)',
            background: accent,
            boxShadow: `0 0 8px ${accent}80`,
          }}
        />
      </div>

      {/* ══ COLUMN LABELS ══════════════════════════════════════ */}
      {fields.length > 0 && <ColumnHeaderRow />}

      {/* ══ FIELD ROWS ═════════════════════════════════════════ */}
      {fields.length > 0 ? (
        fields.map((f, i) => (
          <FieldRow key={f.id ?? i} field={f} index={i} accent={accent} />
        ))
      ) : (
        <div
          style={{
            padding: '20px 16px',
            textAlign: 'center',
            fontSize: 12,
            color: '#50535e',
            fontStyle: 'italic',
          }}
        >
          No fields defined
        </div>
      )}

      {/* ══ FOOTER ═════════════════════════════════════════════ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          background: 'rgba(0,0,0,0.2)',
        }}
      >
        <span style={{ fontSize: 9.5, color: '#3a3c44', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          MongoDB Collection
        </span>
        <span
          style={{
            fontSize: 9.5,
            color: accent,
            fontWeight: 600,
            opacity: 0.7,
            fontFamily: 'monospace',
          }}
        >
          {data.label}Schema
        </span>
      </div>
    </div>
  )
})

export default SchemaNode
