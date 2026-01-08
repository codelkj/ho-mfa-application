# HO-MFA Feature Testing Guide

## Overview

This guide explains how to test all 6 future work features and verify which implementations are real vs simulated.

## Feature Status

### ✅ REAL Implementations

These features use actual hardware/software APIs and write to real databases:

#### 1. FIDO2 Authentication (REAL)
- **What's Real**: Uses WebAuthn API for actual hardware security keys
- **How to Verify**: 
  1. Insert a YubiKey or compatible security key
  2. Go to `/testing` → FIDO2 tab
  3. Click "Register Security Key"
  4. Browser will prompt for physical key interaction
  5. Check database: `SELECT * FROM fido2_credentials`
- **Evidence**: Real cryptographic attestation, physical key required, browser security prompts

#### 2. ML Risk Scoring (REAL)
- **What's Real**: PostgreSQL function analyzes real session data
- **How to Verify**:
  1. Go to `/testing` → ML Risk tab
  2. Click "Calculate Risk Score"
  3. Function queries actual auth_sessions, auth_audit_logs tables
  4. Returns real-time risk analysis
  5. Check: `SELECT * FROM ml_training_data`
- **Evidence**: Database function `extract_risk_features()` processes real data

#### 3. Biometric Verification (REAL)
- **What's Real**: Uses device Touch ID, Face ID, or Windows Hello
- **How to Verify**:
  1. Must use device with biometric hardware (MacBook, iPhone, Windows laptop)
  2. Go to `/testing` → Biometric tab
  3. Click "Enroll Biometric"
  4. OS will prompt for fingerprint/face scan
  5. Actual biometric input required
- **Evidence**: WebAuthn platform authenticator with UV flag, OS-level prompts

#### 4. Break-Glass Protocol (REAL)
- **What's Real**: Complete audit trail in database
- **How to Verify**:
  1. Go to `/testing` → Break-Glass tab
  2. Click "Emergency Access"
  3. Check: `SELECT * FROM break_glass_logs`
  4. Verify timestamps, user_id, justification
- **Evidence**: Full PostgreSQL audit trail with RLS policies

### ⚠️ SIMULATED Implementations

These features have real database structures but lack external dependencies:

#### 5. EHR Integration (SIMULATED)
- **What's Simulated**: FHIR API calls to Epic/Cerner
- **What's Real**: Database logging in `ehr_auth_events` table
- **Why**: Requires actual hospital EHR system access
- **How to Make Real**: Connect to real FHIR endpoint, add OAuth tokens

#### 6. Mobile Application (SIMULATED)
- **What's Simulated**: Push notifications to iOS/Android
- **What's Real**: Database records in `mobile_sessions` and `push_notifications`
- **Why**: Requires native mobile app with FCM/APNs tokens
- **How to Make Real**: Build React Native app, integrate Firebase Cloud Messaging

## Step-by-Step Verification

### 1. Run System Verification

\`\`\`bash
1. Navigate to /testing
2. Click "Run Verification" at the top
3. Review the verification report showing:
   - Real vs Simulated status
   - Database record counts
   - Evidence for each feature
\`\`\`

### 2. Test FIDO2 (Real Hardware)

\`\`\`bash
Required: YubiKey, Titan Key, or compatible FIDO2 device

1. Insert security key
2. Go to /testing → FIDO2 tab
3. Click "Register Security Key"
4. Touch the key when browser prompts
5. Success = Real credential stored

Verify in database:
SELECT credential_id, device_type, created_at 
FROM fido2_credentials 
WHERE user_id = 'your-user-id';
\`\`\`

### 3. Test Biometrics (Real Sensor)

\`\`\`bash
Required: Mac with Touch ID, iPhone with Face ID, or Windows Hello device

1. Go to /testing → Biometric tab
2. Click "Enroll Biometric"
3. OS will request fingerprint/face scan
4. Provide real biometric input
5. Success = Real biometric credential

Verify:
- Look for "User Verified" flag in response
- Check platform authenticator attachment type
\`\`\`

### 4. Test ML Risk Scoring (Real Analysis)

\`\`\`bash
1. Go to /testing → ML Risk tab
2. Click "Calculate Risk Score"
3. Function analyzes:
   - Your recent login history
   - Failed authentication attempts
   - Device/IP patterns
   - Time-based patterns

Verify function:
SELECT extract_risk_features(
  'user-id',
  '192.168.1.1'::inet,
  'device-123',
  'New York, NY'
);
\`\`\`

### 5. Test Break-Glass (Real Audit Trail)

\`\`\`bash
1. Go to /testing → Break-Glass tab
2. Enter emergency justification
3. Click "Request Emergency Access"
4. Check full audit trail

Verify:
SELECT 
  approved_by,
  justification,
  expires_at,
  created_at
FROM break_glass_logs
ORDER BY created_at DESC;
\`\`\`

## How to Confirm Everything is Real

### Database Verification

\`\`\`sql
-- Count all feature records
SELECT 
  'FIDO2' as feature,
  COUNT(*) as records
FROM fido2_credentials
UNION ALL
SELECT 'ML Training', COUNT(*) FROM ml_training_data
UNION ALL
SELECT 'EHR Events', COUNT(*) FROM ehr_auth_events
UNION ALL
SELECT 'Mobile Sessions', COUNT(*) FROM mobile_sessions
UNION ALL
SELECT 'Push Notifications', COUNT(*) FROM push_notifications
UNION ALL
SELECT 'Break-Glass', COUNT(*) FROM break_glass_logs;
\`\`\`

### WebAuthn Browser Check

\`\`\`javascript
// Check if WebAuthn is supported
console.log('WebAuthn supported:', 'credentials' in navigator);

// Check biometric availability
PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  .then(available => console.log('Biometrics available:', available));
\`\`\`

### Feature Flag Status

\`\`\`sql
SELECT 
  feature_key,
  is_enabled,
  rollout_percentage
FROM feature_flags
WHERE organization_id = 'your-org-id';
\`\`\`

## Common Issues

### "WebAuthn not supported"
- Use Chrome 67+, Firefox 60+, Safari 13+, or Edge 18+
- HTTPS required (or localhost for testing)

### "No biometric hardware detected"
- Ensure device has Touch ID, Face ID, or Windows Hello
- Check OS privacy settings allow browser biometric access

### "Database records not appearing"
- Check RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'your_table'`
- Verify user authentication: `SELECT auth.uid()`

## Production Readiness

### Real Features (Production Ready)
- ✅ FIDO2 Authentication
- ✅ ML Risk Scoring
- ✅ Biometric Verification
- ✅ Break-Glass Protocol

### Simulated Features (Need External Services)
- ⚠️ EHR Integration → Requires Epic/Cerner API credentials
- ⚠️ Mobile Push → Requires React Native app + FCM/APNs

## Next Steps

1. Enable all features in `/settings`
2. Test each feature following this guide
3. Run verification checks
4. Review database records
5. For production: Configure external EHR and mobile push services
