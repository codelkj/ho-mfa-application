# Appendix D: User Interface Screenshots

## UI Gallery

### Dashboard

**File:** `screenshot-dashboard.png`  
**Description:** Main dashboard showing Security Score (100), active sessions, biometric enrollment status, and quick actions.

**Key Features Visible:**
- Real-time security score with trend indicator
- Active sessions count with device information
- Biometric enrollment cards (Fingerprint: Enrolled, Facial: Not Enrolled)
- Quick action buttons (Break-Glass Access, Security Settings)
- Session monitoring with risk levels

**URL:** `/dashboard`  
**Access Level:** All authenticated users

---

### Biometric Enrollment

**File:** `screenshot-biometric-enrollment.png`  
**Description:** Biometric enrollment interface with fingerprint and facial recognition options.

**Key Features Visible:**
- Step-by-step enrollment wizard
- Live biometric scanner interface
- Enrollment progress indicator
- Success confirmation with green checkmark
- Re-enrollment option for failed attempts

**URL:** `/biometric/enroll`  
**Access Level:** All authenticated users

---

### Break-Glass Access

**File:** `screenshot-break-glass-form.png`  
**Description:** Emergency access request form with HIPAA compliance warnings.

**Key Features Visible:**
- Emergency type selector (Code Blue, Trauma, Stroke, Sepsis)
- Patient ID input field with validation
- Reason for access textarea (required)
- Witness selection dropdown
- HIPAA acknowledgment checkbox
- Red alert banner: "This action will be logged and reviewed"
- Submit button with loading state

**URL:** `/break-glass`  
**Access Level:** Physician, Nurse (clinical roles)

---

### Break-Glass Confirmation

**File:** `screenshot-break-glass-confirmation.png`  
**Description:** Success confirmation after emergency access granted.

**Key Features Visible:**
- Green success banner with checkmark
- Access granted timestamp
- Supervisor notification confirmation
- Audit trail reference number (e.g., "BG-2024-001")
- "Close & Continue" button

**URL:** `/break-glass` (post-submission)  
**Access Level:** Clinical staff

---

### Security Center

**File:** `screenshot-security-center.png`  
**Description:** Comprehensive security dashboard with vulnerabilities, threats, and compliance status.

**Key Features Visible:**
- Security score: 100/100 (Excellent) with shield icon
- Active threats: 0 with flame icon
- Active vulnerabilities: 3 Critical with bug icon (all mitigated)
- Last scan timestamp
- Vulnerability assessment table with severity levels
- Compliance checklist (HIPAA, SOC 2, NIST, OWASP)
- "Run Security Scan" button
- "Generate HIPAA Audit Report" button

**URL:** `/security`  
**Access Level:** Admin only

---

### Risk Scenario Simulator

**File:** `screenshot-risk-simulator.png`  
**Description:** Interactive risk simulation tool for demonstrating adaptive MFA behavior.

**Key Features Visible:**
- Risk level indicator: MEDIUM RISK (score: 45)
- Six risk factor sliders (Unknown Location, Unusual Time, New Device, Failed Login Attempts, VPN/Proxy, Anomalous Behavior)
- Preset scenario selector dropdown
- Adaptive response recommendation box
- Authentication requirements (Password + Biometric OR OTP)
- Real-time risk score calculation

**URL:** `/test` (Risk Simulator tab)  
**Access Level:** All authenticated users (demo/training purposes)

---

### Compliance Report (Modal)

**File:** `screenshot-compliance-report-modal.png`  
**Description:** HIPAA compliance report generator modal.

**Key Features Visible:**
- Organization name input field
- Report period selector (Last 7/30/90 Days, 12 Months)
- PHI warning banner (orange with exclamation mark)
- "Generate Report" button (teal color)
- "Cancel" button

**URL:** `/security` (modal triggered by "Generate HIPAA Audit Report" button)  
**Access Level:** Admin, Compliance Officer

---

### Compliance Report (Generated)

**File:** `screenshot-compliance-report-pdf.png`  
**Description:** Generated HIPAA compliance audit report (PDF view).

