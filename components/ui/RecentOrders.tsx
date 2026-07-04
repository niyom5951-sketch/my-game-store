"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

function formatTimeAgo(dateString: string) {
  if (!dateString) return "ເມື່ອບໍ່ດົນມານີ້"
  const now = new Date()
  const past = new Date(dateString)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "ເມື່ອບໍ່ດົນມານີ້"
  if (diffMins < 60) return `${diffMins} ນາທີກ่ອນ`
  if (diffHours < 24) return `${diffHours} ຊົ່ວໂມງກ່ອນ`
  return `${diffDays} ວັນກ່ອນ`
}

export default function RecentOrders() {
  const supabase = createClient()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentOrders() {
      try {
        // 🎯 ປ່ຽນມາ Query ຈາກ topup_orders ແລະ Join profiles ກັບ products ໃຫ້ຖືກຕ້ອງຕາມ DB ຈິງ
        const { data, error } = await supabase
          .from("topup_orders")
          .select(`
            id,
            created_at,
            price,
            status,
            game_name,
            profiles ( display_name ),
            products ( image_url )
          `)
          .order("created_at", { ascending: false })
          .limit(10)

        if (error) {
          console.error("Supabase Error:", error.message)
          return
        }

        if (data) setOrders(data)
      } catch (err) {
        console.error("Error fetching orders:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchRecentOrders()
  }, [])

  if (loading) return <div className="text-center py-6 text-sm text-slate-400">ກຳລັງໂຫຼດລາຍການສັ່ງຊື້...</div>
  if (orders.length === 0) return <div className="text-center py-6 text-sm text-slate-400">ບໍ່ມີລາຍການສັ່ງຊື້ໃນຂະນະນີ້</div>

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 text-white p-2 rounded-xl text-sm">🛒</div>
          <div>
            <h3 className="font-black text-slate-800 dark:text-white text-base">ລາຍການສັ່ງຊື້ລ່າສຸດ</h3>
            <p className="text-[11px] text-slate-400">ສິນຄ້າທົ່ວໄປ</p>
          </div>
        </div>
        <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse tracking-wider">LIVE</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {orders.map((order) => (
          <div key={order.id} className="flex-shrink-0 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-4 w-72">
            {/* 📸 ດຶງຮູບພາບຈາກ products ຖ້າມີ ຖ້າບໍ່ມີໃຫ້ໃຊ້ຮູບ Placeholder ແທນ */}
            <img 
              src={order.products?.image_url || "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=150&q=80"} 
              alt={order.game_name} 
              className="w-12 h-12 object-cover rounded-xl bg-slate-200"
            />
            <div className="flex-1 min-w-0">
              {/* 🎮 ສະແດງຊື່ເກມ (Mobile Legends / Free Fire) */}
              <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{order.game_name || "ເຕີມເກມ"}</h4>
              {/* 👤 ສະແດງຊື່ User ທີ່ດຶງມາຈາກ profiles */}
              <p className="text-xs text-slate-400 truncate">ທ່ານ: {order.profiles?.display_name || "ຜູ້ໃຊ້ທົ່ວໄປ"}</p>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-slate-400">⏱️ {formatTimeAgo(order.created_at)}</span>
                {/* 🟢 ສະແດງສະຖານະຕາມຈິງ */}
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                  order.status === "success" 
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" 
                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                }`}>
                  {order.status === "success" ? "ສຳເລັດ" : "ລໍຖ້າ"}
                </span>
              </div>
            </div>
            <div className="text-right">
              {/* 💰 ສະແດງລາຄາ */}
              <span className="font-black text-blue-600 dark:text-blue-400 text-sm">{(order.price || 0).toLocaleString()} ₭</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}