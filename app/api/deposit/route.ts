import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import axios from "axios"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
)

export async function POST(req: Request) {
  try {
    const { amount, userId } = await req.json()

    if (!amount || !userId) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 })
    }

    const parsedAmount = Number(amount)
    
    // 🔥 ປັບໃຫ້ຮອງຮັບ 1 ກີບຂຶ້ນໄປ
    if (isNaN(parsedAmount) || parsedAmount < 1) {
      return NextResponse.json({ error: "จำนวนเงินต้องมากกว่า 1 กีบ" }, { status: 400 })
    }

    // 🔥 ໃສ່ຄີຂອງທ່ານຕົງໆ ປ້ອງກັນ Next.js ເອີ້ນອ່ານຟາຍ .env ບໍ່ທັນ
    const PHAJAY_SECRET_KEY = "$2a$10$nbbZKnP8Pyrw954qHXJkF.LwGUOQDyU9NB/JYVpPbLZ4WUuH6JBmu"

    // 1. ບັນທຶກບິນລົງ Supabase
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("deposit_orders")
      .insert({
        user_id: userId,
        amount_requested: parsedAmount,
        status: "pending",
        method: "bank"
      })
      .select("id, order_number").single()

    if (orderErr || !order) {
      console.error("Supabase Insert Error:", orderErr)
      return NextResponse.json({ error: `Supabase ผิดพลาด: ${orderErr?.message}` }, { status: 500 })
    }

    // 2. 🚀 ຍິງຫາ Phajay API (ເວີຊັນ Production ຕົວຈິງ ຕາມທີ່ວິດີໂອບອກ)
    try {
      const phajayResponse = await axios({
        method: "post",
        url: "https://payment-gateway.phajay.co/v1/api/payment/generate-bcel-qr", // 🎯 ໃຊ້ URL ຕົວຈິງເພື່ອແກ້ ENOTFOUND
        data: {
          amount: parsedAmount,
          description: `OrderNo${order.order_number}` 
        },
        headers: {
          "Content-Type": "application/json",
          "secretKey": PHAJAY_SECRET_KEY
        }
      })

      const phajayData = phajayResponse.data

      // 3. ອັບເດດ transaction_id ທີ່ໄດ້ຈາກ Phajay ລົງ Supabase
      if (phajayData.transactionId) {
        await supabaseAdmin
          .from("deposit_orders")
          .update({ transaction_id: phajayData.transactionId })
          .eq("id", order.id)
      }

      // 4. ສົ່ງຄ່າ QR ແລະ order_number ກັບໄປຫາ Frontend 🎯
      return NextResponse.json({ 
        success: true, 
        qr_string: phajayData.qrCode, 
        order_number: order.order_number // 🔥 ສົ່ງຄ່ານີ້ໄປໃຫ້ page.tsx ເຮັດ Polling ເຊັກສະຖານະ
      })

    } catch (axiosError: any) {
      const errResponse = axiosError.response?.data
      console.error("Axios Phajay Error:", errResponse)
      return NextResponse.json({ 
        error: `Phajay ปฏิเสธ: ${errResponse?.message || JSON.stringify(errResponse) || axiosError.message}` 
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error("Catch Error:", error)
    return NextResponse.json({ error: `ระบบหลุด: ${error.message}` }, { status: 500 })
  }
}