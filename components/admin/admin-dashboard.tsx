"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  Shield,
  Activity,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Fingerprint,
  Home,
} from "lucide-react"
import type { Profile, BreakGlassLog, AuthAuditLog } from "@/lib/types"
import { formatDate, formatDateTime, formatTime } from "@/lib/utils/format-date"

interface AdminDashboardProps {
  profile: Profile
  users: Profile[]
  breakGlassLogs: (BreakGlassLog & {
    user: { full_name: string | null; role: string; department: string | null } | null
    reviewer: { full_name: string | null } | null
  })[]
  auditLogs: (AuthAuditLog & {
    user: { full_name: string | null; role: string } | null
  })[]
  stats: {
    totalUsers: number
    biometricEnrollments: number
    activeSessions: number
    breakGlassCount: number
  }
}

export function AdminDashboard({ profile, users, breakGlassLogs, auditLogs, stats }: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const pendingReviews = breakGlassLogs.filter((log) => !log.reviewed_at)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">HO-MFA System Administration</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              {profile.full_name || profile.email}
            </Badge>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-10 w-10 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Biometric Enrollments</p>
                  <p className="text-3xl font-bold">{stats.biometricEnrollments}</p>
                </div>
                <Fingerprint className="h-10 w-10 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Sessions</p>
                  <p className="text-3xl font-bold">{stats.activeSessions}</p>
                </div>
                <Activity className="h-10 w-10 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card className={pendingReviews.length > 0 ? "border-destructive" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Break-Glass Events</p>
                  <p className="text-3xl font-bold">{stats.breakGlassCount}</p>
                  {pendingReviews.length > 0 && (
                    <p className="text-xs text-destructive mt-1">{pendingReviews.length} pending review</p>
                  )}
                </div>
                <AlertTriangle
                  className={`h-10 w-10 ${pendingReviews.length > 0 ? "text-destructive" : "text-primary/20"}`}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="break-glass">
              Break-Glass Logs
              {pendingReviews.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {pendingReviews.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Break-Glass Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Recent Break-Glass Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {breakGlassLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <div>
                          <p className="font-medium">{log.user?.full_name || "Unknown"}</p>
                          <p className="text-sm text-muted-foreground">
                            Patient: {log.patient_id} - {log.emergency_type}
                          </p>
                        </div>
                        <div className="text-right">
                          {log.reviewed_at ? (
                            <Badge variant="outline" className="text-green-600">
                              Reviewed
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Pending</Badge>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {mounted ? formatDate(log.accessed_at) : "..."}
                          </p>
                        </div>
                      </div>
                    ))}
                    {breakGlassLogs.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No break-glass events</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {auditLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                        {log.event_type.includes("success") ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                        ) : log.event_type.includes("failure") ? (
                          <XCircle className="h-5 w-5 text-destructive shrink-0" />
                        ) : (
                          <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{log.user?.full_name || "System"}</p>
                          <p className="text-sm text-muted-foreground">{log.event_type.replace(/_/g, " ")}</p>
                        </div>
                        <p className="text-xs text-muted-foreground shrink-0">
                          {mounted ? formatTime(log.created_at) : "..."}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Management</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name || "-"}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                        </TableCell>
                        <TableCell>{user.department || "-"}</TableCell>
                        <TableCell>{user.employee_id || "-"}</TableCell>
                        <TableCell>{mounted ? formatDate(user.created_at) : "..."}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Break-Glass Tab */}
          <TabsContent value="break-glass">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Break-Glass Access Logs
                </CardTitle>
                <CardDescription>Review and audit all emergency access events</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Emergency Type</TableHead>
                      <TableHead>Records Accessed</TableHead>
                      <TableHead>Accessed At</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {breakGlassLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{log.user?.full_name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{log.user?.role}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{log.patient_id}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.emergency_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{log.accessed_records?.length || 0} records</span>
                        </TableCell>
                        <TableCell>{mounted ? formatDateTime(log.accessed_at) : "..."}</TableCell>
                        <TableCell>
                          {log.reviewed_at ? (
                            <Badge variant="outline" className="text-green-600">
                              Reviewed by {log.reviewer?.full_name}
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Pending Review</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Authentication Audit Trail
                </CardTitle>
                <CardDescription>Complete log of all authentication events</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Device</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {mounted ? formatDateTime(log.created_at) : "..."}
                        </TableCell>
                        <TableCell>{log.user?.full_name || "System"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              log.event_type.includes("success")
                                ? "default"
                                : log.event_type.includes("failure")
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {log.event_type.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.auth_method || "-"}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm">{log.device_id || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
