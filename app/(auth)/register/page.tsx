"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ThemeToggle from "@/components/ui/ThemeToggle"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleRegister() {
    setError("")
    if (!form.username || !form.email || !form.password || !form.confirm)
      return setError("ກະລຸນາໃສ່ຂໍ້ມູນໃຫ້ຄົບ")
    if (form.password !== form.confirm)
      return setError("ລະຫັດຜ່ານບໍ່ຕົງກັນ")
    if (form.password.length < 6)
      return setError("ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວ")

    setLoading(true)
    const supabase = createClient()

    const { data: existing } = await supabase
      .from("profiles").select("username")
      .eq("username", form.username).single()

    if (existing) {
      setLoading(false)
      return setError("ຊື່ຜູ້ໃຊ້ນີ້ຖືກໃຊ້ແລ້ວ")
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { username: form.username } }
    })

    setLoading(false)
    if (signUpError) return setError(signUpError.message)
    router.refresh()
    router.push("/")
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4">
        <Link href="/login" className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          ← ກັບຄືນ
        </Link>
        <ThemeToggle />
      </div>

      {/* Modal */}
      <div className="flex-1 flex items-center justify-center p-4 pb-8">
        <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-blue-600 p-7 text-center relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/20 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">
              🎮
            </div>
            <h1 className="text-xl font-bold text-white">ສ້າງບັນຊີໃໝ່</h1>
            <p className="text-blue-100 text-sm mt-1">ກະລຸນາໃສ່ຂໍ້ມູນຂ້າງລຸ່ມ</p>
          </div>

          {/* Body */}
          <div className="bg-white dark:bg-gray-900 p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ຊື່ຜູ້ໃຊ້</label>
              <input placeholder="ໃສ່ຊື່ຜູ້ໃຊ້" value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ອີເມວ</label>
              <input placeholder="ໃສ່ອີເມວ" type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ລະຫັດຜ່ານ</label>
              <div className="relative">
                <input placeholder="ຢ່າງໜ້ອຍ 6 ຕົວ"
                  type={showPass ? "text" : "password"} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-16 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-500 font-semibold">
                  {showPass ? "ເຊື່ອງ" : "ສະແດງ"}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ຢືນຢັນລະຫັດຜ່ານ</label>
              <div className="relative">
                <input placeholder="ໃສ່ລະຫັດຜ່ານອີກຄັ້ງ"
                  type={showConfirm ? "text" : "password"} value={form.confirm}
                  onChange={e => setForm({ ...form, confirm: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-16 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-500 font-semibold">
                  {showConfirm ? "ເຊື່ອງ" : "ສະແດງ"}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-3">
                <p className="text-red-500 text-sm text-center">{error}</p>
              </div>
            )}

            <button onClick={handleRegister} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 shadow-lg shadow-blue-500/25 active:scale-95">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ກຳລັງສ້າງບັນຊີ...
                </span>
              ) : "ສະໝັກສະມາຊິກ"}
            </button>

            <p className="text-center text-sm text-gray-400">
              ມີບັນຊີແລ້ວ?{" "}
              <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold">
                ເຂົ້າສູ່ລະບົບ
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}