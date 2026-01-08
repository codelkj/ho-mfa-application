-- =====================================================
-- HO-MFA Future Work Features Migration
-- Version: 2.0.0
-- Description: Adds multi-tenant, FIDO2, ML risk scoring, 
--              EHR integration, and mobile capabilities
-- =====================================================

-- 1. MULTI-TENANT ARCHITECTURE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{
    "session_timeout_minutes": 30,
    "max_concurrent_sessions": 3,
    "require_biometric": true,
    "enable_break_glass": true,
    "enable_fido2": true,
    "enable_ml_risk_scoring": false,
    "ehr_integration_enabled": false,
    "allowed_ip_ranges": []
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add organization_id to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Create default organization for existing users
INSERT INTO public.organizations (name, domain)
VALUES ('Default Healthcare Organization', 'default.hospital.local')
ON CONFLICT (domain) DO NOTHING;

-- Backfill organization_id for existing profiles
UPDATE public.profiles 
SET organization_id = (SELECT id FROM public.organizations WHERE domain = 'default.hospital.local' LIMIT 1)
WHERE organization_id IS NULL;

-- Make organization_id NOT NULL after backfill
ALTER TABLE public.profiles 
  ALTER COLUMN organization_id SET NOT NULL;

-- Add organization_id to other tables
ALTER TABLE public.auth_sessions 
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.break_glass_logs 
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Backfill organization_id from profiles
UPDATE public.auth_sessions s
SET organization_id = p.organization_id
FROM public.profiles p
WHERE s.user_id = p.id AND s.organization_id IS NULL;

UPDATE public.break_glass_logs b
SET organization_id = p.organization_id
FROM public.profiles p
WHERE b.user_id = p.id AND b.organization_id IS NULL;

-- Create indexes for multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_profiles_organization ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_sessions_organization ON public.auth_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_break_glass_organization ON public.break_glass_logs(organization_id);

-- 2. FIDO2/WebAuthn HARDWARE SECURITY
-- =====================================================

CREATE TABLE IF NOT EXISTS public.fido2_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  credential_id TEXT UNIQUE NOT NULL,
  public_key TEXT NOT NULL,
  counter INTEGER DEFAULT 0,
  device_type TEXT NOT NULL, -- 'security_key', 'platform', 'roaming'
  device_name TEXT,
  transports TEXT[], -- 'usb', 'nfc', 'ble', 'internal'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_fido2_user ON public.fido2_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_fido2_credential ON public.fido2_credentials(credential_id);

-- RLS for FIDO2 credentials
ALTER TABLE public.fido2_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own FIDO2 credentials" ON public.fido2_credentials
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own FIDO2 credentials" ON public.fido2_credentials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own FIDO2 credentials" ON public.fido2_credentials
  FOR UPDATE USING (auth.uid() = user_id);

-- 3. ML-BASED RISK SCORING
-- =====================================================

-- Add ML model tracking to risk_contexts
ALTER TABLE public.risk_contexts 
  ADD COLUMN IF NOT EXISTS ml_model_version TEXT DEFAULT 'rule-based-v1.0',
  ADD COLUMN IF NOT EXISTS ml_confidence_score NUMERIC(3,2),
  ADD COLUMN IF NOT EXISTS feature_vector JSONB;

-- Create ML training data table
CREATE TABLE IF NOT EXISTS public.ml_training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.auth_sessions(id) ON DELETE CASCADE,
  features JSONB NOT NULL,
  actual_risk_level TEXT, -- 'low', 'medium', 'high', 'critical'
  predicted_risk_score NUMERIC(3,2),
  was_anomaly BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ml_training_user ON public.ml_training_data(user_id);
CREATE INDEX IF NOT EXISTS idx_ml_training_created ON public.ml_training_data(created_at);

-- Feature extraction function for ML
CREATE OR REPLACE FUNCTION public.extract_risk_features(
  p_user_id UUID,
  p_ip_address INET,
  p_device_id TEXT,
  p_location TEXT,
  p_timestamp TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB AS $$
DECLARE
  features JSONB;
  user_profile RECORD;
  recent_sessions INTEGER;
  failed_attempts INTEGER;
  avg_session_duration INTEGER;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile FROM public.profiles WHERE id = p_user_id;
  
  -- Calculate features
  SELECT COUNT(*) INTO recent_sessions
  FROM public.auth_sessions
  WHERE user_id = p_user_id 
    AND started_at > NOW() - INTERVAL '24 hours';
  
  SELECT COUNT(*) INTO failed_attempts
  FROM public.auth_audit_logs
  WHERE user_id = p_user_id 
    AND event_type = 'login_failure'
    AND created_at > NOW() - INTERVAL '1 hour';
  
  SELECT AVG(EXTRACT(EPOCH FROM (COALESCE(ended_at, NOW()) - started_at)))::INTEGER 
  INTO avg_session_duration
  FROM public.auth_sessions
  WHERE user_id = p_user_id AND ended_at IS NOT NULL;
  
  -- Build feature vector
  features := jsonb_build_object(
    'hour_of_day', EXTRACT(HOUR FROM p_timestamp),
    'day_of_week', EXTRACT(DOW FROM p_timestamp),
    'is_weekend', EXTRACT(DOW FROM p_timestamp) IN (0, 6),
    'recent_sessions_24h', recent_sessions,
    'failed_attempts_1h', failed_attempts,
    'avg_session_duration_sec', COALESCE(avg_session_duration, 1800),
    'is_known_ip', EXISTS(
      SELECT 1 FROM public.auth_sessions 
      WHERE user_id = p_user_id AND ip_address = p_ip_address 
      LIMIT 1
    ),
    'is_known_device', EXISTS(
      SELECT 1 FROM public.auth_sessions 
      WHERE user_id = p_user_id AND device_id = p_device_id 
      LIMIT 1
    ),
    'user_role', user_profile.role,
    'user_department', user_profile.department
  );
  
  RETURN features;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. EHR INTEGRATION LAYER
-- =====================================================

CREATE TABLE IF NOT EXISTS public.ehr_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ehr_system TEXT NOT NULL CHECK (ehr_system IN ('epic', 'cerner', 'meditech', 'allscripts', 'custom')),
  fhir_base_url TEXT NOT NULL,
  client_id TEXT NOT NULL,
  auth_type TEXT NOT NULL CHECK (auth_type IN ('oauth2', 'saml', 'basic')),
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ehr_organization ON public.ehr_integrations(organization_id);

-- EHR authentication events
CREATE TABLE IF NOT EXISTS public.ehr_auth_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ehr_integration_id UUID REFERENCES public.ehr_integrations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'fhir_access', 'patient_lookup', 'record_access'
  patient_id TEXT,
  resource_type TEXT, -- 'Patient', 'Observation', 'MedicationRequest'
  response_status INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ehr_events_user ON public.ehr_auth_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ehr_events_created ON public.ehr_auth_events(created_at);

-- 5. MOBILE CAPABILITIES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.mobile_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_token TEXT UNIQUE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  app_version TEXT,
  push_token TEXT UNIQUE,
  device_info JSONB DEFAULT '{}',
  biometric_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_mobile_user ON public.mobile_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_platform ON public.mobile_sessions(platform);

-- Push notification queue
CREATE TABLE IF NOT EXISTS public.push_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile_session_id UUID REFERENCES public.mobile_sessions(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'auth_challenge', 'break_glass_alert', 'security_alert'
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '5 minutes'
);

CREATE INDEX IF NOT EXISTS idx_push_status ON public.push_notifications(status);
CREATE INDEX IF NOT EXISTS idx_push_expires ON public.push_notifications(expires_at);

-- 6. FEATURE FLAGS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, feature_key)
);

