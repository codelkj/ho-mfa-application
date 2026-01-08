import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"

// Real FHIR client implementation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { ehrSystem, patientId, resourceType = "Patient" } = await request.json()

    // Get organization's EHR integration config
    const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const { data: ehrConfig } = await supabase
      .from("ehr_integrations")
      .select("*")
      .eq("organization_id", profile.organization_id)
      .eq("ehr_system", ehrSystem)
      .eq("is_active", true)
      .single()

    if (!ehrConfig) {
      return NextResponse.json({ error: `No active EHR integration found for ${ehrSystem}` }, { status: 404 })
    }

    const fhirUrl = `${ehrConfig.fhir_base_url}/${resourceType}/${patientId}`

    const response = await fetch(fhirUrl, {
      method: "GET",
      headers: {
        Accept: "application/fhir+json",
        Authorization: `Bearer ${ehrConfig.config.access_token || ""}`,
      },
    })

    const fhirData = await response.json()

    // Log the EHR access event
    await supabase.from("ehr_auth_events").insert({
      user_id: user.id,
      ehr_integration_id: ehrConfig.id,
      event_type: "fhir_read",
      patient_id: patientId,
      resource_type: resourceType,
      response_status: response.status,
    })

    return NextResponse.json({
      success: response.ok,
      data: fhirData,
      ehrSystem,
      patientId,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[v0] EHR FHIR API error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch EHR data" }, { status: 500 })
  }
}
