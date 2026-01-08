# HO-MFA Application - Complete Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Download & Setup](#download--setup)
3. [Local Development Setup](#local-development-setup)
4. [Production Deployment](#production-deployment)
5. [GitHub Repository Setup](#github-repository-setup)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js** (v18.17 or later) - [Download](https://nodejs.org/)
- **Git** (v2.30 or later) - [Download](https://git-scm.com/)
- **VS Code** or **Windsurf** - [VS Code Download](https://code.visualstudio.com/) | [Windsurf Download](https://codeium.com/windsurf)
- **Supabase Account** - [Sign up](https://supabase.com/)
- **Vercel Account** (for production) - [Sign up](https://vercel.com/)

### Recommended VS Code Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Supabase
- GitLens

---

## Download & Setup

### Method 1: Download from v0 (Recommended)

1. **In the v0 interface:**
   - Click the **three dots (•••)** in the top right corner of the code block
   - Select **"Download ZIP"**
   - Save as `ho-mfa-application.zip`

2. **Extract the ZIP file:**
   ```bash
   # Windows
   Right-click → Extract All

   # macOS
   Double-click the ZIP file

   # Linux
   unzip ho-mfa-application.zip
   ```

3. **Navigate to the project:**
   ```bash
   cd ho-mfa-application
   ```

---

## Local Development Setup

### Step 1: Install Dependencies

Open your terminal in VS Code/Windsurf:

```bash
# Install npm packages
npm install

# This installs:
# - Next.js 15
# - React 18
# - Supabase Client
# - Tailwind CSS
# - TypeScript
# - All other dependencies
```

### Step 2: Configure Supabase

1. **Create a Supabase project:**
   - Go to [supabase.com](https://supabase.com/)
   - Click "New Project"
   - Name: `ho-mfa-production`
   - Database Password: (create a secure password)
   - Region: Choose closest to your location
   - Click "Create new project"

2. **Get your Supabase credentials:**
   - In Supabase Dashboard → Settings → API
   - Copy these values:
     - Project URL
     - Anon/Public Key
     - Service Role Key (keep secret!)

3. **Create `.env.local` file in project root:**

```bash
# Create the file
touch .env.local

# Or in Windows PowerShell
New-Item .env.local
```

4. **Add environment variables to `.env.local`:**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Development Redirect URL (for email confirmation)
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# Database URLs (from Supabase Dashboard → Settings → Database)
POSTGRES_URL=postgresql://postgres:[password]@[host]/postgres
POSTGRES_PRISMA_URL=postgresql://postgres:[password]@[host]/postgres
POSTGRES_URL_NON_POOLING=postgresql://postgres:[password]@[host]/postgres
POSTGRES_USER=postgres
POSTGRES_HOST=your_host
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=postgres
```

### Step 3: Run Database Migrations

Execute all SQL migration scripts in Supabase:

1. **In Supabase Dashboard → SQL Editor**

2. **Run scripts in order:**

```bash
# Script 1: Core Tables & Multi-Tenant Architecture
scripts/001_initial_schema.sql

# Script 2: Authentication & Session Management
scripts/002_auth_tables.sql

# Script 3: Security & Audit Logging
scripts/003_security_tables.sql

# Script 4: Advanced Features (FIDO2, ML, EHR, Mobile)
scripts/004_advanced_features.sql

# Script 5: Feature Flags & Configuration
scripts/005_feature_flags.sql

# Script 6: Row Level Security Policies
scripts/006_rls_policies.sql

# Script 7: Database Functions
scripts/007_database_functions.sql
```

3. **Verify tables created:**
   - Go to Supabase Dashboard → Table Editor
   - You should see 15 tables:
     - organizations
     - profiles
     - auth_sessions
     - fido2_credentials
     - biometric_credentials
     - auth_audit_logs
     - feature_flags
     - break_glass_logs
     - ml_risk_contexts
     - ehr_access_logs
     - mobile_sessions
     - push_notifications
     - risk_sessions
     - ml_training_data
     - ehr_integrations

### Step 4: Enable Supabase Authentication

1. **In Supabase Dashboard → Authentication → Providers**
2. **Enable Email provider:**
   - Toggle "Enable Email provider" ON
   - Enable "Confirm email" (optional for dev)
   - Save

3. **Configure Email Templates (optional):**
   - Customize confirmation and reset password emails

### Step 5: Start Development Server

```bash
# Start the Next.js development server
npm run dev

# Server starts at http://localhost:3000
```

### Step 6: Create Initial Organization & Admin User

1. **Sign up at:** `http://localhost:3000/auth/sign-up`
   - Email: your-email@example.com
   - Password: (create secure password)

2. **Confirm email** (if enabled)

3. **Promote user to admin in Supabase:**
   ```sql
   -- In Supabase SQL Editor
   UPDATE profiles 
   SET role = 'admin'
   WHERE email = 'your-email@example.com';
   ```

4. **Enable Feature Flags at:** `http://localhost:3000/settings`
   - Toggle all 6 advanced features ON

### Step 7: Test the Application

Visit these pages to verify functionality:

- **Dashboard:** `http://localhost:3000/dashboard`
- **Profile:** `http://localhost:3000/profile`
- **Security:** `http://localhost:3000/security`
- **Testing Dashboard:** `http://localhost:3000/testing`
- **Feature Flags:** `http://localhost:3000/settings`
- **Admin Panel:** `http://localhost:3000/admin`

---

## Production Deployment

### Method 1: Deploy to Vercel (Recommended)

#### Step 1: Prepare Production Supabase Project

1. **Create production Supabase project:**
   - Name: `ho-mfa-production`
   - Use a different project than development

2. **Run all migration scripts** (same as local setup)

3. **Configure production authentication:**
   - Update redirect URLs to your production domain

#### Step 2: Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy the application:**
   ```bash
   # From project root
   vercel

   # Follow prompts:
   # - Setup and deploy? Y
   # - Which scope? (select your account)
   # - Link to existing project? N
   # - What's your project's name? ho-mfa-application
   # - In which directory is your code? ./
   # - Override settings? N
   ```

4. **Add environment variables in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all variables from `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - All `POSTGRES_*` variables
   - Select: Production, Preview, Development
   - Click "Save"

5. **Redeploy with environment variables:**
   ```bash
   vercel --prod
   ```

6. **Get your production URL:**
   ```
   https://ho-mfa-application.vercel.app
   ```

7. **Update Supabase Redirect URLs:**
   - In Supabase Dashboard → Authentication → URL Configuration
   - Add production URL: `https://ho-mfa-application.vercel.app`

#### Step 3: Configure Custom Domain (Optional)

1. **In Vercel Dashboard → Your Project → Settings → Domains**
2. **Add custom domain:** `yourdomain.com`
3. **Update DNS records** as instructed
4. **Update Supabase redirect URLs** to use custom domain

---

## GitHub Repository Setup

### Step 1: Create GitHub Repository

1. **Go to [github.com](https://github.com)**
2. **Click "New repository"**
3. **Configure repository:**
   - Repository name: `ho-mfa-application`
   - Description: `Healthcare Organization Multi-Factor Authentication System - MSIT 5910 Capstone Project`
   - Visibility: Private (recommended) or Public
   - Do NOT initialize with README (we have existing code)
4. **Click "Create repository"**

### Step 2: Initialize Local Git Repository

```bash
# Navigate to project directory
cd ho-mfa-application

# Initialize Git (if not already initialized)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: HO-MFA Healthcare Authentication System

- Multi-tenant architecture with organization-level isolation
- FIDO2 hardware security key authentication
- ML-based adaptive risk scoring
- HL7 FHIR EHR integration
- Mobile push notification MFA
- Platform biometric authentication (Touch ID, Face ID)
- Break-glass emergency access protocol
- Comprehensive audit logging and HIPAA compliance
- Feature flag system for runtime configuration
- 15 database tables with Row Level Security
- Next.js 15, React 18, Supabase, TypeScript, Tailwind CSS"
```

### Step 3: Connect to GitHub Repository

```bash
# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/ho-mfa-application.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Configure GitHub Repository

#### Add Repository Description:
- Go to repository → Settings
- Description: `Healthcare MFA system with FIDO2, ML risk scoring, EHR integration, and break-glass protocol. MSIT 5910 Capstone Project.`
- Topics: `healthcare`, `authentication`, `mfa`, `fido2`, `nextjs`, `supabase`, `typescript`, `hipaa-compliance`

#### Create `.gitignore` (ensure these are excluded):
```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/
dist/

# Production
.vercel

# Environment Variables
.env
.env.local
.env.production.local
.env.development.local
.env.test.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Misc
*.pem
```

#### Add README.md:
The project already includes a comprehensive README.md

#### Create LICENSE (Optional):
```bash
# MIT License recommended for open-source
# Or keep private if proprietary
```

### Step 5: Connect Vercel to GitHub (Optional - Automatic Deployments)

1. **In Vercel Dashboard → Your Project → Settings → Git**
2. **Click "Connect Git Repository"**
3. **Select GitHub and authorize**
4. **Choose repository:** `your-username/ho-mfa-application`
5. **Configure:**
   - Production Branch: `main`
   - Enable automatic deployments
6. **Save**

Now every push to `main` branch automatically deploys to production!

---

## VS Code / Windsurf Workflow

### VS Code Setup

1. **Open project:**
   ```bash
   code .
   ```

2. **Install recommended extensions:**
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type: `Extensions: Show Recommended Extensions`
   - Install all

3. **Configure integrated terminal:**
   - Terminal → New Terminal
   - Run: `npm run dev`

4. **Use Source Control panel:**
   - Click Source Control icon (left sidebar)
   - Stage changes, commit, push to GitHub

### Windsurf Setup

1. **Open project:**
   - File → Open Folder → Select `ho-mfa-application`

2. **Use AI assistance:**
   - Windsurf has built-in AI for code generation
   - Use `Ctrl+K` for inline AI commands

3. **Run development server:**
   - Terminal → `npm run dev`

---

## Development Workflow

### Daily Development

```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/new-feature-name

# Make changes and test
npm run dev

# Commit changes
git add .
git commit -m "Description of changes"

# Push to GitHub
git push origin feature/new-feature-name

# Create Pull Request on GitHub
# Merge to main after review
```

### Testing Features

```bash
# Run development server
npm run dev

# Test at http://localhost:3000/testing

# Test specific features:
# - FIDO2: http://localhost:3000/testing (requires HTTPS in production)
# - ML Risk Scoring: Automatic on login
# - Feature Flags: http://localhost:3000/settings
# - Break-Glass: http://localhost:3000/break-glass
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Error:** `Could not connect to database`

**Solution:**
```bash
# Check environment variables
cat .env.local

# Verify Supabase credentials in dashboard
# Ensure POSTGRES_URL is correct
```

#### 2. Authentication Not Working

**Error:** `Email confirmation required`

**Solution:**
- Disable email confirmation in Supabase Dashboard → Authentication → Settings
- Or confirm email via link sent

#### 3. Feature Flags Not Loading

**Error:** `Feature flag check failed`

**Solution:**
```sql
-- In Supabase SQL Editor, verify table exists:
SELECT * FROM feature_flags;

-- Run migration script if missing:
-- scripts/005_feature_flags.sql
```

#### 4. Port 3000 Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

#### 5. Build Errors

**Error:** `Module not found`

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

---

## Project Structure

```
ho-mfa-application/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── ehr/fhir/route.ts    # EHR FHIR integration
│   │   └── mobile/push/route.ts  # Mobile push notifications
│   ├── auth/                     # Authentication pages
│   │   ├── login/page.tsx
│   │   └── sign-up/page.tsx
│   ├── dashboard/page.tsx        # Main dashboard
│   ├── profile/page.tsx          # User profile
│   ├── security/page.tsx         # Security settings
│   ├── settings/page.tsx         # Feature flags
│   ├── testing/page.tsx          # Testing dashboard
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── auth/                     # Auth components
│   ├── settings/                 # Settings components
│   ├── testing/                  # Testing components
│   └── ui/                       # UI components (shadcn)
├── lib/                          # Utility libraries
│   ├── supabase/
│   │   ├── client.ts            # Browser Supabase client
│   │   ├── server.ts            # Server Supabase client
│   │   └── middleware.ts        # Auth middleware
│   └── feature-flags.ts         # Feature flag utilities
├── scripts/                      # Database migration scripts
│   ├── 001_initial_schema.sql
│   ├── 002_auth_tables.sql
│   ├── 003_security_tables.sql
│   ├── 004_advanced_features.sql
│   ├── 005_feature_flags.sql
│   ├── 006_rls_policies.sql
│   └── 007_database_functions.sql
├── docs/                         # Documentation
│   ├── msit-5910-unit7-capstone-report.md
│   ├── CAPSTONE_PROJECT_SUMMARY.md
│   └── future-work-features-impact-analysis.md
├── public/                       # Static assets
├── .env.local                    # Environment variables (create this)
├── .gitignore                    # Git ignore rules
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # Project documentation
```

---

## Additional Resources

### Documentation
- **HO-MFA Documentation:** `/docs/README.md`
- **API Documentation:** `/docs/API.md`
- **Testing Guide:** `/TESTING_GUIDE.md`
- **Deployment Guide:** `/DEPLOYMENT_GUIDE.md`

### Support
- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **FIDO2 WebAuthn:** https://webauthn.guide

---

## Security Checklist

Before deploying to production:

- [ ] All environment variables are set in Vercel
- [ ] `.env.local` is in `.gitignore` (never commit secrets!)
- [ ] Supabase Row Level Security (RLS) is enabled on all tables
- [ ] Admin users are properly configured
- [ ] Email confirmation is enabled (optional)
- [ ] HTTPS is enabled (required for FIDO2)
- [ ] Database backups are configured in Supabase
- [ ] Error monitoring is set up (Sentry, etc.)
- [ ] Rate limiting is enabled for API routes
- [ ] CORS is properly configured
- [ ] Security headers are set in `next.config.mjs`

---

## Performance Optimization

- [ ] Images use Next.js Image component
- [ ] Database queries use proper indexes
- [ ] API routes implement caching where appropriate
- [ ] Components use React.memo for expensive renders
- [ ] Bundle size is optimized (< 250KB first load)
- [ ] Lighthouse score > 90 for all metrics

---

## Maintenance

### Regular Tasks
- **Weekly:** Review error logs
- **Monthly:** Update dependencies (`npm update`)
- **Quarterly:** Security audit (`npm audit`)
- **As needed:** Database backups and restores

---

**Congratulations! Your HO-MFA application is now deployed and ready for use!** 🎉

For questions or issues, refer to the troubleshooting section or consult the comprehensive documentation in the `/docs` folder.
