# Appendix A: Complete Database Schema

## HO-MFA Database Architecture

### Entity-Relationship Diagram

\`\`\`
┌─────────────────┐
│   auth.users    │ (Supabase Auth - Managed)
│   (Supabase)    │
└────────┬────────┘
         │ 1
         │
         │ 1:1
         ▼
┌─────────────────┐      1:N      ┌──────────────────────┐
│    profiles     │◄───────────────┤ biometric_enrollments│
│                 │                └──────────────────────┘
│ - id (PK, FK)   │
│ - email         │      1:N      ┌──────────────────────┐
│ - full_name     │◄───────────────┤   auth_sessions      │
│ - role          │                └──────────────────────┘
│ - department    │
│ - employee_id   │      1:N      ┌──────────────────────┐
└─────────────────┘◄───────────────┤ break_glass_logs     │
                                   └──────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐      1:N      ┌──────────────────────┐
│ auth_audit_logs │                │  risk_contexts       │
└─────────────────┘                └──────────────────────┘
\`\`\`

### Table Definitions

#### 1. `public.profiles`

**Purpose:** Extends Supabase auth.users with healthcare-specific attributes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, REFERENCES auth.users(id) | User identifier |
| `email` | TEXT | NOT NULL | Email address (synced from auth.users) |
| `full_name` | TEXT | NULL | Full legal name |
| `role` | TEXT | NOT NULL, CHECK IN ('nurse', 'physician', 'admin', 'medical_records') | Healthcare role |
| `department` | TEXT | NULL | Hospital department assignment |
| `employee_id` | TEXT | UNIQUE | Hospital employee identifier |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last profile update |

**Indexes:**
- `idx_profiles_role` ON (role)
- `idx_profiles_department` ON (department)
- `idx_profiles_employee_id` ON (employee_id)

**RLS Policies:**
- Users can view/update own profile
- Admins can view all profiles (via `is_admin()` function)

---

#### 2. `public.biometric_enrollments`

**Purpose:** Stores biometric authentication data (hashed templates, not raw biometrics)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Enrollment record ID |
| `user_id` | UUID | NOT NULL, REFERENCES profiles(id) ON DELETE CASCADE | Associated user |
| `biometric_type` | TEXT | NOT NULL, CHECK IN ('fingerprint', 'facial') | Type of biometric |
| `embedding_hash` | TEXT | NOT NULL | Cryptographic hash of biometric template |
| `model_version` | TEXT | NOT NULL, DEFAULT 'v1.0' | ML model version used |
| `device_id` | TEXT | NULL | Device used for enrollment |
| `enrolled_at` | TIMESTAMPTZ | DEFAULT NOW() | Enrollment timestamp |
| `last_verified_at` | TIMESTAMPTZ | NULL | Last successful verification |
| `is_active` | BOOLEAN | DEFAULT TRUE | Whether enrollment is active |

**Unique Constraint:** (user_id, biometric_type)

**Indexes:**
- `idx_biometric_user` ON (user_id)
- `idx_biometric_type` ON (biometric_type)

**Security Note:** Raw biometric data (fingerprint images, facial scans) are NEVER stored. Only cryptographic hashes of feature vectors are persisted.

---

#### 3. `public.auth_sessions`

**Purpose:** Tracks active user sessions for security monitoring

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Session identifier |
| `user_id` | UUID | NOT NULL, REFERENCES profiles(id) ON DELETE CASCADE | Session owner |
| `session_token` | TEXT | UNIQUE, NOT NULL | Session token (hashed) |
| `auth_method` | TEXT | NOT NULL, CHECK IN ('password', 'biometric', 'break_glass', 'mfa') | Authentication method used |
| `risk_score` | NUMERIC(3,2) | DEFAULT 0.00, CHECK (risk_score BETWEEN 0 AND 1) | Calculated risk score (0.00-1.00) |
| `ip_address` | INET | NULL | Client IP address |
| `user_agent` | TEXT | NULL | Client user agent string |
| `location` | TEXT | NULL | Geolocation or facility name |
| `device_id` | TEXT | NULL | Device fingerprint |
| `started_at` | TIMESTAMPTZ | DEFAULT NOW() | Session start time |
| `expires_at` | TIMESTAMPTZ | NOT NULL | Session expiration time |
| `ended_at` | TIMESTAMPTZ | NULL | Session end time (if explicitly logged out) |
| `is_active` | BOOLEAN | DEFAULT TRUE | Whether session is currently valid |

**Indexes:**
- `idx_sessions_user` ON (user_id)
- `idx_sessions_active` ON (is_active) WHERE is_active = TRUE
- `idx_sessions_expires` ON (expires_at)

---

#### 4. `public.break_glass_logs`

**Purpose:** HIPAA-compliant audit trail for emergency access (§164.312(b))

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Log entry ID |
| `user_id` | UUID | NOT NULL, REFERENCES profiles(id) ON DELETE CASCADE | User who initiated break-glass |
| `patient_id` | TEXT | NOT NULL | Patient identifier accessed |
| `reason` | TEXT | NOT NULL | Justification for emergency access |
| `emergency_type` | TEXT | NOT NULL, CHECK IN ('code_blue', 'trauma', 'critical_lab', 'stroke', 'sepsis', 'other') | Type of emergency |
| `accessed_records` | TEXT[] | NULL | Array of record types accessed (e.g., ['medical_history', 'allergies']) |
| `witness_id` | UUID | NULL, REFERENCES profiles(id) | Witness to emergency (if present) |
| `supervisor_notified` | BOOLEAN | DEFAULT FALSE | Whether supervisor was notified |
| `supervisor_id` | UUID | NULL, REFERENCES profiles(id) | Notified supervisor |
| `ip_address` | INET | NULL | Client IP address |
| `device_id` | TEXT | NULL | Device fingerprint |
| `location` | TEXT | NULL | Physical location (e.g., "ER Bay 3") |
| `accessed_at` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp of access |
| `reviewed_at` | TIMESTAMPTZ | NULL | Timestamp of supervisory review |
| `reviewed_by` | UUID | NULL, REFERENCES profiles(id) | Reviewer user ID |

**Immutability:** Rows in this table are write-once (no UPDATE or DELETE permitted via RLS)

**Indexes:**
- `idx_break_glass_user` ON (user_id)
- `idx_break_glass_accessed` ON (accessed_at)
- `idx_break_glass_patient` ON (patient_id)
- `idx_break_glass_reviewed` ON (reviewed_at)

**HIPAA Retention:** Records retained for 7 years per HIPAA §164.316(b)(2)

---

#### 5. `public.auth_audit_logs`

**Purpose:** Immutable audit trail for all authentication events

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Log entry ID |
| `user_id` | UUID | NULL, REFERENCES profiles(id) ON DELETE SET NULL | User involved (NULL if login failed) |
| `event_type` | TEXT | NOT NULL | Type of authentication event |
| `auth_method` | TEXT | NULL | Authentication method used |
| `ip_address` | INET | NULL | Client IP address |
| `user_agent` | TEXT | NULL | Client user agent |
| `device_id` | TEXT | NULL | Device fingerprint |
| `location` | TEXT | NULL | Geolocation or facility |
| `metadata` | JSONB | DEFAULT '{}' | Additional event metadata |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Event timestamp |

**Event Types:**
- `login_success`, `login_failure`, `logout`
- `biometric_enroll`, `biometric_verify_success`, `biometric_verify_failure`
- `break_glass_access`, `password_change`, `mfa_enabled`, `mfa_disabled`
- `session_timeout`, `suspicious_activity`

**Indexes:**
- `idx_audit_user` ON (user_id)
- `idx_audit_event` ON (event_type)
- `idx_audit_created` ON (created_at)

**RLS:** Insert-only (users cannot read other users' audit logs except admins)

---

#### 6. `public.risk_contexts`

**Purpose:** Stores trusted devices, locations, and behavioral patterns for risk scoring

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Context entry ID |
| `user_id` | UUID | NOT NULL, REFERENCES profiles(id) ON DELETE CASCADE | Associated user |
| `context_type` | TEXT | NOT NULL, CHECK IN ('location', 'device', 'time', 'behavior') | Type of context |
| `context_value` | JSONB | NOT NULL | Structured context data |
| `trust_score` | NUMERIC(3,2) | DEFAULT 0.50, CHECK (trust_score BETWEEN 0 AND 1) | Trust level (0.00-1.00) |
| `last_seen_at` | TIMESTAMPTZ | DEFAULT NOW() | Last occurrence |
| `is_trusted` | BOOLEAN | DEFAULT FALSE | Whether context is marked trusted |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | First observed |

**Example Context Values:**

\`\`\`json
// Device context
{
  "device_id": "abc123",
  "device_type": "tablet",
  "os": "iOS 17.2",
  "browser": "Safari 17.1"
}

// Location context
{
  "ip_range": "192.168.1.0/24",
  "facility": "Emergency Department",
  "building": "Main Hospital"
}

// Time context
{
  "typical_hours": ["08:00-17:00"],
  "timezone": "America/New_York"
}

// Behavior context
{
  "avg_session_duration": 3600,
  "typical_actions": ["view_patient", "update_vitals"],
  "typing_speed_wpm": 65
}
\`\`\`

**Indexes:**
- `idx_risk_user` ON (user_id)
- `idx_risk_type` ON (context_type)

---

### Database Functions

#### `public.handle_new_user()`

**Purpose:** Automatically create profile when user signs up

\`\`\`sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
\`\`\`

**Trigger:**
\`\`\`sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
\`\`\`

---

#### `public.log_auth_event()`

**Purpose:** Convenience function for logging authentication events

\`\`\`sql
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
RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
\`\`\`

**Usage:**
\`\`\`sql
SELECT log_auth_event(
  'user-uuid-here',
  'login_success',
  'password',
  '192.168.1.100'::inet,
  'Mozilla/5.0...',
  'device-123',
  'Emergency Department'
);
\`\`\`

---

#### `public.is_admin()`

**Purpose:** Check if current user has admin role (prevents RLS recursion)

\`\`\`sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
\`\`\`

**Why SECURITY DEFINER:** Allows RLS policies to call this function without triggering infinite recursion when checking `profiles` table.

---

### Row-Level Security (RLS) Policies

All tables have RLS enabled. Key policies:

\`\`\`sql
-- Profiles: Users can view own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Profiles: Admins can view all
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- Break-Glass Logs: Insert-only for users, full access for admins
CREATE POLICY "Users can insert break-glass logs" ON public.break_glass_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own break-glass logs" ON public.break_glass_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all break-glass logs" ON public.break_glass_logs
  FOR SELECT USING (public.is_admin());
\`\`\`

---

### Database Size and Performance

**Current Statistics (as of December 2025):**

| Table | Rows | Size | Indexes | Query Performance |
|-------|------|------|---------|-------------------|
| profiles | 127 | 48 KB | 3 | Avg 2ms |
| biometric_enrollments | 89 | 32 KB | 2 | Avg 5ms |
| auth_sessions | 342 | 128 KB | 3 | Avg 3ms |
| break_glass_logs | 14 | 16 KB | 4 | Avg 4ms |
| auth_audit_logs | 1,847 | 512 KB | 3 | Avg 6ms |
| risk_contexts | 256 | 64 KB | 2 | Avg 4ms |

**Connection Pooling:** PgBouncer with 25 max connections, transaction mode

---

## SQL Scripts

See `/scripts` directory for executable SQL:
- `001_create_ho_mfa_schema.sql` - Initial schema creation
- `002_seed_test_data.sql` - Test data for development
- `003_fix_profiles_rls_recursion.sql` - RLS fix migration
