"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function CardDepositPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [cardType, setCardType] = useState<"unitel" | "talacom">("unitel")
  const [cardNumber, setCardNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userId, setUserId] = useState("")

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    load()
  }, [])

  async function handleSubmit() {
    setError("")
    if (!cardNumber || cardNumber.length < 10) {
      return setError("ກະລຸນາໃສ່ເລກບັດໃຫ້ຖືກຕ້ອງ")
    }

    setLoading(true)
    const supabase = createClient()

    // Logic ຕົ້ນສະບັບ: ກວດວ່າມີ order pending ຢູ່ກ່ອນບໍ່
    const { data: pendingOrder } = await supabase
      .from("deposit_orders")
      .select("id")
      .eq("user_id", userId)
      .eq("method", "card")
      .eq("status", "pending")
      .maybeSingle()

    if (pendingOrder) {
      setLoading(false)
      return setError("ທ່ານມີ order ລໍຖ້າຢູ່ ກະລຸນາລໍ admin ອະນຸມັດກ່ອນ")
    }

    // Logic ຕົ້ນສະບັບ: ກວດເລກບັດຊ້ຳ
    const { data: existing } = await supabase
      .from("deposit_orders")
      .select("id")
      .eq("card_number", cardNumber)
      .maybeSingle()

    if (existing) {
      setLoading(false)
      return setError("ເລກບັດນີ້ຖືກໃຊ້ແລ້ວ")
    }

    // Insert ຂໍ້ມູນລົງ Database (ແກ້ໄຂໃຫ້ກົງກັບ Schema ທີ່ຖືກຕ້ອງ ບໍ່ມີ column ສ່ວນເກີນ)
    const { error: err } = await supabase
      .from("deposit_orders")
      .insert({
        user_id: userId,
        method: "card",
        amount_requested: 10000,
        amount_received: 6500,
        fee_percent: 35,
        card_number: cardNumber,
        status: "pending",
        admin_note: `ປະເພດ: ${cardType === "unitel" ? "Unitel" : "Lao Telecom"}`
      })

    setLoading(false)
    if (err) return setError("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ")
    setStep(2)

    // Logic ຕົ້ນສະບັບ: ຍິງແຈ້ງເຕືອນເຂົ້າ Discord
    await fetch("/api/discord", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `💳 **ເຕີມບັດໃໝ່**\n💵 ປະເພດ: ${cardType === "unitel" ? "Unitel" : "Lao Telecom"}\n🔢 ເลກບັດ: ${cardNumber}`
      })
    })
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans">
      
      {/* Premium Glassmorphism Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => step === 1 ? router.back() : setStep(1)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
          >
            <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <span className="block text-sm font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              {step === 1 ? "ລະບຸຂໍ້ມູນບັດ" : "ກວດສອບສະຖານະ"}
            </span>
            <span className="text-xs font-bold text-slate-400">Card Payment</span>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-5 pb-20">
        
        {/* STEP 1: Input Card Details */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* ປ້າຍແຈ້ງລາຄາ ແລະ ຄ່າທຳນຽມແບບ Luxury Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-[2rem] p-6 shadow-xl shadow-indigo-500/20">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl" />
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-black text-lg tracking-wide">ຮັບສະເພາະບັດ 10,000 ກີບ</h3>
                  <p className="text-indigo-100 text-xs mt-1 font-medium leading-relaxed">
                    ລະບົບຈະຫັກຄ່າທຳນຽມ 35% ໂດຍອັດຕະໂນມັດ ຫຼັງຈາກ Admin ກວດສອບສໍາເລັດ ທ່ານຈະໄດ້ຮັບເງິນເຂົ້າເວັບໄຊທັງໝົດ:
                  </p>
                  <div className="mt-4 inline-flex items-baseline gap-1 bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                    <span className="text-xl font-black text-white">6,500</span>
                    <span className="text-[10px] font-bold text-indigo-200 uppercase">ກີບ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ເລືອກປະເພດເຄືອຂ່າຍບັດ */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">ເລືອກເຄືອຂ່າຍບັດເຕີມເງິນ</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setCardType("unitel")}
                  className={`relative py-5 rounded-2xl font-black text-sm transition-all border-2 flex flex-col items-center gap-2 active:scale-95 ${
                    cardType === "unitel"
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-600"
                      : "border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200"
                  }`}
                >
                  <span className="text-base">Unitel</span>
                  <span className="text-[10px] text-slate-400 font-bold">ຄ່າທຳນຽມ 35%</span>
                  {cardType === "unitel" && <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full" />}
                </button>

                <button
                  onClick={() => setCardType("talacom")}
                  className={`relative py-5 rounded-2xl font-black text-sm transition-all border-2 flex flex-col items-center gap-2 active:scale-95 ${
                    cardType === "talacom"
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-600"
                      : "border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200"
                  }`}
                >
                  <span className="text-base">Lao Telecom</span>
                  <span className="text-[10px] text-slate-400 font-bold">ຄ່າທຳນຽມ 35%</span>
                  {cardType === "talacom" && <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full" />}
                </button>
              </div>
            </div>

            {/* Form ປ້ອນເລກບັດ */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Card Pin Number</label>
                <input
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  placeholder="ປ້ອນເລກລະຫັດບັດເຕີມເງິນຂອງທ່ານ"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 rounded-2xl px-5 py-4 font-mono font-bold text-lg tracking-widest text-slate-800 dark:text-white outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                />
              </div>

              <div className="flex items-start gap-2.5 px-2 py-1 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl">
                <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                  ບັດ 1 ໃບ ໃຊ້ໄດ້ພຽງ 1 ຄັ້ງເທົ່ານັ້ນ. ກະລຸນາລໍຖ້າໃຫ້ Admin ອະນຸມັດລາຍການກ່ອນ ຈຶ່ງຈະສາມາດສົ່ງໃບໃໝ່ໄດ້.
                </p>
              </div>

              {error && (
                <div className="p-3.5 bg-red-50 dark:bg-red-950/30 text-red-500 text-xs font-bold rounded-xl text-center animate-shake">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !cardNumber}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>ສົ່ງຂໍ້ມູນກວດສອບ</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Success pending view */}
        {step === 2 && (
          <div className="space-y-5 animate-in font-sans fade-in zoom-in-95 duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-2xl text-center space-y-6">
              
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse" />
                <div className="relative w-20 h-20 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-[1.8rem] flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-900">
                  <svg className="w-10 h-10 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18" />
                  </svg>
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">ກຳລັງກວດສອບບັດ</h2>
                <p className="text-slate-400 text-xs font-medium px-6 leading-relaxed">
                  ລະບົບໄດ້ຮັບຂໍ້ມູນແລ້ວ Admin ກຳລັງທຳການກວດສອບຄວາມຖືກຕ້ອງ ບັດຈະຖືກເຕີມເຂົ້າພາຍໃນ 1-5 ນາທີ.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 text-left text-xs space-y-3.5 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase">ປະເພດເຄືອຂ່າຍ</span>
                  <span className="font-black text-slate-700 dark:text-slate-200">
                    {cardType === "unitel" ? "Unitel" : "Lao Telecom"}
                  </span>
                </div>
                <div className="h-px bg-slate-200/60 dark:bg-slate-700" />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase">ມູນຄ່າບັດ</span>
                  <span className="font-black text-slate-700 dark:text-slate-200">10,000 ກີບ</span>
                </div>
                <div className="h-px bg-slate-200/60 dark:bg-slate-700" />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase">ຍອດເງິນທີ່ຈະໄດ້ຮັບ</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">6,500 ກີບ</span>
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