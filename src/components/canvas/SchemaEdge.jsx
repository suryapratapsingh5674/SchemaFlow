import { memo, useState } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
} from '@xyflow/react'

/* ─── Relation type config ──────────────────────────────────── */
const REL_TYPES = {
  ref:     { label: 'ref',     color: '#7c6af7', dash: undefined  },
  embed:   { label: 'embed',   color: '#3dd68c', dash: undefined  },
  virtual: { label: 'virtual', color: '#f5a623', dash: '6 3'      },
  hasmany: { label: 'has many',color: '#4da6ff', dash: '3 3'      },
}

const REL_DEFAULTS = REL_TYPES.ref

/* ═══════════════════════════════════════════════════════════════
   SCHEMA EDGE
════════════════════════════════════════════════════════════════ */
const SchemaEdge = memo(function SchemaEdge({
  id,
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data = {},
  selected,
  markerEnd,
}) {
  const [hovered, setHovered] = useState(false)
  const { deleteElements } = useReactFlow()

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 8,
  })

  const rel      = REL_TYPES[data.relationType] ?? REL_DEFAULTS
  const active   = selected || hovered
  const stroke   = active ? rel.color : 'rgba(255,255,255,0.12)'
  const width    = active ? 2 : 1.5

  /* tooltip text */
  const from = data.fromCollection ?? data.source ?? '?'
  const to   = data.toCollection   ?? data.target ?? '?'
  const tip  = `${from} → ${to}${data.fieldName ? ` (${data.fieldName})` : ''}`

  return (
    <>
      {/* ── Invisible wide hit area for hover / click ── */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth={20}
        stroke="transparent"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'pointer' }}
      />

      {/* ── Glow layer (active only) ── */}
      {active && (
        <BaseEdge
          path={edgePath}
          style={{
            stroke:       rel.color,
            strokeWidth:  6,
            strokeOpacity: 0.18,
            strokeDasharray: rel.dash,
            filter:       `drop-shadow(0 0 4px ${rel.color})`,
            transition:   'stroke-opacity 0.2s',
          }}
        />
      )}

      {/* ── Main edge line ── */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke,
          strokeWidth:    width,
          strokeDasharray: rel.dash,
          transition:     'stroke 0.18s, stroke-width 0.18s',
        }}
      />

      {/* ── Label + controls ── */}
      <EdgeLabelRenderer>
        <div
          style={{
            position:  'absolute',
            transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        4,
            }}
          >
            {/* Relation type pill */}
            <span
              title={tip}
              style={{
                display:       'flex',
                alignItems:    'center',
                gap:           4,
                padding:       '2px 7px',
                borderRadius:  10,
                fontSize:      10,
                fontWeight:    700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                userSelect:    'none',
                cursor:        'default',
                background:    active ? rel.color        : 'var(--bg-elevated)',
                color:         active ? '#fff'           : 'var(--text-muted)',
                border:        `1px solid ${active ? rel.color : 'var(--border-base)'}`,
                boxShadow:     active ? `0 0 8px ${rel.color}50` : 'none',
                transition:    'all 0.15s ease',
                whiteSpace:    'nowrap',
              }}
            >
              {/* Dot in relation color */}
              <span
                style={{
                  width:        5,
                  height:       5,
                  borderRadius: '50%',
                  background:   active ? '#fff' : rel.color,
                  flexShrink:   0,
                }}
              />
              {rel.label}
            </span>

            {/* Delete button — shows on hover/select */}
            {active && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteElements({ edges: [{ id }] })
                }}
                title="Delete relation"
                style={{
                  width:           18,
                  height:          18,
                  borderRadius:    '50%',
                  background:      'var(--bg-elevated)',
                  border:          '1px solid var(--border-base)',
                  color:           'var(--red)',
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  cursor:          'pointer',
                  fontSize:        12,
                  lineHeight:      1,
                  flexShrink:      0,
                  transition:      'background 0.12s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(242,95,92,0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
              >
                ×
              </button>
            )}
          </div>

          {/* Collection name tooltip strip (visible on hover) */}
          {hovered && (
            <div
              style={{
                marginTop:     4,
                padding:       '2px 8px',
                borderRadius:  6,
                background:    'var(--bg-elevated)',
                border:        '1px solid var(--border-base)',
                fontSize:      9,
                color:         'var(--text-muted)',
                textAlign:     'center',
                whiteSpace:    'nowrap',
                pointerEvents: 'none',
              }}
            >
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{from}</span>
              <span style={{ margin: '0 4px' }}>→</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{to}</span>
              {data.fieldName && (
                <span style={{ marginLeft: 4, color: rel.color }}>
                  via {data.fieldName}
                </span>
              )}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
})

export default SchemaEdge
