-- Add EHR integration configuration for real FHIR endpoints
-- This script sets up templates for connecting to actual EHR systems

-- Example Epic FHIR integration (sandbox for testing)
INSERT INTO public.ehr_integrations (
  organization_id,
  ehr_system,
  fhir_base_url,
  client_id,
  auth_type,
  config,
  is_active
)
SELECT 
  id,
  'epic',
  'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
  'YOUR_EPIC_CLIENT_ID',
  'oauth2',
  jsonb_build_object(
    'token_endpoint', 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
    'authorize_endpoint', 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize',
    'scope', 'patient/*.read',
    'redirect_uri', 'https://your-app.vercel.app/api/ehr/callback'
  ),
  false -- Set to true once configured
FROM public.organizations
WHERE domain = 'default.hospital.local'
ON CONFLICT DO NOTHING;

-- Example Cerner FHIR integration
INSERT INTO public.ehr_integrations (
  organization_id,
  ehr_system,
  fhir_base_url,
  client_id,
  auth_type,
  config,
  is_active
)
SELECT 
  id,
  'cerner',
  'https://fhir-myrecord.cerner.com/r4',
  'YOUR_CERNER_CLIENT_ID',
  'oauth2',
  jsonb_build_object(
    'token_endpoint', 'https://authorization.cerner.com/tenants/YOUR_TENANT/protocols/oauth2/profiles/smart-v1/token',
    'authorize_endpoint', 'https://authorization.cerner.com/tenants/YOUR_TENANT/protocols/oauth2/profiles/smart-v1/authorize',
    'scope', 'patient/Patient.read patient/Observation.read',
    'redirect_uri', 'https://your-app.vercel.app/api/ehr/callback'
  ),
  false
FROM public.organizations
WHERE domain = 'default.hospital.local'
ON CONFLICT DO NOTHING;

-- Add RLS policies for EHR integrations
CREATE POLICY "Admins can manage EHR integrations" ON public.ehr_integrations
  FOR ALL USING (public.is_current_user_admin());

CREATE POLICY "Users can view org EHR integrations" ON public.ehr_integrations
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Add environment variable documentation
COMMENT ON TABLE public.ehr_integrations IS 
'EHR integration configurations. Requires environment variables:
- EPIC_CLIENT_SECRET
- CERNER_CLIENT_SECRET
- FCM_SERVER_KEY (for push notifications)
Configure these in your Vercel project settings.';
