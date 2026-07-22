import { useState } from 'react'

/**
 * Tooltip — lightweight hover tooltip with directional placement.
 */
export default function Tooltip({ children, text, placement = 'top', delay = 300 }) {
  const [visible, setVisible] = useState(false)
  const [timer, setTimer] = useState(null)

  const show = () => {
    const t = setTimeout(() => setVisible(true), delay)
    setTimer(t)
  }
  const hide = () => {
    clearTimeout(timer)
    setVisible(false)
  }

  const placementClasses = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <span className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && text && (
        <span
          role="tooltip"
          className={[
            'pointer-events-none absolute z-50 whitespace-nowrap',
            'rounded-[var(--radius-sm)] px-2 py-1',
            'bg-[var(--color-bg-overlay)] border border-[var(--color-border)]',
            'text-[11px] font-medium text-[var(--color-text-primary)]',
            'shadow-[var(--shadow-panel)] animate-fade-slide-in',
            placementClasses[placement] ?? placementClasses.top,
          ].join(' ')}
        >
          {text}
        </span>
      )}
    </span>
  )
}
