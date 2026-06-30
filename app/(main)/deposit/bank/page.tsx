"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function BankDepositPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState("")
  const [bankType, setBankType] = useState<"bcel" | "ldb">("bcel") // 🎯 ເພີ່ມຕົວແປເລືອກທະນາຄານ
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [qrString, setQrString] = useState("") 
  const [orderId, setOrderId] = useState<number | null>(null)
  const [userId, setUserId] = useState("")

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    loadUser()
  }, [])

  // 🔄 Polling ເຊັກສະຖານະບິນອັດຕະໂນມັດ
  useEffect(() => {
    if (!orderId || step !== 2) return

    const interval = setInterval(async () => {
      const supabase = createClient()
      const { data: order } = await supabase
        .from("deposit_orders")
        .select("status")
        .eq("order_number", orderId)
        .single()

      if (order?.status === "success") {
        clearInterval(interval)
        setStep(3) // 🎉 ເດັ້ງໄປໜ້າເຕີມເງິນສຳເລັດ!
      }
    }, 4000) 

    return () => clearInterval(interval)
  }, [orderId, step])

  async function handleCreateOrder() {
    setError("")
    const num = parseInt(amount)
    
    if (!num || num < 100) return setError("ขั้นต่ำ 100 กีบ เพื่อให้ธนาคารสแกนได้")
    
    setLoading(true)
    try {
      const res = await fetch("/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: num, userId, bankType }) // 🎯 ສົ່ງ bankType ໄປຫຼັງບ້ານ
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด")

      setQrString(data.qr_string) 
      setOrderId(data.order_number)
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

        {/* STEP 1: Input & Select Bank */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">เติมเงินอัตโนมัติ</h2>
              <p className="text-slate-400 text-sm mb-6 font-medium">ระบบสแกน QR Code ตัดยอดอัตโนมัติภายใน 10 วินาที</p>

              {/* 🎯 ປຸ່ມເລືອກທະນາຄານ */}
              <div className="space-y-2 mb-6">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">เลือกธนาคาร (Select Bank)</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setBankType("bcel")}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${bankType === "bcel" ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20" : "border-slate-200 dark:border-slate-800"}`}
                  >
                    <span className="text-lg font-black text-blue-600">BCEL One</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBankType("ldb")}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${bankType === "ldb" ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20" : "border-slate-200 dark:border-slate-800"}`}
                  >
                    <span className="text-lg font-black text-green-600">LDB Trust</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">จำนวนเงิน (LAK)</label>
                <div className="relative group">
                  <input
                    type="number"
                    placeholder="100"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 rounded-3xl px-6 py-6 text-3xl font-black text-indigo-600 outline-none transition-all"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300">₭</div>
                </div>
                {error && <p className="text-red-500 text-xs font-bold ml-4 animate-bounce">{error}</p>}
              </div>

              <button
                onClick={handleCreateOrder}
                disabled={loading || !amount}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-3xl font-black shadow-xl active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-3"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>สร้าง QR Code เติมเงิน</span>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Show QR Code */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">ธนาคาร: <span className="text-indigo-600 uppercase">{bankType}</span></p>
              <h3 className="text-4xl font-black text-slate-800 dark:text-white mb-6">
                {parseInt(amount).toLocaleString()} <span className="text-sm text-indigo-600">LAK</span>
              </h3>

              <div className="relative group mb-6">
                <div className="relative bg-white p-4 rounded-3xl border border-slate-100 shadow-sm inline-block">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrString)}`} 
                    alt="Phajay QR Code" 
                    className="w-56 h-56 object-contain rounded-xl" 
                  />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-full text-xs font-bold mb-6 animate-pulse">
                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                กรุณาสแกนจ่าย... ยอดจะอัปเดตอัตโนมัติ
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
                <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">เติมเงินสำเร็จ!</h2>
                <p className="text-slate-400 text-sm font-medium px-4">ระบบได้เพิ่มยอดเงินเข้าในบัญชีของคุณเรียบร้อยแล้ว.</p>
              </div>
              <button onClick={() => router.push("/shop")} className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-5 rounded-3xl font-black active:scale-95 transition-all">กลับสู่หน้าหลัก</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}