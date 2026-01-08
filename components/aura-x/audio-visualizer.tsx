"use client"

import { useEffect, useRef } from "react"

interface AudioVisualizerProps {
  isPlaying: boolean
  audioUrl: string | null
}

export function AudioVisualizer({ isPlaying, audioUrl }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const draw = () => {
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw waveform visualization
      const barCount = 64
      const barWidth = width / barCount
      const centerY = height / 2

      for (let i = 0; i < barCount; i++) {
        // Simulate audio data (will be replaced with real audio analysis)
        const amplitude = isPlaying ? Math.random() * 0.7 + 0.3 : 0.1 + Math.sin(Date.now() / 1000 + i) * 0.05

        const barHeight = amplitude * height * 0.8

        // Create gradient
        const gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2)
        gradient.addColorStop(0, "rgba(168, 85, 247, 0.8)")
        gradient.addColorStop(0.5, "rgba(236, 72, 153, 0.6)")
        gradient.addColorStop(1, "rgba(168, 85, 247, 0.8)")

        ctx.fillStyle = gradient
        ctx.fillRect(i * barWidth + 2, centerY - barHeight / 2, barWidth - 4, barHeight)
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying])

  return (
    <div className="relative h-48 w-full overflow-hidden rounded-lg bg-black/20">
      <canvas ref={canvasRef} className="h-full w-full" />
      {!audioUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-white/40">Generate music to see visualization</p>
        </div>
      )}
    </div>
  )
}
