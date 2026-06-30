import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ ຕ້ອງໃສ່ Service Role Key ບົນ EdgeOne ເດີເຈົ້າ
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("=== 📥 Phajay Webhook Received ===", body)

    const { status, description, transactionId } = body

    if (status === "success" && description) {
      // ຕັດຄຳວ່າ OrderNo ອອກເພື່ອເອົາຕົວເລກບິນ (order_number)
      const orderNumberStr = description.replace("OrderNo", "").trim()
      const orderNumber = parseInt(orderNumberStr)

      if (!isNaN(orderNumber)) {
        // 🔥 ອັບເດດສະຖານະໃນ Supabase ເປັນ success ທັນທີ
        const { error: updateError } = await supabaseAdmin
          .from("deposit_orders")
          .update({ 
            status: "success",
            transaction_id: transactionId || null
          })
          .eq("order_number", orderNumber)

        if (updateError) {
          console.error("Supabase Update Error:", updateError)
          return NextResponse.json({ error: "Update DB failed" }, { status: 500 })
        }

        console.log(`=== ✅ ບິນເລກທີ ${orderNumber} ອັບເດດເປັນ ສຳເລັດ ຮຽບຮ້ອຍແລ້ວ! ===`)
        return NextResponse.json({ success: true, message: "Webhook processed" })
      }
    }

    return NextResponse.json({ success: false, message: "Invalid status or description" })
  } catch (error: any) {
    console.error("Webhook Catch Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}