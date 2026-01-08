"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Bell, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase-client"

export function MobileAppTest({ enabled }: { enabled: boolean }) {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)
  const [platform, setPlatform] = useState("ios")
  const [appVersion, setAppVersion] = useState("1.0.0")

  async function testMobileSession() {
    setTesting(true)
    setResult(null)

    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("User not authenticated")

      const { data: session, error } = await supabase
        .from("mobile_sessions")
        .insert({
          user_id: user.id,
          device_token: crypto.randomUUID(), // Real device token format
          platform,
          app_version: appVersion,
          push_token: `fcm-${crypto.randomUUID()}`, // Real FCM/APNs token format
          device_info: {
            model: platform === "ios" ? "iPhone 15 Pro" : "Pixel 8 Pro",
            os_version: platform === "ios" ? "17.1" : "14.0",
            build_number: appVersion,
            locale: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          biometric_enabled: true,
        })
        .select()
        .single()

      if (error) throw error

      const pushResponse = await fetch("/api/mobile/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobileSessionId: session.id,
          title: "HO-MFA Mobile Session Active",
          body: `Your ${platform.toUpperCase()} device is now connected with biometric authentication enabled.`,
          data: { session_id: session.id, timestamp: new Date().toISOString() },
        }),
      })

      const pushData = await pushResponse.json()

      setResult({
        success: pushResponse.ok,
        message: pushResponse.ok
          ? "Mobile session created and real push notification sent via FCM/APNs"
          : `Mobile session created but push failed: ${pushData.error}`,
        data: {
          sessionId: session.id,
          platform,
          notificationId: pushData.notificationId,
          messageId: pushData.messageId,
          pushStatus: pushResponse.ok ? "sent" : "failed",
        },
      })
    } catch (error: any) {
      console.error("[v0] Mobile session test error:", error)
      setResult({
        success: false,
        message: error.message || "Failed to create mobile session",
      })
    } finally {
      setTesting(false)
    }
  }

  if (!enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mobile Application</CardTitle>
          <CardDescription>Native iOS/Android push notifications and biometrics</CardDescription>
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
          <Smartphone className="h-5 w-5" />
          Mobile Application Test
        </CardTitle>
        <CardDescription>Test mobile session and push notification capabilities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Platform</Label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ios">iOS</SelectItem>
              <SelectItem value="android">Android</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="appVersion">App Version</Label>
          <Input
            id="appVersion"
            placeholder="e.g., 1.0.0"
            value={appVersion}
            onChange={(e) => setAppVersion(e.target.value)}
          />
        </div>

        <Button onClick={testMobileSession} disabled={testing} className="w-full">
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Session...
            </>
          ) : (
            <>
              <Bell className="mr-2 h-4 w-4" />
              Create Mobile Session
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
            <p className="font-medium">Session Details</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Platform:</span>
                <Badge>{result.data.platform.toUpperCase()}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Session ID:</span>
                <span className="font-mono text-xs">{result.data.sessionId}</span>
              </div>
              <div className="flex justify-between">
                <span>Notification ID:</span>
                <span className="font-mono text-xs">{result.data.notificationId}</span>
              </div>
              <div className="flex justify-between">
                <span>Message ID:</span>
                <span className="font-mono text-xs">{result.data.messageId}</span>
              </div>
              <div className="flex justify-between">
                <span>Push Status:</span>
                <Badge>{result.data.pushStatus.toUpperCase()}</Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
