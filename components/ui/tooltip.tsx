'use client'

import * as React from 'react'

function TooltipProvider({ children }: { children: React.ReactNode; delayDuration?: number }) {
  return <>{children}</>
}

function Tooltip({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

const TooltipTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }>(
  ({ children, asChild, ...props }, ref) => {
    if (asChild) {
      return <>{children}</>
    }
    return <div ref={ref} {...props}>{children}</div>
  },
)
TooltipTrigger.displayName = 'TooltipTrigger'

const TooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { side?: string; align?: string; hidden?: boolean; sideOffset?: number }>(
  ({ className, hidden, children, ...props }, ref) => {
    if (hidden) return null
    return null
  },
)
TooltipContent.displayName = 'TooltipContent'

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
