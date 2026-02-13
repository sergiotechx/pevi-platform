"use client"

import Link from "next/link"
import type { ComponentProps } from "react"

/**
 * Link wrapper that suppresses hydration warnings caused by browser extensions
 * (like Keychainify) that modify anchor tag attributes.
 */
export function SafeLink({ children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link {...props} suppressHydrationWarning>
      {children}
    </Link>
  )
}
