"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, CheckCheck } from "lucide-react"
import { useNotifications } from "@/lib/notification-context"
import { useTranslation } from "@/lib/i18n-context"
import type { Notification } from "@/lib/mock-data"

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
  return date.toLocaleDateString()
}

export default function NotificationsPage() {
  const { t } = useTranslation()
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification } = useNotifications()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">{t("notifications.title")}</h1>
          <p className="text-sm text-base-content/60">
            {unreadCount > 0 ? t("notifications.unread", { count: unreadCount }) : t("notifications.caughtUp")}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            {t("notifications.markAllRead")}
          </Button>
        )}
      </div>
      <Card className="border-base-300/50">
        <CardHeader><CardTitle className="text-base">{t("notifications.title")}</CardTitle></CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-base-300 text-base-content/60">
                <Bell className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-medium text-base-content">{t("notifications.empty")}</p>
              <p className="mt-1 text-xs text-base-content/60">{t("notifications.caughtUp")}</p>
            </div>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="flex flex-col divide-y divide-base-300/50">
                {notifications.map((n: Notification) => (
                  <div
                    key={n.id}
                    className={`flex items-start justify-between gap-3 p-4 ${!n.read ? "bg-primary/5" : "opacity-80"}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${n.read ? "text-base-content/80" : "font-semibold text-base-content"}`}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-xs text-base-content/60">{n.message}</p>
                      <span className="mt-2 inline-block text-[11px] text-base-content/50">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {!n.read && (
                        <Button variant="ghost" size="sm" onClick={() => markAsRead(n.id)}>
                          {t("notifications.markRead")}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => dismissNotification(n.id)}>
                        {t("notifications.dismiss")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
