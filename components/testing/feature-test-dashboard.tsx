"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Fido2Test } from "./fido2-test"
import { MlRiskScoringTest } from "./ml-risk-scoring-test"
import { EhrIntegrationTest } from "./ehr-integration-test"
import { MobileAppTest } from "./mobile-app-test"
import { BiometricTest } from "./biometric-test"
import { BreakGlassTest } from "./break-glass-test"
import { createBrowserClient } from "@/lib/supabase-client"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { VerificationPanel } from "./verification-panel"

export function FeatureTestDashboard() {
  const [featureStates, setFeatureStates] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeatureStates()
  }, [])

  async function loadFeatureStates() {
    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single()

      if (!profile) return

      const { data: flags } = await supabase
        .from("feature_flags")
        .select("feature_key, is_enabled")
        .eq("organization_id", profile.organization_id)

      if (flags) {
        const states: Record<string, boolean> = {}
        flags.forEach((flag) => {
          states[flag.feature_key] = flag.is_enabled
        })
        setFeatureStates(states)
      }
    } catch (error) {
      console.error("Failed to load feature states:", error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { key: "fido2_authentication", label: "FIDO2 Authentication", tab: "fido2" },
    { key: "ml_risk_scoring", label: "ML Risk Scoring", tab: "ml" },
    { key: "ehr_integration", label: "EHR Integration", tab: "ehr" },
    { key: "mobile_app", label: "Mobile Application", tab: "mobile" },
    { key: "biometric_verification", label: "Biometric Verification", tab: "biometric" },
    { key: "break_glass_protocol", label: "Break-Glass Protocol", tab: "break-glass" },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Feature Testing Dashboard</h1>
        <p className="text-muted-foreground">Interactive testing interface for all 6 future work features</p>
      </div>

      <VerificationPanel />

      <Card>
        <CardHeader>
          <CardTitle>Feature Status</CardTitle>
          <CardDescription>Current state of all advanced features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div key={feature.key} className="flex items-center justify-between p-3 rounded-lg border">
                <span className="font-medium">{feature.label}</span>
                {featureStates[feature.key] ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Disabled
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="fido2" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="fido2">FIDO2</TabsTrigger>
          <TabsTrigger value="ml">ML Risk</TabsTrigger>
          <TabsTrigger value="ehr">EHR</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
          <TabsTrigger value="biometric">Biometric</TabsTrigger>
          <TabsTrigger value="break-glass">Break-Glass</TabsTrigger>
        </TabsList>

        <TabsContent value="fido2">
          <Fido2Test enabled={featureStates.fido2_authentication} />
        </TabsContent>

        <TabsContent value="ml">
          <MlRiskScoringTest enabled={featureStates.ml_risk_scoring} />
        </TabsContent>

        <TabsContent value="ehr">
          <EhrIntegrationTest enabled={featureStates.ehr_integration} />
        </TabsContent>

        <TabsContent value="mobile">
          <MobileAppTest enabled={featureStates.mobile_app} />
        </TabsContent>

        <TabsContent value="biometric">
          <BiometricTest enabled={featureStates.biometric_verification} />
        </TabsContent>

        <TabsContent value="break-glass">
          <BreakGlassTest enabled={featureStates.break_glass_protocol} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
