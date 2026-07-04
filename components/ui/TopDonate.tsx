"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function TopDonate() {
  const supabase = createClient()
  const [topDonators, setTopDonators] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTopDonate() {
      try {
        const { data } = await supabase
          .from("deposit_orders")
          .select(`
            amount_requested,
            profiles ( display_name )
          `)
          .eq("status", "success")

        if (data) {
          const userTotals: { [key: string]: number } = {}
          data.forEach((item: any) => {
            const name = item.profiles?.display_name || "ຜູ້ໃຊ້ທົ່ວໄປ"
            userTotals[name] = (userTotals[name] || 0) + item.amount_requested
          })

          const sorted = Object.keys(userTotals)
            .map(name => ({ name, total: userTotals[name] }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 3)

          setTopDonators(sorted)
        }
      } catch (err) {
        console.error("Error fetching top donate:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchTopDonate()
  }, [])

  if (loading) return <div className="text-center py-6 text-sm text-slate-400">ກຳລັງໂຫຼດອັນດັບ...</div>

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-amber-500 text-white p-2 rounded-xl text-sm">👑</div>
        <div>
          <h3 className="font-black text-slate-800 dark:text-white text-base">TOP DONATE</h3>
          <p className="text-[11px] text-slate-400">ອັນດັບເຕີມเງິນສູງສຸດ</p>
        </div>
      </div>

      <div className="grid grid-cols-3 items-end max-w-sm mx-auto gap-2 pt-8">
        {/* 🥈 ອັນດັບ 2 (Silver) */}
        <div className="text-center space-y-1">
          <div className="relative inline-block">
            <div className="w-12 h-12 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center text-sm font-black text-slate-700 dark:text-slate-200 border-2 border-white shadow mx-auto">
              {topDonators[1]?.name?.charAt(0) || "2"}
            </div>
            <span className="absolute -bottom-1 -right-1 bg-slate-400 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">2</span>
          </div>
          <div className="text-[11px] font-black text-slate-700 dark:text-slate-300 truncate">{topDonators[1]?.name || "-"}</div>
          <div className="text-[10px] font-bold text-slate-500">{topDonators[1]?.total ? `${topDonators[1].total.toLocaleString()} ₭` : "-"}</div>
          <div className="bg-gradient-to-t from-slate-100 to-slate-50 dark:from-slate-800/60 dark:to-slate-800/20 h-16 rounded-t-xl flex items-center justify-center text-[9px] font-black text-slate-400">SILVER</div>
        </div>

        {/* 🥇 ອັນດັບ 1 (Champion) */}
        <div className="text-center space-y-1 z-10 scale-105">
          <div className="relative inline-block">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-yellow-500 text-base animate-bounce">👑</div>
            <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-lg font-black text-white border-2 border-white shadow-md mx-auto">
              {topDonators[0]?.name?.charAt(0) || "1"}
            </div>
            <span className="absolute -bottom-1 -right-1 bg-amber-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">1</span>
          </div>
          <div className="text-xs font-black text-slate-800 dark:text-white truncate">{topDonators[0]?.name || "-"}</div>
          <div className="text-xs font-black text-amber-600">{topDonators[0]?.total ? `${topDonators[0].total.toLocaleString()} ₭` : "-"}</div>
          <div className="bg-blue-500 h-24 rounded-t-xl flex items-center justify-center text-[9px] font-black text-white shadow">CHAMPION</div>
        </div>

        {/* 🥉 ອັນດັບ 3 (Bronze) */}
        <div className="text-center space-y-1">
          <div className="relative inline-block">
            <div className="w-12 h-12 bg-amber-700/80 rounded-full flex items-center justify-center text-sm font-black text-white border-2 border-white shadow mx-auto">
              {topDonators[2]?.name?.charAt(0) || "3"}
            </div>
            <span className="absolute -bottom-1 -right-1 bg-amber-800 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">3</span>
          </div>
          <div className="text-[11px] font-black text-slate-700 dark:text-slate-300 truncate">{topDonators[2]?.name || "-"}</div>
          <div className="text-[10px] font-bold text-slate-500">{topDonators[2]?.total ? `${topDonators[2].total.toLocaleString()} ₭` : "-"}</div>
          <div className="bg-gradient-to-t from-amber-900/10 to-amber-900/5 dark:from-slate-800/40 dark:to-slate-800/10 h-12 rounded-t-xl flex items-center justify-center text-[9px] font-black text-amber-800/60">BRONZE</div>
        </div>
      </div>
    </div>
  )
}