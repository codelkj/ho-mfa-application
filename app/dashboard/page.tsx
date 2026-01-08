"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import type { User } from "@supabase/supabase-js"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success"
  read: boolean
  created_at: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [biometrics, setBiometrics] = useState<any[]>([])
  const [recentSessions, setRecentSessions] = useState<any[]>([])
  const [totalLogins, setTotalLogins] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
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

      setUser(user)

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(profileData)

      const { data: biometricsData } = await supabase.from("biometric_enrollments").select("*").eq("user_id", user.id)
      setBiometrics(biometricsData || [])

      const { data: sessionsData } = await supabase
        .from("auth_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(5)
      setRecentSessions(sessionsData || [])

      const { count: loginCount } = await supabase
        .from("auth_audit_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("event_type", "login")
      setTotalLogins(loginCount || 0)

      const newNotifications: Notification[] = []

      const hasFingerprintEnrolled = biometricsData?.some((b: any) => b.biometric_type === "fingerprint" && b.is_active)
      const hasFacialEnrolled = biometricsData?.some((b: any) => b.biometric_type === "facial" && b.is_active)

      if (!hasFingerprintEnrolled || !hasFacialEnrolled) {
        newNotifications.push({
          id: "biometric-reminder",
          title: "Complete Biometric Setup",
          message: `You have ${hasFingerprintEnrolled ? "" : "fingerprint"}${!hasFingerprintEnrolled && !hasFacialEnrolled ? " and " : ""}${hasFacialEnrolled ? "" : "facial recognition"} not enrolled. Enroll now to improve your security score.`,
          type: "warning",
          read: false,
          created_at: new Date().toISOString(),
        })
      }

      if (!profileData?.department) {
        newNotifications.push({
          id: "profile-incomplete",
          title: "Profile Incomplete",
          message: "Add your department to complete your profile and improve security score.",
          type: "info",
          read: false,
          created_at: new Date().toISOString(),
        })
      }

      if (loginCount && loginCount <= 3) {
        newNotifications.push({
          id: "welcome",
          title: "Welcome to HO-MFA",
          message: "Thank you for using our Healthcare-Optimized Multi-Factor Authentication system.",
          type: "success",
          read: false,
          created_at: new Date().toISOString(),
        })
      }

      setNotifications(newNotifications)
      setLoading(false)
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardContent
      user={user}
      profile={profile}
      biometrics={biometrics}
      recentSessions={recentSessions}
      totalLogins={totalLogins}
      notifications={notifications}
    />
  )
}
