# Appendix E: API Documentation

## HO-MFA API Reference

**Base URL:** `https://your-project.vercel.app/api`  
**Authentication:** Session-based (cookies)  
**Content-Type:** `application/json`

---

## Authentication Endpoints

### POST /api/auth/login

**Description:** Authenticate user with email and password.

**Request:**
\`\`\`json
{
  "email": "dr.chen@hospital.org",
  "password": "SecurePassword123!"
}
\`\`\`

**Response (Success):**
\`\`\`json
{
  "user": {
    "id": "uuid-here",
    "email": "dr.chen@hospital.org",
    "role": "physician"
  },
  "session": {
    "access_token": "jwt-token",
    "expires_at": "2025-12-12T06:42:00Z"
  }
}
\`\`\`

**Response (Failure):**
\`\`\`json
{
  "error": "Invalid credentials",
  "code": "AUTH_INVALID_CREDENTIALS"
}
\`\`\`

**Status Codes:**
- `200 OK` - Successful authentication
- `401 Unauthorized` - Invalid credentials
- `429 Too Many Requests` - Rate limit exceeded

---

### POST /api/auth/signup

**Description:** Create new user account.

**Request:**
\`\`\`json
{
  "email": "new.user@hospital.org",
  "password": "SecurePassword123!",
  "full_name": "Dr. Jane Smith",
  "role": "physician",
  "department": "Emergency Medicine",
  "employee_id": "EMP-2025-001"
}
\`\`\`

**Response (Success):**
\`\`\`json
{
  "user": {
    "id": "uuid-here",
    "email": "new.user@hospital.org"
  },
  "message": "Verification email sent"
}
\`\`\`

**Status Codes:**
- `201 Created` - Account created successfully
- `400 Bad Request` - Invalid input data
- `409 Conflict` - Email already exists

---

### POST /api/auth/logout

**Description:** End user session.

**Request:** (No body required, uses session cookie)

**Response:**
\`\`\`json
{
  "message": "Logged out successfully"
}
\`\`\`

**Status Codes:**
- `200 OK` - Session ended
- `401 Unauthorized` - No active session

---

## Biometric Endpoints

### POST /api/biometric/enroll

**Description:** Enroll biometric template for user.

**Request:**
\`\`\`json
{
  "biometric_type": "fingerprint",
  "embedding_hash": "sha256-hash-of-biometric-template",
  "device_id": "device-123",
  "model_version": "v1.0"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "enrollment-uuid",
  "biometric_type": "fingerprint",
  "enrolled_at": "2025-12-11T10:30:00Z",
  "is_active": true
}
\`\`\`

**Status Codes:**
- `201 Created` - Enrollment successful
- `400 Bad Request` - Invalid biometric data
- `409 Conflict` - Biometric type already enrolled

---

### POST /api/biometric/verify

**Description:** Verify biometric against enrolled template.

**Request:**
\`\`\`json
{
  "biometric_type": "fingerprint",
  "embedding_hash": "sha256-hash-to-verify"
}
\`\`\`

**Response (Match):**
\`\`\`json
{
  "verified": true,
  "confidence": 0.97,
  "user_id": "user-uuid"
}
\`\`\`

**Response (No Match):**
\`\`\`json
{
  "verified": false,
  "confidence": 0.42,
  "error": "Biometric mismatch"
}
\`\`\`

**Status Codes:**
- `200 OK` - Verification attempted
- `404 Not Found` - No enrollment found for user

---

## Break-Glass Endpoints

### POST /api/break-glass/request

**Description:** Request emergency access with logging.

**Request:**
\`\`\`json
{
  "patient_id": "PT-2024-001",
  "reason": "Patient in cardiac arrest, immediate access to medical history required",
  "emergency_type": "code_blue",
  "witness_id": "witness-user-uuid"
}
\`\`\`

**Response:**
\`\`\`json
{
  "access_granted": true,
  "log_id": "BG-2024-015",
  "accessed_at": "2025-12-11T14:32:00Z",
  "supervisor_notified": true,
  "message": "Emergency access granted. All actions are being logged."
}
\`\`\`

**Status Codes:**
- `200 OK` - Access granted
- `400 Bad Request` - Missing required fields
- `403 Forbidden` - User not authorized for break-glass

---

### GET /api/break-glass/logs

**Description:** Retrieve break-glass access logs (admin only).

**Query Parameters:**
- `user_id` (optional) - Filter by user
- `start_date` (optional) - Filter by date range
- `end_date` (optional)
- `reviewed` (optional) - Filter by review status (true/false)

**Response:**
\`\`\`json
{
  "logs": [
    {
      "id": "BG-2024-015",
      "user_id": "user-uuid",
      "user_name": "Dr. Chen",
      "patient_id": "PT-2024-001",
      "reason": "Cardiac arrest",
      "emergency_type": "code_blue",
      "accessed_at": "2025-12-11T14:32:00Z",
      "reviewed": false
    }
  ],
  "total": 15,
  "page": 1,
  "per_page": 20
}
\`\`\`

**Status Codes:**
- `200 OK` - Logs retrieved
- `403 Forbidden` - Not admin user

---

## Security Endpoints

### GET /api/security/score

**Description:** Calculate current security score for user.

**Response:**
\`\`\`json
{
  "score": 100,
  "rating": "Excellent",
  "factors": {
    "mfa_enabled": true,
    "biometric_enrolled": true,
    "password_strong": true,
    "recent_login_anomalies": false,
    "session_expired": false
  }
}
\`\`\`

**Status Codes:**
- `200 OK` - Score calculated
- `401 Unauthorized` - Not authenticated

---

### POST /api/security/scan

**Description:** Trigger security vulnerability scan (admin only).

**Response:**
\`\`\`json
{
  "scan_id": "scan-uuid",
  "status": "in_progress",
  "estimated_duration": "2 minutes"
}
\`\`\`

**Status Codes:**
- `202 Accepted` - Scan started
- `403 Forbidden` - Not admin

---

## Audit Endpoints

### GET /api/audit/logs

**Description:** Retrieve audit logs.

**Query Parameters:**
- `user_id` (optional)
- `event_type` (optional) - e.g., "login_success", "break_glass_access"
- `start_date` (optional)
- `end_date` (optional)

**Response:**
\`\`\`json
{
  "logs": [
    {
      "id": "log-uuid",
      "user_id": "user-uuid",
      "event_type": "login_success",
      "auth_method": "password",
      "ip_address": "192.168.1.100",
      "created_at": "2025-12-11T10:15:00Z"
    }
  ],
  "total": 1847,
  "page": 1
}
\`\`\`

**Status Codes:**
- `200 OK` - Logs retrieved
- `403 Forbidden` - Insufficient permissions

---

## Report Endpoints

### POST /api/reports/compliance

**Description:** Generate HIPAA compliance report.

**Request:**
\`\`\`json
{
  "organization_name": "Metro General Hospital",
  "report_period": "last_30_days"
}
\`\`\`

**Response:**
\`\`\`json
{
  "report_id": "RPT-MJ1FGRTL",
  "generated_at": "2025-12-11T15:00:00Z",
  "download_url": "/reports/RPT-MJ1FGRTL.pdf",
  "expires_at": "2025-12-18T15:00:00Z"
}
\`\`\`

**Status Codes:**
- `201 Created` - Report generated
- `403 Forbidden` - Not admin/compliance officer

---

## Rate Limiting

**Limits:**
- Authentication endpoints: 5 requests per 5 minutes per IP
- General API endpoints: 100 requests per minute per user
- Report generation: 10 requests per hour per user

**Rate Limit Headers:**
\`\`\`
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1702306800
\`\`\`

**Response (Rate Limit Exceeded):**
\`\`\`json
{
  "error": "Rate limit exceeded",
  "retry_after": 300
}
\`\`\`

**Status Code:** `429 Too Many Requests`

---

## Error Codes

| Code | Meaning |
|------|---------|
| `AUTH_INVALID_CREDENTIALS` | Email or password incorrect |
| `AUTH_EMAIL_NOT_VERIFIED` | User must verify email first |
| `AUTH_ACCOUNT_LOCKED` | Too many failed attempts |
| `BIOMETRIC_ENROLLMENT_EXISTS` | Biometric type already enrolled |
| `BIOMETRIC_VERIFICATION_FAILED` | Biometric does not match |
| `BREAK_GLASS_UNAUTHORIZED` | User role not permitted |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_SERVER_ERROR` | Unexpected server error |

---

## Webhooks (Future Enhancement)

**Planned Endpoints:**
- `POST /api/webhooks/audit-event` - Notify external SIEM
- `POST /api/webhooks/break-glass` - Alert supervisor
- `POST /api/webhooks/anomaly-detected` - Security alerts

*Not currently implemented*

---

## SDK Example (TypeScript)

\`\`\`typescript
import { SupabaseClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = new SupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Login example
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'dr.chen@hospital.org',
  password: 'SecurePassword123!'
})

// Break-glass access example
const { data: bgData, error: bgError } = await supabase
  .from('break_glass_logs')
  .insert({
    patient_id: 'PT-2024-001',
    reason: 'Emergency access',
    emergency_type: 'code_blue'
  })
