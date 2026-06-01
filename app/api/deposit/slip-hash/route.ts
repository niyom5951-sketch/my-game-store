import { NextRequest, NextResponse } from "next/server"
import { getAuthContext, isAuthError } from "@/lib/api/auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  const context = await getAuthContext()
  if (isAuthError(context)) return context

  const body = await req.json().catch(() => null)
  const hash = body?.hash

  if (!hash || typeof hash !== "string" || hash.length < 32) {
    return NextResponse.json({ success: false, error: "Invalid hash" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("deposit_orders")
    .select("id")
    .eq("slip_hash", hash)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, exists: Boolean(data) })
}
