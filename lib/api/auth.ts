import "server-only"

import type { User } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export type AuthProfile = {
  id: string
  username: string | null
  email?: string | null
  role: "admin" | "user" | string
  balance: number | null
}

export type AuthContext = {
  user: User
  profile: AuthProfile
}

export async function getAuthContext(): Promise<AuthContext | NextResponse> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, email, role, balance")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ success: false, error: "Profile not found" }, { status: 403 })
  }

  return { user, profile: profile as AuthProfile }
}

export async function requireAdmin(): Promise<AuthContext | NextResponse> {
  const context = await getAuthContext()

  if (context instanceof NextResponse) {
    return context
  }

  if (context.profile.role !== "admin") {
    return NextResponse.json({ success: false, error: "Admin only" }, { status: 403 })
  }

  return context
}

export function isAuthError(value: AuthContext | NextResponse): value is NextResponse {
  return value instanceof NextResponse
}
