"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function PhoneDepositPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ phone: "", amount: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [orderId, setOrderId] = useState("")
  const [shopPhone, setShopPhone] = useState("")
  const [userId, setUserId] = useState("")
  const [countdown, setCountdown] = useState(600)
  const [received, setReceived] = useState(0)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const { data } = await supabase
        .from("settings")
        .select("key, value")
        .eq("key", "shop_phone")
        .single()
      if (data) setShopPhone(data.value)
    }
    load()
  }, [])

  // Countdown timer Logic ຕົ້ນສະບັບ
  useEffect(() => {
    if (step !== 2) return
    if (countdown <= 0) {
      cancelOrder()
      return
    }
    const timer = setInterval(() => setCountdown(c => c - 1), 1000)
    return () => clearInterval(timer)
  }, [step, countdown])

  async function cancelOrder() {
    const supabase = createClient()
    await supabase
      .from("deposit_orders")
      .update({ status: "cancelled" })
      .eq("id", orderId)
    router.push("/deposit")
  }

  async function handleSubmit() {
    setError("")
    const num = parseInt(form.amount)
    if (!form.phone || form.phone.length < 8) return setError("ກະລຸນາໃສ່ເບີໂທລະສັບໃຫ້ຖືກຕ້ອງ")
    if (!num || num < 10000) return setError("ຍອດເຕີມຂັ້ນຕ່ຳແມ່ນ 10,000 ກີບ")
    const fee = num * 0.35
    const recv = num - fee

    setLoading(true)
    const supabase = createClient()

    const { data, error: err } = await supabase
      .from("deposit_orders")
      .insert({
        user_id: userId,
        method: "phone_transfer",
        amount_requested: num,
        amount_received: recv,
        fee_percent: 35,
        phone_number: form.phone,
        status: "pending",
        admin_note: `ເບີ: ${form.phone}`
      })
      .select()
      .single()

    setLoading(false)
    if (err) return setError("ເກີດຂໍ້ຜິດພາດໃນການສ້າງລາຍການ")
    setOrderId(data.id)
    setReceived(recv)
    setCountdown(600)
    setStep(2)

    // Discord notification Logic ຕົ້ນສະບັບ
    await fetch("/api/discord", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `💰 **ເຕີມເງິນໃໝ່** (ບັດໂທ)\n👤 ເບີ: ${form.phone}\n💵 ຈຳນວນ: ${parseInt(form.amount).toLocaleString()} ກີບ\n✅ ໄດ້ຮັບ: ${recv.toLocaleString()} ກີບ`
      })
    })
  }

  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans">
      
      {/* Sticky Header ແບບ Luxury Blur */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => step === 1 ? router.back() : cancelOrder()}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
          >
            <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <span className="block text-sm font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              {step === 1 ? "ລະບຸຂໍ້ມູນການໂອນ" : "ດຳເນີນການໂອນເງິນ"}
            </span>
            <span className="text-xs font-bold text-slate-400">Step {step} of 2</span>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-5 pb-20">
        
        {/* STEP 1: Input Form */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* ປ້າຍແຈ້ງຄ່າທຳນຽມ Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-[2rem] p-6 shadow-xl shadow-indigo-500/20">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl" />
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-black text-lg tracking-wide">ໂອນຜ່ານບັດໂທລະສັບ</h3>
                  <p className="text-indigo-100 text-xs mt-1 font-medium leading-relaxed">
                    ລະບົບຈະມີການຫັກຄ່າທຳນຽມໃນການປ່ຽນຍອດເງິນ 35% ໂດຍອັດຕະໂນມັດ (ຂັ້ນຕ່ຳ 10,000 ກີບ).
                  </p>
                </div>
              </div>
            </div>

            {/* Main Form Inputs */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
              
              {/* Input ເບີໂທ */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Sender Phone Number</label>
                <div className="relative">
                  <input
                    placeholder="ປ້ອນເບີໂທລະສັບຂອງທ່ານ (ຜູ້ໂອນ)"
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 rounded-2xl pl-5 pr-12 py-4 font-bold text-slate-800 dark:text-white outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Input ຈຳນວນເງິນ */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Transfer Amount (LAK)</label>
                <div className="relative">
                  <input
                    placeholder="ລະບຸຈຳນວນເງິນໂອນ"
                    type="text"
                    inputMode="numeric"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value.replace(/\D/g, "") })}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 rounded-2xl pl-5 pr-12 py-4 font-mono font-black text-xl tracking-wide text-slate-800 dark:text-white outline-none transition-all placeholder:text-slate-400 placeholder:font-normal placeholder:text-base"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 uppercase">LAK</span>
                </div>
              </div>

              {/* ຕາຕະລາງຄຳນວນຍອດເງິນອັດຕະໂນມັດ */}
              {form.amount && parseInt(form.amount) >= 10000 && (
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 text-xs space-y-3 border border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">ຈຳນວນໂອນ</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{parseInt(form.amount).toLocaleString()} ກີບ</span>
                  </div>
                  <div className="h-px bg-slate-200/60 dark:bg-slate-700" />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">ຄ່າທຳນຽມ 35%</span>
                    <span className="font-bold text-rose-500">-{ (parseInt(form.amount) * 0.35).toLocaleString() } ກີບ</span>
                  </div>
                  <div className="h-px bg-slate-200/60 dark:bg-slate-700" />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase">ຍອດເງິນທີ່ຈະໄດ້ຮັບ</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{ (parseInt(form.amount) * 0.65).toLocaleString() } ກີບ</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3.5 bg-red-50 dark:bg-red-950/30 text-red-500 text-xs font-bold rounded-xl text-center">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !form.phone || !form.amount}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>ສ້າງລາຍການໂອນເງິນ</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Instruction & Countdown */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-500">
            
            {/* Elegant Luxury Countdown Timer */}
            <div className={`rounded-[2rem] p-6 text-center text-white relative overflow-hidden transition-all duration-500 ${
              countdown <= 60 
                ? "bg-gradient-to-br from-rose-500 to-red-600 shadow-xl shadow-red-500/20" 
                : "bg-gradient-to-br from-slate-900 to-slate-950 dark:from-indigo-950 dark:to-slate-900 shadow-xl shadow-slate-900/10"
            }`}>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">ກະລຸນາໂອນເງິນພາຍໃນເວລາ</p>
              <p className="text-5xl font-mono font-black my-2 tracking-widest">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </p>
              <p className="text-[11px] opacity-70 font-medium">ຫາກກາຍເວລານີ້ ໃບສັ່ງຊື້ຈະຖືກຍົກເລີກໂດຍອັດຕະໂນມັດ</p>
            </div>

            {/* ເຮັດຕາມຂັ້ນຕອນການໂອນ */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
              <h3 className="font-black text-slate-800 dark:text-white text-center border-b border-slate-100 dark:border-slate-800 pb-3">
                ລາຍຊື່ ແລະ ຂໍ້ມູນການໂອນເງິນ
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase">ເບີຜູ້ຮັບ (ຮ້ານ)</span>
                  <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-base">{shopPhone || "-"}</span>
                </div>
                
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase">ເບີຜູ້ໂອນ</span>
                  <span className="font-black text-slate-700 dark:text-slate-200">{form.phone}</span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase">ຈຳນວນເງິນໂອນ</span>
                  <span className="font-black text-slate-700 dark:text-slate-200">{parseInt(form.amount).toLocaleString()} ກີບ</span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-emerald-500/20 bg-emerald-50/10">
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase">ຈະໄດ້ຮັບທັງໝົດ</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">{received.toLocaleString()} ກີບ</span>
                </div>
              </div>

              {/* Warning Card */}
              <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200/40">
                <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bold leading-relaxed">
                  ຄຳເຕືອນ: ກະລຸນາໃຊ້ເບີໂທລະສັບ {form.phone} ທີ່ລະບຸໄວ້ໃນການໂອນເງິນເທົ່ານັ້ນ!
                </p>
              </div>

              {/* ປຸ່ມຍົກເລີກລາຍການ */}
              <button
                onClick={cancelOrder}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 py-4 rounded-2xl font-black active:scale-[0.98] transition-all text-sm"
              >
                ຍົກເລີກໃບບິນນີ້
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}