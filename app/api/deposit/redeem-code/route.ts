import { NextRequest, NextResponse } from "next/server"
import { getAuthContext, isAuthError } from "@/lib/api/auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  const context = await getAuthContext()
  if (isAuthError(context)) return context

  const body = await req.json().catch(() => null)
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : ""

  if (!code) {
    return NextResponse.json({ success: false, error: "Code is required" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: promo, error: promoError } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", code)
    .eq("is_active", true)
    .single()

  if (promoError || !promo) {
    return NextResponse.json({ success: false, error: "Invalid or used code" }, { status: 404 })
  }
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return NextResponse.json({ success: false, error: "Code expired" }, { status: 400 })
  }
  if (promo.used_count >= promo.max_uses) {
    return NextResponse.json({ success: false, error: "Code usage limit reached" }, { status: 400 })
  }

  const { data: used } = await supabase
    .from("promo_code_usages")
    .select("id")
    .eq("promo_code_id", promo.id)
    .eq("user_id", context.user.id)
    .maybeSingle()

  if (used) {
    return NextResponse.json({ success: false, error: "You already used this code" }, { status: 400 })
  }

  const { data: order, error: orderError } = await supabase
    .from("deposit_orders")
    .insert({
      user_id: context.user.id,
      method: "code",
      amount_requested: promo.value,
      amount_received: promo.value,
      fee_percent: 0,
      promo_code: code,
      status: "pending",
    })
    .select("id")
    .single()

  if (orderError || !order) {
    return NextResponse.json({ success: false, error: orderError?.message || "Create deposit failed" }, { status: 400 })
  }

  const { error: usageError } = await supabase.from("promo_code_usages").insert({
    promo_code_id: promo.id,
    user_id: context.user.id,
    deposit_order_id: order.id,
  })

  if (usageError) {
    await supabase.from("deposit_orders").update({ status: "failed" }).eq("id", order.id)
    return NextResponse.json({ success: false, error: usageError.message }, { status: 400 })
  }

  await supabase
    .from("promo_codes")
    .update({ used_count: promo.used_count + 1 })
    .eq("id", promo.id)

  const { error: approveError } = await supabase.rpc("approve_deposit", { p_order_id: order.id })

  if (approveError) {
    return NextResponse.json({ success: false, error: approveError.message }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    promo: {
      code: promo.code,
      value: promo.value,
    },
  })
}
