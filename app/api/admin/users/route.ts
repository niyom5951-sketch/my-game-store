import { NextRequest, NextResponse } from "next/server"
import { isAuthError, requireAdmin } from "@/lib/api/auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PATCH(req: NextRequest) {
  const context = await requireAdmin()
  if (isAuthError(context)) return context

  const body = await req.json().catch(() => null)
  const userId = body?.user_id
  const action = body?.action

  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ success: false, error: "Invalid user" }, { status: 400 })
  }

  const supabase = createAdminClient()

  if (action === "update_balance") {
    const nextBalance = Number(body?.balance)
    if (!Number.isFinite(nextBalance) || nextBalance < 0) {
      return NextResponse.json({ success: false, error: "Invalid balance" }, { status: 400 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, balance")
      .eq("id", userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const currentBalance = Number(profile.balance || 0)
    const { error } = await supabase
      .from("profiles")
      .update({ balance: nextBalance })
      .eq("id", userId)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    await supabase.from("balance_transactions").insert({
      user_id: userId,
      type: nextBalance >= currentBalance ? "deposit" : "deduct",
      amount: nextBalance - currentBalance,
      ref_type: "admin_adjustment",
      note: `Admin ${context.profile.username || context.user.id} ແກ້ໄຂຍອດເງິນ`,
    })

    return NextResponse.json({ success: true })
  }

  if (action === "toggle_role") {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const nextRole = profile.role === "admin" ? "user" : "admin"
    const { error } = await supabase.from("profiles").update({ role: nextRole }).eq("id", userId)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, role: nextRole })
  }

  return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
}
