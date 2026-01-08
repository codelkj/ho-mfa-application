"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Brain, Activity, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase-client"

export function MlRiskScoringTest({ enabled }: { enabled: boolean }) {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function testMlRiskScoring() {
    setTesting(true)
    setResult(null)

    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("User not authenticated")

      // Call the extract_risk_features function
      const { data, error } = await supabase.rpc("extract_risk_features", {
        p_user_id: user.id,
        p_ip_address: "192.168.1.100",
        p_device_id: "test-device-123",
        p_location: "Hospital Network",
      })

      if (error) throw error

      // Calculate mock risk score based on features
      const features = data
      let riskScore = 0.5

      if (features.failed_attempts_1h > 0) riskScore += 0.2
      if (!features.is_known_ip) riskScore += 0.15
      if (!features.is_known_device) riskScore += 0.15
      if (features.is_weekend) riskScore += 0.05

      riskScore = Math.min(riskScore, 1.0)

      const riskLevel = riskScore < 0.3 ? "low" : riskScore < 0.7 ? "medium" : "high"

      setResult({
        success: true,
        features,
        riskScore,
        riskLevel,
      })
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "Failed to calculate risk score",
      })
    } finally {
      setTesting(false)
    }
  }

  if (!enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ML Risk Scoring</CardTitle>
          <CardDescription>Machine learning-based adaptive risk calculation</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>This feature is currently disabled. Enable it in Settings to test.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          ML Risk Scoring Test
        </CardTitle>
        <CardDescription>Test machine learning-based risk assessment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testMlRiskScoring} disabled={testing} className="w-full">
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Activity className="mr-2 h-4 w-4" />
              Calculate Risk Score
            </>
          )}
        </Button>

        {result && result.success && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Risk assessment completed successfully</AlertDescription>
            </Alert>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <span className="font-medium">Risk Score</span>
                <Badge
                  variant={
                    result.riskLevel === "low" ? "default" : result.riskLevel === "medium" ? "secondary" : "destructive"
                  }
                >
                  {(result.riskScore * 100).toFixed(0)}% - {result.riskLevel.toUpperCase()}
                </Badge>
              </div>

              <div className="p-4 border rounded-lg space-y-2">
                <p className="font-medium">Feature Analysis</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Recent Sessions (24h):</div>
                  <div className="font-mono">{result.features.recent_sessions_24h}</div>

                  <div>Failed Attempts (1h):</div>
                  <div className="font-mono">{result.features.failed_attempts_1h}</div>

                  <div>Known IP:</div>
                  <div className="font-mono">{result.features.is_known_ip ? "Yes" : "No"}</div>

                  <div>Known Device:</div>
                  <div className="font-mono">{result.features.is_known_device ? "Yes" : "No"}</div>

                  <div>Time of Day:</div>
                  <div className="font-mono">{result.features.hour_of_day}:00</div>

                  <div>Weekend:</div>
                  <div className="font-mono">{result.features.is_weekend ? "Yes" : "No"}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {result && !result.success && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
