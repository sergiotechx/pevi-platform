"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { users, type User } from "./mock-data"
import type { UserRole } from "./types"
import { api } from "./api-client"
import { isFreighterInstalled, requestFreighterAccess } from "./stellar"

function storeUser(u: User | null) {
  if (typeof window === "undefined") return
  if (u) sessionStorage.setItem("pevi_user", JSON.stringify(u))
  else sessionStorage.removeItem("pevi_user")
}

function loadUser(): User | null {
  if (typeof window === "undefined") return null
  try {
    const s = sessionStorage.getItem("pevi_user")
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, name: string, role: UserRole) => { success: boolean; error?: string }
  updateWallet: (walletAddress: string) => Promise<{ success: boolean; error?: string }>
  updateUser: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>
  connectWallet: () => Promise<{ success: boolean; address?: string; error?: string }>
  disconnectWallet: () => void
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be inside AuthProvider")
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setUser(loadUser())
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const userData = await api.auth.login({ email, password })
      const data = userData as any
      const found: User = {
        id: String(data.user_id || data.id),
        name: data.fullName || data.name,
        email: data.email,
        role: data.role as User["role"],
        walletAddress: data.walletAddress,
        orgId: data.orgId,
      }
      setUser(found)
      storeUser(found)
      return { success: true }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      const message = axiosErr?.response?.data?.error || "Invalid email or password"
      return { success: false, error: message }
    }
  }, [])

  const signup = useCallback((email: string, password: string, name: string, role: UserRole) => {
    if (users.find((u) => u.email === email)) return { success: false, error: "Email already in use" }
    const newUser: User = { id: `u${Date.now()}`, email, password, name, role }
    users.push(newUser)
    setUser(newUser); storeUser(newUser)
    return { success: true }
  }, [])

  const updateWallet = useCallback(async (walletAddress: string) => {
    if (user) {
      try {
        const res = await api.users.update(parseInt(user.id, 10), { walletAddress }) as any
        const updatedUser: User = {
          ...user,
          walletAddress: res.walletAddress || walletAddress
        }
        setUser(updatedUser)
        storeUser(updatedUser)
        return { success: true }
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { error?: string } }, message?: string }
        const message = axiosErr?.response?.data?.error || axiosErr.message || "wallet.connectionFailed"
        return { success: false, error: message }
      }
    }
    return { success: false, error: "No user" }
  }, [user])

  const updateUser = useCallback(async (data: Partial<User>) => {
    if (user) {
      try {
        // Enviar a la API usando fullName si se proporciona name
        const payload = { ...data } as any
        if (data.name) payload.fullName = data.name
        delete payload.name
        delete payload.id

        const res = await api.users.update(parseInt(user.id, 10), payload) as any

        const updatedUser: User = {
          ...user,
          ...data,
          name: res.fullName || res.name || data.name || user.name,
          walletAddress: res.walletAddress !== undefined ? res.walletAddress : (data.walletAddress || user.walletAddress)
        }

        setUser(updatedUser)
        storeUser(updatedUser)
        return { success: true }
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { error?: string } }, message?: string }
        const message = axiosErr?.response?.data?.error || axiosErr.message || "Error al actualizar usuario"
        return { success: false, error: message }
      }
    }
    return { success: false, error: "No user" }
  }, [user])

  const connectWallet = useCallback(async (): Promise<{
    success: boolean; address?: string; error?: string
  }> => {
    const installed = await isFreighterInstalled()
    if (!installed) {
      return {
        success: false,
        error: "wallet.notInstalled",
      }
    }
    const result = await requestFreighterAccess()
    if ("error" in result) return { success: false, error: result.error }

    const { publicKey } = result
    if (user?.id) {
      try {
        await api.users.update(parseInt(user.id, 10), { walletAddress: publicKey })
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { error?: string } }, message?: string }
        const message = axiosErr?.response?.data?.error || axiosErr.message || "wallet.connectionFailed"
        return { success: false, error: message }
      }
    }

    const updatedUser: User = { ...user!, walletAddress: publicKey }
    setUser(updatedUser)
    storeUser(updatedUser)
    return { success: true, address: publicKey }
  }, [user])

  const disconnectWallet = useCallback(async () => {
    if (user) {
      try {
        await api.users.update(parseInt(user.id, 10), { walletAddress: null } as any)
        const updatedUser: User = { ...user, walletAddress: undefined }
        setUser(updatedUser)
        storeUser(updatedUser)
      } catch (err) {
        console.error("Error disconnecting wallet:", err)
      }
    }
  }, [user])

  const logout = useCallback(() => { setUser(null); storeUser(null) }, [])

  return (
    <AuthContext.Provider value={{ user, login, signup, updateWallet, updateUser, connectWallet, disconnectWallet, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
