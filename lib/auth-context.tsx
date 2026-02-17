"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { users, type User } from "./mock-data"
import type { UserRole } from "./types"
import { api } from "./api-client"

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
  updateWallet: (walletAddress: string) => void
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
      const found: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role as User["role"],
        walletAddress: userData.walletAddress,
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

  const updateWallet = useCallback((walletAddress: string) => {
    if (user) api.users.update(parseInt(user.id, 10), { walletAddress })
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, walletAddress }
      storeUser(updated)
      return updated
    })
  }, [user])

  const connectWallet = useCallback((): Promise<{ success: boolean; address?: string; error?: string }> => {
    const userId = user?.id
    return new Promise((resolve) => {
      setTimeout(() => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
        let address = "G"
        for (let i = 0; i < 55; i++) address += chars.charAt(Math.floor(Math.random() * chars.length))
        setUser((prev) => {
          if (!prev) return prev
          const updated = { ...prev, walletAddress: address }
          storeUser(updated)
          return updated
        })
        if (userId) api.users.update(parseInt(userId, 10), { walletAddress: address })
        resolve({ success: true, address })
      }, 1200)
    })
  }, [user])

  const disconnectWallet = useCallback(() => {
    if (user) api.users.update(parseInt(user.id, 10), { walletAddress: null })
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, walletAddress: undefined }
      storeUser(updated)
      return updated
    })
  }, [user])

  const logout = useCallback(() => { setUser(null); storeUser(null) }, [])

  return (
    <AuthContext.Provider value={{ user, login, signup, updateWallet, connectWallet, disconnectWallet, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
