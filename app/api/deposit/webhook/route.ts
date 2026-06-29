import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// ສ້າງ Supabase Admin Client ເພື່ອໃຫ້ມີສິດແກ້ໄຂຍອດເງິນ User ຫຼັງບ້ាន
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ຕ້ອງໃຊ້ Service Role Key ເດີ້
)

export async function POST(req: Request) {
  try {
    // 1. ຮັບຂໍ້ມູນທີ່ Phajay Gateway ຍິງກົງກັບມາຫາເວັບເຮົາ
    const body = await req.json()
    
    // ດຶງຂໍ້ມູນສຳຄັນອອກມາ (ອ້າງອີງຕາມຮູບແບບທົ່ວໄປຂອງ Phajay Callback)
    const { order_id, status, amount, transaction_id } = body

    // ກວດສອບຄວາມຖືກຕ້ອງຂອງຂໍ້ມູນກ່ອນ
    if (!order_id || status !== "success") {
      return NextResponse.json({ message: "Ignore or invalid status" }, { status: 200 })
    }

    // 2. ກວດເຊັກບິນໃນຕາຕະລາງ deposit_orders ວ່າຖືກຕ້ອງ ແລະ ຍັງເປັນ pending ຢູ່ບໍ່
    const { data: order, error: findErr } = await supabaseAdmin
      .from("deposit_orders")
      .select("*")
      .eq("id", order_id)
      .single()

    if (findErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // 🛡️ ປ້ອງກັນການຍິງ Webhook ຊ້ຳ (ຖ້າບິນເປັນ success ໄປແລ້ວ ໃຫ້ຂ້າມເລີຍ)
    if (order.status === "success") {
      return NextResponse.json({ message: "Order already processed" }, { status: 200 })
    }

    // 3. ເລີ່ມຂະບວນການອັບເດດສະຖານະ ແລະ ບວກຍອດເງິນ (Database Transaction)
    // ອັບເດດສະຖານະບິນເຕີມເງິນໃຫ້ເປັນ success
    const { error: updateOrderErr } = await supabaseAdmin
      .from("deposit_orders")
      .update({ 
        status: "success",
        amount_received: amount,
        updated_at: new Date().toISOString()
      })
      .eq("id", order_id)

    if (updateOrderErr) {
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    // 4. 🔥 ບວກຍອດເງິນ (Balance) ໃຫ້ກັບ User ຄົນນັ້ນ
    // ໝາຍເຫດ: ໃຫ້ປ່ຽນຊື່ຕາຕະລາງ (profiles/users) ແລະ ຊື່ column (balance) ໃຫ້ຕົງກັບຂອງເວັບທ່ານເດີ້
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles") 
      .select("balance")
      .eq("id", order.user_id)
      .single()

    if (profileErr || !profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // ຄຳນວນຍອດເງິນໃໝ່
    const newBalance = (profile.balance || 0) + Number(amount)

    // ອັບເດດຍອດເງິນໃໝ່ລົງ Database
    const { error: updateBalanceErr } = await supabaseAdmin
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", order.user_id)

    if (updateBalanceErr) {
      return NextResponse.json({ error: "Failed to update user balance" }, { status: 500 })
    }

    // 5. ຍິງແຈ້ງເຕືອນເຂົ້າ Discord (Option) ໃຫ້ເຈົ້າຂອງຮ້ານຮູ້
    await fetch(process.env.DISCORD_WEBHOOK_URL || "", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `✅ **ເຕີມເງິນອັດຕະໂນມັດສຳເລັດ!**\n🆔 ບິນ: \`${order_id}\`\n👤 User ID: \`${order.user_id}\`\n💰 ຈຳນວນ: \`${Number(amount).toLocaleString()}\` ກີບ\n🏦 ຜ່ານລະບົບ: Phajay Auto`
      })
    }).catch(() => null)

    // ຕອບກັບ Phajay ວ່າເວັບເຮົາໄດ້ຮັບຂໍ້ມູນ ແລະ ຈັດການຮຽບຮ້ອຍແລ້ວ
    return NextResponse.json({ success: true, message: "Payment processed successfully" }, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}