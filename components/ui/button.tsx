import * as React from 'react'
import { cn } from '@/lib/utils'

const variantMap = {
  default: 'btn-primary',
  destructive: 'btn-error',
  outline: 'btn-outline',
  secondary: 'btn-neutral',
  ghost: 'btn-ghost',
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
        className={cn('btn [&>a]:flex [&>a]:items-center [&>a]:gap-1', variantMap[variant], sizeMap[size], className)}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button }
