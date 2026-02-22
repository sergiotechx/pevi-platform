"use client"

import { useTranslation } from "@/lib/i18n-context"

const colors: Record<string, string> = {
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-emerald-500/5",
  completed: "border-primary/30 bg-primary/10 text-primary shadow-primary/5",
  draft: "border-base-content/20 bg-base-300/30 text-base-content/60",
  published: "border-sky-500/30 bg-sky-500/10 text-sky-400 shadow-sky-500/5",
  paused: "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-amber-500/5",
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-amber-500/5",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-emerald-500/5",
  rejected: "border-red-500/30 bg-red-500/10 text-red-400 shadow-red-500/5",
  submitted: "border-primary/30 bg-primary/10 text-primary shadow-primary/5",
  in_progress: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-cyan-500/5",
  verified: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-emerald-500/5",
  disputed: "border-red-500/30 bg-red-500/10 text-red-400 shadow-red-500/5",
}

const dotColors: Record<string, string> = {
  active: "bg-emerald-400",
  completed: "bg-primary",
  draft: "bg-base-content/40",
  published: "bg-sky-400",
  paused: "bg-amber-400",
  pending: "bg-amber-400 animate-pulse",
  approved: "bg-emerald-400",
  rejected: "bg-red-400",
  submitted: "bg-primary animate-pulse",
  in_progress: "bg-cyan-400 animate-pulse",
  verified: "bg-emerald-400",
  disputed: "bg-red-400 animate-pulse",
}

const labels: Record<string, string> = {
  active: "Active", completed: "Completed", draft: "Draft", published: "Published",
  paused: "Paused", pending: "Pending", approved: "Approved", rejected: "Rejected",
  submitted: "Submitted", in_progress: "In Progress", verified: "Verified", disputed: "Disputed",
}

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-sm ${colors[status] || colors.pending}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotColors[status] || dotColors.pending}`} />
      {t(`status.${status}`) !== `status.${status}` ? t(`status.${status}`) : labels[status] || status}
    </span>
  )
}
