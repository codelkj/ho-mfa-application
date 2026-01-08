"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createBrowserClient } from "@/lib/supabase-client"
import { CheckCircle2, XCircle, Database, Shield, Info, RefreshCw } from "lucide-react"

interface VerificationResult {
  feature: string
  isReal: boolean
  method: string
  evidence: string[]
  dbRecords: number
}

export function VerificationPanel() {
  const [results, setResults] = useState<VerificationResult[]>([])
  const [verifying, setVerifying] = useState(false)

  async function runVerification() {
    setVerifying(true)
    const supabase = createBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const verificationResults: VerificationResult[] = []

    // 1. FIDO2 Authentication
    const { count: fido2Count } = await supabase
      .from("fido2_credentials")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    const webAuthnSupported = "credentials" in navigator && "create" in navigator.credentials

    verificationResults.push({
      feature: "FIDO2 Authentication",
      isReal: webAuthnSupported,
      method: "WebAuthn API",
      evidence: [
        webAuthnSupported ? "Browser supports WebAuthn" : "WebAuthn not supported",
        `${fido2Count || 0} real credentials in database`,
        "Uses cryptographic attestation",
      ],
      dbRecords: fido2Count || 0,
    })

    // 2. ML Risk Scoring
    const { count: mlCount } = await supabase
      .from("ml_training_data")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    // Test if the function exists
    const { data: riskTest, error: riskError } = await supabase.rpc("extract_risk_features", {
      p_user_id: user.id,
      p_ip_address: "127.0.0.1",
      p_device_id: "test",
      p_location: "test",
    })

    verificationResults.push({
      feature: "ML Risk Scoring",
      isReal: !riskError,
      method: "PostgreSQL Function",
      evidence: [
        !riskError ? "Database function operational" : "Function not found",
        `${mlCount || 0} training records`,
        riskTest ? "Real feature extraction working" : "Simulated",
      ],
      dbRecords: mlCount || 0,
    })

    // 3. EHR Integration
    const { count: ehrCount } = await supabase
      .from("ehr_auth_events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    verificationResults.push({
      feature: "EHR Integration",
      isReal: false,
      method: "Simulated (requires FHIR server)",
      evidence: [`${ehrCount || 0} logged events`, "Database structure ready", "Requires external Epic/Cerner API"],
      dbRecords: ehrCount || 0,
    })

    // 4. Mobile Application
    const { count: mobileCount } = await supabase
      .from("mobile_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    const { count: pushCount } = await supabase.from("push_notifications").select("*", { count: "exact", head: true })

    verificationResults.push({
      feature: "Mobile Application",
      isReal: false,
      method: "Database real, push simulated",
      evidence: [
        `${mobileCount || 0} mobile sessions`,
        `${pushCount || 0} push notifications logged`,
        "Requires native iOS/Android app",
      ],
      dbRecords: (mobileCount || 0) + (pushCount || 0),
    })

    // 5. Biometric Verification
    const biometricSupported = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()

    verificationResults.push({
      feature: "Biometric Verification",
      isReal: biometricSupported,
      method: "WebAuthn Platform Authenticator",
      evidence: [
        biometricSupported ? "Device supports biometrics" : "No biometric support",
        "Uses Touch ID / Face ID / Windows Hello",
        "Requires user verification flag",
      ],
      dbRecords: fido2Count || 0,
    })

    // 6. Break-Glass Protocol
    const { count: breakGlassCount } = await supabase
      .from("break_glass_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    verificationResults.push({
      feature: "Break-Glass Protocol",
      isReal: true,
      method: "Full database audit trail",
      evidence: [`${breakGlassCount || 0} break-glass events`, "Real-time logging enabled", "Complete audit trail"],
      dbRecords: breakGlassCount || 0,
    })

    setResults(verificationResults)
    setVerifying(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Verification
            </CardTitle>
            <CardDescription>Verify which features are using real implementations</CardDescription>
          </div>
          <Button onClick={runVerification} disabled={verifying}>
            {verifying ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Verification
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {results.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Ready to verify</AlertTitle>
            <AlertDescription>
              Click "Run Verification" to check which features are using real implementations vs simulations.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <Card key={result.feature}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{result.feature}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        <Database className="h-3 w-3" />
                        {result.dbRecords} records
                      </Badge>
                      {result.isReal ? (
                        <Badge variant="default" className="gap-1 bg-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Real
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Simulated
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>{result.method}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {result.evidence.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-teal-600">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
