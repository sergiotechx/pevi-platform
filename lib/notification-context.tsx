"use client"

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react"
import { notifications as initialNotifications, type Notification } from "./mock-data"
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

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [allNotifications, setAllNotifications] = useState<Notification[]>(initialNotifications)

  const userNotifications = useMemo(
    () =>
      user
        ? allNotifications
            .filter((n) => n.userId === user.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [],
    [user, allNotifications],
  )

  const unreadCount = useMemo(() => userNotifications.filter((n) => !n.read).length, [userNotifications])

  const markAsRead = useCallback((id: string) => {
    setAllNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllAsRead = useCallback(() => {
    if (!user) return
    setAllNotifications((prev) => prev.map((n) => (n.userId === user.id ? { ...n, read: true } : n)))
  }, [user])

  const dismissNotification = useCallback((id: string) => {
    setAllNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider
      value={{ notifications: userNotifications, unreadCount, markAsRead, markAllAsRead, dismissNotification }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
