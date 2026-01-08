"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Database, Link2, CheckCircle2, XCircle, Loader2 } from "lucide-react"

export function EhrIntegrationTest({ enabled }: { enabled: boolean }) {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)
  const [ehrSystem, setEhrSystem] = useState("epic")
  const [patientId, setPatientId] = useState("")

  async function testEhrIntegration() {
    setTesting(true)
    setResult(null)

    try {
      const response = await fetch("/api/ehr/fhir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ehrSystem,
          patientId: patientId || "PATIENT-12345",
          resourceType: "Patient",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to connect to EHR system")
      }

      setResult({
        success: true,
        message: `Successfully retrieved patient data from ${ehrSystem.toUpperCase()} via FHIR`,
        data: {
          ehrSystem: data.ehrSystem,
          patientId: data.patientId,
          timestamp: data.timestamp,
          fhirData: data.data,
        },
      })
    } catch (error: any) {
      console.error("[v0] EHR integration test error:", error)
      setResult({
        success: false,
        message: error.message || "Failed to connect to EHR system",
      })
    } finally {
      setTesting(false)
    }
  }

  if (!enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>EHR Integration</CardTitle>
          <CardDescription>HL7 FHIR integration with Epic, Cerner, and Meditech</CardDescription>
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
          <Database className="h-5 w-5" />
          EHR Integration Test
        </CardTitle>
        <CardDescription>Test HL7 FHIR integration with EHR systems</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>EHR System</Label>
          <Select value={ehrSystem} onValueChange={setEhrSystem}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="epic">Epic</SelectItem>
              <SelectItem value="cerner">Cerner</SelectItem>
              <SelectItem value="meditech">Meditech</SelectItem>
              <SelectItem value="allscripts">Allscripts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="patientId">Patient ID (Optional)</Label>
          <Input
            id="patientId"
            placeholder="e.g., PATIENT-12345"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          />
        </div>

        <Button onClick={testEhrIntegration} disabled={testing} className="w-full">
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Link2 className="mr-2 h-4 w-4" />
              Test EHR Connection
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
            <p className="font-medium">Connection Details</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>EHR System:</span>
                <Badge>{result.data.ehrSystem.toUpperCase()}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Patient ID:</span>
                <span className="font-mono">{result.data.patientId}</span>
              </div>
              <div className="flex justify-between">
                <span>Event ID:</span>
                <span className="font-mono text-xs">{result.data.eventId}</span>
              </div>
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <span className="font-mono text-xs">{new Date(result.data.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>FHIR Data:</span>
                <span className="font-mono text-xs">{JSON.stringify(result.data.fhirData)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
