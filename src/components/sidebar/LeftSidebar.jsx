import { useState, useEffect } from 'react'
import { Plus, Database, ChevronRight, Search, MoreHorizontal, Trash2 } from 'lucide-react'

/**
 * LeftSidebar — collection list + add button.
 * Receives `collections` array and callbacks as props.
 * No business logic — purely layout/display.
 */
export default function LeftSidebar({
  collections = [],
  selectedId = null,
  onSelect,
  onAddCollection,
  onDeleteCollection,
}) {
  const [search, setSearch] = useState('')
  const [hovered, setHovered] = useState(null)
  const [menuOpenId, setMenuOpenId] = useState(null)

  /* Close dropdown when clicking anywhere outside */
  useEffect(() => {
    if (!menuOpenId) return
    const handleClickOutside = () => setMenuOpenId(null)
    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [menuOpenId])

  const filtered = collections.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <aside
      className="flex flex-col shrink-0 anim-slide-left"
      style={{
        width: 'var(--sidebar-w)',
        borderRight: '1px solid var(--border-base)',
        background: 'var(--bg-panel)',
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center px-4 shrink-0"
        style={{ height: 48, borderBottom: '1px solid var(--border-subtle)', gap: 10 }}
      >
        <span className="label-xs flex-1 text-[11px] font-bold tracking-wider">Collections</span>
        <button
          id="sidebar-add-btn"
          onClick={onAddCollection}
          title="Add collection"
          className="w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--bg-active)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          <Plus size={15} />
        </button>
      </div>

      {/* ── Search ── */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Filter collections…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 rounded-lg text-xs outline-none transition-all"
            style={{
              height: 32,
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--brand)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
          />
        </div>
      </div>

      {/* ── Collection list ── */}
      <div className="flex-1 overflow-y-auto py-2 px-1">
        {filtered.length === 0 ? (
          <EmptyState search={search} onAdd={onAddCollection} />
        ) : (
          filtered.map((col) => (
            <CollectionRow
              key={col.id}
              collection={col}
              isSelected={selectedId === col.id}
              isHovered={hovered === col.id}
              onHover={setHovered}
              onSelect={onSelect}
              isMenuOpen={menuOpenId === col.id}
              onToggleMenu={(id) => setMenuOpenId((prev) => (prev === id ? null : id))}
              onDelete={onDeleteCollection}
            />
          ))
        )}
      </div>

      {/* ── Footer add button ── */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={onAddCollection}
          className="w-full flex items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          style={{
            height: 36,
            padding: '0 12px',
            color: 'var(--text-secondary)',
            background: 'var(--bg-elevated)',
            border: '1px dashed var(--border-strong)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--brand-muted)'
            e.currentTarget.style.color = 'var(--text-primary)'
            e.currentTarget.style.borderColor = 'var(--brand)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--bg-elevated)'
            e.currentTarget.style.color = 'var(--text-secondary)'
            e.currentTarget.style.borderColor = 'var(--border-strong)'
          }}
        >
          <Plus size={14} />
          Add collection
        </button>
      </div>
    </aside>
  )
}

/* ─── Collection Row ────────────────────────────────────────── */
function CollectionRow({
  collection,
  isSelected,
  isHovered,
  onHover,
  onSelect,
  isMenuOpen,
  onToggleMenu,
  onDelete,
}) {
  const accentColor = collection.color ?? 'var(--brand)'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(collection.id)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect?.(collection.id)}
      onMouseEnter={() => onHover(collection.id)}
      onMouseLeave={() => onHover(null)}
      className="group relative flex items-center gap-2.5 cursor-pointer transition-all select-none"
      style={{
        margin: '2px 8px',
        padding: '0 12px',
        height: 38,
        borderRadius: 8,
        background: isSelected
          ? 'var(--brand-muted)'
          : isHovered || isMenuOpen
            ? 'var(--bg-hover)'
            : 'transparent',
        border: isSelected ? '1px solid rgba(124,106,247,0.3)' : '1px solid transparent',
        color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
      }}
    >
      {/* Color dot */}
      <span
        className="w-2 h-2 rounded-full shrink-0 shadow-sm"
        style={{ background: accentColor }}
      />

      {/* Icon */}
      <Database
        size={14}
        style={{ color: isSelected ? accentColor : 'var(--text-muted)', flexShrink: 0 }}
      />

      {/* Label */}
      <span className="flex-1 text-xs font-semibold truncate">{collection.label}</span>

      {/* Field count pill */}
      <span
        className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
        style={{
          background: isSelected ? 'rgba(124,106,247,0.2)' : 'rgba(255,255,255,0.06)',
          color: isSelected ? 'var(--brand)' : 'var(--text-secondary)',
        }}
      >
        {collection.fields?.length ?? 0}
      </span>

      {/* More button */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleMenu(collection.id)
          }}
          className={`w-6 h-6 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            isMenuOpen ? 'opacity-100 bg-[var(--bg-active)]' : 'opacity-0 group-hover:opacity-100'
          }`}
          style={{ color: isMenuOpen ? 'var(--text-primary)' : 'var(--text-muted)' }}
          title="Collection options"
        >
          <MoreHorizontal size={14} />
        </button>

        {/* Dropdown Popover Menu */}
        {isMenuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-full mt-1.5 py-1 w-38 rounded-lg shadow-2xl z-50 anim-fade"
            style={{
              background: '#1a1b1e',
              border: '1px solid var(--border-base)',
              boxShadow: '0 8px 28px rgba(0,0,0,0.7)',
            }}
          >
            <button
              onClick={() => {
                onDelete?.(collection.id)
                onToggleMenu(null)
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium cursor-pointer transition-colors text-left"
              style={{ color: 'var(--red)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(242,95,92,0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Trash2 size={13} />
              Delete Collection
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Empty State ───────────────────────────────────────────── */
function EmptyState({ search, onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 gap-3 text-center">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-base)' }}
      >
        <Database size={16} style={{ color: 'var(--text-muted)' }} />
      </div>
      {search ? (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No results for "{search}"</p>
      ) : (
        <>
          <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            No collections yet
          </p>
          <button
            onClick={onAdd}
            className="text-xs px-3 h-6 rounded transition-colors cursor-pointer"
            style={{
              background: 'var(--brand-muted)',
              color: 'var(--brand)',
              border: '1px solid rgba(124,106,247,0.2)',
            }}
          >
            Create first collection
          </button>
        </>
      )}
    </div>
  )
}
