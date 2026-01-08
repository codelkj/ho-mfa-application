"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import type { Profile, BiometricEnrollment, AuthSession } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Fingerprint,
  AlertTriangle,
  UserIcon,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Lock,
  Eye,
  Scan,
  TrendingUp,
  Bell,
  Info,
  X,
  Shield,
  FlaskConical,
} from "lucide-react"
import Link from "next/link"
import { formatDateTime } from "@/lib/utils/format-date"
import { BreakGlassModal } from "@/components/break-glass/break-glass-modal"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success"
  read: boolean
  created_at: string
}

interface DashboardContentProps {
  user: User
  profile: Profile | null
  biometrics: BiometricEnrollment[]
  recentSessions: AuthSession[]
  totalLogins: number
  notifications: Notification[]
}

export function DashboardContent({
  user,
  profile,
  biometrics,
  recentSessions,
  totalLogins,
  notifications: initialNotifications,
}: DashboardContentProps) {
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>("")
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [showBreakGlass, setShowBreakGlass] = useState(false)

  useEffect(() => {
    setMounted(true)
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const hasFingerprintEnrolled = biometrics.some((b) => b.biometric_type === "fingerprint" && b.is_active)
  const hasFacialEnrolled = biometrics.some((b) => b.biometric_type === "facial" && b.is_active)

  const calculateSecurityScore = () => {
    let score = 20
    if (hasFingerprintEnrolled) score += 30
    if (hasFacialEnrolled) score += 30
    if (profile?.full_name) score += 10
    if (profile?.department) score += 10
    return score
  }

  const securityScore = calculateSecurityScore()

  const getSecurityScoreBreakdown = () => {
    const breakdown = [
      { label: "Account created", points: 20, achieved: true },
      { label: "Fingerprint enrolled", points: 30, achieved: hasFingerprintEnrolled },
      { label: "Facial recognition enrolled", points: 30, achieved: hasFacialEnrolled },
      { label: "Full name provided", points: 10, achieved: !!profile?.full_name },
      { label: "Department specified", points: 10, achieved: !!profile?.department },
    ]
    return breakdown
  }

  const getSecurityLevel = (score: number) => {
    if (score >= 80) return { level: "Excellent", color: "text-green-400", bg: "bg-green-500" }
    if (score >= 60) return { level: "Good", color: "text-teal-400", bg: "bg-teal-500" }
    if (score >= 40) return { level: "Fair", color: "text-amber-400", bg: "bg-amber-500" }
    return { level: "Needs Attention", color: "text-red-400", bg: "bg-red-500" }
  }

  const security = getSecurityLevel(securityScore)
  const unreadCount = notifications.filter((n) => !n.read).length

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "physician":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "nurse":
        return "bg-teal-100 text-teal-700 border-teal-200"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const activeSessions = recentSessions.filter((s) => s.is_active).length || 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Compact Top Bar */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex h-14 items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5 text-slate-500" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-semibold text-slate-900">Notifications</h3>
                    <p className="text-xs text-slate-500">{unreadCount} unread</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-slate-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-slate-900">{notification.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{notification.message}</p>
                            </div>
                            <button
                              onClick={() => dismissNotification(notification.id)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{profile?.full_name || user.email}</p>
                <Badge className={`${getRoleBadgeColor(profile?.role || "nurse")} border text-xs`}>
                  {profile?.role || "User"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      {showNotifications && <div className="fixed inset-0 z-0" onClick={() => setShowNotifications(false)} />}

      <main className="p-6">
        {/* Welcome Section */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {getGreeting()}, {profile?.full_name?.split(" ")[0] || "User"}
            </h2>
            <p className="text-slate-500 mt-1">Here's your security overview for today</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-light text-slate-400">{mounted ? currentTime : "--:--"}</p>
            <p className="text-sm text-slate-500">
              {mounted
                ? new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                : ""}
            </p>
          </div>
        </div>

        {/* Security Score Card */}
        <Card className="mb-6 border-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-grid-white/5" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <svg className="h-20 w-20 -rotate-90 cursor-help">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-slate-700"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${(securityScore / 100) * 213.6} 213.6`}
                      className={security.bg.replace("bg-", "text-")}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold">{securityScore}</span>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute left-full ml-4 top-0 w-64 bg-white text-slate-900 rounded-lg shadow-xl border border-slate-200 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <h4 className="font-semibold mb-2 text-sm">Security Score Breakdown</h4>
                    <div className="space-y-2">
                      {getSecurityScoreBreakdown().map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span className={item.achieved ? "text-slate-700" : "text-slate-400"}>{item.label}</span>
                          <span className={`font-medium ${item.achieved ? "text-green-600" : "text-slate-400"}`}>
                            {item.achieved ? `+${item.points}` : `+${item.points}`}
                            {item.achieved && <CheckCircle className="inline h-3 w-3 ml-1" />}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between text-xs font-semibold">
                      <span>Total</span>
                      <span className="text-teal-600">{securityScore}/100</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Security Score</p>
                  <p className={`text-xl font-bold ${security.color}`}>{security.level}</p>
                  <p className="text-slate-400 text-xs mt-1">
                    {securityScore < 100 ? "Hover for breakdown" : "Maximum security achieved"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-white/10 mx-auto mb-2">
                    <Fingerprint className="h-5 w-5" />
                  </div>
                  <p className="text-xl font-bold">{biometrics.filter((b) => b.is_active).length}</p>
                  <p className="text-xs text-slate-400">Biometrics</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-white/10 mx-auto mb-2">
                    <Activity className="h-5 w-5" />
                  </div>
                  <p className="text-xl font-bold">{activeSessions}</p>
                  <p className="text-xs text-slate-400">Active Sessions</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-white/10 mx-auto mb-2">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <p className="text-xl font-bold">{totalLogins || 1}</p>
                  <p className="text-xs text-slate-400">Total Logins</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mb-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/biometric/enroll">
            <Card className="cursor-pointer border-slate-200 transition-all hover:shadow-lg hover:scale-[1.02] hover:border-teal-300 group h-full">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-teal-100 group-hover:from-teal-100 group-hover:to-teal-200 transition-colors">
                  <Fingerprint className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Enroll Biometrics</p>
                  <p className="text-sm text-slate-500">Set up fingerprint or face</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card
            onClick={() => setShowBreakGlass(true)}
            className="cursor-pointer border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 transition-all hover:shadow-lg hover:scale-[1.02] group h-full"
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 group-hover:from-amber-200 group-hover:to-orange-200 transition-colors">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">Break-Glass</p>
                <p className="text-sm text-amber-700">Emergency override</p>
              </div>
            </CardContent>
          </Card>

          <Link href="/profile">
            <Card className="cursor-pointer border-slate-200 transition-all hover:shadow-lg hover:scale-[1.02] hover:border-slate-300 group h-full">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 group-hover:from-slate-100 group-hover:to-slate-200 transition-colors">
                  <UserIcon className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Profile Settings</p>
                  <p className="text-sm text-slate-500">Manage your account</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/security">
            <Card className="cursor-pointer border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 transition-all hover:shadow-lg hover:scale-[1.02] group h-full">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 group-hover:from-teal-200 group-hover:to-cyan-200 transition-colors">
                  <Shield className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <p className="font-semibold text-teal-900">Security Center</p>
                  <p className="text-sm text-teal-700">Compliance & vulnerabilities</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Testing Suite quick action row */}
        <div className="mb-6">
          <Link href="/test">
            <Card className="cursor-pointer border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 transition-all hover:shadow-lg hover:scale-[1.01] group">
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                    <FlaskConical className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Software Testing Suite</p>
                    <p className="text-sm text-blue-700">
                      Run automated tests & simulate risk scenarios for your capstone demo
                    </p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">New</Badge>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Biometric & Sessions Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Biometric Status */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900">Biometric Status</CardTitle>
                  <CardDescription className="text-slate-500">Your enrolled authentication methods</CardDescription>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
                  <Scan className="h-5 w-5 text-teal-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${hasFingerprintEnrolled ? "border-green-200 bg-green-50/50" : "border-slate-200"}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${hasFingerprintEnrolled ? "bg-green-100" : "bg-slate-100"}`}
                    >
                      <Fingerprint
                        className={`h-6 w-6 ${hasFingerprintEnrolled ? "text-green-600" : "text-slate-400"}`}
                      />
                    </div>
                    <div>
                      <span className="font-medium text-slate-900">Fingerprint</span>
                      <p className="text-sm text-slate-500">Touch ID authentication</p>
                    </div>
                  </div>
                  {hasFingerprintEnrolled ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Enrolled
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-500 border-slate-200">
                      <XCircle className="mr-1 h-3 w-3" />
                      Not Enrolled
                    </Badge>
                  )}
                </div>
                <div
                  className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${hasFacialEnrolled ? "border-green-200 bg-green-50/50" : "border-slate-200"}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${hasFacialEnrolled ? "bg-green-100" : "bg-slate-100"}`}
                    >
                      <Eye className={`h-6 w-6 ${hasFacialEnrolled ? "text-green-600" : "text-slate-400"}`} />
                    </div>
                    <div>
                      <span className="font-medium text-slate-900">Facial Recognition</span>
                      <p className="text-sm text-slate-500">Face ID authentication</p>
                    </div>
                  </div>
                  {hasFacialEnrolled ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Enrolled
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-500 border-slate-200">
                      <XCircle className="mr-1 h-3 w-3" />
                      Not Enrolled
                    </Badge>
                  )}
                </div>
                {!hasFingerprintEnrolled && !hasFacialEnrolled && (
                  <Link href="/biometric/enroll">
                    <Button className="mt-4 w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/20">
                      <Lock className="mr-2 h-4 w-4" />
                      Set Up Biometrics Now
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900">Recent Sessions</CardTitle>
                  <CardDescription className="text-slate-500">Your recent authentication activity</CardDescription>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSessions.length > 0 ? (
                  recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                        session.is_active ? "border-green-200 bg-green-50/50" : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            session.is_active ? "bg-green-100" : "bg-slate-100"
                          }`}
                        >
                          <Clock className={`h-5 w-5 ${session.is_active ? "text-green-600" : "text-slate-400"}`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-900">
                            {session.auth_method || "Password"} Authentication
                          </p>
                          <p className="text-xs text-slate-500">
                            {mounted ? formatDateTime(session.started_at) : "Loading..."}
                          </p>
                        </div>
                      </div>
                      {session.is_active ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-500 border-slate-200">Ended</Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50/50 p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-900">Current Session</p>
                        <p className="text-xs text-slate-500">
                          {mounted ? formatDateTime(new Date().toISOString()) : "Loading..."}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Break-Glass Modal */}
      <BreakGlassModal
        open={showBreakGlass}
        onOpenChange={setShowBreakGlass}
        user={user}
        userDepartment={profile?.department || undefined}
      />
    </div>
  )
}
