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
      className="flex items-center px-3 gap-2 shrink-0"
      style={{
        height: 'var(--navbar-h)',
        borderBottom: '1px solid var(--border-base)',
        background: 'var(--bg-panel)',
      }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-2 mr-2 select-none">
        <div
          className="w-6 h-6 rounded flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #7c6af7, #4da6ff)' }}
        >
          <GitBranch size={13} className="text-white" />
        </div>
        <span
          className="text-sm font-semibold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Schema<span style={{ color: 'var(--brand)' }}>Flow</span>
        </span>
      </div>

      {/* ── Divider ── */}
      <div className="w-px h-5 mx-1" style={{ background: 'var(--border-base)' }} />

      {/* ── Add Collection ── */}
      <button
        id="navbar-add-collection"
        onClick={onAddCollection}
        className="flex items-center gap-1.5 px-3 h-7 rounded text-xs font-medium cursor-pointer select-none"
        style={{
          background: flash ? '#5a52cc' : 'var(--brand)',
          color: '#fff',
          transition: 'background 0.15s ease, box-shadow 0.15s ease',
          boxShadow: flash ? '0 0 0 3px rgba(124,106,247,0.4)' : 'none',
        }}
        onMouseEnter={e => {
          if (!flash) e.currentTarget.style.background = 'var(--brand-dim)'
        }}
        onMouseLeave={e => {
          if (!flash) e.currentTarget.style.background = 'var(--brand)'
        }}
      >
        <Plus
          size={13}
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
        className="flex items-center gap-1.5 px-3 h-7 rounded text-xs font-medium cursor-pointer select-none"
        style={{
          background: 'var(--bg-elevated)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-base)',
          transition: 'all 0.1s ease',
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
        <Wand2 size={13} />
        Generate Models
      </button>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Live stats chip ── */}
      <div
        className="flex items-center gap-2 px-3 h-6 rounded-full select-none"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-base)',
        }}
      >
        <Layers size={11} style={{ color: 'var(--text-muted)' }} />
        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
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
        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>·</span>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            {edgeCount}
          </span>
          {' '}relation{edgeCount !== 1 ? 's' : ''}
        </span>
      </div>
    </header>
  )
}
