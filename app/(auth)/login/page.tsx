"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ThemeToggle from "@/components/ui/ThemeToggle"
import { useToast } from "@/components/ui/Toast"

export default function LoginPage() {
  const router = useRouter()
  const { showToast } = useToast()

  const [siteName, setSiteName] = useState("Game Store")
  const [form, setForm] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    async function loadSiteName() {
      const supabase = createClient()
      const { data } = await supabase
        .from("settings").select("value")
        .eq("key", "site_name").maybeSingle()
      if (data?.value) setSiteName(data.value)
    }
    loadSiteName()
  }, [])

  async function handleLogin() {
    setError("")
    if (!form.username || !form.password)
      return setError("ກະລຸນາໃສ່ຂໍ້ມູນໃຫ້ຄົບ")

    setLoading(true)
    const supabase = createClient()

    const { data: profile } = await supabase
      .from("profiles").select("email")
      .eq("username", form.username).single()

    if (!profile) {
      setLoading(false)
      return setError("ບໍ່ພົບຊື່ຜູ້ໃຊ້ນີ້")
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: form.password,
    })

    setLoading(false)
    if (loginError) return setError("ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ")

    showToast("ເຂົ້າສູ່ລະບົບສຳເລັດ!", "success")
    router.refresh()
    router.push("/")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Navbar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <Link href="/" className="font-black text-lg text-gray-900 dark:text-white">
          🎮 {siteName}
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/">
            <button className="text-sm font-bold text-gray-500 dark:text-gray-400 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              ← ກັບໜ້າຫຼັກ
            </button>
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-900/10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">

          {/* Header */}
          <div className="relative bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 p-8 text-center overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-fuchsia-400/20 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl ring-1 ring-white/30">
                🎮
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">ຍິນດີຕ້ອນຮັບ!</h1>
              <p className="text-indigo-100/90 text-sm mt-1.5 font-medium">{siteName}</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">ຊື່ຜູ້ໃຊ້</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  placeholder="ໃສ່ຊື່ຜູ້ໃຊ້"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border-2 border-transparent rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 dark:text-white transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">ລະຫັດຜ່ານ</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  placeholder="••••••••"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border-2 border-transparent rounded-2xl pl-11 pr-16 py-3.5 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 dark:text-white transition-all placeholder:text-slate-400"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-indigo-500 font-bold uppercase tracking-wide">
                  {showPass ? "ເຊື່ອງ" : "ສະແດງ"}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-2xl p-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-red-500 text-xs font-bold">{error}</p>
              </div>
            )}

            <button onClick={handleLogin} disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/30 active:scale-[0.97]">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ກຳລັງເຂົ້າລະບົບ...
                </span>
              ) : "ເຂົ້າສູ່ລະບົບ"}
            </button>

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
              <span className="text-[11px] text-slate-300 font-bold uppercase">ຫຼື</span>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
            </div>

            <Link href="/register">
              <button className="w-full border-2 border-indigo-100 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-bold py-3.5 rounded-2xl transition-all hover:bg-indigo-50 dark:hover:bg-slate-800 active:scale-[0.97] flex items-center justify-center gap-1.5">
                ສ້າງບັນຊີໃໝ່
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}