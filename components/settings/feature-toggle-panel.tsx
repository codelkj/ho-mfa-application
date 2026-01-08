"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, Shield, Smartphone, Activity, GitBranch, Fingerprint, AlertCircle, RefreshCw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { FEATURES } from "@/lib/feature-flags"

export function FeatureTogglePanel() {
  const [features, setFeatures] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [organizationId, setOrganizationId] = useState<string | null>(null)

  useEffect(() => {
    loadFeatures()
  }, [])

  async function loadFeatures() {
    console.log("[v0] Loading features...")
    const supabase = createClient()
    setLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      console.log("[v0] User:", user?.id)

      if (!user) {
        setError("User not authenticated")
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, organization_id")
        .eq("id", user.id)
        .single()

      console.log("[v0] Profile:", profile)
      console.log("[v0] Profile error:", profileError)

      if (profileError) {
        setError(`Profile error: ${profileError.message}`)
        return
      }

      setIsAdmin(profile?.role === "admin")
      setOrganizationId(profile?.organization_id || null)
      console.log("[v0] Is admin:", profile?.role === "admin")

      if (profile?.organization_id) {
        const { data: flags, error: flagsError } = await supabase
          .from("feature_flags")
          .select("feature_key, is_enabled")
          .eq("organization_id", profile.organization_id)

        console.log("[v0] Flags:", flags)
        console.log("[v0] Flags error:", flagsError)

        if (flagsError) {
          setError(`Flags error: ${flagsError.message}`)
          return
        }

        const featureStates: Record<string, boolean> = {}
        flags?.forEach((flag) => {
          featureStates[flag.feature_key] = flag.is_enabled
        })

        console.log("[v0] Feature states:", featureStates)
        setFeatures(featureStates)
      }
    } catch (error) {
      console.error("[v0] Load features error:", error)
      setError(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  async function toggleFeature(featureKey: string) {
    console.log("[v0] Toggling feature:", featureKey, "isAdmin:", isAdmin)

    if (!isAdmin) {
      console.log("[v0] User is not admin, cannot toggle")
      return
    }

    const previousValue = features[featureKey]
    const newValue = !previousValue
    setFeatures((prev) => ({ ...prev, [featureKey]: newValue }))
    setError(null)

    const supabase = createClient()

    try {
      console.log("[v0] New value:", newValue)

      if (!organizationId) {
        throw new Error("Organization ID not found")
      }

      console.log("[v0] Updating feature flag with org ID:", organizationId)

      const { error: updateError } = await supabase
        .from("feature_flags")
        .update({
          is_enabled: newValue,
          rollout_percentage: newValue ? 100 : 0,
          updated_at: new Date().toISOString(),
        })
        .eq("organization_id", organizationId)
        .eq("feature_key", featureKey)

      console.log("[v0] Update error:", updateError)

      if (updateError) {
        setFeatures((prev) => ({ ...prev, [featureKey]: previousValue }))
        setError(`Failed to update ${featureKey}: ${updateError.message}`)
        console.error("[v0] Update failed, reverting to:", previousValue)
        return
      }

      console.log("[v0] Feature toggled successfully to:", newValue)
    } catch (error) {
      setFeatures((prev) => ({ ...prev, [featureKey]: previousValue }))
      console.error("[v0] Toggle feature error:", error)
      setError(error instanceof Error ? error.message : "Unknown error")
    }
  }

  const featureList = [
    {
      key: FEATURES.FIDO2_AUTH,
      title: "FIDO2 Authentication",
      description: "Hardware security key support (YubiKey, etc.)",
      icon: Shield,
      badge: "Hardware",
    },
    {
      key: FEATURES.ML_RISK_SCORING,
      title: "ML Risk Scoring",
      description: "Machine learning-based adaptive risk calculation",
      icon: Activity,
      badge: "AI",
    },
    {
      key: FEATURES.EHR_INTEGRATION,
      title: "EHR Integration",
      description: "HL7 FHIR integration with Epic, Cerner, and Meditech",
      icon: GitBranch,
      badge: "Integration",
    },
    {
      key: FEATURES.MOBILE_APP,
      title: "Mobile Application",
      description: "Native iOS/Android push notifications and biometrics",
      icon: Smartphone,
      badge: "Mobile",
    },
    {
      key: FEATURES.BIOMETRIC_VERIFICATION,
      title: "Biometric Verification",
      description: "Fingerprint and facial recognition authentication",
      icon: Fingerprint,
      badge: "Biometric",
    },
    {
      key: FEATURES.BREAK_GLASS,
      title: "Break-Glass Protocol",
      description: "Emergency access for critical patient care scenarios",
      icon: AlertCircle,
      badge: "Emergency",
    },
  ]

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isAdmin && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Feature toggles can only be modified by administrators. Contact your system administrator to enable or
            disable features.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>Enable or disable advanced features for gradual rollout and testing</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadFeatures} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {featureList.map((feature) => {
            const Icon = feature.icon
            const enabled = features[feature.key] || false

            return (
              <div
                key={feature.key}
                className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Label htmlFor={feature.key} className="text-base font-medium cursor-pointer">
                        {feature.title}
                      </Label>
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                      {enabled && <Badge className="bg-green-600 text-xs">Enabled</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
                <Switch
                  id={feature.key}
                  checked={enabled}
                  onCheckedChange={() => toggleFeature(feature.key)}
                  disabled={!isAdmin}
                />
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
