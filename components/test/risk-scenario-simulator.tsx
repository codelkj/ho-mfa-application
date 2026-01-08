"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertTriangle,
  Shield,
  MapPin,
  Clock,
  Smartphone,
  Fingerprint,
  Eye,
  Activity,
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RiskFactor {
  id: string
  name: string
  icon: React.ReactNode
  weight: number
  enabled: boolean
  value: number
}

interface SimulationResult {
  riskScore: number
  riskLevel: "low" | "medium" | "high" | "critical"
  recommendation: string
  requiredFactors: string[]
  adaptiveResponse: string
}

export function RiskScenarioSimulator() {
  const [isSimulating, setIsSimulating] = useState(false)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [scenario, setScenario] = useState("routine_access")

  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([
    {
      id: "location",
      name: "Unknown Location",
      icon: <MapPin className="w-4 h-4" />,
      weight: 20,
      enabled: false,
      value: 0,
    },
    { id: "time", name: "Unusual Time", icon: <Clock className="w-4 h-4" />, weight: 15, enabled: false, value: 0 },
    {
      id: "device",
      name: "New Device",
      icon: <Smartphone className="w-4 h-4" />,
      weight: 25,
      enabled: false,
      value: 0,
    },
    {
      id: "failed_attempts",
      name: "Failed Login Attempts",
      icon: <XCircle className="w-4 h-4" />,
      weight: 30,
      enabled: false,
      value: 0,
    },
    {
      id: "vpn",
      name: "VPN/Proxy Detected",
      icon: <Shield className="w-4 h-4" />,
      weight: 10,
      enabled: false,
      value: 0,
    },
    {
      id: "behavior",
      name: "Anomalous Behavior",
      icon: <Activity className="w-4 h-4" />,
      weight: 35,
      enabled: false,
      value: 0,
    },
  ])

  const [authFactors, setAuthFactors] = useState({
    password: true,
    fingerprint: false,
    facial: false,
    otp: false,
  })

  const scenarios = [
    { value: "routine_access", label: "Routine Access - Normal workday login" },
    { value: "emergency_access", label: "Emergency Access - Break-glass scenario" },
    { value: "remote_access", label: "Remote Access - Work from home" },
    { value: "new_device", label: "New Device - First login from device" },
    { value: "after_hours", label: "After Hours - Late night access" },
    { value: "high_risk", label: "High Risk - Multiple risk factors" },
  ]

  const applyScenario = (scenarioValue: string) => {
    setScenario(scenarioValue)
    setResult(null)

    // Reset all factors
    const resetFactors = riskFactors.map((f) => ({ ...f, enabled: false, value: 0 }))

    switch (scenarioValue) {
      case "routine_access":
        setRiskFactors(resetFactors)
        setAuthFactors({ password: true, fingerprint: false, facial: false, otp: false })
        break
      case "emergency_access":
        setRiskFactors(resetFactors.map((f) => (f.id === "time" ? { ...f, enabled: true, value: 50 } : f)))
        setAuthFactors({ password: true, fingerprint: false, facial: false, otp: false })
        break
      case "remote_access":
        setRiskFactors(
          resetFactors.map((f) =>
            f.id === "location"
              ? { ...f, enabled: true, value: 60 }
              : f.id === "vpn"
                ? { ...f, enabled: true, value: 40 }
                : f,
          ),
        )
        setAuthFactors({ password: true, fingerprint: false, facial: false, otp: true })
        break
      case "new_device":
        setRiskFactors(resetFactors.map((f) => (f.id === "device" ? { ...f, enabled: true, value: 80 } : f)))
        setAuthFactors({ password: true, fingerprint: true, facial: false, otp: true })
        break
      case "after_hours":
        setRiskFactors(
          resetFactors.map((f) =>
            f.id === "time"
              ? { ...f, enabled: true, value: 70 }
              : f.id === "behavior"
                ? { ...f, enabled: true, value: 30 }
                : f,
          ),
        )
        setAuthFactors({ password: true, fingerprint: true, facial: false, otp: false })
        break
      case "high_risk":
        setRiskFactors(resetFactors.map((f) => ({ ...f, enabled: true, value: 70 })))
        setAuthFactors({ password: true, fingerprint: true, facial: true, otp: true })
        break
    }
  }

  const updateFactor = (id: string, updates: Partial<RiskFactor>) => {
    setRiskFactors((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)))
    setResult(null)
  }

  const runSimulation = async () => {
    setIsSimulating(true)

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Calculate risk score
    const enabledFactors = riskFactors.filter((f) => f.enabled)
    let riskScore = 0
    enabledFactors.forEach((factor) => {
      riskScore += (factor.weight * factor.value) / 100
    })

    // Normalize to 0-100
    riskScore = Math.min(100, Math.round(riskScore))

    // Calculate auth strength
    const authStrength =
      (authFactors.password ? 20 : 0) +
      (authFactors.fingerprint ? 30 : 0) +
      (authFactors.facial ? 30 : 0) +
      (authFactors.otp ? 20 : 0)

    // Adjust risk based on auth strength
    const adjustedRisk = Math.max(0, riskScore - authStrength / 2)

    // Determine risk level
    let riskLevel: SimulationResult["riskLevel"]
    let recommendation: string
    let requiredFactors: string[] = []
    let adaptiveResponse: string

    if (adjustedRisk <= 20) {
      riskLevel = "low"
      recommendation = "Standard authentication sufficient"
      requiredFactors = ["Password"]
      adaptiveResponse = "Allow access with standard logging"
    } else if (adjustedRisk <= 45) {
      riskLevel = "medium"
      recommendation = "Additional verification recommended"
      requiredFactors = ["Password", "Biometric OR OTP"]
      adaptiveResponse = "Prompt for secondary authentication factor"
    } else if (adjustedRisk <= 70) {
      riskLevel = "high"
      recommendation = "Multi-factor authentication required"
      requiredFactors = ["Password", "Biometric", "OTP"]
      adaptiveResponse = "Require all available authentication factors"
    } else {
      riskLevel = "critical"
      recommendation = "Access should be blocked or escalated"
      requiredFactors = ["Password", "Biometric", "OTP", "Supervisor Approval"]
      adaptiveResponse = "Block access and notify security team"
    }

    setResult({
      riskScore: adjustedRisk,
      riskLevel,
      recommendation,
      requiredFactors,
      adaptiveResponse,
    })

    setIsSimulating(false)
  }

  const getRiskColor = (level: SimulationResult["riskLevel"]) => {
    switch (level) {
      case "low":
        return "bg-green-500"
      case "medium":
        return "bg-yellow-500"
      case "high":
        return "bg-orange-500"
      case "critical":
        return "bg-red-500"
    }
  }

  const getRiskBgColor = (level: SimulationResult["riskLevel"]) => {
    switch (level) {
      case "low":
        return "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
      case "medium":
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800"
      case "high":
        return "bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800"
      case "critical":
        return "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Scenario Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" />
            Risk Scenario Simulator
          </CardTitle>
          <CardDescription>Simulate different access scenarios to demonstrate adaptive MFA behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Scenario Preset</Label>
            <Select value={scenario} onValueChange={applyScenario}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {scenarios.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Factors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Risk Factors
            </CardTitle>
            <CardDescription>Toggle and adjust risk factor intensity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {riskFactors.map((factor) => (
              <div key={factor.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={factor.enabled}
                      onCheckedChange={(checked) => updateFactor(factor.id, { enabled: checked })}
                    />
                    <span className={cn("flex items-center gap-2", !factor.enabled && "text-muted-foreground")}>
                      {factor.icon}
                      {factor.name}
                    </span>
                  </div>
                  <Badge variant={factor.enabled ? "default" : "secondary"}>Weight: {factor.weight}</Badge>
                </div>
                {factor.enabled && (
                  <div className="pl-10 flex items-center gap-4">
                    <Slider
                      value={[factor.value]}
                      onValueChange={([value]) => updateFactor(factor.id, { value })}
                      max={100}
                      step={10}
                      className="flex-1"
                    />
                    <span className="text-sm w-12 text-right">{factor.value}%</span>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Authentication Factors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-teal-500" />
              Authentication Factors
            </CardTitle>
            <CardDescription>Select available authentication methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-xs text-muted-foreground">Basic authentication</p>
                </div>
              </div>
              <Switch
                checked={authFactors.password}
                onCheckedChange={(checked) => setAuthFactors((prev) => ({ ...prev, password: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                  <Fingerprint className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="font-medium">Fingerprint</p>
                  <p className="text-xs text-muted-foreground">Biometric verification</p>
                </div>
              </div>
              <Switch
                checked={authFactors.fingerprint}
                onCheckedChange={(checked) => setAuthFactors((prev) => ({ ...prev, fingerprint: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Facial Recognition</p>
                  <p className="text-xs text-muted-foreground">Biometric verification</p>
                </div>
              </div>
              <Switch
                checked={authFactors.facial}
                onCheckedChange={(checked) => setAuthFactors((prev) => ({ ...prev, facial: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">OTP / Push Notification</p>
                  <p className="text-xs text-muted-foreground">Second factor</p>
                </div>
              </div>
              <Switch
                checked={authFactors.otp}
                onCheckedChange={(checked) => setAuthFactors((prev) => ({ ...prev, otp: checked }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Run Simulation */}
      <div className="flex gap-3">
        <Button
          onClick={runSimulation}
          disabled={isSimulating}
          className="flex-1 h-12 text-lg bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
        >
          {isSimulating ? (
            <>
              <Activity className="w-5 h-5 mr-2 animate-pulse" />
              Analyzing Risk Profile...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Run Simulation
            </>
          )}
        </Button>
        <Button variant="outline" onClick={() => applyScenario("routine_access")} disabled={isSimulating}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Simulation Result */}
      {result && (
        <Card className={cn("border-2", getRiskBgColor(result.riskLevel))}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className={cn("w-4 h-4 rounded-full", getRiskColor(result.riskLevel))} />
              Simulation Result
              <Badge
                variant="outline"
                className={cn(
                  result.riskLevel === "low" && "border-green-500 text-green-700",
                  result.riskLevel === "medium" && "border-yellow-500 text-yellow-700",
                  result.riskLevel === "high" && "border-orange-500 text-orange-700",
                  result.riskLevel === "critical" && "border-red-500 text-red-700",
                )}
              >
                {result.riskLevel.toUpperCase()} RISK
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-background">
                <p className="text-4xl font-bold">{result.riskScore}</p>
                <p className="text-sm text-muted-foreground">Adjusted Risk Score</p>
              </div>
              <div className="md:col-span-2 p-4 rounded-lg bg-background">
                <p className="font-medium mb-1">Recommendation</p>
                <p className="text-muted-foreground">{result.recommendation}</p>
              </div>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Adaptive Response</AlertTitle>
              <AlertDescription>{result.adaptiveResponse}</AlertDescription>
            </Alert>

            <div>
              <p className="font-medium mb-2">Required Authentication Factors</p>
              <div className="flex flex-wrap gap-2">
                {result.requiredFactors.map((factor, i) => (
                  <Badge key={i} variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
