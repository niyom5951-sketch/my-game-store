"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function BankDepositPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [qrString, setQrString] = useState("") // ເກັບຄ່າ QR ຈາກ Phajay
  const [orderId, setOrderId] = useState("")
  const [userId, setUserId] = useState("")

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    loadUser()
  }, [])

  // ລະບົບ Polling ກວດສອບສະຖານະບິນອັດຕະໂນມັດ
  useEffect(() => {
    if (!orderId || step !== 2) return

    const interval = setInterval(async () => {
      const supabase = createClient()
      const { data: order } = await supabase
        .from("deposit_orders")
        .select("status")
        .eq("id", orderId)
        .single()

      if (order?.status === "success") {
        clearInterval(interval)
        setStep(3) // ຖ້າ Webhook ແຈ້ງວ່າຈ່າຍແລ້ວ ໃຫ້ເດັ້ງໄປໜ້າສຳເລັດທັນທີ
      }
    }, 4000) // ກວດທຸກໆ 4 ວິນາທີ

    return () => clearInterval(interval)
  }, [orderId, step])

  // ຂັ້ນຕອນສ້າງບິນ ແລະ ຂໍ QR Code ຈາກ Phajay ຜ່ານ API ຫຼັງບ້ານຂອງເຮົາ
  async function handleCreateOrder() {
    setError("")
    const num = parseInt(amount)
    if (!num || num < 3000) return setError("ຂັ້ນຕ່ຳ 3,000 ກີບ")
    
    setLoading(true)
    try {
      const res = await fetch("/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: num, userId })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "ເກີດຂໍ້ຜິດພາດໃນການສ້າງບິນ")

      setQrString(data.qr_string) // ໄດ້ QR String ມາສ້າງ QR Code
      setOrderId(data.order_id)
      setStep(2)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans">
      {/* Header */}
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
            <span className="block text-sm font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Step 0{step}</span>
            <span className="text-xs font-bold text-slate-400">Phajay Auto QR</span>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-5 pb-20">
        {/* Progress Bar */}
        <div className="mb-10 flex gap-2 h-1.5 px-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${step >= i ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-800"}`} />
          ))}
        </div>

        {/* STEP 1: Input Amount */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/5 border border-slate-100 dark:border-slate-800">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">ເຕີມເງິນອັດຕະໂນມັດ</h2>
              <p className="text-slate-400 text-sm mb-8 font-medium">ລະບົບສະແກນ QR Code ຕັດຍອດອັດຕະໂນມັດພາຍໃນ 10 ວິນາທີ</p>

              <div className="space-y-2 mb-8">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Amount (LAK)</label>
                <div className="relative group">
                  <input
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 rounded-3xl px-6 py-6 text-3xl font-black text-indigo-600 outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300">₭</div>
                </div>
                {error && <p className="text-red-500 text-xs font-bold ml-4 animate-bounce">{error}</p>}
              </div>

              <button
                onClick={handleCreateOrder}
                disabled={loading || !amount}
                className="group w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-3xl font-black shadow-xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>ສ້າງ QR Code ເຕີມເງິນ</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Show QR Code */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Payment</p>
              <h3 className="text-4xl font-black text-slate-800 dark:text-white mb-6">
                {parseInt(amount).toLocaleString()} <span className="text-sm text-indigo-600">LAK</span>
              </h3>

              <div className="relative group mb-6">
                <div className="relative bg-white p-4 rounded-3xl border border-slate-100 shadow-sm inline-block">
                  {/* ເອົາ QR String ມາສ້າງຮູບ QR Code ຜ່ານ API ຟຣີ */}
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrString)}`} 
                    alt="Phajay QR Code" 
                    className="w-56 h-56 object-contain rounded-xl" 
                  />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-full text-xs font-bold mb-6 animate-pulse">
                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                ລໍຖ້າການສະແກນໂອນ... ລະບົບຈະອັບເດດອັດຕະໂນມັດ
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-5 text-left text-xs font-medium text-slate-500 space-y-2">
                <p>• ທ່ານສາມາດໃຊ້ Application ຂອງທຸກທະນາຄານເພື່ອສະແກນໄດ້.</p>
                <p>• ຫ້າມປ່ຽນແປງຈຳນວນເງິນໃນເວລາໂອນຢ່າງເດັດຂາດ.</p>
                <p>• ຫຼັງຈາກໂອນສຳເລັດແລ້ວ ຫ້າມປິດໜ້ານີ້ ໃຫ້ລໍຖ້າລະບົບກວດສອບ.</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Success Status */}
        {step === 3 && (
          <div className="animate-in zoom-in-90 duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 shadow-2xl border border-slate-100 dark:border-slate-800 text-center space-y-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse" />
                <div className="relative w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-lg">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">ເຕີມເງິນສຳເລັດ!</h2>
                <p className="text-slate-400 text-sm font-medium px-4">ລະບົບໄດ້ເພີ່ມຍອດເງິນເຂົ້າໃນບັນຊີຂອງທ່ານຮຽບຮ້ອຍແລ້ວ.</p>
              </div>
              <button
                onClick={() => router.push("/shop")}
                className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-5 rounded-3xl font-black active:scale-95 transition-all shadow-xl"
              >
                ກັບສູ່ໜ້າຫຼັກ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}