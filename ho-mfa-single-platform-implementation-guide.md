# Healthcare-Optimized Multi-Factor Authentication (HO-MFA) Framework
## Single-Platform Implementation Guide

**Author:** Johnson Mabgwe  
**Course:** MSIT 5910 – Capstone Project  
**Date:** November 2025

---

## Executive Summary

This guide provides a complete implementation plan for building the entire HO-MFA Framework using **a single AI-powered development platform**. Below is a comparison to help you choose the best platform for your needs.

---

## 1. Platform Comparison for Full HO-MFA Implementation

| Criteria | v0 (Vercel) | Lovable.dev | Leap.new |
|----------|-------------|-------------|----------|
| **Frontend UI** | Excellent | Excellent | Limited |
| **Backend Logic** | Good (Server Actions) | Good (Supabase) | Excellent |
| **Database** | Supabase/Neon | Supabase Only | PostgreSQL/Any |
| **Authentication** | Supabase Auth | Supabase Auth | Custom |
| **Real-time Features** | Yes | Yes | Yes |
| **API Endpoints** | Yes (Route Handlers) | Limited | Excellent |
| **Deployment** | Vercel (automatic) | Vercel (automatic) | AWS/GCP |
| **Cost (Monthly)** | $0-20 | $0-50 | $20-100 |
| **Learning Curve** | Low | Low | Medium |
| **Healthcare Compliance** | Good | Good | Better |
| **Recommended For** | Full Project | Full Project | Backend-Heavy |

---

## 2. RECOMMENDED: v0 as Single Platform

**Why v0 is the Best Single-Platform Choice for HO-MFA:**

1. **Full-Stack Capability:** v0 generates Next.js apps with Server Actions, API routes, and database integration
2. **Supabase Integration:** Built-in support for authentication, database, and real-time subscriptions
3. **HIPAA-Ready:** Supabase offers HIPAA BAA (Business Associate Agreement) on paid plans
4. **Cost-Effective:** Free tier sufficient for capstone; $20/month for production
5. **Code Ownership:** Export and customize all generated code
6. **Rapid Iteration:** Chat-based editing for quick changes

---

## 3. Complete Implementation Sequence (v0 Only)

### Phase 0: Environment Setup (Day 1)

#### Step 0.1: Create Supabase Project

1. Go to https://supabase.com and sign up
2. Create new project: "ho-mfa-capstone"
3. Save your credentials:
   - Project URL
   - Anon Key
   - Service Role Key (for admin operations)

#### Step 0.2: Connect v0 to Supabase

In v0, click "Connect" in the sidebar and add Supabase integration.

---

### Phase 1: Database Schema (Day 1-2)

**v0 Prompt #1: Database Setup Script**

