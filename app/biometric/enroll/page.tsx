"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { BiometricEnrollmentForm } from "@/components/biometric/enrollment-form"
import type { User } from "@supabase/supabase-js"

export default function BiometricEnrollPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [existingEnrollments, setExistingEnrollments] = useState<any[]>([])
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

      const { data: enrollmentsData } = await supabase.from("biometric_enrollments").select("*").eq("user_id", user.id)
      setExistingEnrollments(enrollmentsData || [])

      setLoading(false)
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-slate-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Biometric Enrollment</h1>
          <p className="text-muted-foreground mt-2">
            Enroll your biometric credentials for secure, passwordless authentication
          </p>
        </div>
        <BiometricEnrollmentForm user={user} profile={profile} existingEnrollments={existingEnrollments} />
      </div>
    </div>
  )
}
