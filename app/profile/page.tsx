"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ProfileSettings } from "@/components/profile/profile-settings"
import type { User } from "@supabase/supabase-js"

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [biometrics, setBiometrics] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
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

      const { data: activityData } = await supabase
        .from("auth_audit_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)
      setRecentActivity(activityData || [])

      setLoading(false)
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-slate-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account settings and security preferences</p>
        </div>
        <ProfileSettings user={user} profile={profile} biometrics={biometrics} recentActivity={recentActivity} />
      </div>
    </div>
  )
}