**Key Features Visible:**
- HO-MFA logo and report header
- "HIPAA PROTECTED - CONFIDENTIAL" classification badge
- Report metadata (Period, Generated timestamp, Report ID)
- Summary cards (Security Score 100%, MFA Success Rate 99.8%, Total Authentications 15,847, Compliance Checks 8/8)
- Section 1: Access Control Effectiveness table
- Section 2: Emergency Override Summary (Break-Glass events)
- Section 3: Regulatory Compliance Status
- Section 4: Attestation statement
- Footer with page numbers

**URL:** Opened in new tab after clicking "Download / Print PDF"  
**Access Level:** Admin

---

### Testing Suite

**File:** `screenshot-testing-suite.png`  
**Description:** Automated test dashboard showing test execution and results.

**Key Features Visible:**
- Test progress bar (14/14 tests complete)
- Pass rate: 100%
- Test categories (Database, Security, Auth, Performance)
- Individual test results with green checkmarks
- Test duration metrics
- "Reset" and "Run All Tests" buttons
- Color-coded status indicators (green = passed, red = failed, gray = pending)

**URL:** `/test`  
**Access Level:** Admin, Developer

---

### Login Page

**File:** `screenshot-login.png`  
**Description:** Authentication login page.

**Key Features Visible:**
- HO-MFA logo and tagline
- Email address input field
- Password input field with show/hide toggle
- "Remember me" checkbox
- "Sign In" button (teal color)
- "Forgot password?" link
- "Don't have an account? Sign up" link

**URL:** `/auth/login`  
**Access Level:** Public (unauthenticated)

---

### Sign Up Page

**File:** `screenshot-signup.png`  
**Description:** New user registration page.

**Key Features Visible:**
- Full name input field
- Email address input field
- Password input field with strength indicator
- Role selector dropdown (Physician, Nurse, Admin, Medical Records)
- Department input field
- Employee ID input field
- Terms of service checkbox
- "Create Account" button
- "Already have an account? Sign in" link

**URL:** `/auth/sign-up`  
**Access Level:** Public (unauthenticated)

---

### Profile Page

**File:** `screenshot-profile.png`  
**Description:** User profile management page.

**Key Features Visible:**
- Profile avatar (initials circle)
- Full name with edit icon
- Email address (non-editable)
- Role badge (e.g., "Physician" with stethoscope icon)
- Department affiliation
- Employee ID
- Account created date
- Biometric enrollment status cards
- "Change Password" button
- "Enable MFA" toggle switch
- "Logout" button (red)

**URL:** `/profile`  
**Access Level:** All authenticated users

---

## Screenshot Specifications

| Attribute | Value |
|-----------|-------|
| Format | PNG (lossless) |
| Resolution | 1920x1080 (Full HD) |
| Color Depth | 24-bit RGB |
| Browser | Chrome 120.0 (latest) |
| Viewport | Desktop (responsive design also tested) |
| Date Captured | December 11, 2025 |

---

## UI/UX Design Principles

### Color Palette

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary (Teal) | `#0d9488` | Buttons, links, accents |
| Success (Green) | `#22c55e` | Pass indicators, success messages |
| Warning (Orange) | `#f59e0b` | Warnings, pending states |
| Danger (Red) | `#ef4444` | Errors, critical alerts, logout |
| Neutral (Gray) | `#6b7280` | Text, borders, inactive states |
| Background | `#ffffff` (light), `#1f2937` (dark) | Page backgrounds |

### Typography

- **Headings:** Inter (sans-serif), Bold, 24-32px
- **Body Text:** Inter, Regular, 16px
- **Captions:** Inter, Regular, 14px
- **Line Height:** 1.5 (150%)

### Accessibility

- **WCAG 2.1 Level:** AA compliant
- **Contrast Ratio:** Minimum 4.5:1 for normal text
- **Keyboard Navigation:** Full support (Tab, Enter, Arrow keys)
- **Screen Reader:** ARIA labels on all interactive elements

---

## Responsive Design

All screenshots demonstrate desktop view (1920x1080). The application is fully responsive:

- **Desktop:** ≥1280px (shown above)
- **Tablet:** 768-1279px (hamburger menu, stacked layouts)
- **Mobile:** <768px (single-column, touch-optimized)

**Mobile Screenshots:** Available upon request (separate appendix if needed)