\`\`\`
Create a SQL script for Supabase PostgreSQL that creates the complete 
HO-MFA database schema:

TABLES:
1. profiles (extends Supabase auth.users)
   - id (uuid, references auth.users)
   - full_name (text)
   - role (enum: physician, nurse, admin, it_staff, security)
   - department (text)
   - employee_id (text, unique)
   - mfa_methods (jsonb array: biometric, security_key, totp, sms)
   - risk_profile (enum: low, medium, high)
   - created_at, updated_at

2. authentication_attempts
   - id (uuid)
   - user_id (references profiles)
   - method (enum: password, biometric, security_key, totp, sms, break_glass)
   - success (boolean)
   - risk_score (integer 0-100)
   - ip_address (inet)
   - user_agent (text)
   - location (jsonb: lat, lng, city, country)
   - device_fingerprint (text)
   - created_at

3. risk_scoring_rules
   - id (uuid)
   - factor_name (text)
   - factor_type (enum: location, time, device, behavior, role)
   - weight (integer 0-100)
   - threshold (integer)
   - action (enum: allow, challenge, deny)
   - is_active (boolean)
   - created_by (references profiles)
   - created_at, updated_at

4. emergency_access_logs
   - id (uuid)
   - user_id (references profiles)
   - patient_mrn (text)
   - justification_type (enum: cardiac_arrest, stroke, trauma, 
     allergic_reaction, other)
   - justification_text (text)
   - access_granted_at (timestamp)
   - expires_at (timestamp)
   - reviewed_at (timestamp, nullable)
   - reviewer_id (references profiles, nullable)
   - review_outcome (enum: pending, justified, unjustified, 
     under_investigation, nullable)
   - review_notes (text, nullable)

5. audit_logs
   - id (uuid)
   - event_type (text)
   - user_id (references profiles, nullable)
   - target_type (text)
   - target_id (uuid)
   - details (jsonb)
   - ip_address (inet)
   - created_at

Include:
- Proper indexes on frequently queried columns
- Row Level Security (RLS) policies for each table
- Triggers for updated_at timestamps
- Function to calculate risk score

Output as executable SQL for Supabase SQL Editor.
\`\`\`

---

### Phase 2: Core Authentication UI (Days 3-5)

**v0 Prompt #2: Login Page**

\`\`\`
Create a complete healthcare MFA login page with:

DESIGN:
- Professional medical aesthetic (primary blue #0066CC, white background)
- Hospital logo placeholder at top (120x40px)
- Clean, accessible typography (Inter font)
- Mobile-responsive (works on clinical tablets)

FORM FIELDS:
1. Employee ID input (with hospital icon)
2. Password input (with eye toggle)
3. "Remember this device" checkbox

MFA OPTIONS (shown after initial login):
1. "Use Fingerprint" button with biometric icon
2. "Use Security Key" button with key icon  
3. "Enter TOTP Code" expandable section with 6-digit input
4. "Send SMS Code" button

SPECIAL FEATURES:
1. Red "Emergency Break-Glass Access" button at bottom
2. HIPAA compliance notice footer
3. Loading states for all buttons
4. Error message display area
5. Forgot password link

FUNCTIONALITY:
- Use Supabase auth for email/password
- Store MFA selection in localStorage
- Console log all authentication attempts (we'll connect to DB later)
- Break-glass button opens a modal (separate component)

Use shadcn/ui components: Card, Input, Button, Checkbox, Label, Alert.
Include proper ARIA labels for accessibility.
\`\`\`

**v0 Prompt #3: Break-Glass Modal Component**

\`\`\`
Create a Break-Glass emergency access modal component:

VISUAL DESIGN:
- Red warning header with alert triangle icon
- "EMERGENCY ACCESS - ALL ACTIVITY LOGGED" title
- Yellow caution border around entire modal
- Current timestamp displayed prominently

REQUIRED FORM FIELDS:
1. Patient MRN (Medical Record Number) - text input, required
2. Emergency Type - dropdown select:
   - Cardiac Arrest
   - Stroke/CVA
   - Trauma/Accident
   - Severe Allergic Reaction
   - Respiratory Failure
   - Other Emergency
3. Justification Details - textarea (min 20 characters, required)
4. Checkbox: "I understand this emergency access will be:
   - Immediately logged and timestamped
   - Reviewed by Security within 24 hours
   - Subject to disciplinary action if misused"

BUTTONS:
- "Cancel" (gray, left side)
- "Grant Emergency Access" (red, right side, disabled until form valid)

BEHAVIOR:
1. 10-second countdown timer appears after clicking Grant
2. User can cancel during countdown
3. After countdown, show success message with access ID
4. Access expires in 30 minutes (show timer)
5. Log everything to Supabase emergency_access_logs table

Use shadcn/ui Dialog, Select, Textarea, Checkbox, Button, Alert.
Include form validation with react-hook-form and zod.
\`\`\`

**v0 Prompt #4: Post-Login MFA Challenge Screen**

\`\`\`
Create an MFA challenge screen shown after password verification:

LAYOUT:
- Card centered on screen
- "Additional Verification Required" heading
- User's name and role displayed
- Risk score badge (shows why MFA is required)

VERIFICATION OPTIONS (tabs or buttons):
1. Biometric Tab:
   - Fingerprint animation/icon
   - "Place finger on sensor" instruction
   - Simulated verification (3 second delay, then success)

2. Security Key Tab:
   - USB key animation
   - "Insert your security key and tap" instruction
   - WebAuthn integration (navigator.credentials.get)

3. TOTP Tab:
   - 6-digit code input (auto-advance between digits)
   - "Enter code from authenticator app"
   - 30-second countdown showing code validity
   - Verify button

4. SMS Tab:
   - Phone number (masked: ***-***-1234)
   - "Send Code" button
   - 6-digit input appears after sending
   - Resend option (60 second cooldown)

COMMON ELEMENTS:
- "Try different method" link
- "Cancel and logout" link
- Help icon with tooltip

On successful verification:
- Log to authentication_attempts table
- Redirect to dashboard
- Set session cookie

Use shadcn/ui Tabs, Card, Input, Button, Badge.
\`\`\`

---

### Phase 3: Admin Dashboard (Days 6-10)

**v0 Prompt #5: Dashboard Layout**

\`\`\`
Create the main admin dashboard layout for HO-MFA:

HEADER:
- "HO-MFA Admin Console" logo/title (left)
- Search bar (center)
- Notification bell with badge (right)
- User avatar dropdown: Profile, Settings, Logout (right)
- Dark mode toggle

SIDEBAR (collapsible on mobile):
- Dashboard (home icon) - active state
- Users (users icon)
- Authentication Logs (list icon)
- Emergency Access (alert-triangle icon, red badge if pending reviews)
- Risk Rules (shield icon)
- Audit Trail (scroll icon)
- Reports (bar-chart icon)
- Settings (cog icon)

MAIN CONTENT AREA:
- Breadcrumb navigation
- Page title with action buttons
- Content grid

FOOTER:
- "HIPAA Compliant System" badge
- Last sync timestamp
- Version number

Use Next.js app router layout.tsx pattern.
Sidebar state persisted in localStorage.
Use shadcn/ui Sheet for mobile sidebar.
\`\`\`

**v0 Prompt #6: Dashboard Home Page**

\`\`\`
Create the dashboard home page content:

TOP STATS ROW (4 cards):
1. "Authentications Today" 
   - Large number (fetch from Supabase)
   - Percentage change from yesterday
   - Green up arrow or red down arrow

2. "Failed Attempts"
   - Large number
   - Warning badge if > 10
   - Link to view details

3. "Emergency Access Events"
   - Large number
   - RED background if > 0
   - "Review Now" button if pending

4. "System Risk Score"
   - Gauge visualization (0-100)
   - Color: green (0-30), yellow (31-70), red (71-100)
   - Based on aggregated recent activity

MIDDLE ROW (2 charts):
1. Line Chart: "Authentication Activity (7 Days)"
   - X-axis: dates
   - Y-axis: count
   - Two lines: Successful (green), Failed (red)
   - Tooltip on hover

2. Donut Chart: "Authentication Methods"
   - Segments: Password, Biometric, Security Key, TOTP, SMS
   - Percentages labeled
   - Legend below

BOTTOM ROW:
1. "Recent Activity" Table (left, 60%):
   - Columns: User, Method, Result, Risk Score, Time
   - Color-coded result badges
   - "View All" link
   - Auto-refresh every 30 seconds

2. "Alerts" Panel (right, 40%):
   - Emergency access awaiting review
   - High-risk login attempts
   - Account lockouts
   - "Dismiss" and "View" actions

Fetch all data from Supabase using server components.
Use Recharts for visualizations.
Include loading skeletons.
\`\`\`

**v0 Prompt #7: User Management Page**

\`\`\`
Create the User Management page:

TOP SECTION:
- Page title: "User Management"
- "Add User" primary button (opens slide-over form)
- "Export CSV" secondary button
- "Bulk Actions" dropdown (Disable, Enable, Reset MFA, Delete)

FILTERS ROW:
- Search input (searches name, email, employee ID)
- Department multi-select dropdown
- Role multi-select dropdown  
- Status dropdown (All, Active, Disabled, Locked)
- MFA Status dropdown (All, Enrolled, Not Enrolled)
- "Clear Filters" button

USERS TABLE:
Columns:
1. Checkbox (for bulk selection)
2. User (avatar + name + email stacked)
3. Employee ID
4. Department (badge)
5. Role (badge with role-specific color)
6. MFA Methods (icons for enrolled methods)
7. Last Login (relative time)
8. Risk Score (color-coded: green/yellow/red)
9. Status (Active=green, Disabled=gray, Locked=red)
10. Actions dropdown (View, Edit, Reset MFA, Disable, Delete)

Features:
- Sortable columns
- Pagination (10, 25, 50 per page)
- Row click opens user detail slide-over
- Select all (current page / all pages)

"Add User" Slide-over Form:
- Full name (required)
- Email (required, validated)
- Employee ID (required, unique)
- Department (select)
- Role (select)
- Initial password (generated or manual)
- "Require password change" checkbox
- "Send welcome email" checkbox
- MFA requirement selection

All data from Supabase profiles table with RLS.
Use tanstack/react-table for advanced table features.
\`\`\`

**v0 Prompt #8: Emergency Access Review Page**

\`\`\`
Create the Emergency Access Review page:

ALERT BANNER (if pending reviews exist):
- Red background
- "X emergency access events require review within 24 hours"
- "Review Now" button

TABS:
1. "Pending Review" (count badge)
2. "Under Investigation"
3. "Reviewed - Justified"
4. "Reviewed - Unjustified"
5. "All Events"

TABLE COLUMNS:
1. ID (clickable, opens detail modal)
2. User (avatar + name + role)
3. Patient MRN
4. Emergency Type (badge)
5. Justification (truncated, expand on hover)
6. Granted At (timestamp)
7. Time Since (hours/minutes, red if > 24h)
8. Status (badge)
9. Actions (Review button for pending)

REVIEW MODAL (when clicking Review):
- Full emergency access details
- User information and history
- Patient context (if available)
- Timeline of events
- Review decision:
  * "Justified - Approve" (green button)
  * "Unjustified - Flag" (red button)
  * "Requires Investigation" (yellow button)
- Notes textarea (required)
- Reviewer signature checkbox

POST-REVIEW ACTIONS:
- If Unjustified: 
  * Show "User will be notified" warning
  * Option to "Suspend User Pending Investigation"
  * Auto-create compliance incident

STATISTICS SIDEBAR:
- Total emergency access this month
- Average review time
- Justified vs Unjustified ratio
- Repeat offenders list

Fetch from Supabase emergency_access_logs.
Real-time updates using Supabase subscriptions.
\`\`\`

---

### Phase 4: Risk Scoring Engine (Days 11-14)

**v0 Prompt #9: Risk Rules Configuration Page**

\`\`\`
Create a Risk Scoring Rules configuration page:

HEADER:
- "Risk Scoring Configuration" title
- "Test Rules" button (opens simulator)
- "Import Rules" / "Export Rules" buttons

CURRENT SCORE FORMULA (visual display):
- Show how risk score is calculated
- Base Score + Σ(Factor Weight × Factor Value) = Total Score
- Threshold indicators for: Allow (<30), Challenge (30-70), Deny (>70)

RULES TABLE:
Columns:
1. Drag handle (for reordering)
2. Active toggle switch
3. Factor Name
4. Factor Type (Location, Time, Device, Behavior, Role)
5. Weight (0-100, inline editable)
6. Condition (dropdown + value input)
7. Action triggered (Allow, Challenge, Deny)
8. Edit / Delete buttons

EXISTING RULES (pre-populate):
1. Remote Access: +15 points if location != "on_premises"
2. After Hours: +10 points if time between 8PM-6AM
3. Unknown Device: +20 points if device_trust == "unknown"
4. New Device: +10 points if device first seen < 7 days
5. High-Risk Role: +5 points if role == "admin"
6. Failed Attempts: +25 points if failed_attempts_24h > 3
7. Unusual Location: +30 points if location anomaly detected
8. VPN Access: +5 points if connection via VPN

"Add Rule" MODAL:
- Factor name (text)
- Factor type (select)
- Condition builder:
  * Field (select from available data points)
  * Operator (equals, not equals, greater than, contains, etc.)
  * Value (dynamic input based on field type)
- Weight slider (0-100)
- Resulting action (select)
- Description (optional)

Save rules to Supabase risk_scoring_rules table.
Changes logged to audit_logs with before/after values.
\`\`\`

**v0 Prompt #10: Risk Score Simulator**

\`\`\`
Create a Risk Score Testing Simulator component:

LAYOUT: Split screen
- Left side: Input parameters
- Right side: Real-time calculation result

INPUT PARAMETERS (left):
User Context:
- Role dropdown (physician, nurse, admin, it_staff)
- Department dropdown
- Account age (days)
- Previous failed attempts (number)

Access Context:
- Location (on_premises, remote_office, home, unknown)
- Time of day (datetime picker)
- Device trust level (managed, known, unknown)
- IP address type (corporate, vpn, residential, suspicious)
- Browser/OS (dropdown)

Behavior Context:
- Login frequency vs normal (slider: much_less to much_more)
- Resources accessed (checkboxes: EHR, Admin, Billing, Pharmacy)
- Session duration expectation (short, normal, extended)

CALCULATION RESULT (right):
1. Final Risk Score (large number, color-coded)
2. Risk Level badge (Low/Medium/High/Critical)
3. Recommended Action (Allow / Step-Up / Deny)

4. Score Breakdown (expandable):
   Table showing:
   - Each rule that matched
   - Points contributed
   - Cumulative total
   Bar visualization of each factor's contribution

5. Required MFA (if step-up):
   - List of MFA methods required
   - Minimum factors needed

6. "Save as Test Case" button
7. "Apply to Real User" button (for testing in staging)

Real-time calculation as inputs change.
Use the same logic that will be used in production.
\`\`\`

---

### Phase 5: API Endpoints (Days 15-18)

**v0 Prompt #11: Authentication API Routes**

\`\`\`
Create Next.js API route handlers for HO-MFA authentication:

FILE: app/api/auth/login/route.ts
- POST: Validate credentials against Supabase
- Calculate risk score using risk_scoring_rules
- Determine if MFA required
- Return: { success, requires_mfa, mfa_methods, session_token, risk_score }

FILE: app/api/auth/mfa/verify/route.ts  
- POST: Verify MFA code/response
- Input: { method, code/response, session_token }
- Validate based on method type
- Log attempt to authentication_attempts
- Return: { success, access_token, expires_at }

FILE: app/api/auth/break-glass/route.ts
- POST: Process emergency access request
- Input: { patient_mrn, justification_type, justification_text }
- Validate user has break-glass privilege
- Create emergency_access_logs entry
- Return: { access_id, granted_at, expires_at }
- Trigger notification (console.log for now)

FILE: app/api/auth/break-glass/[id]/review/route.ts
- POST: Submit review decision
- Input: { outcome, notes }
- Update emergency_access_logs
- Trigger appropriate follow-up actions
- Return: { updated_record }

FILE: app/api/risk/calculate/route.ts
- POST: Calculate risk score for given context
- Input: { user_id, location, device, time, etc. }
- Apply all active rules from risk_scoring_rules
- Return: { score, level, factors, recommendation }

All routes should:
- Use Supabase server client
- Validate input with zod
- Log to audit_logs
- Return proper error responses
- Include rate limiting headers
\`\`\`

**v0 Prompt #12: Webhook and Real-time Handlers**

\`\`\`
Create real-time and webhook handlers:

FILE: app/api/webhooks/supabase/route.ts
- Handle Supabase database webhooks
- Trigger: emergency_access_logs INSERT
- Action: Send notification (log to console, ready for email/SMS)

FILE: lib/supabase/realtime.ts
- Export function to subscribe to authentication_attempts
- Export function to subscribe to emergency_access_logs
- Handle connection errors and reconnection

FILE: app/api/reports/daily/route.ts
- GET: Generate daily authentication report
- Aggregate: total attempts, success rate, MFA usage, risk scores
- Format as JSON (ready for email digest)

FILE: app/api/reports/compliance/route.ts
- GET: Generate HIPAA compliance report
- Include: emergency access events, review status, audit trail
- Output: JSON structure for PDF generation

Include TypeScript types for all request/response bodies.
Use server actions where appropriate for mutations.
\`\`\`

---

### Phase 6: Integration and Testing (Days 19-22)

**v0 Prompt #13: Connect All Components**

\`\`\`
Update the login page to use the real API endpoints:

1. Login form submission:
   - Call /api/auth/login with credentials
   - Handle response: success, requires_mfa, error
   - If requires_mfa, show MFA challenge component
   - Pass available mfa_methods to challenge component

2. MFA challenge completion:
   - Call /api/auth/mfa/verify with method and code
   - Handle success: redirect to dashboard
   - Handle failure: show error, allow retry (3 attempts)
   - After 3 failures: lock account, show support message

3. Break-glass submission:
   - Call /api/auth/break-glass with form data
   - Show loading state during 10-second countdown
   - On success: display access ID and expiration
   - Redirect to limited-access view

4. Dashboard data loading:
   - Use server components to fetch initial data
   - Set up real-time subscriptions for live updates
   - Show loading skeletons during data fetch

5. Error handling:
   - Network errors: show retry button
   - Auth errors: redirect to login
   - Rate limit errors: show wait time

Add console.log("[v0] ...") statements at each step for debugging.
\`\`\`

**v0 Prompt #14: End-to-End Test Scenarios**

\`\`\`
Create a test page at /test that simulates all HO-MFA flows:

TEST SCENARIOS:
1. "Normal Login Flow"
   - Low-risk user, on-premises, known device
   - Expected: Password only, no MFA

2. "MFA Required Flow"  
   - Medium-risk user, remote access
   - Expected: Password + one MFA factor

3. "High-Risk Login"
   - Unknown device, after hours, VPN
   - Expected: Password + two MFA factors

4. "Break-Glass Flow"
   - Simulate emergency access request
   - Show audit log entry created

5. "Account Lockout"
   - Simulate 5 failed attempts
   - Show lockout message

6. "Risk Score Boundary Tests"
   - Score of 29 (just under threshold)
   - Score of 30 (exactly at threshold)
   - Score of 71 (just over deny threshold)

Each test:
- "Run Test" button
- Shows request being made
- Shows response received
- Pass/Fail indicator
- Detailed log output

Include "Run All Tests" button with summary results.
\`\`\`

---

### Phase 7: Deployment and Documentation (Days 23-25)

**v0 Prompt #15: Deployment Checklist Page**

\`\`\`
Create a deployment checklist page for administrators:

ENVIRONMENT SETUP:
☐ Supabase project created
☐ Database schema applied
☐ RLS policies enabled
☐ Environment variables configured
☐ Custom domain configured

SECURITY CHECKLIST:
☐ HTTPS enforced
☐ CORS configured correctly
☐ API rate limiting enabled
☐ Session timeout configured (30 min)
☐ Password policy enforced
☐ MFA enforced for admin accounts

HIPAA COMPLIANCE:
☐ BAA signed with Supabase
☐ Audit logging enabled
☐ Data encryption at rest verified
☐ Access logs retention configured (7 years)
☐ Emergency access review SLA documented

INTEGRATION CHECKLIST:
☐ Email service configured
☐ SMS service configured (optional)
☐ EHR sandbox connected (if applicable)
☐ LDAP/AD integration (if applicable)

TESTING:
☐ All test scenarios passing
☐ Load testing completed
☐ Penetration testing scheduled
☐ User acceptance testing completed

Each item:
- Checkbox (persisted to localStorage)
- Help icon with detailed instructions
- "Verify" button where applicable (runs automated check)

Progress bar at top showing completion percentage.
\`\`\`

---

## 4. Alternative: Lovable.dev as Single Platform

If you prefer Lovable.dev, here is the adjusted approach:

### Key Differences:
1. Use Lovable's built-in Supabase integration (simpler setup)
2. All prompts combined into larger feature requests
3. Less granular control over code structure
4. Faster initial development, slightly harder customization

**Lovable.dev Master Prompt (Full Application):**

\`\`\`
Build a complete Healthcare Multi-Factor Authentication (HO-MFA) 
web application with the following specifications:

AUTHENTICATION SYSTEM:
- Email/password login with Supabase Auth
- Multi-factor authentication options: TOTP, SMS (simulated), WebAuthn
- Risk-based authentication that calculates a score (0-100) based on:
  * User location (on-premises vs remote)
  * Time of day (business hours vs after hours)
  * Device trust level (known vs unknown)
  * Recent failed attempts
- Break-glass emergency access with:
  * Patient MRN input
  * Justification type dropdown
  * Mandatory acknowledgment checkbox
  * 30-minute access window
  * Audit logging

ADMIN DASHBOARD:
- Overview with stats: total logins, failures, emergency access events
- User management: list, search, add, edit, disable users
- Emergency access review queue with 24-hour SLA tracking
- Risk scoring rules configuration with test simulator
- Audit log viewer with filters
- Real-time updates using Supabase subscriptions

DATABASE (Supabase):
- profiles (user details, roles, MFA enrollment)
- authentication_attempts (login history with risk scores)
- emergency_access_logs (break-glass events)
- risk_scoring_rules (configurable scoring factors)
- audit_logs (all system events)

DESIGN:
- Professional healthcare theme (blue #0066CC primary)
- HIPAA compliance notices
- Mobile-responsive for clinical tablets
- Dark mode support
- Accessibility compliant (WCAG 2.1 AA)

PAGES:
1. /login - Authentication page
2. /mfa - MFA challenge page
3. /dashboard - Admin overview
4. /users - User management
5. /emergency - Emergency access review
6. /rules - Risk scoring configuration
7. /audit - Audit log viewer
8. /settings - System settings

Deploy to Vercel with Supabase backend.
\`\`\`

---

## 5. Cost Comparison (Single Platform)

| Platform | Monthly Cost | What's Included |
|----------|--------------|-----------------|
| **v0 + Supabase** | $0-45 | v0 Free + Supabase Pro ($25) for HIPAA |
| **Lovable.dev + Supabase** | $20-65 | Lovable Starter ($20) + Supabase Pro ($25) |
| **Leap.new + Supabase** | $50-100 | Leap usage + Supabase Pro + AWS costs |

**Recommendation:** v0 + Supabase Pro ($25/month) provides the best balance of capability, cost, and HIPAA compliance.

---

## 6. Timeline Summary (Single Platform - v0)

| Week | Phase | Deliverable |
|------|-------|-------------|
| 1 | Setup + Database | Supabase project, schema, seed data |
| 2 | Authentication UI | Login, MFA challenge, break-glass modal |
| 3 | Admin Dashboard | Layout, home stats, charts |
| 4 | User Management | User table, CRUD operations |
| 5 | Emergency Access | Review queue, decision workflow |
| 6 | Risk Engine | Rules config, score simulator |
| 7 | API Integration | Connect all components, real-time |
| 8 | Testing + Deploy | End-to-end tests, production deploy |

**Total: 8 weeks using only v0 + Supabase**

---

## 7. Prompt Execution Checklist

Execute prompts in this exact order:

\`\`\`
Week 1:
☐ Prompt #1: Database Schema (run in Supabase SQL Editor)

Week 2:
☐ Prompt #2: Login Page
☐ Prompt #3: Break-Glass Modal
☐ Prompt #4: MFA Challenge Screen

Week 3:
☐ Prompt #5: Dashboard Layout
☐ Prompt #6: Dashboard Home Page

Week 4:
☐ Prompt #7: User Management Page

Week 5:
☐ Prompt #8: Emergency Access Review Page

Week 6:
☐ Prompt #9: Risk Rules Configuration Page
☐ Prompt #10: Risk Score Simulator

Week 7:
☐ Prompt #11: Authentication API Routes
☐ Prompt #12: Webhook Handlers
☐ Prompt #13: Connect All Components

Week 8:
☐ Prompt #14: End-to-End Test Scenarios
☐ Prompt #15: Deployment Checklist
\`\`\`

---

## 8. Troubleshooting Common Issues

| Issue | Solution |
|-------|----------|
| Supabase connection fails | Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in v0 Vars |
| RLS blocking queries | Ensure user is authenticated; check policy conditions |
| Real-time not updating | Verify table has REPLICA IDENTITY FULL enabled |
| MFA not working | WebAuthn requires HTTPS; use Vercel preview URL |
| Break-glass not logging | Check foreign key constraints on user_id |

---

## 9. Academic Integrity Disclosure

When submitting this capstone project, include this disclosure:

\`\`\`
DEVELOPMENT METHODOLOGY DISCLOSURE

This Healthcare-Optimized Multi-Factor Authentication (HO-MFA) 
Framework was developed using AI-assisted development tools:

- v0.dev (Vercel): Used for generating React/Next.js components, 
  UI layouts, and API route handlers
- Supabase: Used for database, authentication, and real-time features

All generated code was:
1. Reviewed and understood by the author
2. Modified and customized for healthcare-specific requirements
3. Tested and validated against security best practices
4. Documented with inline comments explaining functionality

The use of AI-assisted development tools reflects modern software 
engineering practices and accelerated the prototyping phase while 
maintaining code quality and security standards.
\`\`\`

---

*End of Single-Platform Implementation Guide*
