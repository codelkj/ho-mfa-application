export type UserRole = "nurse" | "physician" | "admin" | "medical_records"

export interface Profile {
  id: string
  organization_id: string // Added for multi-tenant
  email: string
  full_name: string | null
  role: UserRole
  department: string | null
  employee_id: string | null
  created_at: string
  updated_at: string
}

export interface BiometricEnrollment {
  id: string
  user_id: string
  biometric_type: "fingerprint" | "facial"
  embedding_hash: string
  model_version: string
  device_id: string | null
  enrolled_at: string
  last_verified_at: string | null
  is_active: boolean
}

export interface AuthSession {
  id: string
  user_id: string
  session_token: string
  auth_method: "password" | "biometric" | "break_glass" | "mfa"
  risk_score: number
  ip_address: string | null
  user_agent: string | null
  location: string | null
  device_id: string | null
  started_at: string
  expires_at: string
  ended_at: string | null
  is_active: boolean
}

export interface BreakGlassLog {
  id: string
  user_id: string
  patient_id: string
  reason: string
  emergency_type: "code_blue" | "trauma" | "critical_lab" | "other"
  accessed_records: string[]
  witness_id: string | null
  supervisor_notified: boolean
  supervisor_id: string | null
  ip_address: string | null
  device_id: string | null
  location: string | null
  accessed_at: string
  reviewed_at: string | null
  reviewed_by: string | null
}

export interface AuthAuditLog {
  id: string
  user_id: string | null
  event_type: string
  auth_method: string | null
  ip_address: string | null
  user_agent: string | null
  device_id: string | null
  location: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface RiskContext {
  id: string
  user_id: string
  context_type: "location" | "device" | "time" | "behavior"
  context_value: Record<string, unknown>
  trust_score: number
  ml_model_version: string | null // Added for ML tracking
  last_seen_at: string
  is_trusted: boolean
  created_at: string
}

export interface Organization {
  id: string
  name: string
  domain: string
  settings: OrganizationSettings
  created_at: string
  updated_at: string
}

export interface OrganizationSettings {
  session_timeout_minutes: number
  max_concurrent_sessions: number
  require_biometric: boolean
  enable_break_glass: boolean
  enable_fido2: boolean
  enable_ml_risk_scoring: boolean
  ehr_integration_enabled: boolean
  allowed_ip_ranges: string[]
}

export interface FIDO2Credential {
  id: string
  user_id: string
  credential_id: string
  public_key: string
  counter: number
  device_type: string
  created_at: string
  last_used_at: string | null
  is_active: boolean
}

export interface EHRIntegration {
  id: string
  organization_id: string
  ehr_system: "epic" | "cerner" | "meditech" | "allscripts"
  fhir_base_url: string
  client_id: string
  is_active: boolean
  last_sync_at: string | null
}

export interface MobileSession {
  id: string
  user_id: string
  device_token: string
  platform: "ios" | "android"
  app_version: string
  push_token: string | null
  created_at: string
  last_active_at: string
}
