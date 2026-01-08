"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { BiometricVerification } from "@/components/biometric/verification"
import type { User } from "@supabase/supabase-js"

export default function BiometricVerifyPage() {
  const [user, setUser] = useState<User | null>(null)
  const [enrollments, setEnrollments] = useState<any[]>([])
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

      const { data: enrollmentsData } = await supabase
        .from("biometric_enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)

      if (!enrollmentsData || enrollmentsData.length === 0) {
        router.push("/biometric/enroll")
        return
      }
      setEnrollments(enrollmentsData)

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <BiometricVerification user={user} enrollments={enrollments} />
    </div>
  )
}
