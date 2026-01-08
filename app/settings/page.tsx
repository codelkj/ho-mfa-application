import { Suspense } from "react"
import { FeatureTogglePanel } from "@/components/settings/feature-toggle-panel"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
        <p className="text-muted-foreground mt-2">Manage feature flags and system configuration</p>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        }
      >
        <FeatureTogglePanel />
      </Suspense>
    </div>
  )
}
