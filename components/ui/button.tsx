import * as React from 'react'
import { cn } from '@/lib/utils'

const variantMap = {
  default: 'bg-brand-gradient text-white border-0 shadow-md hover:shadow-lg hover:brightness-110',
  destructive: 'btn-error',
  outline: 'btn-outline border-base-300/50 hover:border-primary/50 hover:bg-primary/5',
  secondary: 'btn-neutral',
  ghost: 'btn-ghost hover:bg-base-300/40',
  link: 'btn-link',
} as const

const sizeMap = {
  default: '',
  sm: 'btn-sm',
  lg: 'btn-lg',
  icon: 'btn-square btn-sm',
} as const

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantMap
  size?: keyof typeof sizeMap
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild, ...props }, ref) => {
    return (
      <button
        className={cn('btn [&>a]:flex [&>a]:items-center [&>a]:gap-1 transition-all duration-200', variantMap[variant], sizeMap[size], className)}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button }
