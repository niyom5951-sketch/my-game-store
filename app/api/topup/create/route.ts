import { NextRequest, NextResponse } from "next/server"
import { getAuthContext, isAuthError } from "@/lib/api/auth"
import { sendDiscord } from "@/lib/discord"
import { createAdminClient } from "@/lib/supabase/admin"

type TopupBody = {
  product_id?: string
  uid?: string
  zone_id?: string
  username?: string
  password?: string
}

export async function POST(req: NextRequest) {
  const context = await getAuthContext()
  if (isAuthError(context)) return context

  const body = (await req.json().catch(() => null)) as TopupBody | null
  if (!body?.product_id) {
    return NextResponse.json({ success: false, error: "Invalid product" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, games_id, name, price, category, is_active")
    .eq("id", body.product_id)
    .single()

  if (productError || !product || product.category !== "topup" || !product.is_active) {
    return NextResponse.json({ success: false, error: "Product not available" }, { status: 404 })
  }

  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("id, name, input_type, is_active")
    .eq("id", product.games_id)
    .single()

  if (gameError || !game || !game.is_active) {
    return NextResponse.json({ success: false, error: "Game not available" }, { status: 404 })
  }

  const uid = body.uid?.trim() || ""
  const zoneId = body.zone_id?.trim() || ""
  const username = body.username?.trim() || ""
  const password = body.password?.trim() || ""

  if (game.input_type === "uid" && !uid) {
    return NextResponse.json({ success: false, error: "UID is required" }, { status: 400 })
  }
  if (game.input_type === "uid_zone" && (!uid || !zoneId)) {
    return NextResponse.json({ success: false, error: "UID and Zone ID are required" }, { status: 400 })
  }
  if (game.input_type === "username_password" && (!username || !password)) {
    return NextResponse.json({ success: false, error: "Username and password are required" }, { status: 400 })
  }
  if ((context.profile.balance ?? 0) < product.price) {
    return NextResponse.json({ success: false, error: "Insufficient balance" }, { status: 400 })
  }

  const { data: order, error: orderError } = await supabase
    .from("topup_orders")
    .insert({
      user_id: context.user.id,
      product_id: product.id,
      game_name: game.name,
      input_type: game.input_type,
      uid,
      zone_id: zoneId,
      username,
      password,
      price: product.price,
      status: "pending",
    })
    .select("id")
    .single()

  if (orderError || !order) {
    return NextResponse.json({ success: false, error: orderError?.message || "Create order failed" }, { status: 400 })
  }

  const { error: deductError } = await supabase.rpc("deduct_balance", {
    p_user_id: context.user.id,
    p_amount: product.price,
  })

  if (deductError) {
    await supabase.from("topup_orders").update({ status: "failed" }).eq("id", order.id)
    return NextResponse.json({ success: false, error: deductError.message }, { status: 400 })
  }

  await supabase.from("balance_transactions").insert({
    user_id: context.user.id,
    type: "purchase",
    amount: -product.price,
    ref_type: "topup_order",
    ref_id: order.id,
    note: `ເຕີມ ${game.name} - ${product.name}`,
  })

  await sendDiscord(
    `🎮 **ສັ່ງເຕີມເກມ**\n👤 ${context.profile.username || context.user.id}\n🎯 ${game.name} - ${product.name}\n💵 ${Number(product.price).toLocaleString()} ກີບ${uid ? `\n🆔 UID: ${uid}` : ""}${zoneId ? ` | Zone: ${zoneId}` : ""}`
  )

  return NextResponse.json({ success: true, order_id: order.id })
}
