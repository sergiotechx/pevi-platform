import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function StatCard({ title, value, icon: Icon, sub }: { title: string; value: string | number; icon: LucideIcon; sub?: string }) {
  return (
    <Card className="border-base-300/50 bg-base-200/80">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-base-content/60">{title}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {sub && <p className="text-xs text-base-content/60">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
