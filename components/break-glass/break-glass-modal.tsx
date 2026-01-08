"use client"

import type React from "react"
import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Shield, Clock, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface BreakGlassModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  userDepartment?: string
}

const EMERGENCY_TYPES = [
  { value: "code_blue", label: "Code Blue - Cardiac/Respiratory Arrest" },
  { value: "trauma", label: "Trauma - Critical Injury" },
  { value: "critical_lab", label: "Critical Lab Results" },
  { value: "other", label: "Other Emergency" },
]

const QUICK_RECORDS = [
  { id: "medications", label: "Medications" },
  { id: "allergies", label: "Allergies" },
  { id: "vital_signs", label: "Vital Signs" },
  { id: "medical_history", label: "Medical History" },
]

export function BreakGlassModal({ open, onOpenChange, user, userDepartment }: BreakGlassModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accessGranted, setAccessGranted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    patientId: "",
    emergencyType: "code_blue",
    reason: "",
    selectedRecords: ["medications", "allergies"] as string[],
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

    if (!formData.patientId.trim()) {
      setError("Patient ID is required")
      return
    }
    if (!formData.reason.trim() || formData.reason.length < 10) {
      setError("Please provide a reason (minimum 10 characters)")
      return
    }
    if (!formData.acknowledgeAudit) {
      setError("You must acknowledge the audit requirements")
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const { error: insertError } = await supabase.from("break_glass_logs").insert({
        user_id: user?.id,
        patient_id: formData.patientId,
        reason: formData.reason,
        emergency_type: formData.emergencyType,
        accessed_records: formData.selectedRecords,
        supervisor_notified: true,
        device_id: navigator.userAgent.substring(0, 100),
        location: userDepartment || null,
      })

      if (insertError) throw insertError

      await supabase.rpc("log_auth_event", {
        p_user_id: user?.id,
        p_event_type: "break_glass_access",
        p_auth_method: "break_glass",
        p_metadata: {
          patient_id: formData.patientId,
          emergency_type: formData.emergencyType,
          records_accessed: formData.selectedRecords,
        },
      })

      setAccessGranted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process emergency access")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setAccessGranted(false)
    setError(null)
    setFormData({
      patientId: "",
      emergencyType: "code_blue",
      reason: "",
      selectedRecords: ["medications", "allergies"],
      acknowledgeAudit: false,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {accessGranted ? (
          <div className="text-center space-y-4 py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Emergency Access Granted</h2>
              <p className="text-muted-foreground mt-1">Access to patient {formData.patientId} has been logged</p>
            </div>
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>All actions are being recorded. Your supervisor has been notified.</AlertDescription>
            </Alert>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Emergency Break-Glass Access
              </DialogTitle>
              <DialogDescription>
                Bypass normal authentication for emergency patient care. All access is logged.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="modal-patientId">Patient ID / MRN *</Label>
                <Input
                  id="modal-patientId"
                  placeholder="Enter patient ID"
                  value={formData.patientId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, patientId: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Emergency Type *</Label>
                <Select
                  value={formData.emergencyType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, emergencyType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
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

              <div className="space-y-2">
                <Label htmlFor="modal-reason">Reason *</Label>
                <Textarea
                  id="modal-reason"
                  placeholder="Describe the emergency..."
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Quick Access Records</Label>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_RECORDS.map((record) => (
                    <div key={record.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`modal-${record.id}`}
                        checked={formData.selectedRecords.includes(record.id)}
                        onCheckedChange={() => handleRecordToggle(record.id)}
                      />
                      <Label htmlFor={`modal-${record.id}`} className="text-sm font-normal cursor-pointer">
                        {record.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start space-x-2 p-3 bg-muted rounded-lg">
                <Checkbox
                  id="modal-acknowledge"
                  checked={formData.acknowledgeAudit}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, acknowledgeAudit: checked === true }))
                  }
                />
                <Label htmlFor="modal-acknowledge" className="text-sm cursor-pointer leading-relaxed">
                  I acknowledge this access will be logged and reviewed for HIPAA compliance.
                </Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-red-600 hover:bg-red-700">
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Request Emergency Access"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
