"use client"

import { useState } from "react"
import { Bell, Check, CheckCheck, X, ExternalLink, Megaphone, Target, ShieldCheck, ClipboardCheck, Settings, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotifications } from "@/lib/notification-context"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n-context"
import type { Notification } from "@/lib/mock-data"

const typeIcons: Record<string, typeof Bell> = {
  milestone: Target,
  campaign: Megaphone,
  evaluation: ClipboardCheck,
  verification: ShieldCheck,
  system: Settings,
  wallet: Wallet,
}

const typeColors: Record<string, string> = {
  milestone: "text-emerald-400",
  campaign: "text-primary",
  evaluation: "text-amber-400",
  verification: "text-cyan-400",
  system: "text-base-content/60",
  wallet: "text-accent",
}

function formatRelativeTime(dateStr: string) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function NotificationItem({
  notification,
  onRead,
  onDismiss,
  onAction,
}: {
  notification: Notification
  onRead: () => void
  onDismiss: () => void
  onAction: () => void
}) {
  const Icon = typeIcons[notification.type] || Bell
  const color = typeColors[notification.type] || "text-base-content/60"

  return (
    <div
      className={`group relative flex gap-3 border-b border-base-300/50 p-4 transition-colors ${
        notification.read ? "bg-transparent opacity-70" : "bg-primary/5"
      }`}
    >
      {!notification.read && (
        <span className="absolute left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" />
      )}
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-base-300 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-tight ${notification.read ? "text-base-content/80" : "font-semibold text-base-content"}`}>
            {notification.title}
          </p>
          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            {!notification.read && (
              <button
                onClick={(e) => { e.stopPropagation(); onRead() }}
                className="rounded p-1 text-base-content/60 hover:bg-base-300 hover:text-base-content"
                title="Mark as read"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss() }}
              className="rounded p-1 text-base-content/60 hover:bg-base-300 hover:text-error"
              title="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-base-content/60 line-clamp-2">
          {notification.message}
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[11px] text-base-content/50">{formatRelativeTime(notification.createdAt)}</span>
          {notification.actionUrl && notification.actionLabel && (
            <button
              onClick={(e) => { e.stopPropagation(); if (!notification.read) onRead(); onAction() }}
              className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
            >
              {notification.actionLabel}
              <ExternalLink className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function NotificationInbox() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification } = useNotifications()
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { t } = useTranslation()

  const handleAction = (url: string) => {
    setOpen(false)
    router.push(url)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 text-base-content/60 hover:text-base-content">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-content">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          <span className="sr-only">{t("notifications.unread", { count: unreadCount })}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0 border-base-300/50" sideOffset={8}>
        <div className="flex items-center justify-between border-b border-base-300/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-base-content">{t("notifications.title")}</h3>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/15 px-1.5 text-[11px] font-semibold text-primary">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1 text-xs text-base-content/60 transition-colors hover:text-primary"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {t("notifications.markAllRead")}
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-base-300 text-base-content/60">
              <Bell className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-medium text-base-content">{t("notifications.empty")}</p>
            <p className="mt-1 text-xs text-base-content/60">{t("notifications.caughtUp")}</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            {notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={() => markAsRead(n.id)}
                onDismiss={() => dismissNotification(n.id)}
                onAction={() => n.actionUrl && handleAction(n.actionUrl)}
              />
            ))}
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}
