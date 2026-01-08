-- =====================================================
-- HO-MFA TEST SEED DATA
-- Run this AFTER creating a test user via the Sign Up page
-- =====================================================

-- Added pre-flight check to verify users exist before inserting
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
    RAISE EXCEPTION 'No users found in auth.users. Please sign up at /auth/sign-up first, then run this script.';
  END IF;
END $$;

-- Using CTE pattern to safely get user ID
-- Insert sample audit logs for demonstration
WITH first_user AS (SELECT id FROM auth.users LIMIT 1)
INSERT INTO public.auth_audit_logs (
  id, user_id, event_type, auth_method, ip_address, user_agent, device_id, location, metadata, created_at
) 
SELECT 
  gen_random_uuid(),
  first_user.id,
  'login_success',
  'password',
  '192.168.1.100'::inet,
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
  'device_001',
  'Emergency Department, Floor 1',
  '{"mfa_used": false, "risk_score": 0.2}'::jsonb,
  NOW() - INTERVAL '2 hours'
FROM first_user
ON CONFLICT DO NOTHING;

WITH first_user AS (SELECT id FROM auth.users LIMIT 1)
INSERT INTO public.auth_audit_logs (
  id, user_id, event_type, auth_method, ip_address, user_agent, device_id, location, metadata, created_at
) 
SELECT 
  gen_random_uuid(),
  first_user.id,
  'biometric_verify_success',
  'facial_recognition',
  '192.168.1.100'::inet,
  'Mozilla/5.0 (iPad; CPU OS 17_0) Safari/605.1.15',
  'device_002',
  'ICU Nursing Station',
  '{"confidence": 0.97, "model_version": "1.0.0"}'::jsonb,
  NOW() - INTERVAL '1 hour'
FROM first_user
ON CONFLICT DO NOTHING;

WITH first_user AS (SELECT id FROM auth.users LIMIT 1)
INSERT INTO public.auth_audit_logs (
  id, user_id, event_type, auth_method, ip_address, user_agent, device_id, location, metadata, created_at
) 
SELECT 
  gen_random_uuid(),
  first_user.id,
  'break_glass_access',
  'emergency_override',
  '192.168.1.101'::inet,
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
  'device_003',
  'Emergency Department, Trauma Bay',
  '{"reason": "cardiac_arrest", "patient_id": "PT-2024-001"}'::jsonb,
  NOW() - INTERVAL '30 minutes'
FROM first_user
ON CONFLICT DO NOTHING;

-- Fixed break_glass_logs insert with witness_id included
WITH first_user AS (SELECT id FROM auth.users LIMIT 1)
INSERT INTO public.break_glass_logs (
  id, user_id, patient_id, reason, emergency_type, accessed_records, 
  witness_id, supervisor_notified, ip_address, device_id, location, accessed_at
) 
SELECT 
  gen_random_uuid(),
  first_user.id,
  'PT-2024-001',
  'Patient arrived via ambulance with suspected cardiac arrest. Immediate access to medical history required for treatment decisions.',
  'code_blue',
  ARRAY['medical_history', 'allergies', 'current_medications'],
  first_user.id,  -- witness_id (same user for demo)
  true,
  '192.168.1.101'::inet,
  'ED-TABLET-003',
  'Emergency Department, Trauma Bay 2',
  NOW() - INTERVAL '30 minutes'
FROM first_user
ON CONFLICT DO NOTHING;

-- Added second break-glass log (pending review)
WITH first_user AS (SELECT id FROM auth.users LIMIT 1)
INSERT INTO public.break_glass_logs (
  id, user_id, patient_id, reason, emergency_type, accessed_records, 
  witness_id, supervisor_notified, ip_address, device_id, location, accessed_at, reviewed_at, reviewed_by
) 
SELECT 
  gen_random_uuid(),
  first_user.id,
  'PT-2024-002',
  'Unconscious patient in ER, no ID available. Need to check for existing conditions and allergies.',
  'trauma',
  ARRAY['medical_history', 'allergies', 'emergency_contacts'],
  NULL,  -- No witness available
  true,
  '192.168.1.102'::inet,
  'ED-TABLET-005',
  'Emergency Department, Bay 4',
  NOW() - INTERVAL '15 minutes',
  NULL,  -- Not yet reviewed
  NULL
FROM first_user
ON CONFLICT DO NOTHING;

-- Insert sample risk contexts
WITH first_user AS (SELECT id FROM auth.users LIMIT 1)
INSERT INTO public.risk_contexts (
  id, user_id, context_type, context_value, trust_score, is_trusted, last_seen_at, created_at
) 
SELECT 
  gen_random_uuid(),
  first_user.id,
  'device',
  '{"device_id": "device_001", "device_type": "desktop", "os": "Windows 11", "browser": "Chrome"}'::jsonb,
  0.85,
  true,
  NOW(),
  NOW() - INTERVAL '7 days'
FROM first_user
ON CONFLICT DO NOTHING;

-- Added trusted location context
WITH first_user AS (SELECT id FROM auth.users LIMIT 1)
INSERT INTO public.risk_contexts (
  id, user_id, context_type, context_value, trust_score, is_trusted, last_seen_at, created_at
) 
SELECT 
  gen_random_uuid(),
  first_user.id,
  'location',
  '{"ip_range": "192.168.1.0/24", "location_name": "Main Hospital Campus", "building": "Emergency Department"}'::jsonb,
  0.95,
  true,
  NOW(),
  NOW() - INTERVAL '30 days'
FROM first_user
ON CONFLICT DO NOTHING;

-- Verify seed data
SELECT 'Seed data inserted successfully!' as status;
SELECT 'Audit Logs: ' || COUNT(*)::text as count FROM public.auth_audit_logs;
SELECT 'Break Glass Logs: ' || COUNT(*)::text as count FROM public.break_glass_logs;
SELECT 'Risk Contexts: ' || COUNT(*)::text as count FROM public.risk_contexts;
