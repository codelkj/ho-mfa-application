"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Sidebar } from "./sidebar"
import { GlobalSearch } from "./global-search"
import { createClient } from "@/lib/supabase/client"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [userRole, setUserRole] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  // Auth pages don't need the shell
  const isAuthPage = pathname.startsWith("/auth") || pathname === "/"

  useEffect(() => {
    if (isAuthPage) {
      setLoading(false)
      return
    }

    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Get user role from profiles
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

      setUserRole(profile?.role || "user")
      setLoading(false)
    }

    checkAuth()
  }, [isAuthPage, router])

  if (isAuthPage) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    )
  }

  return (
    <>
      <Sidebar userRole={userRole} onSearchOpen={() => setSearchOpen(true)} />
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <main className="min-h-screen bg-slate-50 transition-all duration-300 md:ml-64">{children}</main>
    </>
  )
}
