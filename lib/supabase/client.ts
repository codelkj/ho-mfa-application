import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jxjvpkybgvebknqicqnr.supabase.co"
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4anZwa3liZ3ZlYmtucWljcW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MzA1NzMsImV4cCI6MjA4MTAwNjU3M30.H1_FJTHR3AUOuOFcTBXEMgOAZJvR7I-W6fTiQ8YnmSQ"

  console.log("[v0] Creating Supabase client with URL:", supabaseUrl.substring(0, 30) + "...")

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
