import { forwardRef } from 'react'

const variants = {
  primary: {
    base: 'bg-[var(--color-brand)] hover:bg-[var(--color-brand-dim)] text-white shadow-[0_0_0_0_var(--color-brand-glow)] hover:shadow-[var(--shadow-glow)]',
  },
  ghost: {
    base: 'bg-transparent hover:bg-[var(--color-bg-overlay)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
  },
  outline: {
    base: 'bg-transparent border border-[var(--color-border)] hover:border-[var(--color-brand)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
  },
  danger: {
    base: 'bg-[var(--color-accent-red)]/10 hover:bg-[var(--color-accent-red)]/20 text-[var(--color-accent-red)] border border-[var(--color-accent-red)]/30',
  },
}

const sizes = {
  xs: 'px-2 py-1 text-xs gap-1',
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
}

const Button = forwardRef(function Button(
  {
    children,
    variant = 'ghost',
    size = 'sm',
    icon,
    iconRight,
    className = '',
    disabled = false,
    ...props
  },
  ref,
) {
  const variantClass = variants[variant]?.base ?? variants.ghost.base
  const sizeClass = sizes[size] ?? sizes.sm

  return (
    <button
      ref={ref}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center rounded-[var(--radius-md)]',
        'font-medium cursor-pointer select-none',
        'transition-all duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variantClass,
        sizeClass,
        className,
      ].join(' ')}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  )
})

export default Button
