"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useParams } from "next/navigation"

export default function CodeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [product, setProduct] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [qty, setQty] = useState(1)

  // ຟັງຊັນສຳລັບໂຫຼດຂໍ້ມູນສິນຄ້າແບບ Join ກັບ Table games ເພື່ອຄວາມຖືກຕ້ອງຂອງຂໍ້ມູນ
  async function loadProductData(supabase: any) {
    const { data } = await supabase
      .from("products")
      .select(`
        *,
        games (
          name,
          icon_url
        )
      `)
      .eq("id", params.id)
      .single()
    return data
  }

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [prof, prodData] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        loadProductData(supabase)
      ])

      setProfile(prof.data)
      setProduct(prodData)
      setLoading(false)
    }
    load()
  }, [])

  async function handleBuy() {
    setError("")
    if (profile.balance < product.price * qty)
      return setError(`ຍອດເງິນບໍ່ພໍ (ມີ ${profile.balance?.toLocaleString()} ກີບ)`)
    if (product.stock_left < qty)
      return setError("ສິນຄ້າບໍ່ພໍ")

    setBuying(true)
    const res = await fetch("/api/shop/buy-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: product.id,
        qty,
      })
    })
    const result = await res.json()

    if (!res.ok || !result.success) {
      setBuying(false)
      return setError(result.error || "ຊື້ບໍ່ສຳເລັດ")
    }

    setBuying(false)
    setSuccess(true)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <p className="text-gray-400 font-bold text-xs">ບໍ່ພົບສິນຄ້າ</p>
    </div>
  )

  // ດຶງຊື່ເກມມາຈາກ table games ທີ່ join ມາ (ຖ້າບໍ່ມີໃຫ້ໃຊ້ game_name ຕົວເກົ່າໄປກ່ອນ)
  const displayGameName = product.games?.name || product.game_name

  if (success) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl text-center space-y-5 border border-gray-100 dark:border-gray-800">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">ຊື້ສຳເລັດ!</h2>
          <p className="text-gray-400 text-xs mt-1">
            ທ່ານໄດ້ຊື້ <span className="font-bold text-gray-700 dark:text-gray-200">{product.name}</span> x{qty}
          </p>
          <p className="text-blue-600 dark:text-blue-400 font-black text-xl mt-1.5">
            {(product.price * qty).toLocaleString()} ກີບ
          </p>
        </div>

        <p className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 font-semibold">
          ສາມາດຮັບລະຫັດ ຫຼື ໄອດີ ໄດ້ໃນໜ້າ <span className="font-black text-blue-600">ປະຫວັດ</span>
        </p>

        <div className="space-y-3">
          <button
            onClick={() => router.push("/history")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-2xl transition active:scale-95 text-xs shadow-md shadow-blue-500/10"
          >
            ເບິ່ງປະຫວັດການຊື້
          </button>
          <button
            onClick={async () => {
              setSuccess(false)
              setQty(1)
              setError("")
              const supabase = createClient()
              const updatedProd = await loadProductData(supabase)
              if (updatedProd) setProduct(updatedProd)
            }}
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-black py-3 rounded-2xl transition active:scale-95 text-xs"
          >
            ຕົກລົງ
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-52 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <button onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-black text-gray-900 dark:text-white flex-1 ml-2 truncate tracking-tight">{product.name}</span>
        <span className="text-xs font-black bg-blue-50 dark:bg-blue-950/45 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-900/40">
          💰 {profile?.balance?.toLocaleString()} ກີບ
        </span>
      </div>

      <div className="p-4 space-y-4 max-w-md mx-auto">
        {/* ຮູບສິນຄ້າ */}
        <div className="flex justify-center pt-2">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name}
              className="w-52 h-52 object-cover rounded-3xl shadow-md border border-white dark:border-gray-800" />
          ) : (
            <div className="w-52 h-52 bg-gradient-to-br from-blue-500 to-violet-600 rounded-3xl shadow-md flex items-center justify-center">
              <p className="text-white font-black text-center px-4 text-xs">{product.name}</p>
            </div>
          )}
        </div>

        {/* ຊື່ + ໝວດໝູ່ + ລາຄາ */}
        <div className="space-y-1.5 text-center">
          {displayGameName && (
            <span className="inline-block bg-gray-200/60 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-black px-2.5 py-0.5 rounded-md">
              🎮 ໝວດໝູ່: {displayGameName}
            </span>
          )}
          <h1 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{product.name}</h1>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {product.price?.toLocaleString()} ກີບ
          </p>
        </div>

        {/* ລາຍລະອຽດ */}
        {product.description && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800/60 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <p className="font-black text-xs text-gray-700 dark:text-gray-300">ລາຍລະອຽດສິນຄ້າ</p>
            </div>
            <div className="p-4 space-y-2">
              {product.description.split("\n").map((line: string, i: number) => (
                line.trim() ? (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">{line}</p>
                  </div>
                ) : null
              ))}
            </div>
          </div>
        )}

        {/* ເለືອກຈຳນວນ */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
          <div>
            <p className="font-black text-xs text-gray-700 dark:text-gray-300">ຈຳນວນທີ່ຕ້ອງການຊື້</p>
            <p className="text-[11px] text-gray-400 font-semibold mt-0.5">ຄົງເຫຼືອໃນຄັງ: {product.stock_left} ອັນ</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-black text-base text-gray-700 dark:text-gray-300 active:scale-95 transition">
              -
            </button>
            <span className="text-base font-black text-gray-900 dark:text-white w-6 text-center">{qty}</span>
            <button
              onClick={() => setQty(Math.min(product.stock_left, qty + 1))}
              className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-black text-base text-gray-700 dark:text-gray-300 active:scale-95 transition">
              +
            </button>
          </div>
        </div>

        {/* ບັດສະຫຼຸບລາຄາ */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800/60 flex justify-between items-center">
          <div className="space-y-0.5">
            <span className="text-[11px] text-gray-400 font-bold block">ຍອດລວມທັງໝົດ</span>
            <span className="text-xl font-black text-blue-600 dark:text-blue-400">
              {(product.price * qty).toLocaleString()} ກີບ
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${product.stock_left > 0 ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
            <span className="text-[11px] font-bold text-gray-400">
              {product.stock_left > 0 ? "ພ້ອມສົ່ງທັນທີ" : "ໝົດແລ້ວ"}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/40 rounded-xl p-3">
            <p className="text-rose-500 text-xs font-black text-center">{error}</p>
          </div>
        )}
      </div>

      {/* ປຸ່ມກົດຊື້ດ້ານລຸ່ມ */}
      <div className="fixed left-0 right-0 bottom-[calc(6.75rem+env(safe-area-inset-bottom))] z-30 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4 shadow-[0_-10px_30px_rgba(15,23,42,0.06)]">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleBuy}
            disabled={buying || product.stock_left <= 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white font-black py-3.5 rounded-2xl transition disabled:opacity-50 shadow-lg shadow-blue-500/25 active:scale-95 flex items-center justify-center gap-2 text-xs"
          >
            {buying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ກຳລັງກວດສອບ...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {product.stock_left <= 0 ? "ສິນค้าໝົດຊົ່ວຄາວ" : `ຢືນຢັນການຊື້ (${(product.price * qty).toLocaleString()} ກີບ)`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}