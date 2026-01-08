import { createClient } from "@/lib/supabase/client"

export interface FeatureFlag {
  key: string
  enabled: boolean
  rolloutPercentage: number
  config?: Record<string, any>
}

/**
 * Check if a feature is enabled for the current user
 * Uses RPC function with fallback to direct table query
 */
export async function isFeatureEnabled(featureKey: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.rpc("is_feature_enabled", {
      p_feature_key: featureKey,
    })

    // If RPC works, return result
    if (!error && data !== null) {
      return data === true
    }

    // Fallback: Direct table query
    console.log("[v0] RPC failed, using direct query fallback for:", featureKey)

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return false

    const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.user.id).single()

    if (!profile) return false

    const { data: flag } = await supabase
      .from("feature_flags")
      .select("is_enabled, rollout_percentage")
      .eq("organization_id", profile.organization_id)
      .eq("feature_key", featureKey)
      .single()

    if (!flag) return false

    // Simple rollout: if enabled and 100% rollout, return true
    return flag.is_enabled && flag.rollout_percentage === 100
  } catch (error) {
    console.error("[v0] Feature flag check error:", error)
    return false
  }
}

/**
 * Get all feature flags for the current organization
 */
export async function getFeatureFlags(): Promise<Record<string, boolean>> {
  const supabase = createClient()

  try {
    // Get current user's organization
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", (await supabase.auth.getUser()).data.user?.id)
      .single()

    if (!profile) return {}

    // Get all feature flags
    const { data: flags } = await supabase
      .from("feature_flags")
      .select("feature_key, is_enabled")
      .eq("organization_id", profile.organization_id)

    const flagMap: Record<string, boolean> = {}
    flags?.forEach((flag) => {
      flagMap[flag.feature_key] = flag.is_enabled
    })

    return flagMap
  } catch (error) {
    console.error("[v0] Get feature flags error:", error)
    return {}
  }
}

// Feature flag constants
export const FEATURES = {
  FIDO2_AUTH: "fido2_authentication",
  ML_RISK_SCORING: "ml_risk_scoring",
  EHR_INTEGRATION: "ehr_integration",
  MOBILE_APP: "mobile_app",
  BIOMETRIC_VERIFICATION: "biometric_verification",
  BREAK_GLASS: "break_glass_protocol",
} as const
