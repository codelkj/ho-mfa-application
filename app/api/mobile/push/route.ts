import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"

// Real push notification implementation using Firebase Cloud Messaging
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { mobileSessionId, title, body, data = {} } = await request.json()

    // Get mobile session with push token
    const { data: session } = await supabase
      .from("mobile_sessions")
      .select("*")
      .eq("id", mobileSessionId)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single()

    if (!session || !session.push_token) {
      return NextResponse.json({ error: "No active mobile session with push token" }, { status: 404 })
    }

    const fcmEndpoint = "https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send"
    const fcmServerKey = process.env.FCM_SERVER_KEY

    if (!fcmServerKey) {
      throw new Error("FCM_SERVER_KEY not configured")
    }

    const pushPayload = {
      message: {
        token: session.push_token,
        notification: {
          title,
          body,
        },
        data,
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
            },
          },
        },
        android: {
          priority: "high",
          notification: {
            sound: "default",
            channel_id: "ho_mfa_alerts",
          },
        },
      },
    }

    const pushResponse = await fetch(fcmEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${fcmServerKey}`,
      },
      body: JSON.stringify(pushPayload),
    })

    const pushResult = await pushResponse.json()
    const success = pushResponse.ok

    // Log push notification
    const { data: notification } = await supabase
      .from("push_notifications")
      .insert({
        mobile_session_id: mobileSessionId,
        notification_type: "alert",
        title,
        body,
        data,
        status: success ? "sent" : "failed",
        sent_at: success ? new Date().toISOString() : null,
      })
      .select()
      .single()

    return NextResponse.json({
      success,
      notificationId: notification?.id,
      messageId: pushResult.name,
      platform: session.platform,
    })
  } catch (error: any) {
    console.error("[v0] Push notification error:", error)
    return NextResponse.json({ error: error.message || "Failed to send push notification" }, { status: 500 })
  }
}
