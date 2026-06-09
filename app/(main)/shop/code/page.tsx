"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ThemeToggle from "@/components/ui/ThemeToggle"

export default function CodeShopPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
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
      setProducts(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-bold text-gray-900 dark:text-white flex-1">ລະຫັດ / ໄອດີເກມ</span>
        <ThemeToggle />
      </div>

      <div className="p-4 pb-24">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="font-medium">ຍັງບໍ່ມີສິນຄ້າ</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
                {/* ຮູບ */}
                <div className="relative w-full aspect-square">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                      <p className="text-white font-bold text-sm text-center px-2">{p.name}</p>
                    </div>
                  )}
                  {p.stock_left <= 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        ໝົດແລ້ວ
                      </span>
                    </div>
                  )}
                </div>

                {/* ຂໍ້ມູນ */}
                <div className="p-3 flex flex-col flex-1 space-y-2">
                  <p className="font-bold text-sm text-gray-900 dark:text-white leading-tight line-clamp-2">
                    {p.name}
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 font-bold text-base">
                    {p.price?.toLocaleString()} ກີບ
                  </p>

                  {/* Stock */}
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${p.stock_left > 0 ? "bg-green-500" : "bg-red-500"}`} />
                    <span className="text-xs text-gray-400">
                      {p.stock_left > 0 ? `ເຫຼືອ ${p.stock_left} ອັນ` : "ໝົດແລ້ວ"}
                    </span>
                  </div>

                  {/* ປຸ່ມ */}
                  <Link href={`/shop/code/${p.id}`} className="mt-auto">
                    <button
                      disabled={p.stock_left <= 0}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 text-white font-bold py-2 rounded-xl text-sm transition flex items-center justify-center gap-2 active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
