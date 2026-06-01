"use client"

import { AlertCircle, ArrowUpRight, CheckCircle2, Clock3, Gamepad2, Users, WalletCards } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type RecentDeposit = {
  id: string
  amount_requested: number | null
  method: string | null
  created_at: string
  profiles?: { username?: string | null } | null
}

type RecentTopup = {
  id: string
  game_name: string | null
  price: number | null
  created_at: string
  profiles?: { username?: string | null } | null
  products?: { name?: string | null } | null
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    pendingDeposits: 0,
    pendingTopups: 0,
    totalUsers: 0,
    totalSales: 0,
  })
  const [recentDeposits, setRecentDeposits] = useState<RecentDeposit[]>([])
  const [recentTopups, setRecentTopups] = useState<RecentTopup[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const [dep, top, users, sales, recentDep, recentTop] = await Promise.all([
        supabase.from("deposit_orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("topup_orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "user"),
        supabase.from("topup_orders").select("price").eq("status", "success"),
        supabase
          .from("deposit_orders")
          .select("id, amount_requested, method, created_at, profiles(username)")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("topup_orders")
          .select("id, game_name, price, created_at, profiles(username), products(name)")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(5),
      ])

      const totalSales = sales.data?.reduce((sum, order) => sum + Number(order.price || 0), 0) || 0

      setStats({
        pendingDeposits: dep.count || 0,
        pendingTopups: top.count || 0,
        totalUsers: users.count || 0,
        totalSales,
      })
      setRecentDeposits((recentDep.data || []) as RecentDeposit[])
      setRecentTopups((recentTop.data || []) as RecentTopup[])
      setLoading(false)
    }

    load()
  }, [])

  const statCards = [
    {
      label: "ເຕີມເງິນລໍຖ້າ",
      value: stats.pendingDeposits,
      href: "/admin/deposits",
      icon: WalletCards,
      accent: "bg-amber-500",
      detail: "ຕ້ອງກວດສອບ",
    },
    {
      label: "ເຕີມເກມລໍຖ້າ",
      value: stats.pendingTopups,
      href: "/admin/topups",
      icon: Gamepad2,
      accent: "bg-blue-600",
      detail: "ອໍເດີທີ່ຍັງບໍ່ປິດ",
    },
    {
      label: "Users ທັງໝົດ",
      value: stats.totalUsers,
      href: "/admin/users",
      icon: Users,
      accent: "bg-emerald-600",
      detail: "ສະມາຊິກປົກກະຕິ",
    },
    {
      label: "ຍອດຂາຍສຳເລັດ",
      value: `${stats.totalSales.toLocaleString()} ກີບ`,
      href: "/admin/topups",
      icon: CheckCircle2,
      accent: "bg-violet-600",
      detail: "ຈາກ topup success",
    },
  ]

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              <Clock3 className="h-3.5 w-3.5" />
              Live overview
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-gray-950">ພາບລວມການຈັດການຮ້ານ</h2>
            <p className="mt-1 text-sm text-gray-500">ກວດລາຍການລໍຖ້າ, ຍອດຂາຍ ແລະຜູ້ໃຊ້ໄດ້ຈາກຈຸດດຽວ.</p>
          </div>
          <Link
            href="/admin/products"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-gray-800"
          >
            ຈັດການສິນຄ້າ
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${card.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-300" />
              </div>
              <p className="mt-4 text-sm font-bold text-gray-500">{card.label}</p>
              <p className="mt-1 text-2xl font-black tracking-tight text-gray-950">{loading ? "-" : card.value}</p>
              <p className="mt-2 text-xs text-gray-400">{card.detail}</p>
            </Link>
          )
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h3 className="font-black text-gray-950">ລາຍການເຕີມເງິນລໍຖ້າ</h3>
              <p className="text-xs text-gray-500">ກວດສະລິບ ແລະຊ່ອງທາງຝາກ</p>
            </div>
            <Link href="/admin/deposits" className="text-sm font-bold text-blue-600 hover:text-blue-700">ເບິ່ງທັງໝົດ</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentDeposits.length === 0 ? (
              <EmptyState label="ບໍ່ມີລາຍການຝາກທີ່ລໍຖ້າ" />
            ) : recentDeposits.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-950">{item.profiles?.username || "Unknown user"}</p>
                  <p className="mt-1 text-xs text-gray-500">{item.method || "deposit"} • {new Date(item.created_at).toLocaleString("lo-LA")}</p>
                </div>
                <p className="shrink-0 text-sm font-black text-amber-600">{Number(item.amount_requested || 0).toLocaleString()} ກີບ</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h3 className="font-black text-gray-950">ອໍເດີເຕີມເກມລໍຖ້າ</h3>
              <p className="text-xs text-gray-500">ຈັດການ UID, Zone ແລະບັນຊີ</p>
            </div>
            <Link href="/admin/topups" className="text-sm font-bold text-blue-600 hover:text-blue-700">ເບິ່ງທັງໝົດ</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentTopups.length === 0 ? (
              <EmptyState label="ບໍ່ມີອໍເດີເຕີມເກມທີ່ລໍຖ້າ" />
            ) : recentTopups.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-950">{item.profiles?.username || "Unknown user"}</p>
                  <p className="mt-1 truncate text-xs text-gray-500">{item.game_name} • {item.products?.name || "Package"}</p>
                </div>
                <p className="shrink-0 text-sm font-black text-blue-600">{Number(item.price || 0).toLocaleString()} ກີບ</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-8 text-sm text-gray-500">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
        <AlertCircle className="h-4 w-4" />
      </div>
      {label}
    </div>
  )
}
