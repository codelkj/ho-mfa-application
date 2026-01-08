import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-10 w-10 text-teal-600" />
            <span className="text-2xl font-bold text-slate-900">HO-MFA</span>
          </div>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-900">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {params?.error ? (
              <p className="text-sm text-red-700">Error: {params.error}</p>
            ) : (
              <p className="text-sm text-red-700">An unspecified authentication error occurred.</p>
            )}
            <Link href="/auth/login" className="mt-6 block">
              <Button className="w-full bg-teal-600 hover:bg-teal-700">Try Again</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
