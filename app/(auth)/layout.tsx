"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [games, setGames] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [g, p] = await Promise.all([
        supabase.from("games").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("products").select("*").eq("is_active", true).limit(6)
      ])
      setGames(g.data || [])
      setProducts(p.data || [])
    }
    load()
  }, [])

  return (
    <div className="min-h-screen relative">
      {/* Background — ໜ້າຫຼັກເວັບ blur */}
      <div className="fixed inset-0 bg-gray-50 dark:bg-gray-950 overflow-hidden pointer-events-none select-none">
        {/* Fake Header */}
        <div className="bg-white dark:bg-gray-900 px-4 py-3 flex justify-between items-center border-b dark:border-gray-800">
          <span className="font-bold text-gray-800 dark:text-white">🎮 Game Store</span>
          <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>

        {/* Fake Content */}
        <div className="p-4 space-y-4 opacity-60">
          {/* Banner */}
          <div className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl h-28 flex items-center justify-center">
            <p className="text-white font-bold text-lg">🎮 Game Store</p>
          </div>

          {/* Games Grid */}
          <p className="font-bold text-gray-700 dark:text-gray-300">ເກມຍອດນິຍົມ</p>
          <div className="grid grid-cols-3 gap-2">
            {games.slice(0, 6).map(g => (
              <div key={g.id} className="bg-white dark:bg-gray-800 rounded-xl p-2 text-center">
                {g.icon_url ? (
                  <img src={g.icon_url} className="w-full h-14 object-cover rounded-lg mb-1" />
                ) : (
                  <div className="w-full h-14 bg-gray-100 dark:bg-gray-700 rounded-lg mb-1 flex items-center justify-center text-xl">🎮</div>
                )}
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">{g.name}</p>
              </div>
            ))}
          </div>

          {/* Products */}
          <p className="font-bold text-gray-700 dark:text-gray-300">ສິນຄ້າລາຍດ່ວນ</p>
          <div className="grid grid-cols-2 gap-2">
            {products.slice(0, 4).map(p => (
              <div key={p.id} className="bg-white dark:bg-gray-800 rounded-xl p-3 flex gap-2">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-lg">🔑</div>
                <div>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">{p.name}</p>
                  <p className="text-xs text-blue-500">{p.price?.toLocaleString()} ກີບ</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blur overlay */}
        <div className="absolute inset-0 backdrop-blur-sm bg-white/30 dark:bg-black/30" />
      </div>

      {/* Auth Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}