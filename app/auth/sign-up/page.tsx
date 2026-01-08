"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Shield } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState("nurse")
  const [department, setDepartment] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      setIsLoading(false)
      return
    }

    try {
      console.log("[v0] Starting sign up process...")
      const supabase = createClient()
      console.log("[v0] Supabase client created, attempting signUp...")

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            department: department,
            employee_id: employeeId,
          },
        },
      })

      console.log("[v0] signUp completed, data:", data, "error:", signUpError)

      if (signUpError) throw signUpError

      console.log("[v0] Sign up successful, redirecting to dashboard...")
      router.push("/dashboard")
      router.refresh()
    } catch (err: unknown) {
      console.error("[v0] Sign up error:", err)
      if (err instanceof Error) {
        if (err.message.includes("Failed to fetch") || err.message.includes("fetch")) {
          setError(
            "Unable to connect to authentication service. The database may be starting up. Please wait 1-2 minutes and try again.",
          )
        } else {
          setError(err.message)
        }
      } else {
        setError("An unexpected error occurred. Please check your network connection and try again.")
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
            <CardTitle className="text-xl text-slate-900">Create Account</CardTitle>
            <CardDescription className="text-slate-500">Register for secure healthcare portal access</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName" className="text-slate-700">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Dr. Jane Smith"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border-slate-300"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-slate-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane.smith@hospital.org"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-slate-300"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="employeeId" className="text-slate-700">
                    Employee ID
                  </Label>
                  <Input
                    id="employeeId"
                    type="text"
                    placeholder="EMP-12345"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="border-slate-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="role" className="text-slate-700">
                      Role
                    </Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="border-slate-300">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nurse">Nurse</SelectItem>
                        <SelectItem value="physician">Physician</SelectItem>
                        <SelectItem value="medical_records">Medical Records</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="department" className="text-slate-700">
                      Department
                    </Label>
                    <Input
                      id="department"
                      type="text"
                      placeholder="Emergency"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="border-slate-300"
                    />
                  </div>
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
                <div className="grid gap-2">
                  <Label htmlFor="repeat-password" className="text-slate-700">
                    Confirm Password
                  </Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="border-slate-300"
                  />
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-teal-600 underline underline-offset-4 hover:text-teal-700">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-slate-400">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
