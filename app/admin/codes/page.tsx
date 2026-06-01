"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function AdminCodesPage() {
  const [products, setProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [codes, setCodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"unused" | "used">("unused")

  async function loadProducts() {
    const supabase = createClient()
    const { data } = await supabase
      .from("products")
      .select("*, game_codes(count)")
      .in("category", ["code", "account"])
      .order("created_at", { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  async function loadCodes(productId: string) {
    const supabase = createClient()
    const { data } = await supabase
      .from("game_codes")
      .select("*, profiles(username)")
      .eq("product_id", productId)
      .eq("is_used", tab === "used")
      .order("created_at", { ascending: false })
    setCodes(data || [])
  }

  useEffect(() => { loadProducts() }, [])

  useEffect(() => {
    if (selectedProduct) loadCodes(selectedProduct.id)
  }, [selectedProduct, tab])

  async function handleDelete(id: string) {
    if (!confirm("ລຶບລະຫັດນີ້?")) return
    const supabase = createClient()
    await supabase.from("game_codes").delete().eq("id", id)
    loadCodes(selectedProduct.id)
    loadProducts()
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleString("lo-LA", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ຈັດການ Stock ລະຫັດ</h1>

      {!selectedProduct ? (
        // ລາຍການ Products
        loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-400">
            ຍັງບໍ່ມີສິນຄ້າປະເພດລະຫັດ
          </div>
        ) : (
          <div className="space-y-3">
            {products.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 text-left hover:bg-gray-50"
              >
                {p.image_url ? (
                  <img src={p.image_url} className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                    {p.category === "account" ? "👤" : "🔑"}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-bold">{p.name}</p>
                  <p className="text-sm text-gray-400">{p.game_name}</p>
                  <p className="text-blue-600 font-bold text-sm">
                    {p.price?.toLocaleString()} ກີບ
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${p.stock_left <= 0 ? "text-red-500" : "text-green-600"}`}>
                    {p.stock_left}
                  </p>
                  <p className="text-xs text-gray-400">ເຫຼືອ</p>
                </div>
                <span className="text-gray-400">›</span>
              </button>
            ))}
          </div>
        )
      ) : (
        // ລາຍການ Codes
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedProduct(null)}
              className="text-gray-500 font-bold"
            >
              ← ກັບຄືນ
            </button>
            <div>
              <p className="font-bold">{selectedProduct.name}</p>
              <p className="text-sm text-gray-400">
                ເຫຼືອ {selectedProduct.stock_left}/{selectedProduct.stock_total}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setTab("unused")}
              className={`px-4 py-2 rounded-xl font-bold text-sm ${
                tab === "unused" ? "bg-green-500 text-white" : "bg-white text-gray-500"
              }`}
            >
              ✅ ຍັງບໍ່ໄດ້ໃຊ້
            </button>
            <button
              onClick={() => setTab("used")}
              className={`px-4 py-2 rounded-xl font-bold text-sm ${
                tab === "used" ? "bg-gray-500 text-white" : "bg-white text-gray-500"
              }`}
            >
              ✔️ ໃຊ້ແລ້ວ
            </button>
          </div>

          {/* Codes List */}
          {codes.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center text-gray-400">
              ບໍ່ມີລະຫັດ
            </div>
          ) : (
            <div className="space-y-2">
              {codes.map((c, i) => (
                <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">#{i + 1}</span>
                        {c.type === "account" ? (
                          <div className="space-y-1">
                            <p className="font-mono text-sm font-bold">
                              👤 {c.acc_username}
                            </p>
                            <p className="font-mono text-sm text-gray-500">
                              🔒 {c.acc_password}
                            </p>
                          </div>
                        ) : (
                          <p className="font-mono font-bold">{c.code}</p>
                        )}
                      </div>
                      {c.is_used && (
                        <p className="text-xs text-gray-400 mt-1">
                          ຊື້ໂດຍ: {c.profiles?.username} • {formatDate(c.used_at)}
                        </p>
                      )}
                    </div>
                    {!c.is_used && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-xs px-2 py-1 bg-red-50 text-red-500 rounded-lg font-bold ml-2"
                      >
                        ລຶບ
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}