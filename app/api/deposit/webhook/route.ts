import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("Phajay Webhook Received:", body)

    const { transactionId, status, description } = body

    if (!transactionId || status !== "SUCCESS") {
      return NextResponse.json({ message: "Ignore or Invalid status" }, { status: 200 })
    }

    // แยกเลข Order Number ออกมาจาก description (เช่น OrderNo1 -> 1)
    const orderNumberStr = description ? description.replace("OrderNo", "") : null
    const orderNumber = orderNumberStr ? Number(orderNumberStr) : null

    if (!orderNumber || isNaN(orderNumber)) {
      return NextResponse.json({ error: "Invalid description/order_number" }, { status: 400 })
    }

    // 1. ตรวจสอบบินใน Supabase ด้วย order_number 🎯
    const { data: order, error: fetchErr } = await supabaseAdmin
      .from("deposit_orders")
      .select("*")
      .eq("order_number", orderNumber) // 🔥 ค้นหาด้วย order_number
      .single()

    if (fetchErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.status === "success") {
      return NextResponse.json({ success: true, message: "Already processed" })
    }

    // 2. 🔥 อัปเดตสถานะบินใน Supabase เป็น success
    const { error: updateErr } = await supabaseAdmin
      .from("deposit_orders")
      .update({ status: "success" })
      .eq("order_number", orderNumber) // 🔥 อัปเดตด้วย order_number

    if (updateErr) {
      console.error("Webhook Update Error:", updateErr)
      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
    }

    // 💡 (เพิ่มเติม) สามารถเขียนโค้ดเพื่อบวกพ้อยต์/บวกเงินให้ User ตรงนี้ได้เลย

    return NextResponse.json({ success: true, message: "Webhook processed successfully" }, { status: 200 })

  } catch (error: any) {
    console.error("Webhook Catch Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}