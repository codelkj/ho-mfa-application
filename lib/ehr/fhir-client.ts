/**
 * HL7 FHIR Integration Client
 * Provides EHR integration capabilities for HO-MFA
 */

import { createClient } from "@/lib/supabase/client"

export interface FHIRPatient {
  resourceType: "Patient"
  id: string
  identifier: Array<{
    system: string
    value: string
  }>
  name: Array<{
    family: string
    given: string[]
  }>
  birthDate: string
}

export interface FHIRObservation {
  resourceType: "Observation"
  id: string
  status: string
  code: {
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }
  subject: {
    reference: string
  }
  effectiveDateTime: string
  valueQuantity?: {
    value: number
    unit: string
  }
}

/**
 * Authenticate with EHR system and get FHIR access token
 */
export async function authenticateWithEHR(
  organizationId: string,
): Promise<{ accessToken: string; expiresIn: number } | null> {
  const supabase = createClient()

  try {
    // Get EHR integration config
    const { data: integration } = await supabase
      .from("ehr_integrations")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .single()

    if (!integration) {
      console.error("[v0] No active EHR integration found")
      return null
    }

    // OAuth 2.0 client credentials flow
    const response = await fetch(`${integration.fhir_base_url}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: integration.client_id,
        scope: "system/*.read",
      }),
    })

    if (!response.ok) {
      console.error("[v0] EHR authentication failed:", response.statusText)
      return null
    }

    const data = await response.json()

    // Update last_sync_at
    await supabase.from("ehr_integrations").update({ last_sync_at: new Date().toISOString() }).eq("id", integration.id)

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    }
  } catch (error) {
    console.error("[v0] EHR authentication error:", error)
    return null
  }
}

/**
 * Search for patient in EHR using FHIR API
 */
export async function searchPatient(organizationId: string, patientId: string): Promise<FHIRPatient | null> {
  const supabase = createClient()

  try {
    // Get authentication token
    const auth = await authenticateWithEHR(organizationId)
    if (!auth) return null

    // Get FHIR base URL
    const { data: integration } = await supabase
      .from("ehr_integrations")
      .select("fhir_base_url")
      .eq("organization_id", organizationId)
      .single()

    if (!integration) return null

    // FHIR patient search
    const response = await fetch(`${integration.fhir_base_url}/Patient?identifier=${patientId}`, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        Accept: "application/fhir+json",
      },
    })

    if (!response.ok) {
      console.error("[v0] FHIR patient search failed:", response.statusText)
      return null
    }

    const bundle = await response.json()

    if (bundle.total === 0 || !bundle.entry || bundle.entry.length === 0) {
      return null
    }

    // Log EHR access event
    const user = await supabase.auth.getUser()
    if (user.data.user) {
      await supabase.from("ehr_auth_events").insert({
        user_id: user.data.user.id,
        ehr_integration_id: integration.id,
        event_type: "patient_lookup",
        patient_id: patientId,
        resource_type: "Patient",
        response_status: 200,
      })
    }

    return bundle.entry[0].resource as FHIRPatient
  } catch (error) {
    console.error("[v0] FHIR patient search error:", error)
    return null
  }
}

/**
 * Check if user has permission to access patient record
 * Integrates HO-MFA authentication with EHR authorization
 */
export async function checkPatientAccess(
  userId: string,
  patientId: string,
): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = createClient()

  try {
    // Get user profile and risk score
    const { data: profile } = await supabase.from("profiles").select("role, department").eq("id", userId).single()

    if (!profile) {
      return { allowed: false, reason: "User profile not found" }
    }

    // Check active session
    const { data: session } = await supabase
      .from("auth_sessions")
      .select("risk_score")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("started_at", { ascending: false })
      .limit(1)
      .single()

    if (!session) {
      return { allowed: false, reason: "No active session" }
    }

    // High-risk sessions require step-up authentication
    if (session.risk_score > 0.7) {
      return { allowed: false, reason: "Risk score too high, step-up required" }
    }

    // Role-based access control
    const allowedRoles = ["physician", "nurse", "admin"]
    if (!allowedRoles.includes(profile.role)) {
      return { allowed: false, reason: "Insufficient privileges" }
    }

    return { allowed: true }
  } catch (error) {
    console.error("[v0] Patient access check error:", error)
    return { allowed: false, reason: "Access check failed" }
  }
}
