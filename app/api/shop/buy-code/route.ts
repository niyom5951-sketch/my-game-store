import { NextRequest, NextResponse } from "next/server"
import { getAuthContext, isAuthError } from "@/lib/api/auth"
import { sendDiscord } from "@/lib/discord"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  const context = await getAuthContext()
  if (isAuthError(context)) return context

  const body = await req.json().catch(() => null)
  const productId = body?.product_id
  const qty = Math.min(Math.max(Number(body?.qty || 1), 1), 20)

  if (!productId || typeof productId !== "string") {
    return NextResponse.json({ success: false, error: "Invalid product" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const results = []

  for (let i = 0; i < qty; i++) {
    const { data, error } = await supabase.rpc("buy_game_code", {
      p_user_id: context.user.id,
      p_product_id: productId,
    })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    results.push(data)
  }

  await sendDiscord(
    `🔑 **ຊື້ລະຫັດ**\n👤 ${context.profile.username || context.user.id}\n📦 Product: ${productId} x${qty}`
  )

  return NextResponse.json({ success: true, data: results })
}
