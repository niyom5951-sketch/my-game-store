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

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [prof, prod] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("products").select("*").eq("id", params.id).single()
      ])

      setProfile(prof.data)
      setProduct(prod.data)
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
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">ບໍ່ພົບສິນຄ້າ</p>
    </div>
  )

  // ສຳເລັດ
  if (success) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl text-center space-y-5">
        {/* Icon */}
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">ຊື້ສຳເລັດ!</h2>
          <p className="text-gray-400 text-sm mt-1">
            ທ່ານໄດ້ຊື້ <span className="font-semibold text-gray-700 dark:text-gray-200">{product.name}</span> x{qty}
          </p>
          <p className="text-blue-600 font-bold text-lg mt-1">
            {(product.price * qty).toLocaleString()} ກີບ
          </p>
        </div>

        <p className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
          ສາມາດເບິ່ງລະຫັດໄດ້ໃນໜ້າ <span className="font-semibold text-blue-600">ປະຫວັດ</span>
        </p>

        <div className="space-y-3">
          <button
            onClick={() => router.push("/history")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition active:scale-95"
          >
            ເບິ່ງປະຫວັດ
          </button>
          <button
            onClick={() => {
              setSuccess(false)
              setQty(1)
              setError("")
              // reload product ໃໝ່
              const supabase = createClient()
              supabase.from("products").select("*").eq("id", params.id).single()
                .then(({ data }) => setProduct(data))
            }}
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-2xl transition active:scale-95"
          >
            ຕົກລົງ
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <button onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-bold text-gray-900 dark:text-white flex-1 ml-2 truncate">{product.name}</span>
        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 ml-2 whitespace-nowrap">
          {profile?.balance?.toLocaleString()} ກີບ
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* ຮູບ */}
        <div className="flex justify-center pt-2">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name}
              className="w-48 h-48 object-cover rounded-2xl shadow-lg" />
          ) : (
            <div className="w-48 h-48 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl shadow-lg flex items-center justify-center">
              <p className="text-white font-bold text-center px-4">{product.name}</p>
            </div>
          )}
        </div>

        {/* ຊື່ + ລາຄາ */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {product.price?.toLocaleString()} ກີບ
          </p>
        </div>

        {/* ລາຍລະອຽດ */}
        {product.description && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <p className="font-bold text-sm text-gray-700 dark:text-gray-300">ລາຍລະອຽດ</p>
            </div>
            <div className="p-4 space-y-2">
              {product.description.split("\n").map((line: string, i: number) => (
                line.trim() ? (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{line}</p>
                  </div>
                ) : null
              ))}
            </div>
          </div>
        )}

        {/* ຈຳນວນ */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <p className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-3">ຈຳນວນທີ່ຊື້</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-lg text-gray-700 dark:text-gray-300 active:scale-95 transition">
              -
            </button>
            <span className="text-xl font-bold text-gray-900 dark:text-white w-8 text-center">{qty}</span>
            <button
              onClick={() => setQty(Math.min(product.stock_left, qty + 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-lg text-gray-700 dark:text-gray-300 active:scale-95 transition">
              +
            </button>
          </div>
        </div>

        {/* ສະຫຼຸບ */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">ລວມທັງໝົດ</span>
            <span className="text-sm text-gray-400">ສິນຄ້າຄົງເຫຼືອ {product.stock_left} ອັນ</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {(product.price * qty).toLocaleString()} ກີບ
            </span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${product.stock_left > 0 ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-xs text-gray-400">
                {product.stock_left > 0 ? "ພ້ອມຂາຍ" : "ໝົດແລ້ວ"}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-3">
            <p className="text-red-500 text-sm text-center">{error}</p>
          </div>
        )}
      </div>

      {/* ປຸ່ມຊື້ */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4">
        <button
          onClick={handleBuy}
          disabled={buying || product.stock_left <= 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 text-white font-bold py-4 rounded-2xl transition disabled:opacity-50 shadow-lg shadow-blue-500/25 active:scale-95 flex items-center justify-center gap-2"
        >
          {buying ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ກຳລັງດຳເນີນການ...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {product.stock_left <= 0 ? "ໝົດແລ້ວ" : `ຊື້ ${(product.price * qty).toLocaleString()} ກີບ`}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
