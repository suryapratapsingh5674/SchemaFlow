import { useState, useEffect } from 'react'
import { Plus, Wand2, GitBranch, Layers } from 'lucide-react'

export default function Navbar({
  onAddCollection,
  onGenerateModels,
  nodeCount = 0,
  edgeCount = 0,
}) {
  /* ── Flash the Add button briefly after each new node ── */
  const [flash, setFlash] = useState(false)

  /* Track node count changes to trigger the flash */
  const [prevCount, setPrevCount] = useState(nodeCount)
  useEffect(() => {
    if (nodeCount > prevCount) {
      setFlash(true)
      const t = setTimeout(() => setFlash(false), 600)
      setPrevCount(nodeCount)
      return () => clearTimeout(t)
    }
    setPrevCount(nodeCount)
  }, [nodeCount]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <header
      className="flex items-center shrink-0"
      style={{
        height: 'var(--navbar-h)',
        padding: '0 24px',
        gap: 12,
        borderBottom: '1px solid var(--border-base)',
        background: 'var(--bg-panel)',
      }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 select-none" style={{ marginRight: 12 }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-md"
          style={{ background: 'linear-gradient(135deg, #7c6af7, #4da6ff)' }}
        >
          <GitBranch size={16} className="text-white" />
        </div>
        <span
          className="text-base font-bold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Schema<span style={{ color: 'var(--brand)' }}>Flow</span>
        </span>
      </div>

      {/* ── Divider ── */}
      <div style={{ width: 1, height: 24, margin: '0 8px', background: 'var(--border-base)' }} />

      {/* ── Add Collection ── */}
      <button
        id="navbar-add-collection"
        onClick={onAddCollection}
        className="flex items-center gap-2.5 cursor-pointer select-none"
        style={{
          height: 38,
          padding: '0 18px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          background: flash ? '#5a52cc' : 'var(--brand)',
          color: '#fff',
          border: 'none',
          transition: 'background 0.15s ease, box-shadow 0.15s ease',
          boxShadow: flash ? '0 0 0 3px rgba(124,106,247,0.4)' : '0 1px 3px rgba(0,0,0,0.3)',
        }}
        onMouseEnter={e => {
          if (!flash) e.currentTarget.style.background = 'var(--brand-dim)'
        }}
        onMouseLeave={e => {
          if (!flash) e.currentTarget.style.background = 'var(--brand)'
        }}
      >
        <Plus
          size={16}
          strokeWidth={2.5}
          style={{
            transition: 'transform 0.15s ease',
            transform: flash ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        />
        Add Collection
      </button>

      {/* ── Generate Models ── */}
      <button
        id="navbar-generate-models"
        onClick={onGenerateModels}
        className="flex items-center gap-2.5 cursor-pointer select-none"
        style={{
          height: 38,
          padding: '0 18px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          background: 'var(--bg-elevated)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-base)',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--bg-hover)'
          e.currentTarget.style.color = 'var(--text-primary)'
          e.currentTarget.style.borderColor = 'var(--border-strong)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'var(--bg-elevated)'
          e.currentTarget.style.color = 'var(--text-secondary)'
          e.currentTarget.style.borderColor = 'var(--border-base)'
        }}
      >
        <Wand2 size={15} />
        Generate Models
      </button>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Live stats chip ── */}
      <div
        className="flex items-center gap-3.5 select-none"
        style={{
          height: 34,
          padding: '0 18px',
          borderRadius: 9999,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-base)',
        }}
      >
        <Layers size={14} style={{ color: 'var(--text-muted)' }} />
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          <span
            style={{
              fontWeight: 700,
              color: 'var(--text-primary)',
              transition: 'color 0.2s',
            }}
          >
            {nodeCount}
          </span>
          {' '}collection{nodeCount !== 1 ? 's' : ''}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>·</span>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            {edgeCount}
          </span>
          {' '}relation{edgeCount !== 1 ? 's' : ''}
        </span>
      </div>
    </header>
  )
}
