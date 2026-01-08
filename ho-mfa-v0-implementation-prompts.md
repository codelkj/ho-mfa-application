# HO-MFA Implementation Guide: v0 + Supabase + Modal

## Overview

This guide provides the exact prompts and sequence to build HO-MFA in v0 with live previews at each step.

---

## Architecture Recap

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Next.js    │  │ TensorFlow.js│  │   Supabase Client    │  │
│  │   Frontend   │  │  (Embedding) │  │   (Auth + Data)      │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
└─────────┼─────────────────┼─────────────────────┼───────────────┘
          │                 │                     │
          ▼                 ▼                     ▼
┌─────────────────┐  ┌─────────────┐  ┌───────────────────────────┐
│  Vercel Edge    │  │   Modal     │  │      Supabase Cloud       │
│  (API Routes)   │◄─┤  (Verify)   │  │  ┌─────────┐ ┌─────────┐  │
│                 │  │             │  │  │  Auth   │ │Postgres │  │
└─────────────────┘  └─────────────┘  │  └─────────┘ └─────────┘  │
                                      └───────────────────────────┘
\`\`\`

---

## Phase 1: Database Setup (Supabase)

### Step 1.1: Connect Supabase Integration

In v0, click **Connect** (left sidebar) → **Add Integration** → **Supabase**

### Step 1.2: Create Database Schema

**Prompt to use in v0:**

\`\`\`
Create a SQL script to set up the HO-MFA database schema in Supabase with the following tables:

1. users table (extends Supabase auth.users):
   - id (uuid, references auth.users)
   - employee_id (text, unique)
   - department (text)
   - role (text: 'nurse', 'physician', 'admin', 'records_clerk')
   - trust_score (float, default 0.5)
   - created_at, updated_at timestamps

2. biometric_templates table:
   - id (uuid)
   - user_id (references users)
   - template_type ('facial', 'fingerprint')
   - embedding_vector (vector(512))
   - model_version (text)
   - created_at timestamp

3. authentication_logs table:
   - id (uuid)
   - user_id (references users)
   - auth_method ('password', 'biometric', 'break_glass')
   - risk_score (float)
   - ip_address (inet)
   - device_fingerprint (text)
   - location (text)
   - success (boolean)
   - failure_reason (text, nullable)
   - created_at timestamp

4. break_glass_events table:
   - id (uuid)
   - user_id (references users)
   - patient_id (text)
   - justification (text)
   - supervisor_id (references users, nullable)
   - approved (boolean, nullable)
   - reviewed_at (timestamp, nullable)
   - created_at timestamp

5. active_sessions table:
   - id (uuid)
   - user_id (references users)
   - session_token (text)
   - device_info (jsonb)
   - location (text)
   - trust_level (float)
   - expires_at (timestamp)
   - created_at timestamp

Include Row Level Security (RLS) policies:
- Users can only read their own data
- Admins can read all authentication_logs
- Break glass events are readable by supervisors and the user who created them

Add indexes for performance on frequently queried columns.
\`\`\`

**What you'll see:** A SQL script in the code editor. Click "Run" to execute it against your Supabase database.

---

## Phase 2: Frontend Components (v0)

### Step 2.1: Login Page

**Prompt:**

\`\`\`
Build a healthcare authentication login page for HO-MFA with:

1. Clean, professional medical/healthcare aesthetic (blues, whites, greens)
2. Hospital logo placeholder at top
3. Login form with:
   - Employee ID input field
   - Password input field
   - "Remember this device" checkbox
   - Primary "Sign In" button
   - Secondary "Use Biometric" button with fingerprint icon
   - "Emergency Access (Break Glass)" link in red/warning color

4. Risk indicator badge showing current security level (Low/Medium/High)
5. Footer with "HIPAA Compliant" badge and hospital name

Use Supabase auth for the login functionality.
Make it responsive for tablet use (common in hospitals).
Include proper form validation and error states.
\`\`\`

**Preview:** You'll see the login page render in the right panel. Click "Preview" to interact with it.

---

### Step 2.2: Biometric Enrollment Component

**Prompt:**

\`\`\`
Create a biometric enrollment component for HO-MFA that:

1. Uses the device camera to capture facial images
2. Shows a face outline guide overlay for proper positioning
3. Displays capture progress (e.g., "Capturing... 3 of 5 images")
4. Has clear instructions: "Position your face within the oval"
5. Includes lighting quality indicator
6. Shows success/failure feedback with animations
7. Has "Skip for now" and "Complete Enrollment" buttons

For now, simulate the TensorFlow.js embedding generation with a placeholder.
Store enrollment status in Supabase.
Style it to match the healthcare theme from the login page.
\`\`\`

---

### Step 2.3: Biometric Verification Component

**Prompt:**

\`\`\`
Create a biometric verification component for HO-MFA that:

1. Activates camera and shows live preview
2. Displays "Verifying..." state with a spinner
3. Shows match confidence percentage after verification
4. Has fallback to password if biometric fails 3 times
5. Includes "Having trouble?" help link
6. Auto-closes camera on success or component unmount

Create a server action that will later call Modal for verification.
For now, simulate the verification with a 2-second delay and random success/failure.
\`\`\`

---

### Step 2.4: Break-Glass Emergency Access

**Prompt:**

\`\`\`
Build a Break-Glass emergency access modal for HO-MFA with:

1. Warning banner: "Emergency Access - All actions will be logged and audited"
2. Form fields:
   - Patient ID (required)
   - Justification dropdown: "Life-threatening emergency", "System outage", "Other"
   - Free-text justification field (required if "Other" selected)
   - Checkbox: "I understand this access will be reviewed by my supervisor"

3. Two buttons: "Cancel" (secondary) and "Request Emergency Access" (danger/red)
4. After submission, show:
   - Confirmation with access granted timestamp
   - Warning: "You have 15 minutes of elevated access"
   - Countdown timer

5. Log the break-glass event to Supabase with all details
6. Send notification to supervisor (simulate with console.log for now)

Use red/orange warning colors to emphasize the gravity of this action.
\`\`\`

---

### Step 2.5: Admin Dashboard

**Prompt:**

\`\`\`
Create an admin dashboard for HO-MFA with:

1. Header with "HO-MFA Security Dashboard" title and admin user info
2. Summary cards row:
   - Total authentications today (with trend arrow)
   - Failed attempts (with percentage)
   - Active break-glass events (with warning badge if > 0)
   - Average trust score

3. Two-column layout:
   Left column (60%):
   - Authentication activity chart (line chart, last 7 days)
   - Recent authentication logs table (10 rows, sortable)
     Columns: Time, User, Method, Risk Score, Status, Location

   Right column (40%):
   - Break-glass events requiring review (cards with Approve/Deny buttons)
   - High-risk users list (trust score < 0.3)

4. Filters: Date range, Department, Auth method, Status

Fetch real data from Supabase.
Use shadcn/ui components for the charts and tables.
Make it responsive.
\`\`\`

---

### Step 2.6: User Profile & Security Settings

**Prompt:**

\`\`\`
Build a user profile page for HO-MFA with:

1. Profile header with avatar, name, employee ID, department, role
2. Security section:
   - Current trust score with visual gauge (red/yellow/green)
   - "Trust score is calculated based on login patterns and device consistency"
   
3. Enrolled biometrics section:
   - List of enrolled methods (Facial, Fingerprint) with enrollment date
   - "Re-enroll" and "Remove" buttons for each
   - "Add new biometric" button

4. Active sessions section:
   - Table showing device, location, last active, trust level
   - "Revoke" button for each session except current
   - "Revoke all other sessions" button

5. Authentication history:
   - Recent 20 login attempts with method, time, location, success/failure
   - Link to "View full history"

Fetch all data from Supabase based on current user.
\`\`\`

---

## Phase 3: Modal Integration (Biometric Verification)

### Step 3.1: Create Modal Account

1. Go to [modal.com](https://modal.com) and sign up
2. Install Modal CLI: `pip install modal`
3. Authenticate: `modal token new`

### Step 3.2: Deploy Biometric Verification Function

Create a file `modal_functions/biometric_verify.py`:

\`\`\`python
import modal

app = modal.App("ho-mfa-biometric")

image = modal.Image.debian_slim().pip_install(
    "numpy",
    "scipy"
)

@app.function(
    image=image,
    secrets=[modal.Secret.from_name("ho-mfa-secrets")],
    keep_warm=1  # Prevent cold starts
)
@modal.web_endpoint(method="POST")
def verify_embedding(request: dict):
    """
    Verify facial embedding against stored template.
    
    SECURITY: This endpoint receives PRE-COMPUTED embeddings only.
    Raw biometric images are NEVER transmitted to Modal.
    
    Input:
    {
        "user_id": "uuid",
        "probe_embedding": [512 floats],
        "model_version": "facenet-v1.2"
    }
    
    Output:
    {
        "match": bool,
        "confidence": float,
        "threshold_used": float
    }
    """
    import numpy as np
    from scipy.spatial.distance import cosine
    
    user_id = request.get("user_id")
    probe_embedding = np.array(request.get("probe_embedding"))
    model_version = request.get("model_version")
    
    # In production: fetch stored_embedding from Supabase
    # For demo: simulate with random embedding
    stored_embedding = np.random.rand(512)  # Replace with DB fetch
    
    # Cosine similarity (1 - cosine distance)
    similarity = 1 - cosine(probe_embedding, stored_embedding)
    
    # Adaptive threshold based on model version
    thresholds = {
        "facenet-v1.2": 0.85,
        "arcface-v1.0": 0.82
    }
    threshold = thresholds.get(model_version, 0.85)
    
    return {
        "match": similarity >= threshold,
        "confidence": float(similarity),
        "threshold_used": threshold
    }
\`\`\`

Deploy with: `modal deploy modal_functions/biometric_verify.py`

### Step 3.3: Connect v0 to Modal

**Prompt in v0:**

\`\`\`
Create a server action to call the Modal biometric verification endpoint.

The action should:
1. Accept user_id and probe_embedding (array of 512 floats)
2. Call the Modal endpoint at the URL from MODAL_ENDPOINT_URL env var
3. Include MODAL_API_KEY in the Authorization header
4. Handle errors gracefully (network timeout, Modal cold start)
5. Log the verification attempt to Supabase authentication_logs
6. Return { success: boolean, confidence: number, error?: string }

Add retry logic with exponential backoff (max 3 attempts).
If Modal is unavailable, fall back to client-side verification with a warning.
\`\`\`

---

## Phase 4: Environment Variables

In v0, click **Vars** (left sidebar) and add:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Auto-added by Supabase integration |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auto-added by Supabase integration |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-added by Supabase integration |
| `MODAL_ENDPOINT_URL` | Your Modal endpoint URL (from `modal deploy` output) |
| `MODAL_API_KEY` | Your Modal API key (from modal.com dashboard) |

---

## Phase 5: Integration Testing

### Step 5.1: Test Authentication Flow

**Prompt:**

\`\`\`
Create a test page at /test/auth-flow that:

1. Shows step-by-step authentication flow test
2. Tests each component in sequence:
   - Step 1: Password login → shows success/failure
   - Step 2: Biometric enrollment → shows captured embedding length
   - Step 3: Biometric verification → shows match confidence
   - Step 4: Break-glass request → shows logged event ID

3. Each step has "Run Test" button and shows results
4. Final summary shows all test results with pass/fail status
5. "Reset All" button to clear test data

Use console.log("[v0] ...") statements to debug each step.
\`\`\`

---

## Prompt Sequence Summary

| Order | Component | Estimated Time |
|-------|-----------|----------------|
| 1 | Database Schema (SQL) | 5 min |
| 2 | Login Page | 10 min |
| 3 | Biometric Enrollment | 15 min |
| 4 | Biometric Verification | 10 min |
| 5 | Break-Glass Modal | 10 min |
| 6 | Admin Dashboard | 20 min |
| 7 | User Profile | 15 min |
| 8 | Modal Integration | 15 min |
| 9 | Integration Testing | 10 min |
| **Total** | **Full MVP** | **~2 hours** |

---

## Viewing Previews in v0

1. **Code Panel (Left):** Shows your generated code files
2. **Preview Panel (Right):** Live interactive preview of your app
3. **Console (Bottom):** Shows `console.log` output for debugging
4. **Preview URL:** Click "Open in new tab" for full-screen preview

### Preview Navigation

After building multiple pages, navigate between them:
- Login: `/login`
- Dashboard: `/dashboard`
- Profile: `/profile`
- Admin: `/admin`
- Test: `/test/auth-flow`

---

## Iterative Refinement Prompts

After initial generation, use these refinement prompts:

**Fix styling:**
\`\`\`
The login form feels too cramped on mobile. Add more padding and make the buttons full-width on screens smaller than 640px.
\`\`\`

**Add feature:**
\`\`\`
Add a "Forgot Password" link below the login form that opens a modal for password reset via email.
\`\`\`

**Fix bug:**
\`\`\`
The biometric verification camera doesn't close when I navigate away. Add cleanup in useEffect to stop the video stream on unmount.
\`\`\`

**Improve UX:**
\`\`\`
Add loading skeletons to the admin dashboard while data is being fetched from Supabase.
\`\`\`

---

## Next Steps After Building

1. **Test on mobile device:** Use v0 preview URL on your phone
2. **Add real TensorFlow.js:** Replace simulation with actual FaceNet model
3. **Deploy to Vercel:** Click "Deploy" in v0
4. **Set up Modal production:** Switch from dev to production endpoint
5. **Enable Supabase RLS:** Verify all policies work correctly
6. **Penetration testing:** Run OWASP ZAP against preview URL

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Supabase connection fails | Check that integration is connected in sidebar |
| Modal endpoint timeout | Verify `keep_warm=1` is set; check Modal logs |
| Camera permission denied | Preview must be HTTPS; use deployed preview URL |
| Auth state not persisting | Ensure Supabase client is singleton (check lib/supabase.ts) |
| RLS blocking queries | Check policies; temporarily disable RLS to debug |
