"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/Toast"

type Mode = "login" | "register"

export default function AuthModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const { showToast } = useToast()

  const [mode, setMode] = useState<Mode>("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [loginForm, setLoginForm] = useState({ username: "", password: "" })
  const [registerForm, setRegisterForm] = useState({
    username: "", email: "", password: "", confirm: ""
  })

  if (!open) return null

  function resetAndClose() {
    setError("")
    setLoginForm({ username: "", password: "" })
    setRegisterForm({ username: "", email: "", password: "", confirm: "" })
    setMode("login")
    onClose()
  }

  async function handleLogin() {
    setError("")
    if (!loginForm.username || !loginForm.password)
      return setError("ກະລຸນາໃສ່ຂໍ້ມູນໃຫ້ຄົບ")

    setLoading(true)
    const supabase = createClient()

    const { data: profile } = await supabase
      .from("profiles").select("email")
      .eq("username", loginForm.username).single()

    if (!profile) {
      setLoading(false)
      return setError("ບໍ່ພົບຊື່ຜູ້ໃຊ້ນີ້")
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: loginForm.password,
    })

    setLoading(false)
    if (loginError) return setError("ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ")

    resetAndClose()
    showToast("ເຂົ້າສູ່ລະບົບສຳເລັດ!", "success")
    router.refresh()
  }

  async function handleRegister() {
    setError("")
    if (!registerForm.username || !registerForm.email || !registerForm.password || !registerForm.confirm)
      return setError("ກະລຸນາໃສ່ຂໍ້ມູນໃຫ້ຄົບ")
    if (registerForm.password !== registerForm.confirm)
      return setError("ລະຫັດຜ່ານບໍ່ຕົງກັນ")
    if (registerForm.password.length < 6)
      return setError("ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວ")

    setLoading(true)
    const supabase = createClient()

    const { data: existing } = await supabase
      .from("profiles").select("username")
      .eq("username", registerForm.username).single()

    if (existing) {
      setLoading(false)
      return setError("ຊື່ຜູ້ໃຊ້ນີ້ຖືກໃຊ້ແລ້ວ")
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: registerForm.email,
      password: registerForm.password,
      options: { data: { username: registerForm.username } }
    })

    setLoading(false)
    if (signUpError) return setError(signUpError.message)

    resetAndClose()
    showToast("ສະໝັກສະມາຊິກສຳເລັດ!", "success")
    router.refresh()
  }

  function switchMode(m: Mode) {
    setError("")
    setMode(m)
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={resetAndClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-gray-900 animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-300">

        {/* ປຸ່ມປິດ */}
        <button
          onClick={resetAndClose}
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
          <h1 className="text-xl font-bold text-white">
            {mode === "login" ? "ຍິນດີຕ້ອນຮັບ!" : "ສ້າງບັນຊີໃໝ່"}
          </h1>
          <p className="text-blue-100 text-sm mt-1">
            {mode === "login" ? "ເຂົ້າສູ່ລະບົບເພື່ອສືບຕໍ່" : "ກະລຸນາໃສ່ຂໍ້ມູນຂ້າງລຸ່ມ"}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

          {mode === "login" ? (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  ຊື່ຜູ້ໃຊ້
                </label>
                <input
                  placeholder="ໃສ່ຊື່ຜູ້ໃຊ້"
                  value={loginForm.username}
                  onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
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
                    value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
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

              <button
                onClick={() => switchMode("register")}
                className="w-full border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 font-bold py-3 rounded-xl transition hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-95"
              >
                ຍັງບໍ່ມີບັນຊີ? ສະໝັກ →
              </button>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ຊື່ຜູ້ໃຊ້</label>
                <input placeholder="ໃສ່ຊື່ຜູ້ໃຊ້" value={registerForm.username}
                  onChange={e => setRegisterForm({ ...registerForm, username: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ອີເມວ</label>
                <input placeholder="ໃສ່ອີເມວ" type="email" value={registerForm.email}
                  onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ລະຫັດຜ່ານ</label>
                <div className="relative">
                  <input placeholder="ຢ່າງໜ້ອຍ 6 ຕົວ"
                    type={showPass ? "text" : "password"} value={registerForm.password}
                    onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
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
                    type={showConfirm ? "text" : "password"} value={registerForm.confirm}
                    onChange={e => setRegisterForm({ ...registerForm, confirm: e.target.value })}
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
                <button onClick={() => switchMode("login")} className="text-blue-600 dark:text-blue-400 font-semibold">
                  ເຂົ້າສູ່ລະບົບ
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}