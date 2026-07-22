/**
 * Badge — small coloured chip for labels, types, statuses, etc.
 */
export default function Badge({ children, color, className = '' }) {
  const style = color
    ? { backgroundColor: `${color}20`, color, borderColor: `${color}40` }
    : {}

  return (
    <span
      style={style}
      className={[
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--radius-sm)]',
        'text-[10px] font-bold tracking-wide uppercase border',
        !color && 'bg-[var(--color-bg-overlay)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
