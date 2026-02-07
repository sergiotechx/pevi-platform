'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  return <>{children}</>
}

function SheetTrigger({ children, ...props }: React.HTMLAttributes<HTMLButtonElement>) {
  return <button {...props}>{children}</button>
}

function SheetClose({ children, ...props }: React.HTMLAttributes<HTMLButtonElement>) {
  return <button {...props}>{children}</button>
}

function SheetPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function SheetOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('fixed inset-0 z-50 bg-black/80', className)} {...props} />
}

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'left' | 'right' | 'top' | 'bottom'
  'data-sidebar'?: string
  'data-mobile'?: string
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = 'right', className, children, ...props }, ref) => {
    const parentSheet = props as any
    return (
      <>
        <div className="fixed inset-0 z-50 bg-black/80" />
        <div
          ref={ref}
          className={cn(
            'fixed z-50 bg-base-100 p-6 shadow-lg',
            side === 'left' && 'inset-y-0 left-0 h-full w-3/4 border-r border-base-300 sm:max-w-sm',
            side === 'right' && 'inset-y-0 right-0 h-full w-3/4 border-l border-base-300 sm:max-w-sm',
            side === 'top' && 'inset-x-0 top-0 border-b border-base-300',
            side === 'bottom' && 'inset-x-0 bottom-0 border-t border-base-300',
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </>
    )
  },
)
SheetContent.displayName = 'SheetContent'

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
}

function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold', className)} {...props} />
}

function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-base-content/60', className)} {...props} />
}

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
