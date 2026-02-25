"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Building2, Save, Users, Copy, Check, LogIn, Edit2, X } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n-context"
import useSWR from "swr"

export function OrganizationCard() {
    const { user, updateUser } = useAuth()
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false)
    const [orgName, setOrgName] = useState("")
    const [inviteCodeInput, setInviteCodeInput] = useState("")
    const [copied, setCopied] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    // Fetch organization details if user has orgId
    const { data: org, mutate, isLoading: isLoadingOrg } = useSWR(
        user?.orgId ? `/api/organizations/${user.orgId}` : null,
        (url) => fetch(url).then((res) => res.json())
    )

    useEffect(() => {
        if (org?.name) {
            setOrgName(org.name)
        }
    }, [org])

    const handleCreateOrg = async () => {
        if (!orgName.trim() || !user?.id) return
        setLoading(true)
        try {
            const res = await fetch("/api/organizations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: orgName,
                    user_id: user.id
                })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || t("profile.org.createError"))

            // Update local user context with new orgId
            await updateUser({ orgId: data.org_id })
            mutate(data)
            toast.success(t("profile.org.createdSuccess"))
            setIsEditing(false)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateOrg = async () => {
        if (!orgName.trim() || !user?.orgId) return
        setLoading(true)
        try {
            const res = await fetch(`/api/organizations/${user.orgId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: orgName
                })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || t("profile.org.updateError"))

            mutate(data)
            toast.success(t("profile.org.updatedSuccess"))
            setIsEditing(false)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleJoinOrg = async () => {
        if (!inviteCodeInput.trim() || !user?.id) return
        setLoading(true)
        try {
            const res = await fetch("/api/organizations/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    invite_code: inviteCodeInput.trim().toUpperCase(),
                    user_id: user.id
                })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || t("profile.org.joinError"))

            await updateUser({ orgId: data.organization.org_id })
            toast.success(t("profile.org.joinedSuccess", { name: data.organization.name }))
            setInviteCodeInput("")
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const copyCode = () => {
        if (org?.invite_code) {
            navigator.clipboard.writeText(org.invite_code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
            toast.success(t("profile.org.codeCopied"))
        }
    }

    if (!user || (user.role !== "corporation" && user.role !== "evaluator")) {
        return null
    }

    return (
        <Card className="border-base-300/50">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base">{t("profile.org.title")}</CardTitle>
                    </div>
                    {user.role === "corporation" && user.orgId && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(!isEditing)}
                            className="h-8 w-8 p-0"
                        >
                            {isEditing ? <X className="h-4 w-4 text-error" /> : <Edit2 className="h-4 w-4 text-primary" />}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {user.role === "corporation" ? (
                    <div className="flex flex-col gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">{t("profile.org.nameLabel")}</label>
                            <div className="flex gap-2">
                                <Input
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    placeholder={t("profile.org.namePlaceholder")}
                                    className="bg-base-200/50"
                                    disabled={!!user.orgId && !isEditing}
                                />
                                {(!user.orgId || isEditing) && (
                                    <Button
                                        onClick={user.orgId ? handleUpdateOrg : handleCreateOrg}
                                        disabled={loading || !orgName.trim() || !!(user.orgId && orgName === org?.name)}
                                    >
                                        {loading ? <span className="loading loading-spinner loading-xs" /> : <Save className="h-4 w-4" />}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {org?.invite_code && (
                            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2">{t("profile.org.inviteCodeTitle")}</p>
                                <div className="flex items-center justify-between gap-2">
                                    <code className="text-xl font-bold tracking-widest text-base-content">{org.invite_code}</code>
                                    <Button variant="ghost" size="sm" onClick={copyCode} className="h-8 w-8 p-0">
                                        {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="mt-2 text-[10px] text-base-content/50">{t("profile.org.inviteCodeDesc")}</p>
                            </div>
                        )}
                    </div>

                ) : (
                    // Evaluator Flow
                    <div className="flex flex-col gap-4">
                        {user.orgId && org ? (
                            <div className="flex items-center gap-3 rounded-lg border border-base-300/50 bg-base-300/10 p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-base-content/50">{t("profile.org.memberOf")}</p>
                                    <p className="font-semibold text-base-content">{org.name}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                <p className="text-sm text-base-content/70 italic text-pretty">{t("profile.org.notInOrg")}</p>
                                <div className="flex gap-2">
                                    <Input
                                        value={inviteCodeInput}
                                        onChange={(e) => setInviteCodeInput(e.target.value)}
                                        placeholder={t("profile.org.joinPlaceholder")}
                                        className="bg-base-200/50 uppercase font-mono"
                                    />
                                    <Button onClick={handleJoinOrg} disabled={loading || !inviteCodeInput.trim()} className="shrink-0">
                                        {loading ? <span className="loading loading-spinner loading-xs" /> : <LogIn className="h-4 w-4 mr-2" />}
                                        {t("profile.org.joinButton")}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
