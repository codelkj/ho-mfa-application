"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default function AdminPage() {
  const [profile, setProfile] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [breakGlassLogs, setBreakGlassLogs] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    biometricEnrollments: 0,
    activeSessions: 0,
    breakGlassCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error || !user) {
        router.push("/auth/login")
        return
      }

      // Check if user is admin
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (!profileData || profileData.role !== "admin") {
        router.push("/dashboard")
        return
      }
      setProfile(profileData)

      // Get all users
      const { data: usersData } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })
      setUsers(usersData || [])

      // Get recent break-glass logs
      const { data: breakGlassData } = await supabase
        .from("break_glass_logs")
        .select("*")
        .order("accessed_at", { ascending: false })
        .limit(50)
      setBreakGlassLogs(breakGlassData || [])

      // Get recent audit logs
      const { data: auditData } = await supabase
        .from("auth_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)
      setAuditLogs(auditData || [])

      // Get authentication stats
      const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })
      const { count: biometricEnrollments } = await supabase
        .from("biometric_enrollments")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
      const { count: activeSessions } = await supabase
        .from("auth_sessions")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
      const { count: breakGlassCount } = await supabase
        .from("break_glass_logs")
        .select("*", { count: "exact", head: true })

      setStats({
        totalUsers: totalUsers || 0,
        biometricEnrollments: biometricEnrollments || 0,
        activeSessions: activeSessions || 0,
        breakGlassCount: breakGlassCount || 0,
      })

      setLoading(false)
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-slate-500">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <AdminDashboard
      profile={profile}
      users={users}
      breakGlassLogs={breakGlassLogs}
      auditLogs={auditLogs}
      stats={stats}
    />
  )
}
