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
  
  // ຕົວປ່ຽນສຳລັບເກັບຂໍ້ມູນລາຍການທີ່ຖືກເລືອກເພື່ອສະແດງໃນ Popup (Modal)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // ດຶງຂໍ້ມູນ ແລະ ຮຽງລໍາດັບຈາກຫຼ້າສຸດຢູ່ເທິງສຸດ (created_at desc)
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
      pending: { text: "ລໍຖ້າ", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" },
      success: { text: "ສຳເລັດ", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" },
      failed: { text: "ລົ້ມເຫຼວ", color: "bg-rose-500/10 text-rose-500 border border-rose-500/20" },
      cancelled: { text: "ຍົກເລີກ", color: "bg-gray-500/10 text-gray-500 border border-gray-500/20" },
      processing: { text: "ດຳເນີນການ", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" },
    }
    const s = map[status] || { text: status, color: "bg-gray-500/10 text-gray-500" }
    return (
      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${s.color}`}>
        {s.text}
      </span>
    )
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleString("lo-LA", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit"
    })
  }

  function MethodLabel({ method }: { method: string }) {
    const map: any = {
      bank: "ໂອນຜ່ານທະນາຄານ",
      phone_transfer: "ໂອນບັດໂທລະສັບ",
      card: "ເລກບັດ",
      code: "ໂຄ້ດລາງວັນ"
    }
    return <span>{map[method] || method}</span>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white pb-24 transition-colors duration-300">
      
      {/* Header ແບບລຽບຫູລຽບຕາ */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-gray-900 dark:to-gray-800 px-4 py-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:16px_16px]"></div>
        <div className="max-w-xl mx-auto flex items-center gap-3 relative z-10">
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight">ປະຫວັດທຸລະກຳ</h1>
            <p className="text-xs text-blue-100/80 mt-0.5">ຕິດຕາມ ແລະ ກວດສອບລາຍການທັງໝົດຂອງທ່ານ</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-5 mt-2">
        
        {/* Tabs ເມນູປ່ຽນປະຫວັດ */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-1.5 shadow-md flex border border-gray-100 dark:border-gray-800/60">
          {[
            { key: "deposit", label: "ເຕີມເງິນ" },
            { key: "topup", label: "ເຕີມເກມ" },
            { key: "code", label: "ຊື້ລະຫັດ" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`flex-1 py-3 text-xs font-black rounded-xl transition-all duration-300 ${
                tab === t.key
                  ? "bg-blue-600 text-white shadow-md scale-[1.02]"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ສະຖານະໂຫຼດຂໍ້ມູນ */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-24 space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-400 font-medium">ກຳລັງດຶງຂໍ້ມູນປະຫວັດ...</p>
          </div>
        ) : (
          <div className="space-y-3">
            
            {/* 1. ປະຫວັດເຕີມເງິນ */}
            {tab === "deposit" && (
              deposits.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-400 text-xs">ຍັງບໍ່ມີປະຫວັດການເຕີມເງິນ</div>
              ) : deposits.map((d) => (
                <div key={d.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800/60 flex items-center justify-between hover:shadow-md transition-all duration-200">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-gray-900 dark:text-white"><MethodLabel method={d.method} /></div>
                    <div className="text-[11px] text-gray-400 font-medium">{formatDate(d.created_at)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-black text-blue-600 dark:text-blue-400">+{d.amount_requested?.toLocaleString()} ກີບ</div>
                      <div className="text-[10px] text-gray-400"><StatusBadge status={d.status} /></div>
                    </div>
                    <button onClick={() => setSelectedItem({ ...d, type: "deposit" })} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950 text-gray-400 hover:text-blue-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* 2. ປະຫວັດເຕີມເກມ */}
            {tab === "topup" && (
              topups.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-400 text-xs">ຍັງບໍ່ມີປະຫວັດການເຕີມເກມ</div>
              ) : topups.map((t) => (
                <div key={t.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800/60 flex items-center justify-between hover:shadow-md transition-all duration-200">
                  <div className="space-y-1">
                    <div className="text-xs font-black text-gray-900 dark:text-white">{t.game_name}</div>
                    <div className="text-[11px] text-gray-400 font-bold">{t.products?.name}</div>
                    <div className="text-[11px] text-gray-400 font-medium">{formatDate(t.created_at)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-black text-gray-900 dark:text-white">{t.price?.toLocaleString()} ກີບ</div>
                      <div className="text-[10px] text-gray-400"><StatusBadge status={t.status} /></div>
                    </div>
                    <button onClick={() => setSelectedItem({ ...t, type: "topup" })} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950 text-gray-400 hover:text-blue-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* 3. ປະຫວັດຊື້ລະຫັດ */}
            {tab === "code" && (
              codes.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-400 text-xs">ຍັງບໍ່ມີປະຫວັດການຊື້ລະຫັດ</div>
              ) : codes.map((c) => (
                <div key={c.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800/60 flex items-center justify-between hover:shadow-md transition-all duration-200">
                  <div className="space-y-1">
                    <div className="text-xs font-black text-gray-900 dark:text-white">{c.products?.name}</div>
                    <div className="text-[11px] text-gray-400 font-medium">{formatDate(c.created_at)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-black text-gray-900 dark:text-white">{c.price?.toLocaleString()} ກີບ</div>
                      <div className="text-[10px] text-gray-400"><StatusBadge status={c.status} /></div>
                    </div>
                    <button onClick={() => setSelectedItem({ ...c, type: "code" })} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950 text-gray-400 hover:text-blue-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                    </button>
                  </div>
                </div>
              ))
            )}

          </div>
        )}
      </div>

      {/* ==================== POPUP MODAL (ລາຍລະອຽດກາງຈໍ) ==================== */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedItem(null)}></div>
          
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 relative z-10 scale-in overflow-hidden">
            
            <div className="text-center pb-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-black text-base text-gray-900 dark:text-white">ລາຍລະອຽດທຸລະກຳ</h3>
              <p className="text-[10px] font-mono text-gray-400 mt-1">ID: {selectedItem.id}</p>
            </div>

            <div className="py-5 space-y-4 text-xs">
              
              {/* ລາຍລະອຽດເຕີມເງິນ */}
              {selectedItem.type === "deposit" && (
                <>
                  <div className="flex justify-between"><span className="text-gray-400 font-medium">ປະເພດ:</span> <span className="font-bold text-gray-900 dark:text-white">ເຕີມເງິນ</span></div>
                  <div className="flex justify-between"><span className="text-gray-400 font-medium">ຊ່ອງທາງ:</span> <span className="font-bold text-gray-900 dark:text-white"><MethodLabel method={selectedItem.method} /></span></div>
                  <div className="flex justify-between"><span className="text-gray-400 font-medium">ຈຳນວນທີ່ແຈ້ງເຕີມ:</span> <span className="font-black text-blue-600 dark:text-blue-400">{selectedItem.amount_requested?.toLocaleString()} ກີບ</span></div>
                  {selectedItem.fee_percent > 0 && (
                    <>
                      <div className="flex justify-between"><span className="text-gray-400 font-medium">ค່າຍທຳນຽມ:</span> <span className="font-bold text-rose-500">{selectedItem.fee_percent}%</span></div>
                      <div className="flex justify-between"><span className="text-gray-400 font-medium">ເງິນທີ່ຈະໄດ້ຮັບ:</span> <span className="font-black text-emerald-500">{selectedItem.amount_received?.toLocaleString()} ກີບ</span></div>
                    </>
                  )}
                </>
              )}

              {/* ລາຍລະອຽດເຕີມເກມ */}
              {selectedItem.type === "topup" && (
                <>
                  <div className="flex justify-between"><span className="text-gray-400 font-medium">ປະເພດ:</span> <span className="font-bold text-gray-900 dark:text-white">ເຕີມເກມ</span></div>
                  <div className="flex justify-between"><span className="text-gray-400 font-medium">ຊື່ເກມ:</span> <span className="font-black text-indigo-600 dark:text-indigo-400">{selectedItem.game_name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400 font-medium">ລາຍການສິນຄ້າ:</span> <span className="font-bold text-gray-900 dark:text-white">{selectedItem.products?.name}</span></div>
                  {selectedItem.uid && <div className="flex justify-between"><span className="text-gray-400 font-medium">ID ຜູ້ໃຊ້ (UID):</span> <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-900 dark:text-white font-bold">{selectedItem.uid} {selectedItem.zone_id && `(${selectedItem.zone_id})`}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-400 font-medium">ລາຄາ:</span> <span className="font-black text-blue-600 dark:text-blue-400">{selectedItem.price?.toLocaleString()} ກີບ</span></div>
                  {selectedItem.status === "failed" && <div className="flex justify-between"><span className="text-gray-400 font-medium">ໝາຍເຫດ:</span> <span className="font-bold text-emerald-500">ຄືນເງິນເຂົ້າລະບົບແລ້ວ</span></div>}
                </>
              )}

              {/* ລາຍລະອຽດຊື້ລະຫັດ */}
              {selectedItem.type === "code" && (
                <>
                  <div className="flex justify-between"><span className="text-gray-400 font-medium">ປະເພດ:</span> <span className="font-bold text-gray-900 dark:text-white">ຊື້ລະຫັດ / ບັດ</span></div>
                  <div className="flex justify-between"><span className="text-gray-400 font-medium">ລາຍການສິນຄ້າ:</span> <span className="font-bold text-gray-900 dark:text-white">{selectedItem.products?.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400 font-medium">ລາຄາ:</span> <span className="font-black text-blue-600 dark:text-blue-400">{selectedItem.price?.toLocaleString()} ກີບ</span></div>
                  
                  {selectedItem.status === "success" && (selectedItem.game_codes?.code || selectedItem.game_codes?.acc_username) && (
                    <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2 mt-2">
                      <p className="text-[11px] font-bold text-gray-400 border-b border-gray-200/40 pb-1">ຂໍ້ມູນສິນຄ້າທີ່ໄດ້ຮັບ:</p>
                      {selectedItem.game_codes?.code && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Code:</span>
                          <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{selectedItem.game_codes.code}</span>
                        </div>
                      )}
                      {selectedItem.game_codes?.acc_username && (
                        <div className="space-y-1 text-[11px]">
                          <p className="font-mono text-gray-700 dark:text-gray-300"><span className="text-gray-400 font-bold">Username:</span> {selectedItem.game_codes.acc_username}</p>
                          <p className="font-mono text-gray-700 dark:text-gray-300"><span className="text-gray-400 font-bold">Password:</span> {selectedItem.game_codes.acc_password}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              <div className="h-px bg-gray-100 dark:bg-gray-800 my-2"></div>
              <div className="flex justify-between"><span className="text-gray-400 font-medium">ວັນທີ ແລະ ເວລາ:</span> <span className="font-bold text-gray-700 dark:text-gray-300">{new Date(selectedItem.created_at).toLocaleString("lo-LA")}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-400 font-medium">ສະຖານະທຸລະກຳ:</span> <span><StatusBadge status={selectedItem.status} /></span></div>
            </div>

            <button onClick={() => setSelectedItem(null)} className="w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-black rounded-2xl transition-colors text-xs mt-2">
              ປິດໜ້າຕ່າງນີ້
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .scale-in { animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>

    </div>
  )
}