"use client"
import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ThemeToggle from "@/components/ui/ThemeToggle"
import AnimatedTitle from "@/components/ui/AnimatedTitle"

export default function ShopPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [games, setGames] = useState<any[]>([])
  const [codes, setCodes] = useState<any[]>([])
  const [banner, setBanner] = useState("")
  const [showMenu, setShowMenu] = useState(false)
  // ຖ້າບໍ່ໄດ້ໃຊ້ showShopSheet ສາມາດລຶບອອກໄດ້ ເພື່ອບໍ່ໃຫ້ໜັກໂຄ້ດ
  const [showShopSheet, setShowShopSheet] = useState(false) 
  
  // ✅ ແກ້ໄຂ Type ຂອງ useRef ໃຫ້ຖືກຕ້ອງຕາມມາດຕະຖານ React + TS
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // ✅ ປ່ຽນຈາກ .single() ເປັນ .maybeSingle() ເພື່ອປ້ອງກັນ error ຖ້າບໍ່ມີ profile
        const { data: prof } = await supabase
          .from("profiles")
          .select("username, balance, role")
          .eq("id", user.id)
          .maybeSingle()
        setProfile(prof)
      }

      // ດຶງຂໍ້ມູນແບບຂະໜານ (Parallel) ເຮັດໄດ້ດີແລ້ວ
      const [g, c, s] = await Promise.all([
        supabase.from("games").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("products").select("*").in("category", ["code", "account"]).eq("is_active", true).order("created_at", { ascending: false }),
        supabase.from("settings").select("value").eq("key", "banner_url").maybeSingle()
      ])
      
      setGames(g.data || [])
      setCodes(c.data || [])
      if (s.data) setBanner(s.data.value)
    }
    load()

    // ປິດ menu ເມື່ອກົດນອກ
    function handleClick(e: MouseEvent) {
      // ✅ ແກ້ໄຂໂດຍການເຕີມ `as Node` ເພື່ອໃຫ້ TypeScript ເຂົ້າໃຈ
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
<span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">
  Game Store
</span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {profile ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {profile.balance?.toLocaleString()} ກີບ
              </span>
              {/* Avatar + Dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold hover:bg-blue-700 transition active:scale-95"
                >
                  {profile.username?.[0]?.toUpperCase() || "U"}
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div className="absolute right-0 top-11 w-52 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-100 dark:border-gray-800">
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{profile.username}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                        {profile.balance?.toLocaleString()} ກີບ
                      </p>
                    </div>

                    {/* Menu Items */}
                    {[
                      { href: "/deposit", label: "ເຕີມເງິນ", icon: "M12 4v16m8-8H4" },
                      { href: "/shop/topup", label: "ເຕີມເກມ", icon: "M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.4.959.4v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" },
                      { href: "/shop/code", label: "ສິນຄ້າ", icon: "M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" },
                      { href: "/history", label: "ປະຫວັດ", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
                      { href: "/profile", label: "ໂປຣໄຟລ໌", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" },
                    ].map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setShowMenu(false)}>
                        <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                          </svg>
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{item.label}</span>
                        </div>
                      </Link>
                    ))}

                    <div className="border-t border-gray-100 dark:border-gray-800">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm text-red-500 font-medium">ອອກຈາກລະບົບ</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link href="/login">
              <button className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl">
                ເຂົ້າສູ່ລະບົບ
              </button>
            </Link>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Banner */}
        <div className="rounded-2xl overflow-hidden">
          {banner ? (
            <img src={banner} alt="banner" className="w-full h-44 object-cover" />
          ) : (
            <div className="w-full h-44 bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-center rounded-2xl">
              <p className="text-white font-bold text-2xl tracking-wide">Game Store</p>
            </div>
          )}
        </div>

        {/* ເກມຍອດນິຍົມ */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-base">ເກມຍອດນິຍົມ</p>
              <p className="text-xs text-gray-400">Popular Games</p>
            </div>
            <Link href="/shop/topup" className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
              ທັງໝົດ →
            </Link>
          </div>
          {games.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">ຍັງບໍ່ມີເກມ</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {games.map(g => (
                <Link href={`/shop/topup/${g.id}`} key={g.id}>
                  <div className="relative rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 group cursor-pointer"
                    style={{ height: "clamp(90px, 15vw, 140px)" }}>
                    {g.icon_url ? (
                      <img src={g.icon_url} alt={g.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-violet-600" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white text-xs font-bold truncate">{g.name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ລະຫັດຍອດນິຍົມ */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-base">ລະຫັດຍອດນິຍົມ</p>
              <p className="text-xs text-gray-400">Popular Items</p>
            </div>
            <Link href="/shop/code" className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
              ທັງໝົດ →
            </Link>
          </div>
          {codes.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">ຍັງບໍ່ມີສິນຄ້າ</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {codes.slice(0, 6).map(p => (
                <div key={p.id} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
                  <div className="relative w-full aspect-square">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center p-2">
                        <span className="text-white font-bold text-xs text-center">{p.name}</span>
                      </div>
                    )}
                    {p.stock_left <= 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">ໝົດແລ້ວ</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1 space-y-2">
                    <p className="font-bold text-xs text-gray-900 dark:text-white line-clamp-2">{p.name}</p>
                    <p className="text-blue-600 dark:text-blue-400 font-bold text-sm">{p.price?.toLocaleString()} ກີບ</p>
                    <div className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${p.stock_left > 0 ? "bg-green-500" : "bg-red-500"}`} />
                      <span className="text-xs text-gray-400">{p.stock_left > 0 ? `ເຫຼືອ ${p.stock_left}` : "ໝົດ"}</span>
                    </div>
                    <Link href={`/shop/code/${p.id}`} className="mt-auto">
                      <button disabled={p.stock_left <= 0}
                        className="w-full bg-blue-600 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 text-white font-bold py-2 rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        ຊື້
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}