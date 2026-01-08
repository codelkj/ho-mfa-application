"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, AlertTriangle, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase-client"

export function BreakGlassTest({ enabled }: { enabled: boolean }) {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)
  const [reason, setReason] = useState("")

  async function testBreakGlass() {
    if (!reason.trim()) {
      setResult({
        success: false,
        message: "Emergency reason is required",
      })
      return
    }

    setTesting(true)
    setResult(null)

    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("User not authenticated")

      const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single()

      if (!profile) throw new Error("Profile not found")

      // Log break-glass access
      const { data, error } = await supabase
        .from("break_glass_logs")
        .insert({
          user_id: user.id,
          organization_id: profile.organization_id,
          reason,
          patient_id: "EMERGENCY-" + Date.now(),
          access_level: "full",
          approved: false,
          requires_review: true,
        })
        .select()
        .single()

      if (error) throw error

      setResult({
        success: true,
        message: "Break-glass access logged. Awaiting supervisor review.",
        data: {
          logId: data.id,
          timestamp: data.created_at,
          requiresReview: data.requires_review,
        },
      })
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "Failed to initiate break-glass access",
      })
    } finally {
      setTesting(false)
    }
  }

  if (!enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Break-Glass Protocol</CardTitle>
          <CardDescription>Emergency access for critical patient care scenarios</CardDescription>
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
          <ShieldAlert className="h-5 w-5" />
          Break-Glass Protocol Test
        </CardTitle>
        <CardDescription>Test emergency access for critical care situations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Break-glass access is only for genuine emergencies. All usage is logged and audited.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="reason">Emergency Reason</Label>
          <Textarea
            id="reason"
            placeholder="Describe the emergency situation requiring immediate access..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />
        </div>

        <Button onClick={testBreakGlass} disabled={testing} variant="destructive" className="w-full">
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Initiating...
            </>
          ) : (
            <>
              <ShieldAlert className="mr-2 h-4 w-4" />
              Initiate Break-Glass Access
            </>
          )}
        </Button>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}

        {result && result.success && result.data && (
          <div className="p-4 border rounded-lg space-y-2">
            <p className="font-medium">Access Log Details</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant="secondary">Pending Review</Badge>
              </div>
              <div className="flex justify-between">
                <span>Log ID:</span>
                <span className="font-mono text-xs">{result.data.logId}</span>
              </div>
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <span className="font-mono text-xs">{new Date(result.data.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
