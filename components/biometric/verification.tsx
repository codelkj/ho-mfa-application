"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Camera, Fingerprint, CheckCircle2, AlertCircle, RefreshCw, Shield, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { BiometricEnrollment } from "@/lib/types"

const supabase = createClient()

interface BiometricVerificationProps {
  user: User
  enrollments: BiometricEnrollment[]
}

export function BiometricVerification({ user, enrollments }: BiometricVerificationProps) {
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyProgress, setVerifyProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [verified, setVerified] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<"facial" | "fingerprint">(
    enrollments.find((e) => e.biometric_type === "facial") ? "facial" : "fingerprint",
  )
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const hasFacial = enrollments.some((e) => e.biometric_type === "facial")
  const hasFingerprint = enrollments.some((e) => e.biometric_type === "fingerprint")

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      })
      setCameraStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      setError("Unable to access camera. Please grant camera permissions.")
    }
  }, [])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }
  }, [cameraStream])

  // Cleanup
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [cameraStream])

  // Auto-start camera for facial verification
  useEffect(() => {
    if (selectedMethod === "facial" && !cameraStream && !verified) {
      startCamera()
    } else if (selectedMethod === "fingerprint" && cameraStream) {
      stopCamera()
    }
  }, [selectedMethod, cameraStream, verified, startCamera, stopCamera])

  // Verify facial biometric
  const verifyFacial = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsVerifying(true)
    setError(null)
    setVerifyProgress(0)

    const supabaseLocal = createClient()

    try {
      // Simulate verification progress
      for (let i = 0; i <= 100; i += 15) {
        setVerifyProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 150))
      }

      // In production, this would:
      // 1. Capture frame and generate embedding using TensorFlow.js
      // 2. Compare embedding hash with stored hash
      // 3. Calculate similarity score

      // Simulate successful verification (90% success rate for demo)
      const isMatch = Math.random() > 0.1

      if (isMatch) {
        // Update last_verified_at
        await supabaseLocal
          .from("biometric_enrollments")
          .update({ last_verified_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .eq("biometric_type", "facial")

        // Log successful verification
        await supabaseLocal.rpc("log_auth_event", {
          p_user_id: user.id,
          p_event_type: "biometric_verify_success",
          p_auth_method: "facial",
          p_metadata: { verification_type: "facial" },
        })

        setVerified(true)
        stopCamera()
      } else {
        // Log failed verification
        await supabaseLocal.rpc("log_auth_event", {
          p_user_id: user.id,
          p_event_type: "biometric_verify_failure",
          p_auth_method: "facial",
          p_metadata: { verification_type: "facial", reason: "no_match" },
        })

        throw new Error("Face not recognized. Please try again.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
    } finally {
      setIsVerifying(false)
      setVerifyProgress(0)
    }
  }

  // Verify fingerprint
  const verifyFingerprint = async () => {
    setIsVerifying(true)
    setError(null)
    setVerifyProgress(0)

    const supabaseLocal = createClient()

    try {
      for (let i = 0; i <= 100; i += 25) {
        setVerifyProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      // Simulate successful verification
      const isMatch = Math.random() > 0.1

      if (isMatch) {
        await supabaseLocal
          .from("biometric_enrollments")
          .update({ last_verified_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .eq("biometric_type", "fingerprint")

        await supabaseLocal.rpc("log_auth_event", {
          p_user_id: user.id,
          p_event_type: "biometric_verify_success",
          p_auth_method: "fingerprint",
          p_metadata: { verification_type: "fingerprint" },
        })

        setVerified(true)
      } else {
        await supabaseLocal.rpc("log_auth_event", {
          p_user_id: user.id,
          p_event_type: "biometric_verify_failure",
          p_auth_method: "fingerprint",
          p_metadata: { verification_type: "fingerprint", reason: "no_match" },
        })

        throw new Error("Fingerprint not recognized. Please try again.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
    } finally {
      setIsVerifying(false)
      setVerifyProgress(0)
    }
  }

  // Continue to dashboard after verification
  const proceedToDashboard = () => {
    router.push("/dashboard")
  }

  if (verified) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Verified</h2>
              <p className="text-muted-foreground mt-1">Your identity has been confirmed</p>
            </div>
            <Button onClick={proceedToDashboard} className="w-full">
              Continue to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Biometric Verification</CardTitle>
        <CardDescription>Verify your identity to continue</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Method selector */}
        {hasFacial && hasFingerprint && (
          <div className="flex gap-2">
            <Button
              variant={selectedMethod === "facial" ? "default" : "outline"}
              onClick={() => setSelectedMethod("facial")}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Face
            </Button>
            <Button
              variant={selectedMethod === "fingerprint" ? "default" : "outline"}
              onClick={() => setSelectedMethod("fingerprint")}
              className="flex-1"
            >
              <Fingerprint className="h-4 w-4 mr-2" />
              Fingerprint
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Facial verification */}
        {selectedMethod === "facial" && hasFacial && (
          <div className="space-y-4">
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              {cameraStream ? (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-56 border-4 border-dashed border-primary/50 rounded-full" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />

            {isVerifying && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Verifying...</span>
                  <span>{verifyProgress}%</span>
                </div>
                <Progress value={verifyProgress} />
              </div>
            )}

            <Button onClick={verifyFacial} disabled={isVerifying || !cameraStream} className="w-full">
              {isVerifying ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
              Verify Face
            </Button>
          </div>
        )}

        {/* Fingerprint verification */}
        {selectedMethod === "fingerprint" && hasFingerprint && (
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <Fingerprint
                className={`h-24 w-24 ${isVerifying ? "text-primary animate-pulse" : "text-muted-foreground"}`}
              />
            </div>

            {isVerifying && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Scanning...</span>
                  <span>{verifyProgress}%</span>
                </div>
                <Progress value={verifyProgress} />
              </div>
            )}

            <Button onClick={verifyFingerprint} disabled={isVerifying} className="w-full">
              {isVerifying ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Fingerprint className="h-4 w-4 mr-2" />
              )}
              Verify Fingerprint
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
