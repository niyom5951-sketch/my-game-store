"use client"

import {
  ArrowLeft,
  Boxes,
  Gauge,
  Gamepad2,
  KeyRound,
  Landmark,
  Settings,
  TicketPercent,
  Users,
  WalletCards,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"

const menus = [
  { href: "/admin", label: "Dashboard", description: "ພາບລວມຮ້ານ", icon: Gauge },
  { href: "/admin/deposits", label: "ເຕີມເງິນ", description: "ກວດລາຍການຝາກ", icon: WalletCards },
  { href: "/admin/topups", label: "ເຕີມເກມ", description: "ຈັດການອໍເດີ", icon: Gamepad2 },
  { href: "/admin/products", label: "ສິນຄ້າ", description: "ເກມ ແລະ ແພັກເກດ", icon: Boxes },
  { href: "/admin/codes", label: "Codes", description: "Stock ລະຫັດ", icon: KeyRound },
  { href: "/admin/users", label: "Users", description: "ບັນຊີລູກຄ້າ", icon: Users },
  { href: "/admin/promo", label: "ໂຄ້ດ", description: "ໂປຣໂມຊັນ", icon: TicketPercent },
  { href: "/admin/settings", label: "ຕັ້ງຄ່າ", description: "ຂໍ້ມູນຮ້ານ", icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [profile, setProfile] = useState<{ username?: string | null; email?: string | null } | null>(null)

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data } = await supabase
        .from("profiles")
        .select("username, email, role")
        .eq("id", user.id)
        .single()

      if (data?.role !== "admin") {
        router.push("/shop")
        return
      }

      setProfile({ username: data.username, email: data.email || user.email })
      setChecking(false)
    }

    check()
  }, [router])

  const activeMenu = useMemo(() => {
    return menus.find((menu) => pathname === menu.href || (menu.href !== "/admin" && pathname.startsWith(menu.href))) || menus[0]
  }, [pathname])

  if (checking) {
    return (
      <div className="min-h-screen bg-[#f6f7f9] flex items-center justify-center">
        <div className="rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <div className="h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-gray-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-gray-200 bg-[#14161a] text-white lg:flex lg:flex-col">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#14161a]">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-black tracking-tight">Game Store</p>
              <p className="text-xs font-medium text-white/50">Admin Control</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {menus.map((menu) => {
            const Icon = menu.icon
            const active = pathname === menu.href || (menu.href !== "/admin" && pathname.startsWith(menu.href))

            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-3 transition ${
                  active
                    ? "bg-white text-[#14161a] shadow-sm"
                    : "text-white/65 hover:bg-white/8 hover:text-white"
                }`}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  active ? "bg-blue-600 text-white" : "bg-white/8 text-white/70 group-hover:text-white"
                }`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold">{menu.label}</span>
                  <span className={`block truncate text-[11px] ${active ? "text-gray-500" : "text-white/40"}`}>
                    {menu.description}
                  </span>
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <Link
            href="/shop"
            className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-bold text-white/65 transition hover:bg-white/8 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            ກັບໜ້າຮ້ານ
          </Link>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-gray-500">
                <span>Admin</span>
                <span className="h-1 w-1 rounded-full bg-gray-300" />
                <span>{activeMenu.description}</span>
              </div>
              <h1 className="mt-1 truncate text-xl font-black tracking-tight text-gray-950">{activeMenu.label}</h1>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/shop"
                className="hidden rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 sm:inline-flex"
              >
                ກັບໜ້າຮ້ານ
              </Link>
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-black text-white">
                  {profile?.username?.[0]?.toUpperCase() || "A"}
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-bold leading-none text-gray-900">{profile?.username || "Admin"}</p>
                  <p className="mt-1 max-w-36 truncate text-[11px] text-gray-500">{profile?.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto border-t border-gray-100 px-4 py-2 lg:hidden">
            {menus.map((menu) => {
              const Icon = menu.icon
              const active = pathname === menu.href || (menu.href !== "/admin" && pathname.startsWith(menu.href))
              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${
                    active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {menu.label}
                </Link>
              )
            })}
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
