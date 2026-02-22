import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function StatCard({ title, value, icon: Icon, sub }: { title: string; value: string | number; icon: LucideIcon; sub?: string }) {
  return (
    <Card className="group relative overflow-hidden border-base-300/50 bg-base-200 hover:-translate-y-0.5">
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-brand-gradient opacity-60 transition-opacity group-hover:opacity-100" />
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-gradient-subtle transition-shadow group-hover:glow-primary-sm">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-base-content/50">{title}</p>
          <p className="font-heading text-3xl font-bold tracking-tight">{value}</p>
          {sub && <p className="text-xs text-base-content/50">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
