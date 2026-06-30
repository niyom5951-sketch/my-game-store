import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// ສ້າງ Supabase Admin ໂດຍດຶງຄ່າຈາກ Environment Variables ບົນ EdgeOne
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    // 1. ຮັບຂໍ້ມູນທີ່ Phajay ຍິງ Webhook ກັບມາບອກ
    const body = await req.json()
    console.log("Phajay Webhook Received:", body)

    // 2. ດຶງຂໍ້ມູນສຳຄັນອອກມາ (ກວດສອບວ່າ Phajay ສົ່ງສະຖານະ success ມາ ຫຼື ບໍ່)
    const { status, description, transactionId } = body

    if (status === "success" && description) {
      // 💡 ປົກກະຕິ description ເຮົາສົ່ງໄປເປັນຮູບແບບ "OrderNo100001"
      // ເຮົາຕ້ອງຕັດຄຳວ່າ "OrderNo" ອອກ ເພື່ອໃຫ້ເຫຼືອແຕ່ຕົວເລກ 100001 ໄປຄົ້ນຫາໃນ Database
      const orderNumberStr = description.replace("OrderNo", "").trim()
      const orderNumber = parseInt(orderNumberStr)

      if (!isNaN(orderNumber)) {
        // 3. 🔥 ອັບເດດສະຖານະບິນໃນ Supabase ຈາກ pending ໃຫ້ເປັນ success ໂດຍໃຊ້ order_number
        const { error: updateError } = await supabaseAdmin
          .from("deposit_orders")
          .update({ 
            status: "success",
            transaction_id: transactionId || null
          })
          .eq("order_number", orderNumber) // 🎯 ຄົ້ນຫາດ້ວຍ order_number ໃຫ້ກົງກັບ Frontend

        if (updateError) {
          console.error("Webhook Update Supabase Error:", updateError)
          return NextResponse.json({ error: "Update database failed" }, { status: 500 })
        }

        console.log(`Order ${orderNumber} updated to success successfully!`)
        return NextResponse.json({ success: true, message: "Webhook processed successfully" })
      }
    }

    return NextResponse.json({ success: false, message: "Condition not met or status not success" })

  } catch (error: any) {
    console.error("Webhook Catch Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}