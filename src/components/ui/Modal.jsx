import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

export const Modal = ({ open, onClose, title, children, footer, size = 'md' }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    if (open) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={cn(
              'relative w-full overflow-hidden rounded-t-3xl bg-white shadow-lift sm:rounded-2xl',
              widths[size],
            )}
          >
            {title && (
              <div className="flex items-center justify-between border-b border-sand-200 px-5 py-4">
                <h3 className="text-lg font-semibold text-ink">{title}</h3>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-ink-muted transition hover:bg-sand-200 hover:text-ink"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>
            {footer && <div className="border-t border-sand-200 px-5 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
