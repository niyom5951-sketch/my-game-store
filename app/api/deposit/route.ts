import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
)

const PHAJAY_MERCHANT_TOKEN = "$2a$10$nbbZKnP8Pyrw954qHXJKF.LwGUOQDyU9NB/JYVpPbLZ4WUuH6JBmu"

export async function POST(req: Request) {
  try {
    const { amount, userId } = await req.json()

    if (!amount || !userId) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 })
    }

    // ສ້າງ Order ໃຫ້ກົງກັບ Column ແທ້ໃນ Supabase ຂອງທ່ານ
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("deposit_orders")
      .insert({
        user_id: userId,
        amount: amount,          // ປ່ຽນໃຫ້ກົງກັບ Supabase ຂອງທ່ານ
        status: "pending",
        bank_name: "Phajay QR Auto",
        slip_url: null           // ລະບົບອັດຕະໂນມັດຈະບໍ່ມີການແນບສະລິບ
      })
      .select().single()

    if (orderErr || !order) {
      console.error("Supabase Error:", orderErr)
      return NextResponse.json({ error: "ບໍ່ສາມາດສ້າງບິນໃນລະບົບໄດ້" }, { status: 500 })
    }

    // ຍິງຂໍ QR Code ຈາກ Phajay
    const phajayResponse = await fetch("https://api.phajay.com/api/merchant/v1/payment/qrcode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PHAJAY_MERCHANT_TOKEN}`
      },
      body: JSON.stringify({
        amount: amount,
        order_id: order.id.toString(), // ປ່ຽນເປັນ String ປ້ອງກັນ Error
        description: `Topup Order #${order.id}`
      })
    })

    const phajayData = await phajayResponse.json()

    if (!phajayResponse.ok) {
      return NextResponse.json({ error: phajayData.message || "Phajay API ຕອບຮັບຜິດພາດ" }, { status: 500 })
    }

    // ອັບເດດ transaction_id ທີ່ໄດ້ຈາກ Phajay ກັບຄືນລົງບິນ
    await supabaseAdmin
      .from("deposit_orders")
      .update({ transaction_id: phajayData.transaction_id })
      .eq("id", order.id)

    return NextResponse.json({ 
      success: true, 
      qr_string: phajayData.qr_string, 
      order_id: order.id 
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}