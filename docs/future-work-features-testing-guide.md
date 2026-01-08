# HO-MFA Future Work Features - Testing Guide

## Overview

This guide explains how to test all the advanced features implemented to address the limitations identified in the capstone report.

---

## 1. Multi-Tenant Architecture

### Implementation Location
- **Database Schema**: `scripts/004_add_future_work_features.sql`
- **Tables**: `organizations`, updated `profiles`, `auth_sessions`, `break_glass_logs`
- **RLS Policies**: Organization-scoped data isolation

### Status
✅ **FULLY FUNCTIONAL** - Database schema deployed, RLS policies active

### How to Test

**Step 1: View Current Organization**
\`\`\`sql
-- Run in Supabase SQL Editor
SELECT * FROM organizations;
SELECT id, email, role, organization_id FROM profiles;
\`\`\`

**Step 2: Create a New Organization**
\`\`\`sql
INSERT INTO organizations (name, domain, settings)
VALUES (
  'St. Mary Medical Center', 
  'stmary.health',
  '{"session_timeout_minutes": 45, "require_biometric": true}'::jsonb
);
\`\`\`

**Step 3: Test Data Isolation**
- Log in as User A (Organization 1)
- Try to access sessions from Organization 2
- Should see only your organization's data (RLS enforced)

**Expected Result**: Users can only see data from their own organization

---

## 2. FIDO2/WebAuthn Hardware Security Keys

### Implementation Location
- **Client Library**: `lib/fido2/webauthn.ts`
- **Database Table**: `fido2_credentials`
- **Functions**: `registerFIDO2Credential()`, `verifyFIDO2Credential()`

### Status
✅ **FULLY FUNCTIONAL** - Requires HTTPS and hardware security key (YubiKey, etc.)

### How to Test

**Step 1: Check Browser Support**
\`\`\`javascript
// Open browser console and run:
console.log('WebAuthn supported:', !!window.PublicKeyCredential);
\`\`\`

**Step 2: Register a Security Key**
\`\`\`typescript
// In your browser console or enrollment page:
import { registerFIDO2Credential } from '@/lib/fido2/webauthn';

await registerFIDO2Credential(
  'user-uuid-here',
  'user@hospital.com',
  'Dr. Sarah Chen'
);
\`\`\`

**Step 3: Test Authentication**
- Insert your YubiKey or security key
- Browser will prompt for user presence (touch sensor)
- Credential gets stored in `fido2_credentials` table

**Step 4: Verify in Database**
\`\`\`sql
SELECT * FROM fido2_credentials WHERE user_id = 'your-user-id';
\`\`\`

**Expected Result**: 
- Browser shows security key prompt
- Touch sensor activates
- Credential saved with `credential_id` and `public_key`

**⚠️ Requirements**:
- HTTPS connection (WebAuthn requires secure context)
- Physical security key device
- Supported browser (Chrome, Firefox, Edge, Safari 14+)

---

## 3. ML-Based Risk Scoring

### Implementation Location
- **Risk Scorer**: `lib/ml/risk-scorer.ts`
- **Database Functions**: `extract_risk_features()` in SQL migration
- **Training Data**: `ml_training_data` table

### Status
✅ **FULLY FUNCTIONAL** - Using lightweight logistic regression model

### How to Test

**Step 1: Enable Feature Flag**
\`\`\`typescript
// Navigate to /settings
// Toggle "ML Risk Scoring" to ON
\`\`\`

**Step 2: Calculate Risk Score**
\`\`\`typescript
import { calculateMLRiskScore } from '@/lib/ml/risk-scorer';

const riskScore = await calculateMLRiskScore(
  'user-id',
  '192.168.1.100', // IP address
  'device-123',     // Device ID
  'Los Angeles, CA' // Location
);

console.log('Risk Score:', riskScore);
// {
//   score: 0.65,
//   level: 'high',
//   confidence: 0.85,
//   factors: [
//     { name: 'Unknown IP Address', contribution: 30 },
//     { name: 'New Device', contribution: 25 }
//   ],
//   recommendation: 'step_up'
// }
\`\`\`

**Step 3: View Feature Importance**
- Login from a new device or unknown IP
- Check the `risk_contexts` table for `ml_confidence_score` and `feature_vector`

**Step 4: View Training Data**
\`\`\`sql
SELECT * FROM ml_training_data 
ORDER BY created_at DESC 
LIMIT 10;
\`\`\`

**Expected Result**:
- Risk score calculated based on ML features (not just rules)
- Feature contributions explain the score (explainable AI)
- Training data captured for model improvement

**Feature Weights**:
- Unknown IP: +30% risk
- New Device: +25% risk  
- Failed attempts: +35% risk
- Weekend access: +15% risk
- Unusual time: +20% risk

---

## 4. EHR Integration (HL7 FHIR)

### Implementation Location
- **FHIR Client**: `lib/ehr/fhir-client.ts`
- **Database Tables**: `ehr_integrations`, `ehr_auth_events`
- **Functions**: `authenticateWithEHR()`, `searchPatient()`, `checkPatientAccess()`

### Status
✅ **FULLY FUNCTIONAL** - Requires EHR system configuration

### How to Test

**Step 1: Configure EHR Integration**
\`\`\`sql
INSERT INTO ehr_integrations (
  organization_id,
  ehr_system,
  fhir_base_url,
  client_id,
  auth_type,
  is_active
) VALUES (
  (SELECT id FROM organizations WHERE domain = 'default.hospital.local'),
  'epic',
  'https://fhir.epic.com/interconnect-fhir-oauth',
  'your-client-id',
  'oauth2',
  true
);
\`\`\`

**Step 2: Test Patient Search**
\`\`\`typescript
import { searchPatient } from '@/lib/ehr/fhir-client';

const patient = await searchPatient(
  'org-id-here',
  'MRN-12345' // Medical Record Number
);

console.log('Patient:', patient);
// {
//   resourceType: 'Patient',
//   id: '12345',
//   name: [{ family: 'Smith', given: ['John'] }],
//   birthDate: '1980-01-01'
// }
\`\`\`

**Step 3: Check Access Permissions**
\`\`\`typescript
import { checkPatientAccess } from '@/lib/ehr/fhir-client';

const access = await checkPatientAccess(
  'user-id',
  'patient-id'
);

console.log('Access allowed:', access.allowed);
// { allowed: true } or { allowed: false, reason: 'Risk score too high' }
\`\`\`

**Step 4: View EHR Access Audit Log**
\`\`\`sql
SELECT * FROM ehr_auth_events 
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC;
\`\`\`

**Expected Result**:
- Patient data retrieved via FHIR API
- Access control enforced based on role and risk score
- All EHR access logged for HIPAA compliance

**Supported EHR Systems**:
- Epic (with App Orchard credentials)
- Cerner (with Code Console setup)
- Meditech
- Allscripts
- Custom FHIR R4 servers

---

## 5. Mobile Application Support

### Implementation Location
- **Database Tables**: `mobile_sessions`, `push_notifications`
- **Features**: Device token tracking, push notification queue

### Status
✅ **PARTIALLY FUNCTIONAL** - Database ready, requires native app for full testing

### How to Test

**Step 1: Register Mobile Device**
\`\`\`sql
INSERT INTO mobile_sessions (
  user_id,
  device_token,
  platform,
  app_version,
  push_token,
  biometric_enabled
) VALUES (
  'your-user-id',
  'device-token-abc123',
  'ios',
  '1.0.0',
  'fcm-push-token-xyz789',
  true
);
\`\`\`

**Step 2: Queue Push Notification**
\`\`\`sql
INSERT INTO push_notifications (
  mobile_session_id,
  notification_type,
  title,
  body,
  data
) VALUES (
  (SELECT id FROM mobile_sessions WHERE device_token = 'device-token-abc123'),
  'auth_challenge',
  'Authentication Request',
  'Approve login from Chrome on MacBook Pro',
  '{"session_id": "session-123", "location": "Los Angeles"}'::jsonb
);
\`\`\`

**Step 3: View Mobile Sessions**
\`\`\`sql
SELECT * FROM mobile_sessions 
WHERE user_id = 'your-user-id' 
AND is_active = true;
\`\`\`

**Step 4: View Push Notification Queue**
\`\`\`sql
SELECT * FROM push_notifications 
WHERE status = 'pending' 
AND expires_at > NOW();
\`\`\`

**Expected Result**:
- Mobile device registered with platform and push token
- Notifications queued and marked as sent
- Expired notifications cleaned up automatically

**Mobile Features Supported**:
- iOS/Android device tracking
- Push notification delivery
- Biometric authentication (fingerprint/Face ID)
- Session synchronization across devices

---

## 6. Feature Flags System

### Implementation Location
- **Feature Flags Library**: `lib/feature-flags.ts`
- **Admin Panel**: `components/settings/feature-toggle-panel.tsx`
- **Settings Page**: `app/settings/page.tsx`
- **Database Table**: `feature_flags`

### Status
✅ **FULLY FUNCTIONAL** - Admin panel with toggle switches

### How to Test

**Step 1: Navigate to Settings**
\`\`\`
/settings
\`\`\`

**Step 2: View Feature Toggles**
- You should see 6 feature toggles:
  1. FIDO2 Authentication
  2. ML Risk Scoring
  3. EHR Integration
  4. Mobile Application
  5. Biometric Verification
  6. Break-Glass Protocol

**Step 3: Toggle Features (Admin Only)**
- Switch "ML Risk Scoring" to ON
- Switch "EHR Integration" to OFF
- Changes saved automatically to database

**Step 4: Check Feature Status Programmatically**
\`\`\`typescript
import { isFeatureEnabled, FEATURES } from '@/lib/feature-flags';

const mlEnabled = await isFeatureEnabled(FEATURES.ML_RISK_SCORING);
console.log('ML Risk Scoring enabled:', mlEnabled);
\`\`\`

**Step 5: Verify in Database**
\`\`\`sql
SELECT feature_key, is_enabled, rollout_percentage 
FROM feature_flags 
WHERE organization_id = 'your-org-id';
\`\`\`

**Step 6: Test Gradual Rollout**
\`\`\`sql
-- Enable feature for 50% of users
UPDATE feature_flags 
SET is_enabled = true, rollout_percentage = 50
WHERE feature_key = 'ml_risk_scoring';
\`\`\`

**Expected Result**:
- Admin sees all toggle switches
- Non-admin sees read-only view
- Feature state changes reflected immediately
- Gradual rollout supported (0-100%)

---

## Testing Summary

| Feature | Status | Testing Method | Dependencies |
|---------|--------|----------------|--------------|
| **Multi-Tenant** | ✅ Active | SQL queries, RLS testing | Database only |
| **FIDO2** | ✅ Active | Browser WebAuthn API, security key | HTTPS, hardware key |
| **ML Risk Scoring** | ✅ Active | API calls, console testing | Feature flag ON |
| **EHR Integration** | ✅ Active | FHIR API calls | EHR system credentials |
| **Mobile Support** | ⚠️ Partial | Database testing | Native app (optional) |
| **Feature Flags** | ✅ Active | Settings page UI | Admin role |

---

## Quick Start Testing Script

Run this in your browser console after logging in:

\`\`\`typescript
// Test all feature flags
import { getFeatureFlags } from '@/lib/feature-flags';
const flags = await getFeatureFlags();
console.table(flags);

// Test ML risk scoring
import { calculateMLRiskScore } from '@/lib/ml/risk-scorer';
const risk = await calculateMLRiskScore(
  'current-user-id',
  null, 
  null, 
  null
);
console.log('Current Risk Score:', risk);

// Check FIDO2 support
console.log('WebAuthn Support:', {
  available: !!window.PublicKeyCredential,
  conditionalUI: PublicKeyCredential.isConditionalMediationAvailable?.() || false
});
\`\`\`

---

## Troubleshooting

### FIDO2 Not Working
- **Issue**: "WebAuthn not supported"
- **Fix**: Use HTTPS (required by WebAuthn API)
- **Fix**: Test in Chrome/Edge (best support)

### ML Risk Scoring Returns 0.5
- **Issue**: Fallback scoring activated
- **Fix**: Enable feature flag in `/settings`
- **Fix**: Check `risk_contexts` table exists

### EHR Integration Fails
- **Issue**: "No active EHR integration found"
- **Fix**: Insert row in `ehr_integrations` table
- **Fix**: Provide valid FHIR endpoint URL

### Feature Toggles Not Visible
- **Issue**: Empty feature list
- **Fix**: Run migration script 004
- **Fix**: Check user has admin role

---

## Production Deployment Checklist

Before deploying these features to production:

- [ ] Run `004_add_future_work_features.sql` migration
- [ ] Configure HTTPS certificate (required for FIDO2)
- [ ] Set up EHR system OAuth credentials
- [ ] Configure mobile push notification service (FCM/APNS)
- [ ] Test RLS policies prevent cross-organization data access
- [ ] Train ML model on production data (replace logistic regression)
- [ ] Set gradual rollout percentages (start at 10%)
- [ ] Configure organization-specific settings
- [ ] Test break-glass protocol with all features enabled

---

## Additional Resources

- **FIDO2 Specification**: https://fidoalliance.org/specifications/
- **HL7 FHIR R4**: https://hl7.org/fhir/R4/
- **Epic FHIR API**: https://fhir.epic.com/
- **WebAuthn Demo**: https://webauthn.io/

---

*Last Updated: December 2025*
*HO-MFA v2.0.0 - Future Work Features Implementation*
