"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ThemeToggle from "@/components/ui/ThemeToggle"

export default function CodeShopPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([]) // ເກັບລາຍຊື່ໝວດໝູ່ເກມທັງໝົດ
  const [selectedCategory, setSelectedCategory] = useState<string>("all") // ເກັບໝວດໝູ່ທີ່ກຳລັງກົດເລືອກ
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from("products")
        .select("*")
        .in("category", ["code", "account"])
        .eq("is_active", true)
        .order("created_at", { ascending: false })
      
      const allProducts = data || []
      setProducts(allProducts)

      // ດຶງລາຍຊື່ game_name ແບບບໍ່ຊ້ຳກັນມາເຮັດເປັນໝວດໝູ່ (ເຊັ່ນ Blox Fruit, Grow a garden)
      const uniqueCategories: string[] = Array.from(
        new Set(allProducts.map((p) => p.game_name).filter(Boolean))
      )
      setCategories(uniqueCategories)
      
      setLoading(false)
    }
    load()
  }, [])

  // ຟັງຊັນກັ່ນຕອງສິນຄ້າຕາມໝວດໝູ່ທີ່ເລືອກ
  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter(p => p.game_name === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
        <button onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-black text-gray-900 dark:text-white flex-1 tracking-tight">ລະຫັດ / ໄອດີເກມ</span>
        <ThemeToggle />
      </div>

      {/* 🛠️ ເພີ່ມແຖບເລືອກໝວດໝູ່ເກມ (Game Categories Tab) */}
      {!loading && products.length > 0 && categories.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800/60 px-4 py-2.5 flex gap-2 overflow-x-auto scrollbar-none sticky top-[53px] z-10">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-black shrink-0 transition-all ${
              selectedCategory === "all"
                ? "bg-blue-600 text-white shadow-sm scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            🌟 ທັງໝົດ
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-black shrink-0 transition-all ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-sm scale-105"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              🎮 {cat}
            </button>
          ))}
        </div>
      )}

      <div className="p-4 pb-24">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-3 opacity-25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="font-bold text-xs">ຍັງບໍ່ມີສິນຄ້າໃນໝວດໝູ່ນີ້</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map(p => (
              <div key={p.id} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800/60 flex flex-col hover:shadow-md transition-all duration-200">
                {/* ຮູບ */}
                <div className="relative w-full aspect-square">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <p className="text-white font-black text-xs text-center px-2">{p.name}</p>
                    </div>
                  )}
                  {p.stock_left <= 0 && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm">
                        ໝົດແລ້ວ
                      </span>
                    </div>
                  )}
                  {/* Tag ບອກຊື່ເກມນ້ອຍໆຢູ່ມຸມຮູບ */}
                  {p.game_name && (
                    <span className="absolute top-2 left-2 bg-black/50 text-white text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                      {p.game_name}
                    </span>
                  )}
                </div>

                {/* ຂໍ້ມູນ */}
                <div className="p-3 flex flex-col flex-1 space-y-2">
                  <p className="font-black text-xs text-gray-900 dark:text-white leading-tight line-clamp-2 min-h-[32px]">
                    {p.name}
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 font-black text-sm">
                    {p.price?.toLocaleString()} ກີບ
                  </p>

                  {/* Stock */}
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${p.stock_left > 0 ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                    <span className="text-[11px] font-semibold text-gray-400">
                      {p.stock_left > 0 ? `ເຫຼືອ ${p.stock_left} ອັນ` : "ໝົດແລ້ວ"}
                    </span>
                  </div>

                  {/* ປຸ່ມ */}
                  <Link href={`/shop/code/${p.id}`} className="mt-auto pt-1">
                    <button
                      disabled={p.stock_left <= 0}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white font-black py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      ຊື້ສິນຄ້າ
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}