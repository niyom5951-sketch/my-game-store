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
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!game) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <p className="text-gray-400 font-black text-xs">ບໍ່ພົບເກມ</p>
    </div>
  )

  if (success) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl text-center space-y-5 border border-gray-100 dark:border-gray-800">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">ສົ່ງຄຳສັ່ງສຳເລັດ!</h2>
          <p className="text-gray-400 text-xs mt-1 font-semibold">ກຳລັງດຳເນີນການ ກະລຸນາລໍຖ້າລະບົບເຕີມໃຫ້</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 text-left space-y-2.5 border border-gray-100 dark:border-gray-700/50">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-gray-400">ເກມ</span>
            <span className="font-black text-gray-900 dark:text-white">{game.name}</span>
          </div>
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-gray-400">ແພັກເກດ</span>
            <span className="font-black text-gray-900 dark:text-white">{selectedPkg?.name}</span>
          </div>
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-gray-400">ລາຄາ</span>
            <span className="font-black text-blue-600 dark:text-blue-400">{selectedPkg?.price?.toLocaleString()} ກີບ</span>
          </div>
          {form.uid && (
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-400">UID</span>
              <span className="font-mono font-black text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{form.uid}</span>
            </div>
          )}
          {form.zone_id && (
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-400">Zone ID</span>
              <span className="font-mono font-black text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{form.zone_id}</span>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <button onClick={() => router.push("/history")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-2xl active:scale-95 transition text-xs shadow-md shadow-blue-500/10">
            ເບິ່ງປະຫວັດການເຕີມ
          </button>
          <button onClick={() => { setSuccess(false); setSelectedPkg(null); setForm({ uid: "", zone_id: "", username: "", password: "" }) }}
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-black py-3 rounded-2xl active:scale-95 transition text-xs">
            ເຕີມຕໍ່
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <button onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-black text-gray-900 dark:text-white truncate max-w-[180px] tracking-tight">{game.name}</span>
        <span className="text-xs font-black bg-blue-50 dark:bg-blue-950/45 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-900/40">
          💰 {profile?.balance?.toLocaleString()} ກີບ
        </span>
      </div>

      {/* Game Banner */}
      <div className="relative h-44 overflow-hidden">
        {game.icon_url ? (
          <img src={game.icon_url} alt={game.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <span className="inline-block bg-blue-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md mb-1.5">
            {game.input_type?.replace("_", " + ")}
          </span>
          <p className="text-white font-black text-xl leading-tight tracking-tight">{game.name}</p>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-md mx-auto">
        {/* ຟອມປ້ອນຂໍ້ມູນ */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800/60 space-y-3.5">
          <div className="flex items-center gap-2 pb-1 border-b border-gray-50 dark:border-gray-800">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="font-black text-xs text-gray-800 dark:text-gray-200">ກະລຸນາປ້ອນຂໍ້ມູນບັນຊີເກມ</p>
          </div>

          {game.input_type === "uid" && (
            <input placeholder="ໃສ່ UID ຂອງເຈົ້າ" value={form.uid}
              onChange={e => setForm({ ...form, uid: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:text-white transition font-semibold" />
          )}

          {game.input_type === "uid_zone" && (
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <input placeholder="ໃສ່ UID" value={form.uid}
                  onChange={e => setForm({ ...form, uid: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:text-white transition font-semibold" />
              </div>
              <div>
                <input placeholder="Zone ID" value={form.zone_id}
                  onChange={e => setForm({ ...form, zone_id: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3 text-xs text-center outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:text-white transition font-semibold" />
              </div>
            </div>
          )}

          {game.input_type === "username_password" && (
            <div className="space-y-2.5">
              <input placeholder="ໃສ່ Username / Email / ບັນຊີ" value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:text-white transition font-semibold" />
              <input placeholder="ໃສ່ Password / ລະຫັດຜ່ານ" type="password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:text-white transition font-semibold" />
            </div>
          )}
        </div>

        {/* ເລືອກແພັກເກດ */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800/60">
          <div className="flex items-center gap-2 mb-3.5 pb-1 border-b border-gray-50 dark:border-gray-800">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="font-black text-xs text-gray-800 dark:text-gray-200">ເລືອກແພັກເກດທີ່ຕ້ອງການ</p>
          </div>

          {packages.length === 0 ? (
            <p className="text-center text-gray-400 text-xs py-6 font-semibold">⚠️ ຍັງບໍ່ມີແພັກເກດສິນຄ້າໃນເກມນີ້</p>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {packages.map(pkg => (
                <button key={pkg.id} onClick={() => setSelectedPkg(pkg)}
                  className={`p-3.5 rounded-2xl border-2 text-left transition relative overflow-hidden flex flex-col justify-between min-h-[76px] ${
                    selectedPkg?.id === pkg.id
                      ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40"
                      : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 hover:border-gray-200"
                  }`}>
                  <p className={`text-[11px] font-black leading-snug break-words ${selectedPkg?.id === pkg.id ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}>
                    {pkg.name}
                  </p>
                  <p className={`text-sm font-black mt-1.5 ${selectedPkg?.id === pkg.id ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"}`}>
                    {pkg.price?.toLocaleString()} ກີບ
                  </p>
                  
                  {selectedPkg?.id === pkg.id && (
                    <div className="absolute right-0 top-0 bg-blue-500 text-white p-0.5 rounded-bl-lg">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ບັດສະຫຼຸບຄຳສັ່ງ */}
        {selectedPkg && (
          <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-4 space-y-2.5">
            <p className="font-black text-xs text-blue-700 dark:text-blue-400">ສະຫຼຸບລາຍການສັ່ງຊື້</p>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-blue-600/70 dark:text-blue-400/60">ແພັກເກດທີ່ເລືອກ</span>
              <span className="font-black text-blue-800 dark:text-blue-300">{selectedPkg.name}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-blue-600/70 dark:text-blue-400/60">ລາຄາເຕີມ</span>
              <span className="font-black text-blue-800 dark:text-blue-300">{selectedPkg.price?.toLocaleString()} ກີບ</span>
            </div>
            <div className="flex justify-between text-xs font-semibold pt-1 border-t border-blue-100/50 dark:border-blue-900/20">
              <span className="text-blue-600/70 dark:text-blue-400/60">ຍອດເງິນຄົງເຫຼືອ</span>
              <span className={`font-black ${profile?.balance < selectedPkg.price ? "text-rose-500" : "text-emerald-500"}`}>
                {profile?.balance?.toLocaleString()} ກີບ
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/40 rounded-xl p-3">
            <p className="text-rose-500 text-xs font-black text-center">{error}</p>
          </div>
        )}

        {/* ປຸ່ມຢືນຢັນການເຕີມ */}
        <button onClick={handleBuy} disabled={buying || !selectedPkg}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white font-black py-3.5 rounded-2xl transition disabled:opacity-50 shadow-lg shadow-blue-500/25 active:scale-95 flex items-center justify-center gap-2 text-xs">
          {buying ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ກຳລັງສົ່ງຄຳສັ່ງເຕີມ...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {selectedPkg ? `ຢືນຢັນການເຕີມ (${selectedPkg.price?.toLocaleString()} ກີບ)` : "ກະລຸນາເລືອກແພັກເກດກ່ອນ"}
            </>
          )}
        </button>
      </div>
    </div>
  )
}