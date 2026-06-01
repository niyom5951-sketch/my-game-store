"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function PromoCodePage() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<any>(null)

  async function handleSubmit() {
    setError("")
    if (!code.trim()) return setError("ກະລຸນາໃສ່ໂຄ້ດ")

    setLoading(true)
    const res = await fetch("/api/deposit/redeem-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    })
    const data = await res.json()

    setLoading(false)
    if (!res.ok || !data.success) {
      return setError(data.error || "ໂຄ້ດບໍ່ຖືກຕ້ອງ ຫຼື ຖືກໃຊ້ແລ້ວ")
    }
    setResult(data.promo)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans">
      
      {/* Sticky Header ແບບ Premium Glassmorphism */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
          >
            <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <span className="block text-sm font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Redeem Code
            </span>
            <span className="text-xs font-bold text-slate-400">ແລກຮັບເຄຣດິດຟຣີ</span>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-5 pb-20">
        
        {/* ໜ້າຕອນທີ່ຍັງບໍ່ໄດ້ກົດແລກໂຄ້ດ */}
        {!result ? (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* ປ້າຍຫົວຂໍ້ແບບ Luxury Cyber Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-[2rem] p-6 shadow-xl shadow-indigo-500/20">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl" />
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm0 0h4m-4 0H8m12 0a2 2 0 100-4h-4m4 4c0 1.105-.895 2-2 2h-2m0 0V5a2 2 0 10-2 2h2m0 10V5m0 12c0 1.105-.895 2-2 2h-2m0 0V5a2 2 0 10-2 2h2m0 10V5m0 12c0 1.105-.895 2-2 2h-2" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-black text-lg tracking-wide">ໃສ່ໂຄ້ດກິດຈະກຳ</h3>
                  <p className="text-indigo-100 text-xs mt-1 font-medium leading-relaxed">
                    ຫາກທ່ານມີ Gift Code, Promo Code ຫຼື ໂຄ້ດລາງວັນ ຈາກທາງເພຈ ສາມາດປ້ອນເພື່ອຮັບເງິນເຂົ້າເວັບໄຊໄດ້ທັນທີ.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Input ປ້ອນໂຄ້ດ */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Enter Coupon / Promo Code</label>
                <input
                  placeholder="ຕົວຢ່າງ: LUCKY2026"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 rounded-2xl px-5 py-4 font-mono font-black text-center text-xl tracking-widest text-slate-800 dark:text-white outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                />
              </div>

              {error && (
                <div className="p-3.5 bg-red-50 dark:bg-red-950/30 text-red-500 text-xs font-bold rounded-xl text-center">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !code.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>ກວດສອບ ແລະ ຮັບເງິນ</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          
          /* ໜ້າຕອນທີ່ແລກໂຄ້ດສຳເລັດ (Success State) */
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-2xl text-center space-y-6">
              
              {/* SVG Animation Check Icon */}
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse" />
                <div className="relative w-20 h-20 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-[1.8rem] flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-900">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">ແລກຮັບສຳເລັດ!</h2>
                <p className="text-slate-400 text-xs font-medium px-6 leading-relaxed">
                  ລະບົບໄດ້ທຳການກວດສອບໂຄ້ດ ແລະ ເພີ່ມຍອດເງິນເຂົ້າບັນຊີຂອງທ່ານຮຽບຮ້ອຍແລ້ວ.
                </p>
              </div>

              {/* ປ້າຍສະແດງຈຳນວນເງິນສຸດພຣີມ້ຽມ */}
              <div className="bg-gradient-to-b from-slate-50 to-slate-100/50 dark:from-slate-800/40 dark:to-slate-800/20 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/80">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">ໄດ້ຮັບເຄຣດິດຟຣີ</span>
                <div className="mt-2 flex items-baseline justify-center gap-1.5">
                  <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {result.value.toLocaleString()}
                  </span>
                  <span className="text-xs font-black text-emerald-500 uppercase">ກີບ</span>
                </div>
              </div>

              <button
                onClick={() => router.push("/shop")}
                className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-4 rounded-2xl font-black active:scale-[0.98] transition-all shadow-md"
              >
                ຕົກລົງ
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
