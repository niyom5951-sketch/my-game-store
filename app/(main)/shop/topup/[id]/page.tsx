"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useParams } from "next/navigation"

export default function TopupDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [game, setGame] = useState<any>(null)
  const [packages, setPackages] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [selectedPkg, setSelectedPkg] = useState<any>(null)
  const [form, setForm] = useState({ uid: "", zone_id: "", username: "", password: "" })
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [prof, g, pkgs] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("games").select("*").eq("id", params.id).single(),
        supabase.from("products").select("*").eq("games_id", params.id).eq("is_active", true).order("price")
      ])

      setProfile(prof.data)
      setGame(g.data)
      setPackages(pkgs.data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleBuy() {
    setError("")
    if (!selectedPkg) return setError("ກະລຸນາເລືອກແພັກເກດ")

    if (game.input_type === "uid" && !form.uid)
      return setError("ກະລຸນາໃສ່ UID")
    if (game.input_type === "uid_zone" && (!form.uid || !form.zone_id))
      return setError("ກະລຸນາໃສ່ UID ແລະ Zone ID")
    if (game.input_type === "username_password" && (!form.username || !form.password))
      return setError("ກະລຸນາໃສ່ Username ແລະ Password")
    if (profile.balance < selectedPkg.price)
      return setError(`ຍອດເງິນບໍ່ພໍ (ມີ ${profile.balance?.toLocaleString()} ກີບ)`)

    setBuying(true)
    const res = await fetch("/api/topup/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: selectedPkg.id,
        uid: form.uid,
        zone_id: form.zone_id,
        username: form.username,
        password: form.password,
      })
    })
    const result = await res.json()

    if (!res.ok || !result.success) {
      setBuying(false)
      return setError(result.error || "ສົ່ງຄຳສັ່ງບໍ່ສຳເລັດ")
    }

    setBuying(false)
    setSuccess(true)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!game) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">ບໍ່ພົບເກມ</p>
    </div>
  )

  // ສຳເລັດ
  if (success) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl text-center space-y-5">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">ສົ່ງຄຳສັ່ງສຳເລັດ!</h2>
          <p className="text-gray-400 text-sm mt-1">ກຳລັງດຳເນີນການ ກະລຸນາລໍຖ້າ</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">ເກມ</span>
            <span className="font-bold text-gray-900 dark:text-white">{game.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">ແພັກເກດ</span>
            <span className="font-bold text-gray-900 dark:text-white">{selectedPkg?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">ລາຄາ</span>
            <span className="font-bold text-blue-600">{selectedPkg?.price?.toLocaleString()} ກີບ</span>
          </div>
          {form.uid && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">UID</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">{form.uid}</span>
            </div>
          )}
          {form.zone_id && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Zone ID</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">{form.zone_id}</span>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <button onClick={() => router.push("/history")}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-2xl active:scale-95 transition">
            ເບິ່ງປະຫວັດ
          </button>
          <button onClick={() => { setSuccess(false); setSelectedPkg(null); setForm({ uid: "", zone_id: "", username: "", password: "" }) }}
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-2xl active:scale-95 transition">
            ເຕີມຕໍ່
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <button onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-bold text-gray-900 dark:text-white">{game.name}</span>
        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
          {profile?.balance?.toLocaleString()} ກີບ
        </span>
      </div>

      {/* Game Banner */}
      <div className="relative h-40 overflow-hidden">
        {game.icon_url ? (
          <img src={game.icon_url} alt={game.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-violet-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <p className="text-white font-bold text-xl">{game.name}</p>
          <p className="text-white/70 text-sm capitalize">{game.input_type?.replace("_", " + ")}</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* ຟອມ */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="font-bold text-sm text-gray-700 dark:text-gray-300">ຂໍ້ມູນບັນຊີ</p>
          </div>

          {game.input_type === "uid" && (
            <input placeholder="ໃສ່ UID" value={form.uid}
              onChange={e => setForm({ ...form, uid: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition" />
          )}

          {game.input_type === "uid_zone" && (
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="UID" value={form.uid}
                onChange={e => setForm({ ...form, uid: e.target.value })}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition" />
              <input placeholder="Zone ID" value={form.zone_id}
                onChange={e => setForm({ ...form, zone_id: e.target.value })}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition" />
            </div>
          )}

          {game.input_type === "username_password" && (
            <div className="space-y-2">
              <input placeholder="Username" value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition" />
              <input placeholder="Password" type="password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition" />
            </div>
          )}
        </div>

        {/* ເລືອກແພັກເກດ */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="font-bold text-sm text-gray-700 dark:text-gray-300">ເລືອກແພັກເກດ</p>
          </div>

          {packages.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">ຍັງບໍ່ມີແພັກເກດ</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {packages.map(pkg => (
                <button key={pkg.id} onClick={() => setSelectedPkg(pkg)}
                  className={`p-3 rounded-xl border-2 text-left transition active:scale-95 ${
                    selectedPkg?.id === pkg.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  }`}>
                  <p className={`text-xs font-bold ${selectedPkg?.id === pkg.id ? "text-blue-600" : "text-gray-700 dark:text-gray-300"}`}>
                    {pkg.name}
                  </p>
                  <p className={`text-sm font-bold mt-1 ${selectedPkg?.id === pkg.id ? "text-blue-600" : "text-gray-900 dark:text-white"}`}>
                    {pkg.price?.toLocaleString()} ກີບ
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ສະຫຼຸບ */}
        {selectedPkg && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 space-y-2">
            <p className="font-bold text-sm text-blue-700 dark:text-blue-300">ສະຫຼຸບຄຳສັ່ງ</p>
            <div className="flex justify-between text-sm">
              <span className="text-blue-600/70 dark:text-blue-400/70">ແພັກເກດ</span>
              <span className="font-bold text-blue-700 dark:text-blue-300">{selectedPkg.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-600/70 dark:text-blue-400/70">ລາຄາ</span>
              <span className="font-bold text-blue-700 dark:text-blue-300">{selectedPkg.price?.toLocaleString()} ກີບ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-600/70 dark:text-blue-400/70">ຍອດຂອງທ່ານ</span>
              <span className={`font-bold ${profile?.balance < selectedPkg.price ? "text-red-500" : "text-green-600"}`}>
                {profile?.balance?.toLocaleString()} ກີບ
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-3">
            <p className="text-red-500 text-sm text-center">{error}</p>
          </div>
        )}

        {/* ປຸ່ມຢືນຢັນ */}
        <button onClick={handleBuy} disabled={buying || !selectedPkg}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 text-white font-bold py-4 rounded-2xl transition disabled:opacity-50 shadow-lg shadow-blue-500/25 active:scale-95 flex items-center justify-center gap-2">
          {buying ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ກຳລັງດຳເນີນການ...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {selectedPkg ? `ຢືນຢັນ ${selectedPkg.price?.toLocaleString()} ກີບ` : "ເລືອກແພັກເກດກ່ອນ"}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
