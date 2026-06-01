import { NextRequest, NextResponse } from "next/server"
import { isAuthError, requireAdmin } from "@/lib/api/auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  const context = await requireAdmin()
  if (isAuthError(context)) return context

  const body = await req.json().catch(() => null)
  const orderId = body?.order_id

  if (!orderId || typeof orderId !== "string") {
    return NextResponse.json({ success: false, error: "Invalid order" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("refund_topup", { p_order_id: orderId })

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, data })
}
