"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Fingerprint } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Starting login process...")
      const supabase = createClient()
      console.log("[v0] Supabase client created, attempting signInWithPassword...")

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("[v0] signInWithPassword completed, error:", error)

      if (error) throw error

      console.log("[v0] Login successful, redirecting to dashboard...")
      router.push("/dashboard")
    } catch (err: unknown) {
      console.error("[v0] Login error:", err)
      if (err instanceof Error) {
        if (err.message.includes("Failed to fetch") || err.message.includes("fetch")) {
          setError(
            "Unable to connect to authentication service. The database may be starting up. Please wait 1-2 minutes and try again.",
          )
        } else {
          setError(err.message)
        }
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-10 w-10 text-teal-600" />
            <span className="text-2xl font-bold text-slate-900">HO-MFA</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">Healthcare-Optimized Multi-Factor Authentication</p>
        </div>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Welcome Back</CardTitle>
            <CardDescription className="text-slate-500">Sign in to access your healthcare portal</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-slate-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nurse@hospital.org"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-slate-300"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-slate-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-slate-300"
                  />
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-400">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-slate-300 bg-transparent"
                  onClick={() => (window.location.href = "/biometric/verify")}
                >
                  <Fingerprint className="mr-2 h-4 w-4" />
                  Biometric Login
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link href="/auth/sign-up" className="text-teal-600 underline underline-offset-4 hover:text-teal-700">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-slate-400">Protected by HIPAA-compliant security measures</p>
      </div>
    </div>
  )
}
