"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function BankDepositPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState("")
  const [selectedBank, setSelectedBank] = useState<"bcel" | "ldb">("bcel")
  const [slipFile, setSlipFile] = useState<File | null>(null)
  const [slipPreview, setSlipPreview] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [orderId, setOrderId] = useState("")
  const [bankInfo, setBankInfo] = useState<any>({})
  const [userId, setUserId] = useState("")

  // --- Logic ຕົ້ນສະບັບທັງໝົດ ---
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const { data } = await supabase
        .from("settings")
        .select("key, value")
        .in("key", [
          "bank_bcel_name", "bank_bcel_number", "bank_bcel_account_name", "bank_bcel_qr_url",
          "bank_ldb_name", "bank_ldb_number", "bank_ldb_account_name", "bank_ldb_qr_url"
        ])

      if (data) {
        const info: any = {}
        data.forEach(d => info[d.key] = d.value)
        setBankInfo(info)
      }
    }
    load()
  }, [])

  const bank = selectedBank === "bcel" ? {
    name: bankInfo.bank_bcel_name,
    number: bankInfo.bank_bcel_number,
    account: bankInfo.bank_bcel_account_name,
    qr: bankInfo.bank_bcel_qr_url,
  } : {
    name: bankInfo.bank_ldb_name,
    number: bankInfo.bank_ldb_number,
    account: bankInfo.bank_ldb_account_name,
    qr: bankInfo.bank_ldb_qr_url,
  }

  async function handleCreateOrder() {
    setError("")
    const num = parseInt(amount)
    if (!num || num < 3000) return setError("ຂັ້ນຕ່ຳ 3,000 ກີບ")
    setLoading(true)
    const supabase = createClient()
    const { data, error: err } = await supabase
      .from("deposit_orders")
      .insert({
        user_id: userId,
        method: "bank",
        amount_requested: num,
        amount_received: num,
        fee_percent: 0,
        status: "pending",
        admin_note: `ທະນາຄານ: ${bank.name}`
      })
      .select().single()

    setLoading(false)
    if (err) return setError("ເກີດຂໍ້ຜິດພາດ")
    setOrderId(data.id)
    setStep(2)
    await fetch("/api/discord", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `💰 **ເຕີມເງິນໃໝ່** (ທະນາຄານ)\n👤 ຜູ້ໃຊ້: ${userId}\n💵 ຈຳນວນ: ${parseInt(amount).toLocaleString()} ກີບ\n🏦 ທະນາຄານ: ${bank.name}`
      })
    })
  }

  async function handleUploadSlip() {
    if (!slipFile) return setError("ກະລຸນາແນບສະລິບ")
    setError("")
    setLoading(true)
    const supabase = createClient()
    const hashBuffer = await crypto.subtle.digest("SHA-256", await slipFile.arrayBuffer())
    const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("")
    const hashCheck = await fetch("/api/deposit/slip-hash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hash })
    })
    const hashResult = await hashCheck.json()
    if (!hashCheck.ok) {
      setLoading(false)
      return setError(hashResult.error || "ກວດສະລິບບໍ່ສຳເລັດ")
    }
    if (hashResult.exists) {
      setLoading(false)
      return setError("ສະລິບນີ້ຖືກໃຊ້ແລ້ວ")
    }
    const ext = slipFile.name.split('.').pop()
    const filename = `${userId}/${Date.now()}.${ext}`
    const { error: uploadErr } = await supabase.storage.from("slips").upload(filename, slipFile)
    if (uploadErr) {
      setLoading(false)
      return setError("Upload ບໍ່ສຳເລັດ: " + uploadErr.message)
    }
    const { data: urlData } = supabase.storage.from("slips").getPublicUrl(filename)
    await supabase.from("deposit_orders").update({ slip_url: urlData.publicUrl, slip_hash: hash }).eq("id", orderId)
    setLoading(false)
    setStep(3)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSlipFile(file)
    setSlipPreview(URL.createObjectURL(file))
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans">
      {/* Premium Glassmorphism Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => step === 1 ? router.back() : setStep(step - 1)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
          >
            <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <span className="block text-sm font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Step 0{step}</span>
            <span className="text-xs font-bold text-slate-400">Transaction Panel</span>
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

        {/* STEP 1: Amount & Bank Selection */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/5 border border-slate-100 dark:border-slate-800">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">ເຕີມເງິນ</h2>
              <p className="text-slate-400 text-sm mb-8 font-medium">ກະລຸນາເລືອກທະນາຄານ ແລະ ລະບຸຈຳນວນເງິນ</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {["bcel", "ldb"].map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBank(b as any)}
                    className={`relative py-5 rounded-3xl font-black transition-all overflow-hidden border-2 ${
                      selectedBank === b 
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600" 
                      : "border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:border-slate-200"
                    }`}
                  >
                    <span className="relative z-10">{b === "bcel" ? "BCEL ONE" : "LDB BANK"}</span>
                    {selectedBank === b && <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />}
                  </button>
                ))}
              </div>

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
                    <span>ຢືນຢັນການເຕີມ</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Transfer Details */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Payment</p>
              <h3 className="text-4xl font-black text-slate-800 dark:text-white mb-8">
                {parseInt(amount).toLocaleString()} <span className="text-sm text-indigo-600">LAK</span>
              </h3>

              <div className="relative group mb-8">
                <div className="absolute -inset-4 bg-indigo-500/10 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-white p-4 rounded-3xl border border-slate-100 shadow-sm inline-block">
                  {bank.qr ? (
                    <img src={bank.qr} alt="QR" className="w-56 h-56 object-contain rounded-xl" />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center bg-slate-50 text-slate-300 text-xs font-bold uppercase">No QR Content</div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 text-left space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Bank</span>
                  <span className="text-sm font-black text-slate-700 dark:text-slate-200">{bank.name}</span>
                </div>
                <div className="h-px bg-slate-200/50 dark:bg-slate-700" />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Account No.</span>
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 select-all tracking-wider">{bank.number}</span>
                </div>
                <div className="h-px bg-slate-200/50 dark:bg-slate-700" />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Account Name</span>
                  <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase">{bank.account}</span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-left ml-2">Upload Transfer Slip</p>
                <label className="relative block group cursor-pointer">
                  <div className={`w-full border-2 border-dashed rounded-[2rem] p-8 transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
                    slipPreview 
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20" 
                    : "border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50/30 dark:bg-slate-800/30"
                  }`}>
                    {slipPreview ? (
                      <img src={slipPreview} className="w-full max-h-52 object-contain rounded-2xl shadow-lg" />
                    ) : (
                      <>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                        </div>
                        <p className="text-xs font-black text-slate-500 uppercase">Select Image</p>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              {error && <p className="text-red-500 text-xs font-bold mt-4 animate-pulse">{error}</p>}

              <button
                onClick={handleUploadSlip}
                disabled={loading || !slipFile}
                className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-3xl font-black shadow-xl shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-30"
              >
                {loading ? "ກຳລັງປະມວນຜົນ..." : "ຢືນຢັນການແຈ້ງໂອນ"}
              </button>
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
                <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Payment Received</h2>
                <p className="text-slate-400 text-sm font-medium px-4">ລາຍການຂອງທ່ານຖືກສົ່ງໃຫ້ Admin ແລ້ວ ກະລຸນາລໍຖ້າການກວດສອບພາຍໃນ 1-5 ນາທີ.</p>
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
