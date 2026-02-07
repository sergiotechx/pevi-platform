"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"
import type { UserRole } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"

export default function SignupPage() {
  const { signup } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<UserRole | "">("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (password !== confirmPassword) { setError(t("signup.passwordMismatch")); return }
    if (!role) { setError(t("signup.selectType")); return }
    setLoading(true)
    setTimeout(() => {
      const result = signup(email, password, name, role as UserRole)
      if (result.success) router.push("/dashboard/profile")
      else setError(result.error || t("signup.failed"))
      setLoading(false)
    }, 600)
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
          <p className="mt-1 text-sm text-base-content/60">{t("signup.createAccount")}</p>
        </div>
        <Card className="border-base-300/50 bg-base-200">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-base-content">{t("signup.title")}</CardTitle>
            <CardDescription>{t("signup.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && <div className="rounded-md bg-error/10 p-3 text-sm text-error">{error}</div>}
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">{t("common.name")}</Label>
                <Input id="name" placeholder={t("signup.namePlaceholder")} value={name} onChange={(e) => setName(e.target.value)} required className="bg-base-100/50" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">{t("common.email")}</Label>
                <Input id="email" type="email" placeholder={t("signup.emailPlaceholder")} value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-base-100/50" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">{t("common.password")}</Label>
                <Input id="password" type="password" placeholder={t("signup.passwordPlaceholder")} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="bg-base-100/50" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword">{t("signup.confirmPassword")}</Label>
                <Input id="confirmPassword" type="password" placeholder={t("signup.confirmPlaceholder")} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="bg-base-100/50" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="role">{t("signup.userType")}</Label>
                <Select onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger className="bg-base-100/50"><SelectValue placeholder={t("signup.selectRole")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corporation">{t("role.corporation")}</SelectItem>
                    <SelectItem value="beneficiary">{t("role.beneficiary")}</SelectItem>
                    <SelectItem value="evaluator">{t("role.evaluator")}</SelectItem>
                    <SelectItem value="verifier">{t("role.verifier")}</SelectItem>
                    <SelectItem value="angel_investor">{t("role.angel_investor")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? t("signup.loading") : t("signup.submit")}</Button>
            </form>
            <div className="mt-6 text-center text-sm text-base-content/60" suppressHydrationWarning>
              {t("signup.hasAccount")}{" "}
              <Link href="/login" className="font-medium text-primary hover:underline" suppressHydrationWarning>{t("signup.signIn")}</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
