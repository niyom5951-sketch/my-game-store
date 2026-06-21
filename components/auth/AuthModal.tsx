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
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300"
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-900/40 bg-white dark:bg-slate-900 border border-white/20 dark:border-slate-800 animate-in zoom-in-95 fade-in slide-in-from-bottom-6 duration-400">

        {/* ປຸ່ມປິດ */}
        <button
          onClick={resetAndClose}
          className="absolute top-4 right-4 z-50 bg-white/15 hover:bg-white/30 backdrop-blur-md text-white w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg"
          title="ປິດ"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header - Gradient ສວຍງາມ */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 p-8 text-center overflow-hidden">
          {/* ຕົບແຕ່ງພື້ນຫຼັງ */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-fuchsia-400/20 rounded-full blur-2xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-white/5 rounded-full" />

          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl ring-1 ring-white/30">
              🎮
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {mode === "login" ? "ຍິນດີຕ້ອນຮັບ!" : "ສ້າງບັນຊີໃໝ່"}
            </h1>
            <p className="text-indigo-100/90 text-sm mt-1.5 font-medium">
              {mode === "login" ? "ເຂົ້າສູ່ລະບົບເພື່ອສືບຕໍ່ການນຳໃຊ້" : "ມາເລີ່ມຕົ້ນການຜະຈົນໄພນຳກັນ"}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3.5 max-h-[65vh] overflow-y-auto">

          {mode === "login" ? (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">
                  ຊື່ຜູ້ໃຊ້
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    placeholder="ໃສ່ຊື່ຜູ້ໃຊ້"
                    value={loginForm.username}
                    onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border-2 border-transparent rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 dark:text-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">
                  ລະຫັດຜ່ານ
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    placeholder="••••••••"
                    type={showPass ? "text" : "password"}
                    value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border-2 border-transparent rounded-2xl pl-11 pr-16 py-3.5 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 dark:text-white transition-all placeholder:text-slate-400"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-indigo-500 font-bold uppercase tracking-wide hover:text-indigo-600">
                    {showPass ? "ເຊື່ອງ" : "ສະແດງ"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-2xl p-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-500 text-xs font-bold">{error}</p>
                </div>
              )}

              <button onClick={handleLogin} disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/30 active:scale-[0.97] mt-1">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ກຳລັງເຂົ້າລະບົບ...
                  </span>
                ) : "ເຂົ້າສູ່ລະບົບ"}
              </button>

              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                <span className="text-[11px] text-slate-300 dark:text-slate-600 font-bold uppercase">ຫຼື</span>
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
              </div>

              <button
                onClick={() => switchMode("register")}
                className="w-full border-2 border-indigo-100 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-bold py-3.5 rounded-2xl transition-all hover:bg-indigo-50 dark:hover:bg-slate-800 active:scale-[0.97] flex items-center justify-center gap-1.5"
              >
                ສ້າງບັນຊີໃໝ່
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">ຊື່ຜູ້ໃຊ້</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input placeholder="ໃສ່ຊື່ຜູ້ໃຊ້" value={registerForm.username}
                    onChange={e => setRegisterForm({ ...registerForm, username: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border-2 border-transparent rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 dark:text-white transition-all placeholder:text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">ອີເມວ</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input placeholder="ໃສ່ອີເມວ" type="email" value={registerForm.email}
                    onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border-2 border-transparent rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 dark:text-white transition-all placeholder:text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">ລະຫັດຜ່ານ</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input placeholder="ຢ່າງໜ້ອຍ 6 ຕົວ"
                    type={showPass ? "text" : "password"} value={registerForm.password}
                    onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border-2 border-transparent rounded-2xl pl-11 pr-16 py-3.5 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 dark:text-white transition-all placeholder:text-slate-400" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-indigo-500 font-bold uppercase tracking-wide hover:text-indigo-600">
                    {showPass ? "ເຊື່ອງ" : "ສະແດງ"}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">ຢືນຢັນລະຫັດຜ່ານ</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input placeholder="ໃສ່ລະຫັດຜ່ານອີກຄັ້ງ"
                    type={showConfirm ? "text" : "password"} value={registerForm.confirm}
                    onChange={e => setRegisterForm({ ...registerForm, confirm: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border-2 border-transparent rounded-2xl pl-11 pr-16 py-3.5 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 dark:text-white transition-all placeholder:text-slate-400" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-indigo-500 font-bold uppercase tracking-wide hover:text-indigo-600">
                    {showConfirm ? "ເຊື່ອງ" : "ສະແດງ"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-2xl p-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-500 text-xs font-bold">{error}</p>
                </div>
              )}

              <button onClick={handleRegister} disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/30 active:scale-[0.97] mt-1">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ກຳລັງສ້າງບັນຊີ...
                  </span>
                ) : "ສະໝັກສະມາຊິກ"}
              </button>

              <p className="text-center text-sm text-slate-400 dark:text-slate-500 pt-1">
                ມີບັນຊີແລ້ວ?{" "}
                <button onClick={() => switchMode("login")} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
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