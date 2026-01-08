# HO-MFA Production Deployment Guide

## Environment Variables Required

### Supabase (Already Configured)
\`\`\`
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

### EHR Integration (Required for Real FHIR)

#### Epic FHIR
\`\`\`
EPIC_CLIENT_ID=your-epic-client-id
EPIC_CLIENT_SECRET=your-epic-client-secret
EPIC_FHIR_BASE_URL=https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4
\`\`\`

To get Epic credentials:
1. Register at https://fhir.epic.com/
2. Create a new app
3. Select "Backend Services" or "SMART on FHIR"
4. Add redirect URI: `https://your-domain.com/api/ehr/callback`

#### Cerner FHIR
\`\`\`
CERNER_CLIENT_ID=your-cerner-client-id
CERNER_CLIENT_SECRET=your-cerner-client-secret
CERNER_TENANT_ID=your-tenant-id
\`\`\`

To get Cerner credentials:
1. Register at https://code.cerner.com/
2. Create SMART on FHIR application
3. Configure scopes and redirect URIs

### Mobile Push Notifications (Required for Real Push)

#### Firebase Cloud Messaging (Android & iOS)
\`\`\`
FCM_PROJECT_ID=your-firebase-project-id
FCM_SERVER_KEY=your-fcm-server-key
FCM_SENDER_ID=your-sender-id
\`\`\`

To get FCM credentials:
1. Create Firebase project at https://console.firebase.google.com/
2. Add Android and iOS apps
3. Download google-services.json (Android) and GoogleService-Info.plist (iOS)
4. Get Server Key from Project Settings > Cloud Messaging

#### Apple Push Notification Service (iOS)
\`\`\`
APNS_KEY_ID=your-apns-key-id
APNS_TEAM_ID=your-apple-team-id
APNS_AUTH_KEY=your-apns-auth-key
\`\`\`

To get APNS credentials:
1. Apple Developer Account required
2. Create APNs Auth Key in Certificates, Identifiers & Profiles
3. Enable Push Notifications in App ID capabilities

## Deployment Steps

### 1. Deploy to Vercel

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
\`\`\`

### 2. Configure Environment Variables

In Vercel Dashboard:
1. Go to Project Settings > Environment Variables
2. Add all required variables above
3. Redeploy for changes to take effect

### 3. Run Database Migrations

\`\`\`bash
# Apply EHR and push configuration
# This is already done via Supabase MCP tools
\`\`\`

### 4. Enable EHR Integrations

In Supabase SQL Editor or via API:
\`\`\`sql
-- Enable Epic integration after configuration
UPDATE public.ehr_integrations
SET is_active = true,
    config = config || jsonb_build_object(
      'client_secret', 'YOUR_ACTUAL_SECRET'
    )
WHERE ehr_system = 'epic';
\`\`\`

### 5. Test Real Implementations

#### FIDO2/WebAuthn (No Additional Setup)
- Works immediately on deployed domain (HTTPS required)
- Test with YubiKey, Titan Key, or any FIDO2 device
- Visit `/testing` → FIDO2 tab

#### Biometric Authentication (No Additional Setup)
- Works on devices with Touch ID, Face ID, Windows Hello
- Test via `/testing` → Biometric tab
- Requires user interaction with actual biometric sensor

#### ML Risk Scoring (Already Real)
- Uses actual database function with real user data
- No additional configuration needed
- Test via `/testing` → ML Risk tab

#### Break-Glass Protocol (Already Real)
- Full audit trail in database
- No additional configuration needed
- Test via `/testing` → Break-Glass tab

#### EHR Integration (Requires FHIR Credentials)
- Add Epic/Cerner credentials to environment variables
- Update `ehr_integrations` table with secrets
- Test via `/testing` → EHR tab
- Will make real FHIR API calls to configured endpoints

#### Mobile Push Notifications (Requires FCM Setup)
- Add FCM credentials to environment variables
- Mobile app must be built with React Native
- Test via `/testing` → Mobile tab
- Will send real push notifications to devices

## Verification Checklist

- [ ] All environment variables configured in Vercel
- [ ] Database migrations applied (check via Supabase dashboard)
- [ ] HTTPS enabled on custom domain (required for WebAuthn)
- [ ] EHR integrations marked active in database
- [ ] FCM project created and credentials added
- [ ] Test all 6 features via `/testing` page
- [ ] Review audit logs in database
- [ ] Check feature flags in `/settings`

## Feature Status Post-Deployment

### ✅ Fully Real (No External Dependencies)
1. FIDO2 Authentication - WebAuthn API with real hardware keys
2. ML Risk Scoring - PostgreSQL function with real data analysis
3. Biometric Verification - WebAuthn with platform authenticators
4. Break-Glass Protocol - Full database audit trail

### 🔧 Real (Requires Configuration)
5. EHR Integration - Real FHIR API calls (needs Epic/Cerner credentials)
6. Mobile Push - Real FCM/APNs (needs Firebase setup + mobile app)

## Troubleshooting

### WebAuthn Not Working
- Ensure HTTPS is enabled (required for WebAuthn)
- Check browser compatibility (Chrome 67+, Firefox 60+, Safari 13+)
- Verify device has biometric hardware or security key

### EHR Integration Failing
- Verify FHIR credentials are correct
- Check EHR system is in `is_active = true` state
- Review `ehr_auth_events` table for error codes
- Ensure redirect URIs match in EHR system registration

### Push Notifications Not Sending
- Verify FCM_SERVER_KEY is set correctly
- Check mobile app has valid push tokens
- Review `push_notifications` table status column
- Ensure Firebase project has Cloud Messaging enabled

## Support

For issues with:
- WebAuthn: Browser console logs, device capabilities
- EHR: Check FHIR endpoint status, OAuth token validity
- Push: Verify FCM project settings, device token format
- Database: Review RLS policies, check user permissions
