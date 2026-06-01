"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ThemeToggle from "@/components/ui/ThemeToggle"

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

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
    router.push("/")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4">
        <p className="font-bold text-gray-800 dark:text-white">🎮 Game Store</p>
        <ThemeToggle />
      </div>

      {/* Modal Container */}
      <div className="flex-1 flex items-center justify-center p-4 pb-8">
        <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative bg-white dark:bg-gray-900">
          
          {/* ປຸ່ມປິດ (X) ຢູ່ມຸມຂວາມືເທິງ */}
          <button 
            onClick={() => router.push("/")}
            className="absolute top-4 right-4 z-50 bg-black/20 hover:bg-black/40 backdrop-blur text-white hover:text-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 font-bold text-sm"
            title="ປິດ"
          >
            ✕
          </button>

          {/* Header */}
          <div className="bg-blue-600 p-7 text-center relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/20 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">
              🎮
            </div>
            <h1 className="text-xl font-bold text-white">ຍິນດີຕ້ອນຮັບ!</h1>
            <p className="text-blue-100 text-sm mt-1">ເຂົ້າສູ່ລະບົບເພື່ອສືບຕໍ່</p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                ชື່ຜູ້ໃຊ້
              </label>
              <input
                placeholder="ໃສ່ຊື່ຜູ້ໃຊ້"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                ລະຫັດຜ່ານ
              </label>
              <div className="relative">
                <input
                  placeholder="••••••••"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-16 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-500 font-semibold">
                  {showPass ? "ເຊື່ອງ" : "ສະແດງ"}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-3">
                <p className="text-red-500 text-sm text-center">{error}</p>
              </div>
            )}

            <button onClick={handleLogin} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 shadow-lg shadow-blue-500/25 active:scale-95">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ກຳລັງເຂົ້າລະບົບ...
                </span>
              ) : "ເຂົ້າສູ່ລະບົບ"}
            </button>

            <Link href="/register">
              <button className="w-full border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 font-bold py-3 rounded-xl transition hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-95">
                ຍັງບໍ່ມີບັນຊີ? ສະໝັກ →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}