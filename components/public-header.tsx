"use client"

import { usePathname } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { Button } from "@/components/ui/button"
import { SafeLink } from "@/components/safe-link"
import {
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  UserCircle,
} from "lucide-react"

export function PublicHeader() {
  const { user, isAuthenticated, logout } = useAuth()
  const { t } = useTranslation()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const navSafeLinks = [
    { href: "/", labelKey: "public.explore" },
    { href: "/about", labelKey: "public.about" },
  ]

  function handleLogout() {
    setDropdownOpen(false)
    logout()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-base-300/50 bg-base-100/90 backdrop-blur-md" suppressHydrationWarning>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <SafeLink href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-content text-sm font-bold">
            P
          </div>
          <span className="font-heading text-xl font-bold tracking-tight">
            PEVI
          </span>
        </SafeLink>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label={t("common.navigation")}>
          {navSafeLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href)
            return (
              <SafeLink
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                }`}
              >
                {t(link.labelKey)}
              </SafeLink>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />

          {/* Auth section - Desktop */}
          <div className="hidden md:flex md:items-center md:gap-2">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-base-content/80 transition-colors hover:bg-base-200"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                    {user.name.charAt(0)}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 z-50 mt-1 w-56 rounded-lg border border-base-300/50 bg-base-200 py-1 shadow-lg">
                      <div className="border-b border-base-300/50 px-4 py-3">
                        <p className="text-sm font-medium text-base-content">
                          {user.name}
                        </p>
                        <p className="text-xs text-base-content/60">
                          {t(`role.${user.role}`)}
                        </p>
                      </div>
                      <SafeLink
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-base-content/80 transition-colors hover:bg-base-300/50"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        {t("common.dashboard")}
                      </SafeLink>
                      <SafeLink
                        href="/dashboard/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-base-content/80 transition-colors hover:bg-base-300/50"
                      >
                        <UserCircle className="h-4 w-4" />
                        {t("common.profile")}
                      </SafeLink>
                      <div className="border-t border-base-300/50">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-error transition-colors hover:bg-base-300/50"
                        >
                          <LogOut className="h-4 w-4" />
                          {t("common.logout")}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <SafeLink href="/login">
                  <Button variant="ghost" size="sm">
                    {t("public.login")}
                  </Button>
                </SafeLink>
                <SafeLink href="/signup">
                  <Button size="sm">{t("public.signup")}</Button>
                </SafeLink>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-md p-2 text-base-content/70 hover:bg-base-200 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-base-300/50 bg-base-100 md:hidden">
          <nav className="flex flex-col px-4 py-3" aria-label={t("common.navigation")}>
            {navSafeLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href)
              return (
                <SafeLink
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                  }`}
                >
                  {t(link.labelKey)}
                </SafeLink>
              )
            })}

            <div className="my-2 border-t border-base-300/50" />

            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-base-content">
                      {user.name}
                    </p>
                    <p className="text-xs text-base-content/60">
                      {t(`role.${user.role}`)}
                    </p>
                  </div>
                </div>
                <SafeLink
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-base-content/70 hover:bg-base-200"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {t("common.dashboard")}
                </SafeLink>
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    handleLogout()
                  }}
                  className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-error hover:bg-base-200"
                >
                  <LogOut className="h-4 w-4" />
                  {t("common.logout")}
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-3 py-2">
                <SafeLink href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    {t("public.login")}
                  </Button>
                </SafeLink>
                <SafeLink href="/signup" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full">
                    {t("public.signup")}
                  </Button>
                </SafeLink>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
