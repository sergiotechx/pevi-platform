"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LoginPage() {
  const { login } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const result = await login(email, password)
      if (result.success) {
        router.push("/dashboard")
      } else {
        setError(result.error || t("login.failed"))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-base-100 p-4">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-base-content">{t("common.pevi")}</h1>
          <p className="mt-1 text-sm text-base-content/60">{t("common.tagline")}</p>
        </div>
        <Card className="border-base-300/50 bg-base-200">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-base-content pb-2">{t("login.title")}</CardTitle>
            <CardDescription>{t("login.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && <div className="rounded-md bg-error/10 p-3 text-sm text-error">{error}</div>}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">{t("common.email")}</Label>
                <Input id="email" type="email" placeholder={t("login.emailPlaceholder")} value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-base-100/50" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">{t("common.password")}</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder={t("login.passwordPlaceholder")} value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-base-100/50 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? t("login.loading") : t("login.submit")}</Button>
            </form>
            <div className="mt-4 rounded-md border border-base-300/50 bg-base-300/30 p-3">
              <p className="mb-2 text-xs font-medium text-base-content/60">{t("login.demoAccounts")}</p>
              <div className="flex flex-col gap-1 text-xs text-base-content/70">
                <span>{t("role.corporation")}: corp@pevi.com</span>
                <span>{t("role.beneficiary")}: ben@pevi.com</span>
                <span>{t("role.evaluator")}: eval@pevi.com</span>
                <span>{t("role.verifier")}: ver@pevi.com</span>
                <span>{t("role.angel_investor")}: angel@pevi.com</span>
              </div>
            </div>
            <div className="mt-6 text-center text-sm text-base-content/60" suppressHydrationWarning>
              {t("login.noAccount")}{" "}
              <Link href="/signup" className="font-medium text-primary hover:underline" suppressHydrationWarning>{t("login.createOne")}</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
