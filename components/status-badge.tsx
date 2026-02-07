"use client"

import { useTranslation } from "@/lib/i18n-context"

const colors: Record<string, string> = {
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  completed: "border-primary/30 bg-primary/10 text-primary",
  draft: "border-base-content/20 bg-base-300/50 text-base-content/60",
  published: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  paused: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  rejected: "border-red-500/30 bg-red-500/10 text-red-400",
  submitted: "border-primary/30 bg-primary/10 text-primary",
  in_progress: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  verified: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  disputed: "border-red-500/30 bg-red-500/10 text-red-400",
}

const labels: Record<string, string> = {
  active: "Active", completed: "Completed", draft: "Draft", published: "Published",
  paused: "Paused", pending: "Pending", approved: "Approved", rejected: "Rejected",
  submitted: "Submitted", in_progress: "In Progress", verified: "Verified", disputed: "Disputed",
}

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[status] || colors.pending}`}>
      {t(`status.${status}`) !== `status.${status}` ? t(`status.${status}`) : labels[status] || status}
    </span>
  )
}
