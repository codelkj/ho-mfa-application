# Appendix F: Deployment Configuration

## Deployment Architecture

### Production Environment

**Hosting:** Vercel (Serverless Platform)  
**Database:** Supabase (Managed PostgreSQL)  
**CDN:** Vercel Edge Network (Global)  
**SSL/TLS:** Automatic (Let's Encrypt)

\`\`\`
┌─────────────────────────────────────────────────────┐
│              End Users (Global)                      │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│         Vercel Edge Network (CDN)                    │
│  • 100+ Edge Locations Worldwide                    │
│  • Automatic HTTPS (TLS 1.3)                        │
│  • DDoS Protection                                  │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│       Next.js Application (Serverless)               │
│  • Automatic Scaling (0 to ∞)                       │
│  • Edge Functions for API Routes                    │
│  • Static Site Generation (SSG) for Public Pages   │
│  • Server-Side Rendering (SSR) for Auth Pages      │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│           Supabase Cloud (Database)                  │
│  • PostgreSQL 15.x                                  │
│  • Connection Pooling (PgBouncer)                   │
│  • Daily Automated Backups                          │
│  • Point-in-Time Recovery (7 days)                  │
└─────────────────────────────────────────────────────┘
\`\`\`

---

## Configuration Files

### 1. `next.config.mjs`

\`\`\`javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignore TypeScript errors during build (v0 compatibility)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable image optimization for v0 preview
  images: {
    unoptimized: true,
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
        has: [{ type: 'cookie', key: 'sb-access-token' }],
      },
    ]
  },
}

export default nextConfig
\`\`\`

---

### 2. `middleware.ts`

\`\`\`typescript
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Protected paths requiring authentication
  const protectedPaths = [
    "/dashboard",
    "/biometric",
    "/break-glass",
    "/admin",
    "/profile",
    "/security"
  ]
  
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Check for session cookie
  const sessionCookie = request.cookies.get('sb-access-token')

  if (isProtectedPath && !sessionCookie) {
    // Redirect to login if no session
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
\`\`\`

---

### 3. Environment Variables

**Production (Vercel):**

\`\`\`bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI... (secret)

# Database (provided by Supabase)
POSTGRES_URL=postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres
POSTGRES_URL_NON_POOLING=postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres

# App Config
NEXT_PUBLIC_APP_URL=https://ho-mfa.vercel.app
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard

# Feature Flags
NEXT_PUBLIC_ENABLE_RISK_SIMULATOR=true
NEXT_PUBLIC_ENABLE_COMPLIANCE_REPORTS=true
\`\`\`

**Development (Local):**

\`\`\`bash
# Same as production, but with local redirect URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

---

## Deployment Process

### Automatic Deployment (Git Push)

1. **Commit Code:**
   \`\`\`bash
   git add .
   git commit -m "feat: add compliance report generator"
   git push origin main
   \`\`\`

2. **Vercel Auto-Deploys:**
   - Detects new commit on `main` branch
   - Runs `npm run build`
   - Executes automated tests (if configured)
   - Deploys to production (if tests pass)
   - Generates deployment URL

3. **Deployment URL:**
   - Production: `https://ho-mfa.vercel.app`
   - Preview (PR): `https://ho-mfa-git-feature-branch.vercel.app`

---

### Manual Deployment

\`\`\`bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Deploy to preview
vercel
\`\`\`

---

## Database Configuration

### Supabase Project Settings

**Project ID:** `xxxxx` (redacted)  
**Region:** US East (Ohio) - `us-east-1`  
**Plan:** Free Tier (500 MB database, 2 GB bandwidth, 50 MB file storage)

### Connection Pooling

**PgBouncer Configuration:**
\`\`\`ini
[databases]
postgres = host=db.xxxxx.supabase.co port=5432 dbname=postgres

[pgbouncer]
pool_mode = transaction
max_client_conn = 100
default_pool_size = 25
\`\`\`

**Connection String (Pooled):**
\`\`\`
postgresql://postgres:[password]@db.xxxxx.supabase.co:6543/postgres
\`\`\`

---

## Backup and Recovery

### Automated Backups

**Frequency:** Daily (3:00 AM UTC)  
**Retention:** 7 days (free tier), 30 days (pro tier)  
**Location:** Supabase managed storage (encrypted)

### Point-in-Time Recovery

**Window:** Last 7 days  
**Granularity:** 1-minute intervals

**Restore Command:**
\`\`\`bash
supabase db recovery --timestamp "2025-12-10T14:30:00Z"
\`\`\`

---

### Manual Backup

\`\`\`bash
# Export database schema
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres --schema-only > schema.sql

# Export data
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres --data-only > data.sql

# Full backup
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > full_backup.sql
\`\`\`

---

## Monitoring and Observability

### Vercel Analytics

**Metrics Tracked:**
- **Web Vitals:** LCP, FID, CLS, TTFB
- **Real User Monitoring:** Page load times, API response times
- **Deployment Frequency:** Deployments per day
- **Error Rate:** Failed requests percentage

**Dashboard:** https://vercel.com/[team]/[project]/analytics

---

### Supabase Dashboard

**Metrics Tracked:**
- **Database Size:** Current: 12 MB / 500 MB
- **API Requests:** 1,523 requests/day (avg)
- **Bandwidth:** 47 MB/day (avg)
- **Active Connections:** 3-7 concurrent

**Dashboard:** https://supabase.com/dashboard/project/xxxxx

---

### Error Tracking

**Tool:** Vercel Error Monitoring (built-in)  
**Alerts:** Email notifications for 5xx errors  
**Integration:** Slack webhook (optional)

**Sample Alert:**
\`\`\`
❌ Error Alert: 500 Internal Server Error
Route: /api/break-glass/request
User ID: user-abc-123
Timestamp: 2025-12-11T15:42:00Z
Error: "Database connection timeout"
\`\`\`

---

## Performance Optimization

### Caching Strategy

**Static Assets:**
- Cache-Control: `public, max-age=31536000, immutable`
- CDN: Vercel Edge Network

**API Routes:**
- Cache-Control: `no-store` (auth-required endpoints)
- SWR (stale-while-revalidate) for dashboard data

**Database Queries:**
- Connection pooling reduces latency
- Indexed columns for frequent queries

---

### Build Optimization

**Next.js Configuration:**
\`\`\`javascript
// next.config.mjs
{
  swcMinify: true,  // Use SWC for faster minification
  compress: true,    // Enable gzip compression
  productionBrowserSourceMaps: false,  // Disable source maps in prod
}
\`\`\`

**Bundle Analysis:**
\`\`\`bash
# Install bundle analyzer
npm install @next/bundle-analyzer

# Analyze build
ANALYZE=true npm run build
\`\`\`

---

## Security Configuration

### SSL/TLS

**Certificate:** Automatic (Vercel)  
**TLS Version:** 1.3 (minimum 1.2)  
**Cipher Suites:** Modern configuration (no weak ciphers)

**Test:** https://www.ssllabs.com/ssltest/analyze.html?d=ho-mfa.vercel.app

---

### Secrets Management

**Vercel Secrets:**
\`\`\`bash
# Add secret
vercel secrets add supabase-service-role-key "eyJhbGciOiJI..."

# Reference in environment variable
SUPABASE_SERVICE_ROLE_KEY=@supabase-service-role-key
\`\`\`

**Best Practices:**
- Never commit secrets to Git
- Rotate secrets every 90 days
- Use different keys for dev/staging/prod

---

## Rollback Procedures

### Instant Rollback (Vercel)

1. Navigate to Vercel Dashboard → Deployments
2. Find previous successful deployment
3. Click "Promote to Production"
4. Rollback complete in < 30 seconds

**CLI Rollback:**
\`\`\`bash
vercel rollback [deployment-url]
\`\`\`

---

### Database Rollback

1. **Identify Restore Point:**
   \`\`\`bash
   supabase db history
   \`\`\`

2. **Restore to Timestamp:**
   \`\`\`bash
   supabase db recovery --timestamp "2025-12-10T12:00:00Z"
   \`\`\`

3. **Verify Restoration:**
   \`\`\`bash
   psql -h db.xxxxx.supabase.co -U postgres -d postgres -c "SELECT COUNT(*) FROM profiles;"
   \`\`\`

---

## Disaster Recovery Plan

### RTO and RPO

**Recovery Time Objective (RTO):** < 1 hour  
**Recovery Point Objective (RPO):** < 24 hours (daily backups)

### Recovery Procedures

**Scenario 1: Application Failure**
- Action: Rollback to last known good deployment
- Time: < 5 minutes

**Scenario 2: Database Corruption**
- Action: Restore from automated backup
- Time: < 30 minutes

**Scenario 3: Complete Infrastructure Failure**
- Action: Deploy to new Vercel project + restore database
- Time: < 2 hours

---

## Scaling Configuration

### Vercel Serverless Limits

**Free Tier:**
- 100 GB bandwidth/month
- 100 deployments/day
- 12-second function timeout

**Pro Tier (if needed):**
- 1 TB bandwidth/month
- Unlimited deployments
- 60-second function timeout

### Database Scaling

**Current:** Free tier (500 MB, 2 GB bandwidth)  
**Next Tier:** Pro ($25/month - 8 GB database, 50 GB bandwidth)  
**Enterprise:** Custom pricing (dedicated instance)

---

## Cost Breakdown

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Vercel (Hosting) | Free | $0 |
| Supabase (Database) | Free | $0 |
| Domain (optional) | .com | $12/year ($1/month) |
| **Total** | | **$0-1/month** |

**Projected Cost at Scale (1,000 users):**
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- **Total:** $45/month

---

## Appendix F-1: Deployment Checklist

- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] RLS policies enabled
- [ ] SSL certificate active
- [ ] DNS configured (if custom domain)
- [ ] Monitoring alerts set up
- [ ] Backup schedule verified
- [ ] Rollback procedure tested
- [ ] Security headers configured
- [ ] Performance benchmarks met

---

**Last Updated:** December 11, 2025  
**Maintained By:** Development Team  
**Review Frequency:** Quarterly
