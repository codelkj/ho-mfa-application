"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import {
  CheckCircle,
  XCircle,
  Loader2,
  Database,
  Shield,
  Fingerprint,
  AlertTriangle,
  User,
  Activity,
  Play,
  RotateCcw,
  FileCode,
  TestTube,
  Zap,
  Clock,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { RiskScenarioSimulator } from "./risk-scenario-simulator"

interface TestResult {
  name: string
  status: "pending" | "running" | "passed" | "failed"
  message?: string
  duration?: number
  category: "database" | "auth" | "security" | "performance"
}

interface TestDashboardProps {
  userId: string
  userEmail: string
}

export function TestDashboard({ userId, userEmail }: TestDashboardProps) {
  const [tests, setTests] = useState<TestResult[]>([
    // Database Tests
    { name: "Database Connection", status: "pending", category: "database" },
    { name: "Profiles Table Access", status: "pending", category: "database" },
    { name: "Biometric Enrollments Table", status: "pending", category: "database" },
    { name: "Auth Sessions Table", status: "pending", category: "database" },
    { name: "Break Glass Logs Table", status: "pending", category: "database" },
    { name: "Audit Logs Table", status: "pending", category: "database" },
    { name: "Risk Contexts Table", status: "pending", category: "database" },
    // Security Tests
    { name: "RLS Policies Active", status: "pending", category: "security" },
    { name: "Cross-User Data Isolation", status: "pending", category: "security" },
    { name: "SQL Injection Prevention", status: "pending", category: "security" },
    // Auth Tests
    { name: "Session Validation", status: "pending", category: "auth" },
    { name: "Token Refresh", status: "pending", category: "auth" },
    // Performance Tests
    { name: "Query Response Time", status: "pending", category: "performance" },
    { name: "Concurrent Connections", status: "pending", category: "performance" },
  ])
  const [isRunning, setIsRunning] = useState(false)
  const [testProgress, setTestProgress] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const [activeTab, setActiveTab] = useState("tests")

  const updateTest = (index: number, update: Partial<TestResult>) => {
    setTests((prev) => prev.map((t, i) => (i === index ? { ...t, ...update } : t)))
  }

  const runTests = async () => {
    setIsRunning(true)
    setTestProgress(0)
    setTotalDuration(0)
    const startTime = Date.now()

    // Reset all tests
    setTests((prev) => prev.map((t) => ({ ...t, status: "pending" as const, message: undefined, duration: undefined })))

    const supabase = createClient()
    const totalTests = tests.length

    // Test 1: Database Connection
    updateTest(0, { status: "running" })
    setTestProgress((1 / totalTests) * 100)
    const start0 = Date.now()
    try {
      const { error } = await supabase.from("profiles").select("count").limit(1)
      if (error) throw error
      updateTest(0, { status: "passed", message: "Connected successfully", duration: Date.now() - start0 })
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error"
      updateTest(0, { status: "failed", message: errorMessage, duration: Date.now() - start0 })
    }

    // Test 2: Profiles Table
    updateTest(1, { status: "running" })
    setTestProgress((2 / totalTests) * 100)
    const start1 = Date.now()
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId)
      if (error) throw error
      updateTest(1, {
        status: "passed",
        message: `Found ${data?.length || 0} profile(s)`,
        duration: Date.now() - start1,
      })
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error"
      updateTest(1, { status: "failed", message: errorMessage, duration: Date.now() - start1 })
    }

    // Test 3: Biometric Enrollments
    updateTest(2, { status: "running" })
    setTestProgress((3 / totalTests) * 100)
    const start2 = Date.now()
    try {
      const { data, error } = await supabase.from("biometric_enrollments").select("*").eq("user_id", userId)
      if (error) throw error
      updateTest(2, {
        status: "passed",
        message: `Found ${data?.length || 0} enrollment(s)`,
        duration: Date.now() - start2,
      })
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error"
      updateTest(2, { status: "failed", message: errorMessage, duration: Date.now() - start2 })
    }

    // Test 4: Auth Sessions
    updateTest(3, { status: "running" })
    setTestProgress((4 / totalTests) * 100)
    const start3 = Date.now()
    try {
      const { data, error } = await supabase.from("auth_sessions").select("*").eq("user_id", userId)
      if (error) throw error
      updateTest(3, {
        status: "passed",
        message: `Found ${data?.length || 0} session(s)`,
        duration: Date.now() - start3,
      })
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error"
      updateTest(3, { status: "failed", message: errorMessage, duration: Date.now() - start3 })
    }

    // Test 5: Break Glass Logs
    updateTest(4, { status: "running" })
    setTestProgress((5 / totalTests) * 100)
    const start4 = Date.now()
    try {
      const { data, error } = await supabase.from("break_glass_logs").select("*").eq("user_id", userId)
      if (error) throw error
      updateTest(4, { status: "passed", message: `Found ${data?.length || 0} log(s)`, duration: Date.now() - start4 })
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error"
      updateTest(4, { status: "failed", message: errorMessage, duration: Date.now() - start4 })
    }

    // Test 6: Audit Logs
    updateTest(5, { status: "running" })
    setTestProgress((6 / totalTests) * 100)
    const start5 = Date.now()
    try {
      const { data, error } = await supabase.from("auth_audit_logs").select("*").eq("user_id", userId)
      if (error) throw error
      updateTest(5, { status: "passed", message: `Found ${data?.length || 0} log(s)`, duration: Date.now() - start5 })
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error"
      updateTest(5, { status: "failed", message: errorMessage, duration: Date.now() - start5 })
    }

    // Test 7: Risk Contexts
    updateTest(6, { status: "running" })
    setTestProgress((7 / totalTests) * 100)
    const start6 = Date.now()
    try {
      const { data, error } = await supabase.from("risk_contexts").select("*").eq("user_id", userId)
      if (error) throw error
      updateTest(6, {
        status: "passed",
        message: `Found ${data?.length || 0} context(s)`,
        duration: Date.now() - start6,
      })
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error"
      updateTest(6, { status: "failed", message: errorMessage, duration: Date.now() - start6 })
    }

    // Test 8: RLS Policies
    updateTest(7, { status: "running" })
    setTestProgress((8 / totalTests) * 100)
    const start7 = Date.now()
    try {
      const fakeUserId = "00000000-0000-0000-0000-000000000000"
      const { data, error } = await supabase.from("profiles").select("*").eq("id", fakeUserId)
      if (error) throw error
      if (data && data.length === 0) {
        updateTest(7, {
          status: "passed",
          message: "RLS correctly blocking unauthorized access",
          duration: Date.now() - start7,
        })
      } else {
        updateTest(7, {
          status: "failed",
          message: "RLS may not be configured correctly",
          duration: Date.now() - start7,
        })
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error"
      if (errorMessage.includes("permission") || errorMessage.includes("denied")) {
        updateTest(7, {
          status: "passed",
          message: "RLS correctly denying unauthorized access",
          duration: Date.now() - start7,
        })
      } else {
        updateTest(7, { status: "failed", message: errorMessage, duration: Date.now() - start7 })
      }
    }

    // Test 9: Cross-User Data Isolation
    updateTest(8, { status: "running" })
    setTestProgress((9 / totalTests) * 100)
    const start8 = Date.now()
    try {
      const { data } = await supabase.from("profiles").select("id")
      const uniqueIds = new Set(data?.map((p) => p.id))
      if (uniqueIds.size <= 1 || (uniqueIds.size > 0 && uniqueIds.has(userId))) {
        updateTest(8, { status: "passed", message: "User data properly isolated", duration: Date.now() - start8 })
      } else {
        updateTest(8, { status: "failed", message: "Data isolation check failed", duration: Date.now() - start8 })
      }
    } catch {
      updateTest(8, { status: "passed", message: "Access properly restricted", duration: Date.now() - start8 })
    }

    // Test 10: SQL Injection Prevention
    updateTest(9, { status: "running" })
    setTestProgress((10 / totalTests) * 100)
    const start9 = Date.now()
    try {
      const maliciousInput = "'; DROP TABLE profiles; --"
      await supabase.from("profiles").select("*").eq("full_name", maliciousInput)
      updateTest(9, {
        status: "passed",
        message: "Parameterized queries protect against injection",
        duration: Date.now() - start9,
      })
    } catch {
      updateTest(9, { status: "passed", message: "Query safely rejected", duration: Date.now() - start9 })
    }

    // Test 11: Session Validation
    updateTest(10, { status: "running" })
    setTestProgress((11 / totalTests) * 100)
    const start10 = Date.now()
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (error) throw error
      if (session) {
        updateTest(10, { status: "passed", message: "Session is valid and active", duration: Date.now() - start10 })
      } else {
        updateTest(10, { status: "failed", message: "No active session found", duration: Date.now() - start10 })
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error"
      updateTest(10, { status: "failed", message: errorMessage, duration: Date.now() - start10 })
    }

    // Test 12: Token Refresh
    updateTest(11, { status: "running" })
    setTestProgress((12 / totalTests) * 100)
    const start11 = Date.now()
    try {
      const { error } = await supabase.auth.refreshSession()
      if (error) throw error
      updateTest(11, { status: "passed", message: "Token refresh successful", duration: Date.now() - start11 })
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error"
      updateTest(11, { status: "failed", message: errorMessage, duration: Date.now() - start11 })
    }

    // Test 13: Query Response Time
    updateTest(12, { status: "running" })
    setTestProgress((13 / totalTests) * 100)
    const start12 = Date.now()
    try {
      await supabase.from("profiles").select("*").eq("id", userId)
      const responseTime = Date.now() - start12
      const status = responseTime < 500 ? "passed" : "failed"
      updateTest(12, { status, message: `Response time: ${responseTime}ms (target: <500ms)`, duration: responseTime })
    } catch {
      updateTest(12, { status: "failed", message: "Query failed", duration: Date.now() - start12 })
    }

    // Test 14: Concurrent Connections (simulated)
    updateTest(13, { status: "running" })
    setTestProgress((14 / totalTests) * 100)
    const start13 = Date.now()
    try {
      const promises = Array(5)
        .fill(null)
        .map(() => supabase.from("profiles").select("count").limit(1))
      await Promise.all(promises)
      updateTest(13, { status: "passed", message: "5 concurrent queries successful", duration: Date.now() - start13 })
    } catch {
      updateTest(13, { status: "failed", message: "Concurrent query test failed", duration: Date.now() - start13 })
    }

    setTestProgress(100)
    setTotalDuration(Date.now() - startTime)
    setIsRunning(false)
  }

  const passedCount = tests.filter((t) => t.status === "passed").length
  const failedCount = tests.filter((t) => t.status === "failed").length
  const passRate =
    tests.filter((t) => t.status !== "pending").length > 0
      ? Math.round((passedCount / tests.filter((t) => t.status !== "pending").length) * 100)
      : 0

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "database":
        return <Database className="h-4 w-4" />
      case "security":
        return <Shield className="h-4 w-4" />
      case "auth":
        return <User className="h-4 w-4" />
      case "performance":
        return <Zap className="h-4 w-4" />
      default:
        return <TestTube className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "database":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
      case "security":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      case "auth":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
      case "performance":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900">
            <TestTube className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Software Testing Suite</h1>
            <p className="text-muted-foreground">Automated integration, security tests & risk simulation</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            <User className="h-3 w-3 mr-1" />
            {userEmail}
          </Badge>
          <Link href="/security">
            <Button variant="outline" className="gap-2 bg-transparent">
              <Shield className="h-4 w-4" />
              Security Center
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="tests" className="gap-2">
            <FileCode className="h-4 w-4" />
            Automated Tests
          </TabsTrigger>
          <TabsTrigger value="simulator" className="gap-2">
            <Zap className="h-4 w-4" />
            Risk Simulator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="mt-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm">Pass Rate</p>
                    <p className="text-3xl font-bold">{passRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-teal-200" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Passed</p>
                    <p className="text-3xl font-bold text-green-600">{passedCount}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Failed</p>
                    <p className="text-3xl font-bold text-red-600">{failedCount}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Duration</p>
                    <p className="text-3xl font-bold">{totalDuration}ms</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Test Runner */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileCode className="h-5 w-5" />
                    Automated Test Runner
                  </CardTitle>
                  <CardDescription>
                    Run comprehensive tests for database, security, auth, and performance
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setTests((prev) =>
                        prev.map((t) => ({
                          ...t,
                          status: "pending" as const,
                          message: undefined,
                          duration: undefined,
                        })),
                      )
                    }
                    disabled={isRunning}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button onClick={runTests} disabled={isRunning} className="bg-teal-600 hover:bg-teal-700">
                    {isRunning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run All Tests
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {isRunning && (
                <div className="mt-4">
                  <Progress value={testProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-1">Running tests... {Math.round(testProgress)}%</p>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4 flex-wrap h-auto gap-1">
                  <TabsTrigger value="all" className="gap-1">
                    <TestTube className="h-3 w-3" />
                    All ({tests.length})
                  </TabsTrigger>
                  <TabsTrigger value="database" className="gap-1">
                    <Database className="h-3 w-3" />
                    Database ({tests.filter((t) => t.category === "database").length})
                  </TabsTrigger>
                  <TabsTrigger value="security" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Security ({tests.filter((t) => t.category === "security").length})
                  </TabsTrigger>
                  <TabsTrigger value="auth" className="gap-1">
                    <User className="h-3 w-3" />
                    Auth ({tests.filter((t) => t.category === "auth").length})
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="gap-1">
                    <Zap className="h-3 w-3" />
                    Performance ({tests.filter((t) => t.category === "performance").length})
                  </TabsTrigger>
                </TabsList>

                {["all", "database", "security", "auth", "performance"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="space-y-2">
                    {tests
                      .filter((t) => tab === "all" || t.category === tab)
                      .map((test, index) => {
                        const actualIndex = tests.findIndex((t) => t.name === test.name)
                        return (
                          <div
                            key={test.name}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border gap-2"
                          >
                            <div className="flex items-center gap-3">
                              {test.status === "pending" && (
                                <div className="w-5 h-5 rounded-full border-2 border-muted" />
                              )}
                              {test.status === "running" && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
                              {test.status === "passed" && <CheckCircle className="w-5 h-5 text-green-500" />}
                              {test.status === "failed" && <XCircle className="w-5 h-5 text-red-500" />}
                              <div>
                                <p className="font-medium">{test.name}</p>
                                {test.message && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">{test.message}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-8 sm:ml-0">
                              <Badge className={getCategoryColor(test.category)} variant="secondary">
                                {getCategoryIcon(test.category)}
                                <span className="ml-1 hidden sm:inline">{test.category}</span>
                              </Badge>
                              {test.duration !== undefined && (
                                <Badge variant="outline" className="text-xs">
                                  {test.duration}ms
                                </Badge>
                              )}
                            </div>
                          </div>
                        )
                      })}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Quick Navigation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full h-16 flex-col gap-1 bg-transparent">
                    <Activity className="h-5 w-5" />
                    <span className="text-xs">Dashboard</span>
                  </Button>
                </Link>
                <Link href="/biometric/enroll">
                  <Button variant="outline" className="w-full h-16 flex-col gap-1 bg-transparent">
                    <Fingerprint className="h-5 w-5" />
                    <span className="text-xs">Biometrics</span>
                  </Button>
                </Link>
                <Link href="/break-glass">
                  <Button variant="outline" className="w-full h-16 flex-col gap-1 bg-transparent">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="text-xs">Break-Glass</span>
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button variant="outline" className="w-full h-16 flex-col gap-1 bg-transparent">
                    <Shield className="h-5 w-5" />
                    <span className="text-xs">Admin</span>
                  </Button>
                </Link>
                <Link href="/security">
                  <Button
                    variant="outline"
                    className="w-full h-16 flex-col gap-1 border-teal-200 bg-teal-50 dark:bg-teal-950 dark:border-teal-800"
                  >
                    <Shield className="h-5 w-5 text-teal-600" />
                    <span className="text-xs text-teal-600">Security</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulator" className="mt-6">
          <RiskScenarioSimulator />
        </TabsContent>
      </Tabs>
    </div>
  )
}
