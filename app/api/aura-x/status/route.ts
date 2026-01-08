import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const sessionId = searchParams.get("sessionId")

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
  }

  try {
    // TODO: Query Temporal workflow status
    // const client = await Client.connect()
    // const handle = client.workflow.getHandle(sessionId)
    // const status = await handle.describe()

    // Mock response for now
    return NextResponse.json({
      sessionId,
      status: "running",
      currentStage: "composing",
      progress: 45,
      estimatedTimeRemaining: 120,
    })
  } catch (error) {
    console.error("[v0] Error fetching workflow status:", error)
    return NextResponse.json({ error: "Failed to fetch workflow status" }, { status: 500 })
  }
}
