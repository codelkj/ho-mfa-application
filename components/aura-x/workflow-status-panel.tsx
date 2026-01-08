"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"

interface WorkflowStatusPanelProps {
  status: string
  sessionId: string | null
}

export function WorkflowStatusPanel({ status, sessionId }: WorkflowStatusPanelProps) {
  const stages = [
    { id: "composition", label: "Composition", status: "composing" },
    { id: "arrangement", label: "Arrangement", status: "arranging" },
    { id: "mixing", label: "Mixing", status: "mixing" },
    { id: "mastering", label: "Mastering", status: "mastering" },
  ]

  const getStageStatus = (stageStatus: string) => {
    if (status === "idle") return "pending"
    if (status === stageStatus) return "active"

    const currentIndex = stages.findIndex((s) => s.status === status)
    const stageIndex = stages.findIndex((s) => s.status === stageStatus)

    if (currentIndex > stageIndex) return "completed"
    return "pending"
  }

  return (
    <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white">Workflow Status</CardTitle>
        <CardDescription className="text-purple-300">Temporal orchestration pipeline</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessionId && (
          <div className="rounded-lg bg-white/5 p-3">
            <p className="text-xs text-white/60">Session ID</p>
            <p className="font-mono text-xs text-white">{sessionId}</p>
          </div>
        )}

        <div className="space-y-3">
          {stages.map((stage, index) => {
            const stageStatus = getStageStatus(stage.status)
            return (
              <div key={stage.id} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center">
                  {stageStatus === "completed" && <CheckCircle2 className="h-6 w-6 text-green-400" />}
                  {stageStatus === "active" && <Loader2 className="h-6 w-6 animate-spin text-blue-400" />}
                  {stageStatus === "pending" && <Circle className="h-6 w-6 text-white/20" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{stage.label}</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    stageStatus === "completed"
                      ? "border-green-500/50 text-green-400"
                      : stageStatus === "active"
                        ? "border-blue-500/50 text-blue-400"
                        : "border-white/20 text-white/40"
                  }
                >
                  {stageStatus === "completed" && "Done"}
                  {stageStatus === "active" && "Running"}
                  {stageStatus === "pending" && "Pending"}
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
