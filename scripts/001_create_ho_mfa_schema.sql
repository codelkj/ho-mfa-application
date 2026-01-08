-- HO-MFA Database Schema
-- Healthcare-Optimized Multi-Factor Authentication System

-- 1. User Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'nurse' CHECK (role IN ('nurse', 'physician', 'admin', 'medical_records')),
  department TEXT,
  employee_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Biometric Enrollments Table
CREATE TABLE IF NOT EXISTS public.biometric_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  biometric_type TEXT NOT NULL CHECK (biometric_type IN ('fingerprint', 'facial')),
  embedding_hash TEXT NOT NULL, -- Hashed embedding for verification (never store raw biometrics)
  model_version TEXT NOT NULL DEFAULT 'v1.0',
  device_id TEXT,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  last_verified_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, biometric_type)
);

-- 3. Authentication Sessions Table
CREATE TABLE IF NOT EXISTS public.auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  auth_method TEXT NOT NULL CHECK (auth_method IN ('password', 'biometric', 'break_glass', 'mfa')),
  risk_score NUMERIC(3,2) DEFAULT 0.00 CHECK (risk_score >= 0 AND risk_score <= 1),
  ip_address INET,
  user_agent TEXT,
  location TEXT,
  device_id TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- 4. Break-Glass Access Logs Table (HIPAA Audit Trail)
CREATE TABLE IF NOT EXISTS public.break_glass_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  emergency_type TEXT NOT NULL CHECK (emergency_type IN ('code_blue', 'trauma', 'critical_lab', 'other')),
  accessed_records TEXT[], -- Array of accessed record types
  witness_id UUID REFERENCES public.profiles(id),
  supervisor_notified BOOLEAN DEFAULT FALSE,
  supervisor_id UUID REFERENCES public.profiles(id),
  ip_address INET,
  device_id TEXT,
  location TEXT,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id)
);

-- 5. Authentication Audit Logs Table
CREATE TABLE IF NOT EXISTS public.auth_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'login_success', 'login_failure', 'logout', 
    'biometric_enroll', 'biometric_verify_success', 'biometric_verify_failure',
    'break_glass_access', 'password_change', 'mfa_enabled', 'mfa_disabled',
    'session_timeout', 'suspicious_activity'
  )),
  auth_method TEXT,
  ip_address INET,
  user_agent TEXT,
  device_id TEXT,
  location TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Risk Context Table (for context-aware authentication)
CREATE TABLE IF NOT EXISTS public.risk_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL CHECK (context_type IN ('location', 'device', 'time', 'behavior')),
  context_value JSONB NOT NULL,
  trust_score NUMERIC(3,2) DEFAULT 0.50 CHECK (trust_score >= 0 AND trust_score <= 1),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  is_trusted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.break_glass_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_contexts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for biometric_enrollments
CREATE POLICY "Users can view own biometrics" ON public.biometric_enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own biometrics" ON public.biometric_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own biometrics" ON public.biometric_enrollments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own biometrics" ON public.biometric_enrollments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for auth_sessions
CREATE POLICY "Users can view own sessions" ON public.auth_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.auth_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.auth_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for break_glass_logs (strict - only admins can view all)
CREATE POLICY "Users can view own break glass logs" ON public.break_glass_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert break glass logs" ON public.break_glass_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all break glass logs" ON public.break_glass_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update break glass logs" ON public.break_glass_logs
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for auth_audit_logs (admins only for viewing all)
CREATE POLICY "Users can view own audit logs" ON public.auth_audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs" ON public.auth_audit_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all audit logs" ON public.auth_audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for risk_contexts
CREATE POLICY "Users can view own risk contexts" ON public.risk_contexts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own risk contexts" ON public.risk_contexts
  FOR ALL USING (auth.uid() = user_id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, department, employee_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'nurse'),
    COALESCE(NEW.raw_user_meta_data ->> 'department', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'employee_id', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to log authentication events
CREATE OR REPLACE FUNCTION public.log_auth_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_auth_method TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_device_id TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.auth_audit_logs (
    user_id, event_type, auth_method, ip_address, user_agent, device_id, location, metadata
  ) VALUES (
    p_user_id, p_event_type, p_auth_method, p_ip_address, p_user_agent, p_device_id, p_location, p_metadata
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department);
CREATE INDEX IF NOT EXISTS idx_biometric_user ON public.biometric_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON public.auth_sessions(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_break_glass_user ON public.break_glass_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_break_glass_accessed ON public.break_glass_logs(accessed_at);
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.auth_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_event ON public.auth_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.auth_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_risk_user ON public.risk_contexts(user_id);
