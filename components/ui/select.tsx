'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

interface SelectContextType {
  value: string
  onValueChange: (value: string) => void
}

const SelectContext = React.createContext<SelectContextType>({ value: '', onValueChange: () => {} })

function Select({ value, defaultValue = '', onValueChange, children }: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const currentValue = value ?? internalValue
  const handleChange = React.useCallback(
    (v: string) => {
      if (onValueChange) onValueChange(v)
      else setInternalValue(v)
    },
    [onValueChange],
  )

  return (
    <SelectContext.Provider value={{ value: currentValue, onValueChange: handleChange }}>
      {children}
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { children?: React.ReactNode }>(
  ({ className, children, ...props }, ref) => {
    const { value, onValueChange } = React.useContext(SelectContext)
    return (
      <select
        ref={ref}
        className={cn('select select-bordered w-full', className)}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        {...props}
      >
        {children}
      </select>
    )
  },
)
SelectTrigger.displayName = 'SelectTrigger'

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(SelectContext)
  if (!value && placeholder) {
    return <option value="" disabled>{placeholder}</option>
  }
  return null
}

function SelectContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <option value={value}>{children}</option>
}

function SelectGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function SelectLabel({ children }: { children: React.ReactNode }) {
  return <option disabled>{children}</option>
}

function SelectSeparator() {
  return null
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
}
