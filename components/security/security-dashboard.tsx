"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  FileWarning,
  Scan,
  Bug,
  Key,
  Globe,
  Server,
  Database,
  Clock,
  RefreshCw,
} from "lucide-react"
import { formatDate, formatDateTime } from "@/lib/utils/format-date"
import Link from "next/link"
import { ComplianceReportGenerator } from "./compliance-report-generator"

interface SecurityDashboardProps {
  userId: string
}

interface VulnerabilityScan {
  id: string
  name: string
  severity: "critical" | "high" | "medium" | "low" | "info"
  status: "open" | "mitigated" | "accepted"
  description: string
  recommendation: string
  detectedAt: Date
}

interface SecurityEvent {
  id: string
  type: string
  severity: "critical" | "high" | "medium" | "low"
  description: string
  ip_address: string
  timestamp: Date
  resolved: boolean
}

interface ComplianceCheck {
  id: string
  name: string
  category: string
  status: "passed" | "failed" | "warning"
  lastChecked: Date
  details: string
}

export function SecurityDashboard({ userId }: SecurityDashboardProps) {
  const [mounted, setMounted] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [lastScan, setLastScan] = useState<Date | null>(null)
  const [securityScore, setSecurityScore] = useState(0)
  const [threatLevel, setThreatLevel] = useState<"low" | "medium" | "high" | "critical">("low")

  // Simulated security data
  const [vulnerabilities] = useState<VulnerabilityScan[]>([
    {
      id: "1",
      name: "SQL Injection Prevention",
      severity: "info",
      status: "mitigated",
      description: "Parameterized queries implemented across all database operations",
      recommendation: "Continue using parameterized queries",
      detectedAt: new Date(Date.now() - 86400000 * 7),
    },
    {
      id: "2",
      name: "CSRF Token Validation",
      severity: "low",
      status: "mitigated",
      description: "All forms protected with CSRF tokens",
      recommendation: "Maintain CSRF protection on all state-changing requests",
      detectedAt: new Date(Date.now() - 86400000 * 5),
    },
    {
      id: "3",
      name: "Session Timeout Policy",
      severity: "medium",
      status: "mitigated",
      description: "Sessions expire after 30 minutes of inactivity per HIPAA requirements",
      recommendation: "Consider implementing sliding session windows",
      detectedAt: new Date(Date.now() - 86400000 * 3),
    },
    {
      id: "4",
      name: "RLS Policy Enforcement",
      severity: "info",
      status: "mitigated",
      description: "Row Level Security active on all sensitive tables",
      recommendation: "Regularly audit RLS policies",
      detectedAt: new Date(Date.now() - 86400000 * 2),
    },
  ])

  const [securityEvents] = useState<SecurityEvent[]>([
    {
      id: "1",
      type: "Failed Login Attempt",
      severity: "low",
      description: "Multiple failed login attempts detected",
      ip_address: "192.168.1.105",
      timestamp: new Date(Date.now() - 3600000),
      resolved: true,
    },
    {
      id: "2",
      type: "Break-Glass Access",
      severity: "high",
      description: "Emergency access triggered for patient PT-2024-001",
      ip_address: "192.168.1.101",
      timestamp: new Date(Date.now() - 7200000),
      resolved: true,
    },
    {
      id: "3",
      type: "New Device Login",
      severity: "medium",
      description: "Login from unrecognized device",
      ip_address: "10.0.0.50",
      timestamp: new Date(Date.now() - 86400000),
      resolved: true,
    },
  ])

  const [complianceChecks] = useState<ComplianceCheck[]>([
    {
      id: "1",
      name: "HIPAA Access Logging",
      category: "HIPAA",
      status: "passed",
      lastChecked: new Date(),
      details: "All PHI access is logged with user ID, timestamp, and action",
    },
    {
      id: "2",
      name: "Encryption at Rest",
      category: "HIPAA",
      status: "passed",
      lastChecked: new Date(),
      details: "Database encryption enabled via Supabase",
    },
    {
      id: "3",
      name: "Encryption in Transit",
      category: "HIPAA",
      status: "passed",
      lastChecked: new Date(),
      details: "TLS 1.3 enforced on all connections",
    },
    {
      id: "4",
      name: "Multi-Factor Authentication",
      category: "HIPAA",
      status: "passed",
      lastChecked: new Date(),
      details: "Biometric MFA available and enforced for PHI access",
    },
    {
      id: "5",
      name: "Audit Trail Integrity",
      category: "SOC 2",
      status: "passed",
      lastChecked: new Date(),
      details: "Tamper-evident logging with checksums",
    },
    {
      id: "6",
      name: "Access Control Lists",
      category: "SOC 2",
      status: "passed",
      lastChecked: new Date(),
      details: "Role-based access control implemented",
    },
    {
      id: "7",
      name: "Password Policy",
      category: "NIST",
      status: "passed",
      lastChecked: new Date(),
      details: "Minimum 8 characters, complexity requirements met",
    },
    {
      id: "8",
      name: "Session Management",
      category: "OWASP",
      status: "passed",
      lastChecked: new Date(),
      details: "Secure session handling with HttpOnly cookies",
    },
  ])

  useEffect(() => {
    setMounted(true)
    // Calculate security score based on vulnerabilities and compliance
    const mitigatedVulns = vulnerabilities.filter((v) => v.status === "mitigated").length
    const passedCompliance = complianceChecks.filter((c) => c.status === "passed").length
    const score = Math.round(
      (mitigatedVulns / vulnerabilities.length) * 50 + (passedCompliance / complianceChecks.length) * 50,
    )
    setSecurityScore(score)
    setLastScan(new Date(Date.now() - 3600000)) // 1 hour ago
  }, [vulnerabilities, complianceChecks])

  const runSecurityScan = async () => {
    setIsScanning(true)
    // Simulate security scan
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setLastScan(new Date())
    setIsScanning(false)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500 text-white"
      case "high":
        return "bg-orange-500 text-white"
      case "medium":
        return "bg-yellow-500 text-black"
      case "low":
        return "bg-blue-500 text-white"
      case "info":
        return "bg-slate-500 text-white"
      default:
        return "bg-slate-500 text-white"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
      case "mitigated":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
      case "open":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
      case "accepted":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    )
  }

  const criticalVulns = vulnerabilities.filter((v) => v.severity === "critical" && v.status === "open").length
  const highVulns = vulnerabilities.filter((v) => v.severity === "high" && v.status === "open").length
  const openEvents = securityEvents.filter((e) => !e.resolved).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900">
                <Shield className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Security Center</h1>
                <p className="text-muted-foreground">Monitor threats, vulnerabilities, and compliance</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ComplianceReportGenerator userId={userId} />
            <Button onClick={runSecurityScan} disabled={isScanning} variant="outline">
              {isScanning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Scan className="h-4 w-4 mr-2" />
                  Run Security Scan
                </>
              )}
            </Button>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Security Score */}
          <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-sm font-medium">Security Score</p>
                  <p className="text-4xl font-bold mt-1">{securityScore}</p>
                  <p className="text-teal-100 text-sm mt-1">
                    {securityScore >= 90 ? "Excellent" : securityScore >= 70 ? "Good" : "Needs Attention"}
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <ShieldCheck className="h-8 w-8" />
                </div>
              </div>
              <Progress value={securityScore} className="mt-4 bg-teal-400" />
            </CardContent>
          </Card>

          {/* Threat Level */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Threat Level</p>
                  <p className="text-2xl font-bold mt-1 capitalize text-green-600">{threatLevel}</p>
                  <p className="text-muted-foreground text-sm mt-1">{openEvents} active alerts</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <ShieldAlert className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vulnerabilities */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Vulnerabilities</p>
                  <p className="text-2xl font-bold mt-1">{criticalVulns + highVulns}</p>
                  <p className="text-muted-foreground text-sm mt-1">Open issues</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                  <Bug className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Last Scan */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Last Scan</p>
                  <p className="text-lg font-bold mt-1">{lastScan ? formatDateTime(lastScan) : "Never"}</p>
                  <p className="text-muted-foreground text-sm mt-1">Automated daily</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="vulnerabilities" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="vulnerabilities" className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              <span className="hidden sm:inline">Vulnerabilities</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <FileWarning className="h-4 w-4" />
              <span className="hidden sm:inline">Compliance</span>
            </TabsTrigger>
            <TabsTrigger value="policies" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Policies</span>
            </TabsTrigger>
          </TabsList>

          {/* Vulnerabilities Tab */}
          <TabsContent value="vulnerabilities">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Vulnerability Assessment
                </CardTitle>
                <CardDescription>Security vulnerabilities detected and their mitigation status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vulnerabilities.map((vuln) => (
                    <div
                      key={vuln.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {getStatusIcon(vuln.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{vuln.name}</p>
                            <Badge className={getSeverityColor(vuln.severity)}>{vuln.severity}</Badge>
                            <Badge variant="outline" className="capitalize">
                              {vuln.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{vuln.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            <span className="font-medium">Recommendation:</span> {vuln.recommendation}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(vuln.detectedAt)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Security Events
                </CardTitle>
                <CardDescription>Recent security-related events and incidents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {event.resolved ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{event.type}</p>
                            <Badge className={getSeverityColor(event.severity)}>{event.severity}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {event.ip_address}
                            </span>
                            <span>{formatDateTime(event.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={event.resolved ? "outline" : "destructive"}>
                        {event.resolved ? "Resolved" : "Active"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileWarning className="h-5 w-5" />
                  Compliance Status
                </CardTitle>
                <CardDescription>Regulatory compliance checks for HIPAA, SOC 2, NIST, and OWASP</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {["HIPAA", "SOC 2", "NIST", "OWASP"].map((category) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">{category}</h4>
                      <div className="space-y-2">
                        {complianceChecks
                          .filter((c) => c.category === category)
                          .map((check) => (
                            <div key={check.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                {getStatusIcon(check.status)}
                                <div>
                                  <p className="font-medium text-sm">{check.name}</p>
                                  <p className="text-xs text-muted-foreground">{check.details}</p>
                                </div>
                              </div>
                              <Badge
                                variant={check.status === "passed" ? "default" : "destructive"}
                                className={check.status === "passed" ? "bg-green-500" : ""}
                              >
                                {check.status}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Policies Tab */}
          <TabsContent value="policies">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Policies
                </CardTitle>
                <CardDescription>Active security policies and configurations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-teal-600" />
                      <h4 className="font-medium">Authentication Policy</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">MFA Required</span>
                        <Badge className="bg-green-500">Enabled</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Biometric Auth</span>
                        <Badge className="bg-green-500">Enabled</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Session Timeout</span>
                        <span className="font-medium">30 minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Login Attempts</span>
                        <span className="font-medium">5 attempts</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-teal-600" />
                      <h4 className="font-medium">Data Protection</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Encryption at Rest</span>
                        <Badge className="bg-green-500">AES-256</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Encryption in Transit</span>
                        <Badge className="bg-green-500">TLS 1.3</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">RLS Policies</span>
                        <Badge className="bg-green-500">Active</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Backup Frequency</span>
                        <span className="font-medium">Daily</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-teal-600" />
                      <h4 className="font-medium">Audit & Monitoring</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Access Logging</span>
                        <Badge className="bg-green-500">Enabled</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Break-Glass Alerts</span>
                        <Badge className="bg-green-500">Enabled</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Log Retention</span>
                        <span className="font-medium">7 years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Real-time Monitoring</span>
                        <Badge className="bg-green-500">Active</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <Server className="h-5 w-5 text-teal-600" />
                      <h4 className="font-medium">Network Security</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Firewall</span>
                        <Badge className="bg-green-500">Active</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">DDoS Protection</span>
                        <Badge className="bg-green-500">Cloudflare</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rate Limiting</span>
                        <Badge className="bg-green-500">Enabled</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IP Allowlist</span>
                        <span className="font-medium">Configurable</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
