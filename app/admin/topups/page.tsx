"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function AdminTopupsPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"pending" | "success" | "failed">("pending")

  async function load() {
    const supabase = createClient()
    const { data } = await supabase
      .from("topup_orders")
      .select("*, profiles(username), products(name)")
      .eq("status", tab)
      .order("created_at", { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [tab])

  async function handleSuccess(id: string) {
    await fetch("/api/topup/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: id, status: "success" })
    })
    load()
  }

  async function handleFailed(id: string) {
    await fetch("/api/topup/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: id })
    })
    load()
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleString("lo-LA", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ຈັດການເຕີມເກມ</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: "pending", label: "ລໍຖ້າ", color: "bg-yellow-500" },
          { key: "success", label: "ສຳເລັດ", color: "bg-green-500" },
          { key: "failed", label: "ລົ້ມເຫຼວ/ຄືນເງິນ", color: "bg-red-500" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              tab === t.key ? `${t.color} text-white` : "bg-white text-gray-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400">
          ບໍ່ມີລາຍການ
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{o.profiles?.username}</p>
                  <p className="text-sm text-gray-400">{o.game_name}</p>
                </div>
                <p className="font-bold text-blue-600">
                  {o.price?.toLocaleString()} ກີບ
                </p>
              </div>

              {/* ລາຍລະອຽດ */}
              <div className="bg-gray-50 rounded-xl p-3 space-y-1 text-sm">
                <p><span className="text-gray-400">ສິນຄ້າ:</span> {o.products?.name}</p>
                {o.uid && <p><span className="text-gray-400">UID:</span> <span className="font-mono font-bold">{o.uid}</span></p>}
                {o.zone_id && <p><span className="text-gray-400">Zone ID:</span> <span className="font-mono font-bold">{o.zone_id}</span></p>}
                {o.username && <p><span className="text-gray-400">Username:</span> <span className="font-mono font-bold">{o.username}</span></p>}
                {o.password && <p><span className="text-gray-400">Password:</span> <span className="font-mono font-bold">{o.password}</span></p>}
              </div>

              <p className="text-xs text-gray-400">{formatDate(o.created_at)}</p>

              {tab === "pending" && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleFailed(o.id)}
                    className="py-2 rounded-xl bg-red-50 text-red-500 font-bold border border-red-200"
                  >
                    ❌ ລົ້ມເຫຼວ + ຄືນເງິນ
                  </button>
                  <button
                    onClick={() => handleSuccess(o.id)}
                    className="py-2 rounded-xl bg-green-500 text-white font-bold"
                  >
                    ✅ ສຳເລັດ
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
