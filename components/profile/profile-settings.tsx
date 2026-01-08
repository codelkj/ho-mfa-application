"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  UserIcon,
  Mail,
  Building,
  BadgeIcon,
  Shield,
  Fingerprint,
  Camera,
  CheckCircle2,
  XCircle,
  Clock,
  Home,
  Save,
  AlertCircle,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Profile, BiometricEnrollment, AuthAuditLog } from "@/lib/types"
import { formatDate, formatDateTime } from "@/lib/utils/format-date"

interface ProfileSettingsProps {
  user: User
  profile: Profile | null
  biometrics: BiometricEnrollment[]
  recentActivity: AuthAuditLog[]
}

export function ProfileSettings({ user, profile, biometrics, recentActivity }: ProfileSettingsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  const [formData, setFormData] = useState({
    fullName: profile?.full_name || "",
    department: profile?.department || "",
    employeeId: profile?.employee_id || "",
  })

  const hasFacial = biometrics.some((b) => b.biometric_type === "facial" && b.is_active)
  const hasFingerprint = biometrics.some((b) => b.biometric_type === "fingerprint" && b.is_active)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsUpdating(true)

    const supabaseClient = createClient()

    try {
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({
          full_name: formData.fullName || null,
          department: formData.department || null,
          employee_id: formData.employeeId || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      setSuccess("Profile updated successfully")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsUpdating(false)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default"
      case "physician":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-600 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" value={user.email || ""} disabled className="pl-10 bg-muted" />
                  </div>
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="department"
                      placeholder="e.g., Emergency Department"
                      value={formData.department}
                      onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <div className="relative">
                    <BadgeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="employeeId"
                      placeholder="Enter your employee ID"
                      value={formData.employeeId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, employeeId: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Role:</span>
                    <Badge variant={getRoleBadgeVariant(profile?.role || "nurse")}>{profile?.role || "nurse"}</Badge>
                  </div>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your recent authentication events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-3">
                        {activity.event_type.includes("success") ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : activity.event_type.includes("failure") ? (
                          <XCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{activity.event_type.replace(/_/g, " ")}</p>
                          <p className="text-xs text-muted-foreground">{activity.auth_method || "system"}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {mounted ? formatDateTime(activity.created_at) : "..."}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Biometric Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Facial Recognition</span>
                </div>
                {hasFacial ? (
                  <Badge variant="default" className="bg-green-600">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">Not Set</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Fingerprint</span>
                </div>
                {hasFingerprint ? (
                  <Badge variant="default" className="bg-green-600">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">Not Set</Badge>
                )}
              </div>
              <Separator />
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/biometric/enroll">
                  <Fingerprint className="h-4 w-4 mr-2" />
                  Manage Biometrics
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">User ID</span>
                <span className="font-mono text-xs">{user.id.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{mounted && profile?.created_at ? formatDate(profile.created_at) : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{mounted && profile?.updated_at ? formatDate(profile.updated_at) : "-"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
