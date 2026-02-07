'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface PopoverContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const PopoverContext = React.createContext<PopoverContextType>({ open: false, setOpen: () => {} })

function Popover({ open: controlledOpen, onOpenChange, children }: { open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = React.useCallback(
    (v: boolean) => {
      if (onOpenChange) onOpenChange(v)
      else setInternalOpen(v)
    },
    [onOpenChange],
  )

  React.useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-popover]')) {
        setOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, setOpen])

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block" data-popover>
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(
  ({ children, asChild, onClick, ...props }, ref) => {
    const { open, setOpen } = React.useContext(PopoverContext)

    if (asChild) {
      return (
        <span onClick={(e) => { setOpen(!open); }} className="cursor-pointer">
          {children}
        </span>
      )
    }

    return (
      <button
        ref={ref}
        onClick={(e) => { setOpen(!open); onClick?.(e) }}
        {...props}
      >
        {children}
      </button>
    )
  },
)
PopoverTrigger.displayName = 'PopoverTrigger'

const PopoverContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { align?: 'start' | 'center' | 'end'; sideOffset?: number }>(
  ({ className, align = 'center', sideOffset = 4, children, ...props }, ref) => {
    const { open } = React.useContext(PopoverContext)
    if (!open) return null

    return (
      <div
        ref={ref}
        className={cn(
          'absolute z-[100] rounded-lg border border-base-300 bg-base-200 p-4 shadow-lg',
          align === 'end' ? 'right-0' : align === 'start' ? 'left-0' : 'left-1/2 -translate-x-1/2',
          className,
        )}
        style={{ top: `calc(100% + ${sideOffset}px)` }}
        data-popover
        {...props}
      >
        {children}
      </div>
    )
  },
)
PopoverContent.displayName = 'PopoverContent'

export { Popover, PopoverTrigger, PopoverContent }
