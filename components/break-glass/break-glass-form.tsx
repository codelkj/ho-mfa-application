"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Shield, Clock, FileWarning, CheckCircle2, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types"

interface BreakGlassFormProps {
  user: User
  profile: Profile | null
  witnesses: Pick<Profile, "id" | "full_name" | "role" | "department">[]
}

const EMERGENCY_TYPES = [
  { value: "code_blue", label: "Code Blue - Cardiac/Respiratory Arrest" },
  { value: "trauma", label: "Trauma - Critical Injury" },
  { value: "critical_lab", label: "Critical Lab Results" },
  { value: "other", label: "Other Emergency" },
]

const RECORD_TYPES = [
  { id: "demographics", label: "Patient Demographics" },
  { id: "medications", label: "Current Medications" },
  { id: "allergies", label: "Allergies" },
  { id: "lab_results", label: "Laboratory Results" },
  { id: "vital_signs", label: "Vital Signs" },
  { id: "medical_history", label: "Medical History" },
  { id: "imaging", label: "Imaging/Radiology" },
  { id: "notes", label: "Clinical Notes" },
]

export function BreakGlassForm({ user, profile, witnesses }: BreakGlassFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accessGranted, setAccessGranted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    patientId: "",
    emergencyType: "code_blue", // Updated default value
    reason: "",
    selectedRecords: [] as string[],
    witnessId: "",
    acknowledgeAudit: false,
  })

  const handleRecordToggle = (recordId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedRecords: prev.selectedRecords.includes(recordId)
        ? prev.selectedRecords.filter((id) => id !== recordId)
        : [...prev.selectedRecords, recordId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.patientId.trim()) {
      setError("Patient ID is required")
      return
    }
    if (!formData.emergencyType) {
      setError("Emergency type is required")
      return
    }
    if (!formData.reason.trim() || formData.reason.length < 20) {
      setError("Please provide a detailed reason (minimum 20 characters)")
      return
    }
    if (formData.selectedRecords.length === 0) {
      setError("Select at least one record type to access")
      return
    }
    if (!formData.acknowledgeAudit) {
      setError("You must acknowledge the audit trail requirements")
      return
    }

    setIsSubmitting(true)

    const supabase = createClient()

    try {
      // Log the break-glass access
      const { error: insertError } = await supabase.from("break_glass_logs").insert({
        user_id: user.id,
        patient_id: formData.patientId,
        reason: formData.reason,
        emergency_type: formData.emergencyType,
        accessed_records: formData.selectedRecords,
        witness_id: formData.witnessId || null,
        supervisor_notified: true,
        ip_address: null,
        device_id: navigator.userAgent.substring(0, 100),
        location: profile?.department || null,
      })

      if (insertError) {
        console.error("Break-glass insert error full:", JSON.stringify(insertError, null, 2))
        console.error("Break-glass insert error details:", insertError)
        console.log("User ID being inserted:", user.id)
        console.log("Form data being sent:", {
          user_id: user.id,
          patient_id: formData.patientId,
          reason: formData.reason,
          emergency_type: formData.emergencyType,
          accessed_records: formData.selectedRecords,
          witness_id: formData.witnessId || null,
        })
        
        // Check if it's a 409 conflict
        if (insertError.code === "409") {
          setError("Database conflict (409): This usually means a constraint violation. Check console for details.")
        } else {
          setError(insertError.message ? `${insertError.message} (${insertError.details || insertError.code || ''})` : "Failed to insert break_glass_logs")
        }
        setIsSubmitting(false)
        return
      }

      // Log the auth event
      const { error: rpcError } = await supabase.rpc("log_auth_event", {
        p_user_id: user.id,
        p_event_type: "break_glass_access",
        p_auth_method: "break_glass",
        p_metadata: {
          patient_id: formData.patientId,
          emergency_type: formData.emergencyType,
          records_accessed: formData.selectedRecords,
          witness_present: !!formData.witnessId,
        },
      })

      if (rpcError) {
        console.error("Break-glass RPC error:", rpcError)
        setError(rpcError.message ? `${rpcError.message} (${rpcError.details || ''})` : "Failed to log auth event")
        setIsSubmitting(false)
        return
      }

      setAccessGranted(true)
    } catch (err) {
      console.error("Unhandled break-glass error:", err)
      const message = err instanceof Error ? err.message : typeof err === "object" ? JSON.stringify(err) : String(err)
      setError(message || "Failed to process emergency access")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (accessGranted) {
    return (
      <Card className="border-green-500">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Emergency Access Granted</h2>
              <p className="text-muted-foreground mt-1">Access to patient {formData.patientId} has been logged</p>
            </div>
            <Alert className="text-left">
              <Eye className="h-4 w-4" />
              <AlertTitle>Audit Trail Active</AlertTitle>
              <AlertDescription>
                All actions during this session are being recorded for HIPAA compliance. Your supervisor has been
                notified of this emergency access.
              </AlertDescription>
            </Alert>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setAccessGranted(false)
                  setFormData({
                    patientId: "",
                    emergencyType: "code_blue", // Updated default value
                    reason: "",
                    selectedRecords: [],
                    witnessId: "",
                    acknowledgeAudit: false,
                  })
                }}
              >
                New Emergency Access
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Warning Header */}
      <Alert variant="destructive" className="border-2">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="text-lg">Emergency Break-Glass Access</AlertTitle>
        <AlertDescription className="mt-2">
          This function bypasses normal authentication for emergency patient care. All access is logged and will be
          reviewed. Use only when standard access is unavailable and patient care requires immediate action.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            Emergency Access Request
          </CardTitle>
          <CardDescription>Complete all fields to request emergency patient record access</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Patient ID */}
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID / MRN *</Label>
              <Input
                id="patientId"
                placeholder="Enter patient ID or medical record number"
                value={formData.patientId}
                onChange={(e) => setFormData((prev) => ({ ...prev, patientId: e.target.value }))}
              />
            </div>

            {/* Emergency Type */}
            <div className="space-y-2">
              <Label htmlFor="emergencyType">Emergency Type *</Label>
              <Select
                value={formData.emergencyType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, emergencyType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select emergency type" />
                </SelectTrigger>
                <SelectContent>
                  {EMERGENCY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Emergency Access *</Label>
              <Textarea
                id="reason"
                placeholder="Describe the emergency situation and why immediate access is required..."
                rows={4}
                value={formData.reason}
                onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 20 characters. Be specific about the clinical necessity.
              </p>
            </div>

            {/* Records to Access */}
            <div className="space-y-3">
              <Label>Records to Access *</Label>
              <div className="grid grid-cols-2 gap-3">
                {RECORD_TYPES.map((record) => (
                  <div key={record.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={record.id}
                      checked={formData.selectedRecords.includes(record.id)}
                      onCheckedChange={() => handleRecordToggle(record.id)}
                    />
                    <Label htmlFor={record.id} className="text-sm font-normal cursor-pointer">
                      {record.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Witness */}
            <div className="space-y-2">
              <Label htmlFor="witness">Witness (Optional but Recommended)</Label>
              <Select
                value={formData.witnessId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, witnessId: value === "none" ? "" : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a witness if available" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No witness available</SelectItem>
                  {witnesses.map((witness) => (
                    <SelectItem key={witness.id} value={witness.id}>
                      {witness.full_name || "Unknown"} - {witness.role} ({witness.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Acknowledgment */}
            <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg">
              <Checkbox
                id="acknowledge"
                checked={formData.acknowledgeAudit}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, acknowledgeAudit: checked === true }))}
              />
              <div className="space-y-1">
                <Label htmlFor="acknowledge" className="cursor-pointer">
                  I acknowledge the audit requirements *
                </Label>
                <p className="text-xs text-muted-foreground">
                  I understand that this access will be logged, my supervisor will be notified, and I may be required to
                  provide justification for this emergency access during compliance review.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-destructive hover:bg-destructive/90">
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileWarning className="h-4 w-4 mr-2" />
                    Request Emergency Access
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Compliance Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Shield className="h-8 w-8 text-primary shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">HIPAA Compliance Notice</p>
              <p className="text-sm text-muted-foreground">
                Break-glass access is designed for genuine emergencies only. Misuse of this feature may result in
                disciplinary action and potential legal consequences. All access events are retained for 6 years per
                HIPAA requirements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
