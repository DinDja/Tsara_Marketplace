"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { User } from "@/lib/types"
import { loginWithEmail, registerUser, loginWithGoogle, logout as logoutService, getCurrentUser, updateAvatar as updateAvatarService } from "@/lib/services"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  loginGoogle: () => Promise<void>
  logout: () => Promise<void>
  updateAvatar: (file: File) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u)
    }).finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const u = await loginWithEmail(email, password)
    setUser(u)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const u = await registerUser(name, email, password)
    setUser(u)
  }, [])

  const loginGoogle = useCallback(async () => {
    const u = await loginWithGoogle()
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    await logoutService()
    setUser(null)
  }, [])

  const updateAvatar = useCallback(async (file: File) => {
    if (!user) return
    const avatar = await updateAvatarService(user.id, file)
    setUser(prev => prev ? { ...prev, avatar } : null)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginGoogle, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider")
  return ctx
}
