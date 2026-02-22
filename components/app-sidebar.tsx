"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard, Megaphone, Users, FileCheck, ShieldCheck, Target, Upload,
  ClipboardCheck, LogOut, UserCircle, PlusCircle, UserCog, Compass, BarChart3, CreditCard, Bell,
} from "lucide-react"
import type { UserRole } from "@/lib/types"

const navByRole: Record<UserRole, { titleKey: string; href: string; icon: typeof LayoutDashboard }[]> = {
  corporation: [
    { titleKey: "nav.overview", href: "/dashboard", icon: LayoutDashboard },
    { titleKey: "nav.createCampaign", href: "/dashboard/campaigns/create", icon: PlusCircle },
    { titleKey: "nav.listCampaigns", href: "/dashboard/campaigns", icon: Megaphone },
    { titleKey: "nav.manageRoles", href: "/dashboard/manage-roles", icon: UserCog },
    { titleKey: "nav.beneficiaries", href: "/dashboard/beneficiaries", icon: Users },
    { titleKey: "common.profile", href: "/dashboard/profile", icon: UserCircle },
  ],
  beneficiary: [
    { titleKey: "nav.overview", href: "/dashboard", icon: LayoutDashboard },
    { titleKey: "nav.exploreCampaigns", href: "/dashboard/explore", icon: Compass },
    { titleKey: "nav.myProgress", href: "/dashboard/progress", icon: BarChart3 },
    { titleKey: "nav.uploadEvidence", href: "/dashboard/evidence", icon: Upload },
    { titleKey: "nav.payments", href: "/dashboard/payments", icon: CreditCard },
    { titleKey: "nav.notifications", href: "/dashboard/notifications", icon: Bell },
    { titleKey: "common.profile", href: "/dashboard/profile", icon: UserCircle },
  ],
  evaluator: [
    { titleKey: "nav.overview", href: "/dashboard", icon: LayoutDashboard },
    { titleKey: "nav.assignedMilestones", href: "/dashboard/review", icon: ClipboardCheck },
    { titleKey: "nav.evaluationHistory", href: "/dashboard/evaluations", icon: FileCheck },
    { titleKey: "common.profile", href: "/dashboard/profile", icon: UserCircle },
  ],
  verifier: [
    { titleKey: "nav.overview", href: "/dashboard", icon: LayoutDashboard },
    { titleKey: "nav.assignedEvaluations", href: "/dashboard/audit", icon: ShieldCheck },
    { titleKey: "nav.auditHistory", href: "/dashboard/verified", icon: FileCheck },
    { titleKey: "common.profile", href: "/dashboard/profile", icon: UserCircle },
  ],
  angel_investor: [
    { titleKey: "nav.overview", href: "/dashboard", icon: LayoutDashboard },
    { titleKey: "common.campaigns", href: "/dashboard/campaigns", icon: Megaphone },
    { titleKey: "nav.payments", href: "/dashboard/payments", icon: CreditCard },
    { titleKey: "common.profile", href: "/dashboard/profile", icon: UserCircle },
  ],
}

export function AppSidebar() {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const pathname = usePathname()
  if (!user) return null
  const items = navByRole[user.role] || navByRole.beneficiary

  return (
    <Sidebar className="border-r border-base-300">
      <SidebarHeader className="border-b border-base-300 p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-content text-sm font-bold">P</div>
          <span className="font-heading text-lg font-bold tracking-tight">PEVI</span>
        </Link>
        <p className="mt-1 text-xs text-base-content/60 capitalize">{t("role.dashboard", { role: t(`role.${user.role}`) })}</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("common.navigation")}</SidebarGroupLabel>
          <SidebarMenu>
            {items.map((item) => {
              const isActive = item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || (pathname.startsWith(item.href + "/") && !items.some((o) => o.href !== item.href && pathname.startsWith(o.href)))
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{t(item.titleKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-base-300 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-base-content/60">{user.email}</p>
          </div>
          <button onClick={logout} className="rounded-md p-1.5 text-base-content/60 hover:bg-base-300 hover:text-base-content" title={t("common.logout")}>
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
