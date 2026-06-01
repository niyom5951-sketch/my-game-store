"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ThemeToggle from "@/components/ui/ThemeToggle"

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(data)
      setNewUsername(data?.username || "")
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    setError("")
    setSuccess("")
    if (newPassword && newPassword !== confirmPassword)
      return setError("ລະຫັດຜ່ານບໍ່ຕົງກັນ")
    if (newPassword && newPassword.length < 6)
      return setError("ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວ")

    setSaving(true)
    const supabase = createClient()

    if (newUsername !== profile.username) {
      const { error: err } = await supabase
        .from("profiles").update({ username: newUsername }).eq("id", profile.id)
      if (err) { setSaving(false); return setError("ຊື່ຜູ້ໃຊ້ນີ້ຖືກໃຊ້ແລ້ວ") }
    }

    if (newPassword) {
      const { error: err } = await supabase.auth.updateUser({ password: newPassword })
      if (err) { setSaving(false); return setError("ບໍ່ສາມາດປ່ຽນລະຫັດຜ່ານໄດ້") }
    }

    setSaving(false)
    setSuccess("ອັບເດດສຳເລັດ!")
    setEditing(false)
    setNewPassword("")
    setConfirmPassword("")
    setProfile({ ...profile, username: newUsername })
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <button onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-bold text-gray-900 dark:text-white">ໂປຣໄຟລ໌</span>
        <ThemeToggle />
      </div>

      <div className="p-4 space-y-4">
        {/* Avatar Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 text-center space-y-3">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto shadow-lg shadow-blue-500/30">
            {profile?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-xl text-gray-900 dark:text-white">{profile?.username}</p>
            <p className="text-gray-400 text-sm mt-0.5">{profile?.email}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-1">ຍອດເງິນ</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {profile?.balance?.toLocaleString()} ກີບ
            </p>
          </div>
        </div>

        {/* ແກ້ໄຂ */}
        {!editing ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex justify-between items-center">
              <p className="font-bold text-gray-900 dark:text-white">ຂໍ້ມູນບັນຊີ</p>
              <button onClick={() => setEditing(true)}
                className="text-blue-600 text-sm font-bold">
                ແກ້ໄຂ
              </button>
            </div>
            {[
              { label: "ຊື່ຜູ້ໃຊ້", value: profile?.username },
              { label: "ອີເມວ", value: profile?.email },
              { label: "ລະຫັດຜ່ານ", value: "••••••••" },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <span className="text-sm text-gray-400">{item.label}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
            <p className="font-bold text-gray-900 dark:text-white">ແກ້ໄຂຂໍ້ມູນ</p>
            <input placeholder="ຊື່ຜູ້ໃຊ້ໃໝ່" value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 dark:text-white" />
            <div className="relative">
              <input placeholder="ລະຫັດຜ່ານໃໝ່ (ຖ້າຢາກປ່ຽນ)"
                type={showPass ? "text" : "password"} value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-16 text-sm outline-none focus:border-blue-500 dark:text-white" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-500 font-semibold">
                {showPass ? "ເຊື່ອງ" : "ສະແດງ"}
              </button>
            </div>
            <div className="relative">
              <input placeholder="ຢືນຢັນລະຫັດຜ່ານໃໝ່"
                type={showConfirm ? "text" : "password"} value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-16 text-sm outline-none focus:border-blue-500 dark:text-white" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-500 font-semibold">
                {showConfirm ? "ເຊື່ອງ" : "ສະແດງ"}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setEditing(false); setError("") }}
                className="py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold">
                ຍົກເລີກ
              </button>
              <button onClick={handleSave} disabled={saving}
                className="py-3 rounded-xl bg-blue-600 text-white font-bold disabled:opacity-50">
                {saving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3">
            <p className="text-green-600 text-sm text-center font-medium">{success}</p>
          </div>
        )}

        {/* ລິ້ງຕ່າງໆ */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          {[
            { href: "/contact", label: "ຕິດຕໍ່ພວກເຮົາ", icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
            { href: "/terms", label: "ນະໂຍບາຍ", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
          ].map(item => (
            <Link key={item.href} href={item.href}>
              <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                </div>
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Admin */}
        {profile?.role === "admin" && (
          <Link href="/admin">
            <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-blue-500/20 active:scale-95 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold">ໂໝດ Admin</p>
                  <p className="text-white/70 text-xs">ຈັດການເວັບໄຊ</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </Link>
        )}

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 text-red-500 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition active:scale-95">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          ອອກຈາກລະບົບ
        </button>
      </div>
    </div>
  )
}