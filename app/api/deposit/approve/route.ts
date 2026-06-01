import { NextRequest, NextResponse } from "next/server"
import { isAuthError, requireAdmin } from "@/lib/api/auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  const context = await requireAdmin()
  if (isAuthError(context)) return context

  const body = await req.json().catch(() => null)
  const orderId = body?.order_id
  const action = body?.action || "approve"

  if (!orderId || typeof orderId !== "string") {
    return NextResponse.json({ success: false, error: "Invalid order" }, { status: 400 })
  }

  const supabase = createAdminClient()

  if (action === "reject") {
    const { error } = await supabase
      .from("deposit_orders")
      .update({ status: "failed" })
      .eq("id", orderId)
      .eq("status", "pending")

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  }

  const { data, error } = await supabase.rpc("approve_deposit", { p_order_id: orderId })

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, data })
}
