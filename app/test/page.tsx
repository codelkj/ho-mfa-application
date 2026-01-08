"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TestDashboard } from "@/components/test/test-dashboard"

export default function TestPage() {
  const [userId, setUserId] = useState<string>("")
  const [userEmail, setUserEmail] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      setUserId(user.id)
      setUserEmail(user.email || "")
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

  if (!userId) return null

  return <TestDashboard userId={userId} userEmail={userEmail} />
}
