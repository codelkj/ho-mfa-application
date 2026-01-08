import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Mail } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-10 w-10 text-teal-600" />
            <span className="text-2xl font-bold text-slate-900">HO-MFA</span>
          </div>
        </div>

        <Card className="border-slate-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
              <Mail className="h-8 w-8 text-teal-600" />
            </div>
            <CardTitle className="text-xl text-slate-900">Check Your Email</CardTitle>
            <CardDescription className="text-slate-500">We&apos;ve sent you a confirmation link</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-slate-600">
              Please check your email inbox and click the confirmation link to activate your account. Once confirmed,
              you can sign in and set up biometric authentication.
            </p>
            <Link href="/auth/login" className="mt-6 block">
              <Button variant="outline" className="w-full border-slate-300 bg-transparent">
                Return to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