-- Insert default feature flags
INSERT INTO public.feature_flags (organization_id, feature_key, is_enabled, rollout_percentage)
SELECT 
  id, 
  feature, 
  false, 
  0
FROM public.organizations,
  (VALUES 
    ('fido2_authentication'),
    ('ml_risk_scoring'),
    ('ehr_integration'),
    ('mobile_app'),
    ('biometric_verification'),
    ('break_glass_protocol')
  ) AS features(feature)
ON CONFLICT (organization_id, feature_key) DO NOTHING;

-- Function to check feature flag
CREATE OR REPLACE FUNCTION public.is_feature_enabled(
  p_feature_key TEXT,
  p_organization_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  org_id UUID;
  flag_enabled BOOLEAN;
  rollout_pct INTEGER;
  user_hash INTEGER;
BEGIN
  -- Get organization_id from current user if not provided
  IF p_organization_id IS NULL THEN
    SELECT organization_id INTO org_id 
    FROM public.profiles 
    WHERE id = auth.uid() 
    LIMIT 1;
  ELSE
    org_id := p_organization_id;
  END IF;
  
  -- Get feature flag
  SELECT is_enabled, rollout_percentage 
  INTO flag_enabled, rollout_pct
  FROM public.feature_flags
  WHERE organization_id = org_id AND feature_key = p_feature_key;
  
  -- If not found or disabled, return false
  IF NOT FOUND OR flag_enabled = FALSE THEN
    RETURN FALSE;
  END IF;
  
  -- If 100% rollout, return true
  IF rollout_pct = 100 THEN
    RETURN TRUE;
  END IF;
  
  -- Calculate deterministic user hash for gradual rollout
  user_hash := (('x' || substring(auth.uid()::text, 1, 8))::bit(32)::int % 100);
  
  RETURN user_hash < rollout_pct;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. UPDATE RLS POLICIES FOR MULTI-TENANT
-- =====================================================

-- Drop and recreate profiles policies with organization scope
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view org profiles" ON public.profiles
  FOR SELECT USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    AND public.is_admin()
  );

-- Update sessions policies
DROP POLICY IF EXISTS "Users can view own sessions" ON public.auth_sessions;

CREATE POLICY "Users can view own sessions" ON public.auth_sessions
  FOR SELECT USING (
    user_id = auth.uid() 
    OR (
      organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
      AND public.is_admin()
    )
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMENT ON TABLE public.organizations IS 'Multi-tenant organization configuration';
COMMENT ON TABLE public.fido2_credentials IS 'FIDO2/WebAuthn hardware security keys';
COMMENT ON TABLE public.ml_training_data IS 'Training data for ML-based risk scoring';
COMMENT ON TABLE public.ehr_integrations IS 'EHR system integration configuration';
COMMENT ON TABLE public.mobile_sessions IS 'Mobile device session tracking';
COMMENT ON TABLE public.feature_flags IS 'Feature flag configuration for gradual rollouts';
