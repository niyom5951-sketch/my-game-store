"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function AdminDepositsPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"pending" | "success" | "failed">("pending")

  async function load() {
    const supabase = createClient()
    const { data } = await supabase
      .from("deposit_orders")
      .select("*, profiles(username)")
      .eq("status", tab)
      .order("created_at", { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [tab])

  async function handleApprove(id: string) {
    await fetch("/api/deposit/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: id, action: "approve" })
    })
    load()
  }

  async function handleReject(id: string) {
    await fetch("/api/deposit/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: id, action: "reject" })
    })
    load()
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleString("lo-LA", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    })
  }

  function MethodLabel({ method }: { method: string }) {
    const map: any = {
      bank: "🏦 ທະນາຄານ",
      phone_transfer: "📱 ບັດໂທ",
      card: "💳 ເລກບັດ",
      code: "🎟️ ໂຄ້ດ"
    }
    return <span>{map[method] || method}</span>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ຈັດການເຕີມເງິນ</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: "pending", label: "ລໍຖ້າ", color: "bg-yellow-500" },
          { key: "success", label: "ສຳເລັດ", color: "bg-green-500" },
          { key: "failed", label: "ລົ້ມເຫຼວ", color: "bg-red-500" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              tab === t.key
                ? `${t.color} text-white`
                : "bg-white text-gray-500"
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
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{o.profiles?.username}</p>
                  <p className="text-sm text-gray-400">
                    <MethodLabel method={o.method} />
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">
                    {o.amount_requested?.toLocaleString()} ກີບ
                  </p>
                  {o.fee_percent > 0 && (
                    <p className="text-xs text-green-600">
                      ໄດ້ຮັບ: {o.amount_received?.toLocaleString()} ກີບ
                    </p>
                  )}
                </div>
              </div>

              {/* ລາຍລະອຽດ */}
              {o.phone_number && (
                <div className="bg-gray-50 rounded-xl p-3 text-sm">
                  <p><span className="text-gray-400">ເບີໂທ:</span> {o.phone_number}</p>
                </div>
              )}
              {o.card_number && (
                <div className="bg-gray-50 rounded-xl p-3 text-sm">
                  <p><span className="text-gray-400">ເລກບັດ:</span> {o.card_number}</p>
                  {o.admin_note && <p><span className="text-gray-400">ປະເພດ:</span> {o.admin_note}</p>}
                </div>
              )}
              {o.slip_url && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">ສະລິບ:</p>
                  <img
                    src={o.slip_url}
                    alt="slip"
                    className="w-full max-h-48 object-contain rounded-xl border cursor-pointer"
                    onClick={() => window.open(o.slip_url, "_blank")}
                  />
                </div>
              )}

              <p className="text-xs text-gray-400">{formatDate(o.created_at)}</p>

              {/* ປຸ່ມ Approve/Reject */}
              {tab === "pending" && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleReject(o.id)}
                    className="py-2 rounded-xl bg-red-50 text-red-500 font-bold border border-red-200"
                  >
                    ❌ ປະຕິເສດ
                  </button>
                  <button
                    onClick={() => handleApprove(o.id)}
                    className="py-2 rounded-xl bg-green-500 text-white font-bold"
                  >
                    ✅ ອະນຸມັດ
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
