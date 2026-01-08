/**
 * FIDO2/WebAuthn Implementation
 * Provides hardware security key support for HO-MFA
 */

import { createClient } from "@/lib/supabase/client"

export interface FIDO2RegistrationOptions {
  challenge: string
  rp: {
    name: string
    id: string
  }
  user: {
    id: string
    name: string
    displayName: string
  }
  pubKeyCredParams: Array<{
    type: string
    alg: number
  }>
  timeout: number
  attestation: string
  authenticatorSelection: {
    authenticatorAttachment?: string
    requireResidentKey: boolean
    userVerification: string
  }
}

export interface FIDO2Credential {
  id: string
  rawId: ArrayBuffer
  response: {
    clientDataJSON: ArrayBuffer
    attestationObject: ArrayBuffer
  }
  type: string
}

/**
 * Generate registration options for FIDO2 enrollment
 */
export async function generateRegistrationOptions(
  userId: string,
  userEmail: string,
  userName: string,
): Promise<FIDO2RegistrationOptions> {
  // Generate cryptographic challenge
  const challenge = new Uint8Array(32)
  crypto.getRandomValues(challenge)

  return {
    challenge: bufferToBase64(challenge),
    rp: {
      name: "HO-MFA Healthcare",
      id: window.location.hostname,
    },
    user: {
      id: userId,
      name: userEmail,
      displayName: userName,
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 }, // ES256
      { type: "public-key", alg: -257 }, // RS256
    ],
    timeout: 60000,
    attestation: "direct",
    authenticatorSelection: {
      authenticatorAttachment: "cross-platform", // Allow security keys
      requireResidentKey: false,
      userVerification: "preferred",
    },
  }
}

/**
 * Register a FIDO2 credential
 */
export async function registerFIDO2Credential(
  userId: string,
  userEmail: string,
  userName: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    // Check browser support
    if (!window.PublicKeyCredential) {
      return { success: false, error: "WebAuthn not supported in this browser" }
    }

    // Generate registration options
    const options = await generateRegistrationOptions(userId, userEmail, userName)

    // Convert options for WebAuthn API
    const publicKeyOptions: PublicKeyCredentialCreationOptions = {
      challenge: base64ToBuffer(options.challenge),
      rp: options.rp,
      user: {
        id: stringToBuffer(options.user.id),
        name: options.user.name,
        displayName: options.user.displayName,
      },
      pubKeyCredParams: options.pubKeyCredParams.map((param) => ({
        type: param.type as PublicKeyCredentialType,
        alg: param.alg,
      })),
      timeout: options.timeout,
      attestation: options.attestation as AttestationConveyancePreference,
      authenticatorSelection: options.authenticatorSelection as AuthenticatorSelectionCriteria,
    }

    // Invoke WebAuthn API
    const credential = (await navigator.credentials.create({
      publicKey: publicKeyOptions,
    })) as PublicKeyCredential

    if (!credential) {
      return { success: false, error: "Credential creation failed" }
    }

    // Extract credential data
    const response = credential.response as AuthenticatorAttestationResponse
    const credentialId = bufferToBase64(credential.rawId)
    const publicKey = bufferToBase64(response.getPublicKey()!)

    // Save to database
    const { error } = await supabase.from("fido2_credentials").insert({
      user_id: userId,
      credential_id: credentialId,
      public_key: publicKey,
      device_type: "security_key",
      device_name: "Security Key",
      transports: ["usb", "nfc", "ble"],
    })

    if (error) {
      console.error("[v0] FIDO2 registration error:", error)
      return { success: false, error: error.message }
    }

    // Log enrollment event
    await supabase.rpc("log_auth_event", {
      p_user_id: userId,
      p_event_type: "biometric_enroll",
      p_auth_method: "fido2",
      p_metadata: { credential_id: credentialId, device_type: "security_key" },
    })

    return { success: true }
  } catch (error) {
    console.error("[v0] FIDO2 registration error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed",
    }
  }
}

/**
 * Verify FIDO2 credential during authentication
 */
export async function verifyFIDO2Credential(userId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    // Get user's credentials
    const { data: credentials, error: fetchError } = await supabase
      .from("fido2_credentials")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)

    if (fetchError || !credentials || credentials.length === 0) {
      return { success: false, error: "No registered credentials found" }
    }

    // Generate authentication challenge
    const challenge = new Uint8Array(32)
    crypto.getRandomValues(challenge)

    // Prepare authentication options
    const publicKeyOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      timeout: 60000,
      rpId: window.location.hostname,
      allowCredentials: credentials.map((cred) => ({
        id: base64ToBuffer(cred.credential_id),
        type: "public-key" as PublicKeyCredentialType,
        transports: (cred.transports || ["usb"]) as AuthenticatorTransport[],
      })),
      userVerification: "preferred",
    }

    // Invoke WebAuthn API
    const assertion = (await navigator.credentials.get({
      publicKey: publicKeyOptions,
    })) as PublicKeyCredential

    if (!assertion) {
      return { success: false, error: "Authentication failed" }
    }

    // Update last_used_at
    await supabase
      .from("fido2_credentials")
      .update({ last_used_at: new Date().toISOString() })
      .eq("credential_id", bufferToBase64(assertion.rawId))

    // Log successful verification
    await supabase.rpc("log_auth_event", {
      p_user_id: userId,
      p_event_type: "biometric_verify_success",
      p_auth_method: "fido2",
      p_metadata: { credential_id: bufferToBase64(assertion.rawId) },
    })

    return { success: true }
  } catch (error) {
    console.error("[v0] FIDO2 verification error:", error)

    // Log failed verification
    await supabase.rpc("log_auth_event", {
      p_user_id: userId,
      p_event_type: "biometric_verify_failure",
      p_auth_method: "fido2",
      p_metadata: { error: error instanceof Error ? error.message : "Unknown error" },
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : "Verification failed",
    }
  }
}

// Helper functions
function bufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

function stringToBuffer(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer
}
