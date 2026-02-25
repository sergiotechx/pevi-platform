"use client"

import { createContext, useContext, useMemo, useCallback, type ReactNode } from "react"
import useSWR from "swr"
import { type Notification } from "./mock-data"
import { useAuth } from "./auth-context"

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  dismissNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error("useNotifications must be inside NotificationProvider")
  return ctx
}

// Fetcher that prevents caching
const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then(res => res.json())

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  // Use SWR for automatic polling and window-focus revalidation
  const { data, mutate } = useSWR(
    user?.id ? `/api/notifications?user_id=${user.id}` : null,
    fetcher,
    {
      refreshInterval: 5000, // Poll every 5 seconds
      revalidateOnFocus: true
    }
  )

  const notifications = useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    return data.map((n: any) => ({
      id: n.notification_id.toString(),
      userId: n.user_id.toString(),
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      metadata: n.metadata,
      createdAt: n.createdAt,
      actionUrl: n.actionUrl,
      actionLabel: n.actionLabel
    }))
  }, [data])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic UI update
    mutate(
      data?.map((n: any) => n.notification_id.toString() === id ? { ...n, read: true } : n),
      false
    )

    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      })
      mutate() // Revalidate with server
    } catch (err) {
      console.error("Error marking as read:", err)
      mutate() // Rollback on error
    }
  }, [data, mutate])

  const markAllAsRead = useCallback(async () => {
    if (!user || !data) return

    // Optimistic UI update
    mutate(data.map((n: any) => ({ ...n, read: true })), false)

    try {
      const unread = data.filter((n: any) => !n.read)
      await Promise.all(
        unread.map((n: any) =>
          fetch(`/api/notifications/${n.notification_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ read: true }),
          })
        )
      )
      mutate() // Revalidate with server
    } catch (err) {
      console.error("Error marking all as read:", err)
      mutate() // Rollback on error
    }
  }, [user, data, mutate])

  const dismissNotification = useCallback(async (id: string) => {
    // Optimistic UI update
    mutate(
      data?.filter((n: any) => n.notification_id.toString() !== id),
      false
    )

    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" })
      mutate() // Revalidate with server
    } catch (err) {
      console.error("Error dismissing notification:", err)
      mutate() // Rollback on error
    }
  }, [data, mutate])

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
