"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function HistoryPage() {
  const router = useRouter()
  const [tab, setTab] = useState<"deposit" | "topup" | "code">("deposit")
  const [deposits, setDeposits] = useState<any[]>([])
  const [topups, setTopups] = useState<any[]>([])
  const [codes, setCodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState("")

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [dep, top, cod] = await Promise.all([
        supabase.from("deposit_orders").select("*")
          .eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("topup_orders").select("*, products(name, game_name)")
          .eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("code_orders").select("*, products(name, game_name), game_codes(code, acc_username, acc_password)")
          .eq("user_id", user.id).order("created_at", { ascending: false })
      ])

      setDeposits(dep.data || [])
      setTopups(top.data || [])
      setCodes(cod.data || [])
      setLoading(false)
    }
    load()
  }, [])

  function StatusBadge({ status }: { status: string }) {
    const map: any = {
      pending: { text: "ລໍຖ້າ", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
      success: { text: "ສຳເລັດ", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
      failed: { text: "ລົ້ມເຫຼວ", color: "bg-rose-500/10 text-rose-500" },
      cancelled: { text: "ຍົກເລີກ", color: "bg-gray-500/10 text-gray-500" },
      processing: { text: "ດຳເນີນການ", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    }
    const s = map[status] || { text: status, color: "bg-gray-500/10 text-gray-500" }
    return (
      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${s.color}`}>
        {s.text}
      </span>
    )
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleString("lo-LA", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    })
  }

  function MethodLabel({ method }: { method: string }) {
    const map: any = {
      bank: "ທະນາຄານ",
      phone_transfer: "ໂອນບັດໂທ",
      card: "เลกบັດ",
      code: "ໂຄ້ດລາງວັນ"
    }
    return <span>{map[method] || method}</span>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
      
      {/* Header ປ່ຽນເປັນສີຟ້າຄາມພຣີມ່ຽມ (ເຂົ້າກັບ Dark/Light ໄດ້ດີທີ່ສຸດ) */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-gray-900 dark:to-gray-800 px-4 py-6 text-white shadow-md transition-colors">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h1 className="font-black text-lg tracking-tight">ປະຫວັດການເຮັດລາຍການ</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 pb-28 space-y-4">
        
        {/* Tabs ເມນູປ່ຽນປະຫວັດ - ຄຸມໂທນສີຟ້າ */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-1.5 shadow-sm flex border border-gray-100 dark:border-gray-800 transition-colors">
          {[
            { key: "deposit", label: "💰 ເຕີມເງິນ" },
            { key: "topup", label: "🎮 ເຕີມເກມ" },
            { key: "code", label: "🔑 ຊື້ລະຫັດ" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                tab === t.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          /* ຕາຕະລາງ Table ຈັດສີໃຫ້ກົມກືນ (ຮູບທີ 3) */
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/40 text-gray-400 dark:text-gray-500 font-bold border-b border-gray-100 dark:border-gray-800">
                    <th className="p-3 text-center w-12">#</th>
                    <th className="p-3">ປະເພດ / ລາຍການ</th>
                    <th className="p-3 text-right">ຈຳນວນເງິນ</th>
                    <th className="p-3 text-center">ວັນທີເຮັດລາຍການ</th>
                    <th className="p-3 text-center">ສະຖານະ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                  
                  {/* 1. ຕາຕະລາງປະຫວັດເຕີມເງິນ */}
                  {tab === "deposit" && (
                    deposits.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-12 text-gray-400">ຍັງບໍ່ມີປະຫວັດການເຕີມເງິນ</td></tr>
                    ) : deposits.map((d, index) => (
                      <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                        <td className="p-3 text-center font-bold text-gray-400">{index + 1}</td>
                        <td className="p-3 font-semibold text-gray-900 dark:text-white"><MethodLabel method={d.method} /></td>
                        <td className="p-3 text-right font-black text-blue-600 dark:text-blue-400">
                          {d.amount_requested?.toLocaleString()} ກີບ
                          {d.fee_percent > 0 && <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">ໄດ້ຮັບ: {d.amount_received?.toLocaleString()} ກີບ</span>}
                        </td>
                        <td className="p-3 text-center text-gray-400 dark:text-gray-500">{formatDate(d.created_at)}</td>
                        <td className="p-3 text-center"><StatusBadge status={d.status} /></td>
                      </tr>
                    ))
                  )}

                  {/* 2. ຕﺎຕະລາງປະຫວັດເຕີມເກມ */}
                  {tab === "topup" && (
                    topups.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-12 text-gray-400">ຍັງບໍ່ມີປະຫວັດການເຕີມເກມ</td></tr>
                    ) : topups.map((t, index) => (
                      <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                        <td className="p-3 text-center font-bold text-gray-400">{index + 1}</td>
                        <td className="p-3 space-y-0.5">
                          <p className="font-bold text-gray-900 dark:text-white">{t.game_name}</p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500">{t.products?.name}</p>
                          {t.uid && <p className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">ID: {t.uid} {t.zone_id && `(${t.zone_id})`}</p>}
                        </td>
                        <td className="p-3 text-right font-black text-blue-600 dark:text-blue-400">{t.price?.toLocaleString()} ກີບ</td>
                        <td className="p-3 text-center text-gray-400 dark:text-gray-500">{formatDate(t.created_at)}</td>
                        <td className="p-3 text-center space-y-1">
                          <StatusBadge status={t.status} />
                          {t.status === "failed" && <span className="block text-[10px] text-emerald-600 dark:text-emerald-400">↩️ ຄືນເງິນແລ້ວ</span>}
                        </td>
                      </tr>
                    ))
                  )}

                  {/* 3. ຕﺎຕະລາງປະຫວັດຊື້ລະຫັດ */}
                  {tab === "code" && (
                    codes.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-12 text-gray-400">ຍັງບໍ່ມີປະຫວັດການຊື້ລະຫັດ</td></tr>
                    ) : codes.map((c, index) => (
                      <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                        <td className="p-3 text-center font-bold text-gray-400">{index + 1}</td>
                        <td className="p-3 space-y-1">
                          <p className="font-bold text-gray-900 dark:text-white">{c.products?.name}</p>
                          {c.game_codes?.code && (
                            <span className="inline-block bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded font-mono font-bold text-blue-600 dark:text-blue-400 border border-gray-200/40 dark:border-gray-700">Code: {c.game_codes.code}</span>
                          )}
                          {c.game_codes?.acc_username && (
                            <div className="text-[10px] bg-gray-100 dark:bg-gray-800 p-1.5 rounded font-mono space-y-0.5 text-gray-600 dark:text-gray-400 border border-gray-200/40 dark:border-gray-700">
                              <p><span className="text-gray-400">U:</span> {c.game_codes.acc_username}</p>
                              <p><span className="text-gray-400">P:</span> {c.game_codes.acc_password}</p>
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-right font-black text-blue-600 dark:text-blue-400">{c.price?.toLocaleString()} ກີບ</td>
                        <td className="p-3 text-center text-gray-400 dark:text-gray-500">{formatDate(c.created_at)}</td>
                        <td className="p-3 text-center"><StatusBadge status={c.status} /></td>
                      </tr>
                    ))
                  )}

                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav ໄອຄອນເສັ້ນກົງຕາມຮູບທີ 1 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex z-20 transition-colors duration-300">
        {[
          { href: "/shop", label: "ຫຼັກ", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", active: false },
          { href: "/history", label: "ປະຫວັດ", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", active: true },
          { href: "/deposit", label: "ເຕີມບ້ວມ", icon: "M12 4v16m8-8H4", active: false },
          { href: "/shop/topup", label: "ສິນค้า", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z", active: false },
          { href: "/profile", label: "ໂປຣໄຟລ໌", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z", active: false },
        ].map(item => (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
              item.active ? "text-blue-600 dark:text-blue-400 font-bold" : "text-gray-400 dark:text-gray-500"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            <span className="text-[11px]">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}