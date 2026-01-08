import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Fingerprint, AlertTriangle, Activity } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-teal-600" />
            <span className="text-xl font-bold text-slate-900">HO-MFA</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-teal-600 hover:bg-teal-700">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Healthcare-Optimized
            <span className="block text-teal-600">Multi-Factor Authentication</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            Secure, HIPAA-compliant authentication designed for healthcare environments. Balance security with clinical
            workflow efficiency through context-aware, biometric-enabled access control.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                Start Free Trial
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="mt-24 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-200">
            <CardHeader>
              <Fingerprint className="h-10 w-10 text-teal-600" />
              <CardTitle className="mt-4 text-slate-900">Biometric Auth</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600">
                Fingerprint and facial recognition with on-device processing. No raw biometric data leaves the client.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <AlertTriangle className="h-10 w-10 text-amber-500" />
              <CardTitle className="mt-4 text-slate-900">Break-Glass Access</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600">
                Emergency access protocol with full audit trail. Immediate supervisor notification and post-hoc review.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <Shield className="h-10 w-10 text-teal-600" />
              <CardTitle className="mt-4 text-slate-900">HIPAA Compliant</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600">
                Full audit logging, encryption at rest and in transit, and role-based access control per 45 CFR 164.312.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <Activity className="h-10 w-10 text-teal-600" />
              <CardTitle className="mt-4 text-slate-900">Risk-Adaptive</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600">
                Context-aware authentication adjusts security requirements based on location, device, and user behavior
                patterns.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Trust Banner */}
        <div className="mt-24 rounded-xl bg-teal-600 p-8 text-center text-white">
          <h2 className="text-2xl font-bold">Trusted by Healthcare Organizations</h2>
          <p className="mt-2 text-teal-100">
            Designed for hospitals, clinics, and healthcare systems requiring HIPAA-compliant authentication without
            compromising clinical efficiency.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          <p>© 2025 HO-MFA. Healthcare-Optimized Multi-Factor Authentication.</p>
          <p className="mt-1">HIPAA Compliant • SOC 2 Type II • ISO 27001</p>
        </div>
      </footer>
    </div>
  )
}
