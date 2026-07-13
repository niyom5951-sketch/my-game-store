"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"

export default function OrderCheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get("id") // ດຶງ ID ສິນຄ້າຈາກ URL

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // 🎯 States ໃໝ່ສຳລັບກອກຂໍ້ມູນ ແລະ ເກັບຈຳນວນ
  const [characterName, setCharacterName] = useState("")
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (!productId) {
      router.push("/shop")
      return
    }

    async function loadProduct() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single()

      if (error || !data) {
        alert("ບໍ່ພົບຂໍ້ມູນບໍລິການນີ້")
        router.push("/shop")
      } else {
        setProduct(data)
      }
      setLoading(false)
    }

    loadProduct()
  }, [productId])

  // ຟັງກັນເພີ່ມ-ຫຼຸດຈຳນວນ
  const decreaseQty = () => {
    if (quantity > 1) setQuantity(prev => prev - 1)
  }
  const increaseQty = () => {
    setQuantity(prev => prev + 1)
  }

  // ຄຳນວນລາຄາລວມ (ລາຄາ × ຈຳນວນ)
  const totalPrice = product ? product.price * quantity : 0

  async function handleSubmitOrder(e: React.FormEvent) {
    e.preventDefault()
    if (!product || submitting) return

    if (!characterName.trim()) {
      alert("ກະລຸນາກອກຊື່ໃນເກມຂອງທ່ານກ່ອນ!")
      return
    }

    setSubmitting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // ຕຽມຂໍ້ມູນບັນທຶກລົງ game_order
    const orderPayload = {
      user_id: user?.id || null,
      product_id: product.id,
      product_name: product.name,
      game_name: product.game_name || "Game Service", 
      game_character_name: characterName, // 🎯 ເກັບຊື່ໃນເກມທີ່ລູກຄ້າກອກ
      price: product.price, 
      quantity: quantity, 
      total_price: totalPrice, 
      category: "order",
      status: "pending",
      created_at: new Date().toISOString()
    }

    const { error } = await supabase.from("game_order").insert(orderPayload)

    setSubmitting(false)
    if (error) {
      alert("ເກີດຂໍ້ຜິດພາດ: " + error.message)
    } else {
      alert("🎉 ສັ່ງຊື້ບໍລິການສຳເລັດແລ້ວ! ກະລຸນາລໍຖ້າແອດມິນດຳເນີນການ.")
      router.push("/history") 
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 pb-12">
      <div className="max-w-xl mx-auto space-y-5">
        
        {/* Header ສ່ວນຫົວ */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => router.back()} 
            className="w-10 h-10 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center border border-gray-100 dark:border-gray-800 shadow-sm active:scale-95 transition"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">ກວດສອບການສັ່ງຊື້</h1>
            <p className="text-xs text-gray-400">ຢືນຢັນລາຍການ ແລະ ກອກຂໍ້ມູນຂອງທ່ານໃຫ້ຖືກຕ້ອງ</p>
          </div>
        </div>

        {/* 📦 ຟອມຫຼັກ */}
        <form onSubmit={handleSubmitOrder} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
          
          {/* ສ່ວນສະແດງ ຮູບພາບ, ຊື່ເກມ, ແລະ ລາຍລະອຽດສິນຄ້າ */}
          <div className="space-y-4 border-b border-gray-100 dark:border-gray-800/60 pb-5">
            
            {/* 📸 ສະແດງຮູບພາບສິນຄ້າ */}
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-3xl font-bold">📦</div>
              )}
            </div>

            {/* 🏷️ ຊື່ເກມ ແລະ ຊື່ບໍລິການ */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-950/45 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {product.game_name || "🎮 GAME STORE"}
              </span>
              <h2 className="font-bold text-xl text-gray-900 dark:text-white pt-1.5 leading-tight">
                {product.name}
              </h2>
              <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400 pt-0.5">
                ລາຄາ: {product.price?.toLocaleString()} ກີບ / ຊິ້ນ
              </p>
            </div>

            {/* 📝 ສະແດງລາຍລະອຽດສິນຄ້າ */}
            {product.description && (
              <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-3.5 border border-gray-100 dark:border-gray-800/50">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">📋 ລາຍລະອຽດບໍລິການ:</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* 🎯 2. 📝 ເພີ່ມຊ່ອງກອກ "ຊື່ໃນເກມຂອງທ່ານ" ຢູ່ບ່ອນນີ້ */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              👤 ຊື່ໃນເກມຂອງທ່ານ <span className="text-red-500">*</span>
            </label>
            <input 
              required
              type="text"
              placeholder="ກອກຊື່ຕົວລະຄອນ ຫຼື ຊື່ໃນເກມຂອງທ່ານ..." 
              value={characterName}
              onChange={e => setCharacterName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-white transition font-medium" 
            />
          </div>

          {/* 🔢 ສ່ວນເລືອກຈຳນວນ (- +) */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-800/60">
            <div>
              <p className="font-bold text-sm text-gray-800 dark:text-gray-200">ເລືອກຈຳນວນ</p>
              <p className="text-xs text-gray-400">ກຳນົດຈຳນວນທີ່ຕ້ອງການຊື້</p>
            </div>
            
            {/* ປຸ່ມກົດ - + */}
            <div className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1.5 rounded-xl shadow-sm">
              <button
                type="button"
                onClick={decreaseQty}
                className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center font-extrabold text-gray-600 dark:text-gray-400 transition active:scale-90"
              >
                —
              </button>
              <span className="w-10 text-center font-bold text-sm text-gray-900 dark:text-white select-none">
                {quantity}
              </span>
              <button
                type="button"
                onClick={increaseQty}
                className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center font-extrabold text-gray-600 dark:text-gray-400 transition active:scale-90"
              >
                +
              </button>
            </div>
          </div>

          {/* 💵 ສະຫຼຸບລາຄາ */}
          <div className="flex items-center justify-between border-t border-dashed border-gray-200 dark:border-gray-800 pt-4 px-1">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">ຍອດລວມທີ່ຕ້ອງຊຳລະ:</span>
            <span className="text-xl font-black text-blue-600 dark:text-blue-400">
              {totalPrice.toLocaleString()} ກີບ
            </span>
          </div>

          {/* 🚀 ປຸ່ມຢືນຢັນການຊື້ */}
          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl text-sm shadow-md shadow-blue-500/10 active:scale-[0.99] transition flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>ກຳລັງດຳເນີນການ...</span>
              </>
            ) : (
              <>
                <span>🛒 ຢືນຢັນການຊື້ — {totalPrice.toLocaleString()} ກີບ</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  )
}