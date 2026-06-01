import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

function normalizeUsername(value: string | null) {
  return value?.trim().toLowerCase() || ""
}

export async function GET(req: NextRequest) {
  const username = normalizeUsername(req.nextUrl.searchParams.get("username"))
  return checkUsername(username)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const username = normalizeUsername(body?.username)
  return checkUsername(username)
}

async function checkUsername(username: string) {
  if (!/^[a-z0-9_]{3,24}$/.test(username)) {
    return NextResponse.json({ available: false, error: "Invalid username" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ available: false, error: error.message }, { status: 400 })
  }

  return NextResponse.json({ available: !data })
}
