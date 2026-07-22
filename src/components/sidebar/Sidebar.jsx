import { useState } from 'react'
import { Database, Search, ChevronDown, ChevronRight, Link2 } from 'lucide-react'
import CollectionItem from './CollectionItem.jsx'
import { useSchemaStore } from '../../store/schemaStore.jsx'

export default function Sidebar() {
  const { state } = useSchemaStore()
  const { nodes, edges, sidebarCollapsed } = state
  const [search, setSearch] = useState('')
  const [collectionsOpen, setCollectionsOpen] = useState(true)
  const [relationsOpen, setRelationsOpen] = useState(true)

  const filteredNodes = nodes.filter((n) =>
    (n.data?.label ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  if (sidebarCollapsed) return null

  return (
    <aside
      className={[
        'w-64 shrink-0 flex flex-col',
        'bg-[var(--color-bg-surface)] border-r border-[var(--color-border)]',
        'animate-fade-slide-in',
      ].join(' ')}
    >
      {/* ── Search ── */}
      <div className="p-3 border-b border-[var(--color-border-subtle)]">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search collections…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={[
              'w-full pl-8 pr-3 py-1.5 text-xs rounded-[var(--radius-md)]',
              'bg-[var(--color-bg-base)] border border-[var(--color-border)]',
              'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]',
              'focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]/30',
              'transition-all duration-150',
            ].join(' ')}
          />
        </div>
      </div>

      {/* ── Scroll area ── */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">

        {/* Collections section */}
        <div>
          <button
            onClick={() => setCollectionsOpen((v) => !v)}
            className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer"
          >
            {collectionsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <Database size={11} />
            Collections
            <span className="ml-auto text-[10px] font-normal">{filteredNodes.length}</span>
          </button>

          {collectionsOpen && (
            <div className="mt-1 space-y-0.5 pl-1">
              {filteredNodes.length > 0 ? (
                filteredNodes.map((node) => (
                  <CollectionItem key={node.id} node={node} />
                ))
              ) : (
                <p className="px-3 py-3 text-xs text-[var(--color-text-muted)] italic text-center">
                  {search ? 'No matches' : 'No collections yet'}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="my-2 border-t border-[var(--color-border-subtle)]" />

        {/* Relations section */}
        <div>
          <button
            onClick={() => setRelationsOpen((v) => !v)}
            className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer"
          >
            {relationsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <Link2 size={11} />
            Relations
            <span className="ml-auto text-[10px] font-normal">{edges.length}</span>
          </button>

          {relationsOpen && (
            <div className="mt-1 space-y-0.5 pl-1">
              {edges.length > 0 ? (
                edges.map((edge) => {
                  const src = nodes.find((n) => n.id === edge.source)
                  const tgt = nodes.find((n) => n.id === edge.target)
                  return (
                    <div
                      key={edge.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-bg-overlay)] transition-colors cursor-pointer"
                    >
                      <span className="text-[var(--color-text-secondary)] font-medium truncate">
                        {src?.data?.label ?? '?'}
                      </span>
                      <span className="text-[var(--color-brand)] shrink-0">→</span>
                      <span className="text-[var(--color-text-secondary)] font-medium truncate">
                        {tgt?.data?.label ?? '?'}
                      </span>
                    </div>
                  )
                })
              ) : (
                <p className="px-3 py-3 text-xs text-[var(--color-text-muted)] italic text-center">
                  No relations yet
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer stats ── */}
      <div className="p-3 border-t border-[var(--color-border-subtle)]">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Collections', value: nodes.length },
            { label: 'Relations', value: edges.length },
            {
              label: 'Fields',
              value: nodes.reduce((acc, n) => acc + (n.data?.fields?.length ?? 0), 0),
            },
            {
              label: 'Req\'d Fields',
              value: nodes.reduce(
                (acc, n) =>
                  acc + (n.data?.fields?.filter((f) => f.required)?.length ?? 0),
                0,
              ),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[var(--color-bg-base)] rounded-[var(--radius-md)] p-2 text-center"
            >
              <div className="text-lg font-bold text-[var(--color-brand)]">{stat.value}</div>
              <div className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wide mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
