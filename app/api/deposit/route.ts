import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import axios from "axios"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
)

export async function POST(req: Request) {
  try {
    const { amount, userId, bankType } = await req.json() // 🎯 ຮັບຄ່າ bankType ມາ

    if (!amount || !userId) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 })
    }

    const parsedAmount = Number(amount)
    if (isNaN(parsedAmount) || parsedAmount < 100) {
      return NextResponse.json({ error: "จำนวนเงินต้องมากกว่า 100 กีบ" }, { status: 400 })
    }

    // ດຶງຄີ Phajay ຈາກ Environment ທີ່ຜູກບົນ EdgeOne
    const PHAJAY_SECRET_KEY = process.env.PHAJAY_SECRET_KEY || "$2a$10$nbbZKnP8Pyrw954qHXJkF.LwGUOQDyU9NB/JYVpPbLZ4WUuH6JBmu"

    // 1. ບັງຄັບບັນທຶກບິນລົງ Supabase ກ່ອນ
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("deposit_orders")
      .insert({
        user_id: userId,
        amount_requested: parsedAmount,
        status: "pending",
        method: bankType || "bank" // ເກັບປະເພດທະນາຄານລົງ DB
      })
      .select("id, order_number").single()

    if (orderErr || !order) {
      return NextResponse.json({ error: `Supabase ผิดพลาด: ${orderErr?.message}` }, { status: 500 })
    }

    // 🎯 2. ສະຫຼັບ URL ຕາມທะນາຄານທີ່ເລືອກ
    let phajayUrl = "https://payment-gateway.phajay.co/v1/api/payment/generate-bcel-qr" // ມາດຕະຖານ BCEL
    if (bankType === "ldb") {
      phajayUrl = "https://payment-gateway.phajay.co/v1/api/payment/generate-ldb-qr" // 🎯 ຖ້າເລືອກ LDB ໃຫ້ຍິງໄປ Endpoint ຂອງ LDB
    }

    try {
      const phajayResponse = await axios({
        method: "post",
        url: phajayUrl,
        data: {
          amount: parsedAmount,
          description: `OrderNo${order.order_number}` // ສົ່ງເລກບິນໄປນຳ ເພື່ອໃຫ້ Webhook ດຶງຄືນໄດ້ຖືກຕ້ອງ
        },
        headers: {
          "Content-Type": "application/json",
          "secretKey": PHAJAY_SECRET_KEY
        }
      })

      const phajayData = phajayResponse.data

      if (phajayData.transactionId) {
        await supabaseAdmin
          .from("deposit_orders")
          .update({ transaction_id: phajayData.transactionId })
          .eq("id", order.id)
      }

      return NextResponse.json({ 
        success: true, 
        qr_string: phajayData.qrCode || phajayData.qr_string, 
        order_number: order.order_number
      })

    } catch (axiosError: any) {
      return NextResponse.json({ error: `Phajay ปฏิเสธ: ${axiosError.response?.data?.message || axiosError.message}` }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: `ระบบหลุด: ${error.message}` }, { status: 500 })
  }
}