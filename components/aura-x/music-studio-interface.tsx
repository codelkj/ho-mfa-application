"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Square, AudioWaveform as Waveform, Sparkles, Volume2, Activity, Zap } from "lucide-react"
import { AudioVisualizer } from "./audio-visualizer"
import { WorkflowStatusPanel } from "./workflow-status-panel"
import { AgentChatPanel } from "./agent-chat-panel"

type WorkflowStatus = "idle" | "composing" | "arranging" | "mixing" | "mastering" | "completed" | "error"

export function MusicStudioInterface() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>("idle")
  const [prompt, setPrompt] = useState("")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [workflowProgress, setWorkflowProgress] = useState(0)
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    latency: 0,
    quality: 0,
    gpuUsage: 0,
  })

  const audioRef = useRef<HTMLAudioElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws")

    ws.onopen = () => {
      console.log("[v0] WebSocket connected to AURA-X backend")
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === "workflow_status") {
        setWorkflowStatus(data.status)
        setWorkflowProgress(data.progress)
      } else if (data.type === "audio_chunk") {
        // Handle real-time audio streaming
        // This will be implemented with Pipecat
      } else if (data.type === "metrics") {
        setRealTimeMetrics(data.metrics)
      } else if (data.type === "workflow_complete") {
        setAudioUrl(data.audioUrl)
        setWorkflowStatus("completed")
      }
    }

    ws.onerror = (error) => {
      console.error("[v0] WebSocket error:", error)
      setWorkflowStatus("error")
    }

    wsRef.current = ws

    return () => {
      ws.close()
    }
  }, [])

  const handleStartGeneration = async () => {
    if (!prompt.trim()) return

    setWorkflowStatus("composing")
    setWorkflowProgress(0)

    try {
      // Start Temporal workflow via API
      const response = await fetch("/api/aura-x/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          style: "electronic",
          duration: 60,
          quality: "high",
        }),
      })

      const data = await response.json()
      setSessionId(data.sessionId)

      // Send workflow start message via WebSocket
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "start_workflow",
            sessionId: data.sessionId,
          }),
        )
      }
    } catch (error) {
      console.error("[v0] Generation error:", error)
      setWorkflowStatus("error")
    }
  }

  const handleStopGeneration = () => {
    if (sessionId && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "stop_workflow",
          sessionId,
        }),
      )
    }
    setWorkflowStatus("idle")
    setSessionId(null)
  }

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case "idle":
        return "bg-slate-500"
      case "composing":
      case "arranging":
      case "mixing":
      case "mastering":
        return "bg-blue-500 animate-pulse"
      case "completed":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
    }
  }

  const getStatusText = (status: WorkflowStatus) => {
    switch (status) {
      case "idle":
        return "Ready"
      case "composing":
        return "Composing melody..."
      case "arranging":
        return "Arranging structure..."
      case "mixing":
        return "Mixing tracks..."
      case "mastering":
        return "Mastering audio..."
      case "completed":
        return "Complete"
      case "error":
        return "Error"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AURA-X</h1>
              <p className="text-xs text-purple-300">Level 5 Autonomous Music AI</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-green-500/50 text-green-400">
              <Activity className="mr-1 h-3 w-3" />
              Live
            </Badge>
            <Badge variant="outline" className="border-purple-500/50 text-purple-400">
              <Zap className="mr-1 h-3 w-3" />
              {realTimeMetrics.latency}ms
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto grid gap-6 p-6 lg:grid-cols-3">
        {/* Main Studio Area */}
        <div className="space-y-6 lg:col-span-2">
          {/* Generation Controls */}
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Compose with AI</CardTitle>
              <CardDescription className="text-purple-300">
                Describe your music and let AURA-X create it autonomously
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-white">
                  Music Prompt
                </Label>
                <Input
                  id="prompt"
                  placeholder="e.g., 'uplifting electronic track with piano and synths, 120 BPM, progressive house style'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="border-white/20 bg-white/5 text-white placeholder:text-white/50"
                  disabled={workflowStatus !== "idle" && workflowStatus !== "completed"}
                />
              </div>

              <div className="flex items-center gap-3">
                {workflowStatus === "idle" || workflowStatus === "completed" || workflowStatus === "error" ? (
                  <Button
                    onClick={handleStartGeneration}
                    disabled={!prompt.trim()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Music
                  </Button>
                ) : (
                  <Button onClick={handleStopGeneration} variant="destructive" className="bg-red-500 hover:bg-red-600">
                    <Square className="mr-2 h-4 w-4" />
                    Stop Generation
                  </Button>
                )}

                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${getStatusColor(workflowStatus)}`} />
                  <span className="text-sm text-white/80">{getStatusText(workflowStatus)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              {workflowStatus !== "idle" && workflowStatus !== "completed" && workflowStatus !== "error" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Progress</span>
                    <span className="text-white">{workflowProgress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${workflowProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audio Visualizer & Playback */}
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Waveform className="h-5 w-5" />
                Audio Visualizer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AudioVisualizer isPlaying={isPlaying} audioUrl={audioUrl} />

              {/* Playback Controls */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={togglePlayback}
                  disabled={!audioUrl}
                  size="lg"
                  className="bg-white/10 hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="h-5 w-5 text-white" /> : <Play className="h-5 w-5 text-white" />}
                </Button>
                <div className="flex-1">
                  <Slider disabled={!audioUrl} defaultValue={[70]} max={100} step={1} className="cursor-pointer" />
                </div>
                <Volume2 className="h-5 w-5 text-white/60" />
              </div>

              {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />}
            </CardContent>
          </Card>

          {/* Real-time Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Latency</p>
                    <p className="text-2xl font-bold text-white">{realTimeMetrics.latency}ms</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Quality Score</p>
                    <p className="text-2xl font-bold text-white">{realTimeMetrics.quality.toFixed(1)}/10</p>
                  </div>
                  <Sparkles className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">GPU Usage</p>
                    <p className="text-2xl font-bold text-white">{realTimeMetrics.gpuUsage}%</p>
                  </div>
                  <Zap className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Workflow Status */}
          <WorkflowStatusPanel status={workflowStatus} sessionId={sessionId} />

          {/* Agent Chat */}
          <AgentChatPanel sessionId={sessionId} />
        </div>
      </div>
    </div>
  )
}
