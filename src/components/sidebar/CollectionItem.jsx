import { memo } from 'react'
import { Database } from 'lucide-react'
import { useSchemaStore } from '../../store/schemaStore.jsx'

const CollectionItem = memo(function CollectionItem({ node }) {
  const { state, dispatch } = useSchemaStore()
  const isSelected = state.selectedNodeId === node.id

  return (
    <button
      onClick={() => dispatch({ type: 'SELECT_NODE', payload: node.id })}
      className={[
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-left',
        'transition-all duration-150 group cursor-pointer',
        isSelected
          ? 'bg-[var(--color-brand)]/10 border border-[var(--color-brand)]/30'
          : 'border border-transparent hover:bg-[var(--color-bg-overlay)]',
      ].join(' ')}
    >
      {/* Color indicator */}
      <span
        className="w-2 h-2 rounded-full shrink-0 ring-2 ring-black/20"
        style={{ background: node.data?.color ?? '#6c63ff' }}
      />

      {/* Name */}
      <span
        className={[
          'flex-1 text-sm font-medium truncate',
          isSelected ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]',
        ].join(' ')}
      >
        {node.data?.label ?? 'Collection'}
      </span>

      {/* Field count */}
      <span className="text-[10px] text-[var(--color-text-muted)] shrink-0">
        {node.data?.fields?.length ?? 0}
      </span>
    </button>
  )
})

export default CollectionItem
