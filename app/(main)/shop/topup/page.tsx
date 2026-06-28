"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function TopupShopPage() {
  const router = useRouter()
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from("games")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
      setGames(data || [])
      setLoading(false)
    }
    load()
  }, [])

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
        <span className="font-black text-gray-900 dark:text-white tracking-tight">ບໍລິການເຕີມເກມ</span>
      </div>

      <div className="p-4 pb-24">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-3 opacity-25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.4.959.4v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
            </svg>
            <p className="font-black text-xs">ຍັງບໍ່ມີລາຍການເກມໃນລະບົບ</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {games.map(g => (
              <Link href={`/shop/topup/${g.id}`} key={g.id}>
                <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800/60 active:scale-95 hover:shadow-md transition-all duration-200 group flex flex-col h-full">
                  {/* ຮູບພາບໜ້າປົກເກມ */}
                  <div className="relative w-full aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {g.icon_url ? (
                      <img src={g.icon_url} alt={g.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <p className="text-white font-black text-center px-3 text-xs">{g.name}</p>
                      </div>
                    )}
                    {/* Gradient ບັງແສງດ້ານລຸ່ມຮູບ */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* ຂໍ້ມູນຊື່ເກມເທິງຮູບ */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 space-y-0.5">
                      <p className="text-white font-black text-xs sm:text-sm truncate leading-tight">
                        {g.name}
                      </p>
                      <p className="text-white/70 text-[10px] uppercase tracking-wider font-bold">
                        {g.input_type?.replace("_", " ")}
                      </p>
                    </div>
                  </div>

                  {/* ປຸ່ມກົດດ້ານລຸ່ມກາດ */}
                  <div className="p-3 mt-auto">
                    <div className="w-full bg-blue-600 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm group-hover:bg-blue-700 transition">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      ເຕີມເລີຍ
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}