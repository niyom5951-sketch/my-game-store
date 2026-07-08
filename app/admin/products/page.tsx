"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function AdminProductsPage() {
  const [tab, setTab] = useState<"topup" | "code">("topup")
  const [games, setGames] = useState<any[]>([])
  const [selectedGame, setSelectedGame] = useState<any>(null)
  const [packages, setPackages] = useState<any[]>([])

  const [codeCategories, setCodeCategories] = useState<any[]>([])
  const [selectedCodeCategory, setSelectedCodeCategory] = useState<any>(null)
  const [codeProducts, setCodeProducts] = useState<any[]>([])

  const [loading, setLoading] = useState(true)
  const [codeCatLoading, setCodeCatLoading] = useState(true)

  // Modals
  const [showGameForm, setShowGameForm] = useState(false)
  const [showPkgForm, setShowPkgForm] = useState(false)
  const [showCodeCategoryForm, setShowCodeCategoryForm] = useState(false)
  const [showCodeForm, setShowCodeForm] = useState(false)
  const [showCodeStockForm, setShowCodeStockForm] = useState(false)
  const [editingGame, setEditingGame] = useState<any>(null)
  const [editingPkg, setEditingPkg] = useState<any>(null)
  const [editingCodeCategory, setEditingCodeCategory] = useState<any>(null)
  const [editingCode, setEditingCode] = useState<any>(null)
  const [selectedCodeProduct, setSelectedCodeProduct] = useState<any>(null)

  const [gameForm, setGameForm] = useState({ name: "", icon_url: "", input_type: "uid", sort_order: "0", is_active: true })
  const [pkgForm, setPkgForm] = useState({ name: "", price: "", image_url: "", is_active: true })
  const [codeCategoryForm, setCodeCategoryForm] = useState({ name: "", icon_url: "" })
  const [codeForm, setCodeForm] = useState({ name: "", price: "", image_url: "", description: "", is_active: true })
  const [codeLines, setCodeLines] = useState("")
  const [saving, setSaving] = useState(false)
  const [codeCatError, setCodeCatError] = useState("")
  const [codeProductError, setCodeProductError] = useState("")

  async function loadGames() {
    const supabase = createClient()
    const { data } = await supabase.from("games").select("*").order("sort_order")
    setGames(data || [])
    setLoading(false)
  }

  async function loadPackages(gameId: string) {
    const supabase = createClient()
    const { data } = await supabase.from("products").select("*").eq("games_id", gameId).eq("category", "topup").order("price")
    setPackages(data || [])
  }

  async function loadCodeCategories() {
    const supabase = createClient()
    const { data, error } = await supabase.from("code_categories").select("*").order("sort_order")
    if (error) { console.error("loadCodeCategories:", error); setCodeCatError(error.message) }
    else setCodeCatError("")
    setCodeCategories(data || [])
    setCodeCatLoading(false)
  }

  async function loadCodeProducts(categoryId: string) {
    const supabase = createClient()
    const { data, error } = await supabase.from("products").select("*").eq("code_category_id", categoryId).order("created_at", { ascending: false })
    if (error) { console.error("loadCodeProducts:", error); setCodeProductError(error.message) }
    else setCodeProductError("")
    setCodeProducts(data || [])
  }

  useEffect(() => {
    loadGames()
    loadCodeCategories()
  }, [])

  // ==================== GAME HANDLERS ====================
  async function handleSaveGame() {
    setSaving(true)
    const supabase = createClient()
    const payload = {
      name: gameForm.name,
      icon_url: gameForm.icon_url || null,
      input_type: gameForm.input_type,
      sort_order: parseInt(gameForm.sort_order),
      is_active: gameForm.is_active
    }
    if (editingGame) {
      await supabase.from("games").update(payload).eq("id", editingGame.id)
    } else {
      await supabase.from("games").insert(payload)
    }
    setSaving(false)
    setShowGameForm(false)
    setEditingGame(null)
    setGameForm({ name: "", icon_url: "", input_type: "uid", sort_order: "0", is_active: true })
    loadGames()
  }

  async function handleDeleteGame(id: string) {
    if (!confirm("ລຶບເກມນີ້ ລວມທັງແພັກເກດທັງໝົດ?")) return
    const supabase = createClient()
    await supabase.from("products").delete().eq("games_id", id)
    await supabase.from("games").delete().eq("id", id)
    setSelectedGame(null)
    loadGames()
  }

  // ==================== PACKAGE HANDLERS ====================
  async function handleSavePkg() {
    if (!pkgForm.name || !pkgForm.price) return
    setSaving(true)
    const supabase = createClient()
    const payload = {
      name: pkgForm.name,
      game_name: selectedGame.name,
      games_id: selectedGame.id,
      category: "topup",
      input_type: selectedGame.input_type,
      price: parseFloat(pkgForm.price),
      image_url: pkgForm.image_url || null,
      is_active: pkgForm.is_active,
      stock_total: 999,
      stock_left: 999
    }
    if (editingPkg) {
      await supabase.from("products").update(payload).eq("id", editingPkg.id)
    } else {
      await supabase.from("products").insert(payload)
    }
    setSaving(false)
    setShowPkgForm(false)
    setEditingPkg(null)
    setPkgForm({ name: "", price: "", image_url: "", is_active: true })
    loadPackages(selectedGame.id)
  }

  async function handleDeletePkg(id: string) {
    if (!confirm("ລຶບແພັກເກດນີ້?")) return
    const supabase = createClient()
    await supabase.from("products").delete().eq("id", id)
    loadPackages(selectedGame.id)
  }

  // ==================== CODE CATEGORY HANDLERS ====================
  async function handleSaveCodeCategory() {
    if (!codeCategoryForm.name) return
    setSaving(true)
    const supabase = createClient()
    const payload: any = {
      name: codeCategoryForm.name,
      icon_url: codeCategoryForm.icon_url || null,
    }
    let error
    if (editingCodeCategory) {
      const res = await supabase.from("code_categories").update(payload).eq("id", editingCodeCategory.id)
      error = res.error
    } else {
      payload.is_active = true
      payload.sort_order = codeCategories.length
      const res = await supabase.from("code_categories").insert(payload)
      error = res.error
    }
    setSaving(false)
    if (error) {
      console.error("handleSaveCodeCategory:", error)
      alert("ບັນທຶກໝວດໝູ່ບໍ່ສຳເລັດ:\n" + error.message)
      return
    }
    setShowCodeCategoryForm(false)
    setEditingCodeCategory(null)
    setCodeCategoryForm({ name: "", icon_url: "" })
    loadCodeCategories()
  }

  async function handleDeleteCodeCategory(id: string) {
    if (!confirm("ລຶບໝວດໝູ່ນີ້ ລວມທັງສິນຄ້າທັງໝົດຂ້າງໃນ?")) return
    const supabase = createClient()
    const { data: prods, error: selErr } = await supabase.from("products").select("id").eq("code_category_id", id)
    if (selErr) { alert("ລຶບບໍ່ສຳເລັດ:\n" + selErr.message); return }
    if (prods && prods.length) {
      const ids = prods.map(p => p.id)
      await supabase.from("game_codes").delete().in("product_id", ids)
      await supabase.from("products").delete().in("id", ids)
    }
    const { error } = await supabase.from("code_categories").delete().eq("id", id)
    if (error) { alert("ລຶບໝວດໝູ່ບໍ່ສຳເລັດ:\n" + error.message); return }
    setSelectedCodeCategory(null)
    loadCodeCategories()
  }

  // ==================== CODE PRODUCT HANDLERS ====================
  async function handleSaveCode() {
    if (!codeForm.name || !codeForm.price) return
    setSaving(true)
    const supabase = createClient()
    const payload: any = {
      name: codeForm.name,
      game_name: codeForm.name,
      category: "account",
      code_category_id: selectedCodeCategory.id,
      price: parseFloat(codeForm.price),
      image_url: codeForm.image_url || null,
      description: codeForm.description || null,
      is_active: codeForm.is_active,
    }
    let error
    if (editingCode) {
      const res = await supabase.from("products").update(payload).eq("id", editingCode.id)
      error = res.error
    } else {
      payload.stock_total = 0
      payload.stock_left = 0
      const res = await supabase.from("products").insert(payload)
      error = res.error
    }
    setSaving(false)
    if (error) {
      console.error("handleSaveCode:", error)
      alert("ບັນທຶກສິນຄ້າບໍ່ສຳເລັດ:\n" + error.message)
      return
    }
    setShowCodeForm(false)
    setEditingCode(null)
    setCodeForm({ name: "", price: "", image_url: "", description: "", is_active: true })
    loadCodeProducts(selectedCodeCategory.id)
  }

  async function handleDeleteCode(id: string) {
    if (!confirm("ລຶບສິນຄ້ານີ້?")) return
    const supabase = createClient()
    await supabase.from("game_codes").delete().eq("product_id", id)
    const { error } = await supabase.from("products").delete().eq("id", id)
    if (error) { alert("ລຶບສິນຄ້າບໍ່ສຳເລັດ:\n" + error.message); return }
    loadCodeProducts(selectedCodeCategory.id)
  }

  async function handleAddCodeStock() {
    if (!codeLines.trim()) return
    setSaving(true)
    const supabase = createClient()
    const lines = codeLines.trim().split("\n").filter(l => l.trim())
    const codes = lines.map((line, i) => {
      const parts = line.trim().split(":")
      return {
        product_id: selectedCodeProduct.id,
        type: "account",
        acc_username: parts[0]?.trim(),
        acc_password: parts.slice(1).join(":").trim(),
        is_used: false,
        sort_order: i
      }
    })
    const { error: insertErr } = await supabase.from("game_codes").insert(codes)
    if (insertErr) {
      setSaving(false)
      alert("ເພີ່ມ Stock ບໍ່ສຳເລັດ:\n" + insertErr.message)
      return
    }
    const { error: updateErr } = await supabase.from("products").update({
      stock_total: (selectedCodeProduct.stock_total || 0) + codes.length,
      stock_left: (selectedCodeProduct.stock_left || 0) + codes.length
    }).eq("id", selectedCodeProduct.id)
    setSaving(false)
    if (updateErr) {
      alert("ອັບເດດ Stock ບໍ່ສຳເລັດ:\n" + updateErr.message)
      return
    }
    setShowCodeStockForm(false)
    setCodeLines("")
    loadCodeProducts(selectedCodeCategory.id)
  }

  async function handleToggle(table: string, id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from(table).update({ is_active: !current }).eq("id", id)
    if (table === "games") loadGames()
    else if (table === "code_categories") loadCodeCategories()
    else if (selectedGame) loadPackages(selectedGame.id)
    else if (selectedCodeCategory) loadCodeProducts(selectedCodeCategory.id)
  }

  const inputTypeLabel = (t: string) => {
    if (t === "uid") return "UID ເທົ່ານັ້ນ"
    if (t === "uid_zone") return "UID + Zone ID"
    if (t === "username_password") return "Username + Password"
    return t
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ຈັດການສິນຄ້າ</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => { setTab("topup"); setSelectedGame(null) }}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition ${tab === "topup" ? "bg-blue-600 text-white" : "bg-white text-gray-500 border"}`}>
          🎮 ເຕີມເກມ
        </button>
        <button onClick={() => { setTab("code"); setSelectedCodeCategory(null) }}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition ${tab === "code" ? "bg-blue-600 text-white" : "bg-white text-gray-500 border"}`}>
          🔑 ລະຫັດເກມ
        </button>
      </div>

      {/* ==================== TAB TOPUP ==================== */}
      {tab === "topup" && (
        <div className="space-y-4">
          {!selectedGame ? (
            // ລາຍການເກມ
            <>
              <div className="flex justify-between items-center">
                <p className="font-bold text-gray-700">ເກມທັງໝົດ</p>
                <button onClick={() => { setEditingGame(null); setGameForm({ name: "", icon_url: "", input_type: "uid", sort_order: "0", is_active: true }); setShowGameForm(true) }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold">
                  + ເພີ່ມເກມ
                </button>
              </div>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {games.map(g => (
                    <div key={g.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border">
                      <div className="relative h-32 cursor-pointer" onClick={() => { setSelectedGame(g); loadPackages(g.id) }}>
                        {g.icon_url ? (
                          <img src={g.icon_url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                            <p className="text-white font-bold">{g.name}</p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-2 left-3">
                          <p className="text-white font-bold text-sm">{g.name}</p>
                          <p className="text-white/70 text-xs">{inputTypeLabel(g.input_type)}</p>
                        </div>
                      </div>
                      <div className="p-3 flex gap-2">
                        <button onClick={() => handleToggle("games", g.id, g.is_active)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${g.is_active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                          {g.is_active ? "ເປີດ" : "ປິດ"}
                        </button>
                        <button onClick={() => { setEditingGame(g); setGameForm({ name: g.name, icon_url: g.icon_url || "", input_type: g.input_type, sort_order: g.sort_order?.toString(), is_active: g.is_active }); setShowGameForm(true) }}
                          className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600">
                          ແກ້ໄຂ
                        </button>
                        <button onClick={() => handleDeleteGame(g.id)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-500">
                          ລຶບ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // ລາຍການແພັກເກດຂອງເກມ
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedGame(null)} className="text-gray-500 hover:text-gray-700">
                    ← ກັບຄືນ
                  </button>
                  <p className="font-bold text-lg">{selectedGame.name}</p>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-bold">
                    {inputTypeLabel(selectedGame.input_type)}
                  </span>
                </div>
                <button onClick={() => { setEditingPkg(null); setPkgForm({ name: "", price: "", image_url: "", is_active: true }); setShowPkgForm(true) }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold">
                  + ເພີ່ມແພັກເກດ
                </button>
              </div>

              {packages.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center text-gray-400">ຍັງບໍ່ມີແພັກເກດ</div>
              ) : (
                <div className="space-y-3">
                  {packages.map(p => (
                    <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-4">
                      {p.image_url ? (
                        <img src={p.image_url} className="w-12 h-12 rounded-xl object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center">
                          <span className="text-white text-xs font-bold">IMG</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-bold">{p.name}</p>
                        <p className="text-blue-600 font-bold text-sm">{p.price?.toLocaleString()} ກີບ</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleToggle("products", p.id, p.is_active)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold ${p.is_active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                          {p.is_active ? "ເປີດ" : "ປິດ"}
                        </button>
                        <button onClick={() => { setEditingPkg(p); setPkgForm({ name: p.name, price: p.price?.toString(), image_url: p.image_url || "", is_active: p.is_active }); setShowPkgForm(true) }}
                          className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-600">
                          ແກ້ໄຂ
                        </button>
                        <button onClick={() => handleDeletePkg(p.id)}
                          className="px-2 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-500">
                          ລຶບ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ==================== TAB CODE ==================== */}
      {tab === "code" && (
        <div className="space-y-4">
          {!selectedCodeCategory ? (
            // ລາຍການໝວດໝູ່
            <>
              <div className="flex justify-between items-center">
                <p className="font-bold text-gray-700">ໝວດໝູ່ລະຫັດເກມ</p>
                <button onClick={() => { setEditingCodeCategory(null); setCodeCategoryForm({ name: "", icon_url: "" }); setShowCodeCategoryForm(true) }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold">
                  + ເພີ່ມໝວດໝູ່
                </button>
              </div>
              {codeCatError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">
                  ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ: {codeCatError}
                </div>
              )}
              {codeCatLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : codeCategories.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center text-gray-400">ຍັງບໍ່ມີໝວດໝູ່</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {codeCategories.map(c => (
                    <div key={c.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border">
                      <div className="relative h-32 cursor-pointer" onClick={() => { setSelectedCodeCategory(c); loadCodeProducts(c.id) }}>
                        {c.icon_url ? (
                          <img src={c.icon_url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
                            <p className="text-white font-bold">{c.name}</p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-2 left-3">
                          <p className="text-white font-bold text-sm">{c.name}</p>
                        </div>
                      </div>
                      <div className="p-3 flex gap-2">
                        <button onClick={() => handleToggle("code_categories", c.id, c.is_active)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${c.is_active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                          {c.is_active ? "ເປີດ" : "ປິດ"}
                        </button>
                        <button onClick={() => { setEditingCodeCategory(c); setCodeCategoryForm({ name: c.name, icon_url: c.icon_url || "" }); setShowCodeCategoryForm(true) }}
                          className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600">
                          ແກ້ໄຂ
                        </button>
                        <button onClick={() => handleDeleteCodeCategory(c.id)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-500">
                          ລຶບ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // ລາຍການສິນຄ້າໃນໝວດໝູ່
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedCodeCategory(null)} className="text-gray-500 hover:text-gray-700">
                    ← ກັບຄືນ
                  </button>
                  <p className="font-bold text-lg">{selectedCodeCategory.name}</p>
                </div>
                <button onClick={() => { setEditingCode(null); setCodeForm({ name: "", price: "", image_url: "", description: "", is_active: true }); setShowCodeForm(true) }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold">
                  + ເພີ່ມສິນຄ້າ
                </button>
              </div>

              {codeProductError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">
                  ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ: {codeProductError}
                </div>
              )}

              {codeProducts.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center text-gray-400">ຍັງບໍ່ມີສິນຄ້າ</div>
              ) : (
                <div className="space-y-3">
                  {codeProducts.map(p => (
                    <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border">
                      <div className="flex items-center gap-4">
                        {p.image_url ? (
                          <img src={p.image_url} className="w-14 h-14 rounded-xl object-cover" />
                        ) : (
                          <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center">
                            <span className="text-white text-xs font-bold">IMG</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-bold">{p.name}</p>
                          <p className="text-blue-600 font-bold text-sm">{p.price?.toLocaleString()} ກີບ</p>
                          <p className={`text-xs mt-1 ${p.stock_left <= 0 ? "text-red-500" : "text-green-600"}`}>
                            Stock: {p.stock_left}/{p.stock_total}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => handleToggle("products", p.id, p.is_active)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold ${p.is_active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                          {p.is_active ? "ເປີດ" : "ປິດ"}
                        </button>
                        <button onClick={() => { setEditingCode(p); setCodeForm({ name: p.name, price: p.price?.toString(), image_url: p.image_url || "", description: p.description || "", is_active: p.is_active }); setShowCodeForm(true) }}
                          className="flex-1 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-600">
                          ✏️ ແກ້ໄຂ
                        </button>
                        <button onClick={() => { setSelectedCodeProduct(p); setCodeLines(""); setShowCodeStockForm(true) }}
                          className="flex-1 py-2 rounded-xl text-xs font-bold bg-green-50 text-green-600">
                          + Stock
                        </button>
                        <button onClick={() => handleDeleteCode(p.id)}
                          className="flex-1 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-500">
                          🗑️ ລຶບ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ==================== MODALS ==================== */}

      {/* Game Form */}
      {showGameForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="font-bold text-xl">{editingGame ? "ແກ້ໄຂເກມ" : "ເພີ່ມເກມ"}</h2>
            <input placeholder="ຊື່ເກມ *" value={gameForm.name}
              onChange={e => setGameForm({ ...gameForm, name: e.target.value })}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-400" />
            <input placeholder="URL ໄອຄອນ" value={gameForm.icon_url}
              onChange={e => setGameForm({ ...gameForm, icon_url: e.target.value })}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-400" />
            {gameForm.icon_url && (
              <img src={gameForm.icon_url} className="w-20 h-20 rounded-xl object-cover mx-auto" />
            )}
            <div>
              <p className="text-sm font-bold text-gray-500 mb-2">ປະເພດການໃສ່ຂໍ້ມູນ</p>
              <div className="space-y-2">
                {[
                  { value: "uid", label: "UID ເທົ່ານັ້ນ (Free Fire)" },
                  { value: "uid_zone", label: "UID + Zone ID (Mobile Legends)" },
                  { value: "username_password", label: "Username + Password (Roblox)" },
                ].map(opt => (
                  <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer ${gameForm.input_type === opt.value ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
                    <input type="radio" name="input_type" value={opt.value}
                      checked={gameForm.input_type === opt.value}
                      onChange={e => setGameForm({ ...gameForm, input_type: e.target.value })}
                      className="text-blue-600" />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <input placeholder="ລຳດັບ (0, 1, 2...)" type="number" value={gameForm.sort_order}
              onChange={e => setGameForm({ ...gameForm, sort_order: e.target.value })}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-400" />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={gameForm.is_active}
                onChange={e => setGameForm({ ...gameForm, is_active: e.target.checked })} />
              <span className="text-sm">ເປີດໃຊ້ງານ</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShowGameForm(false)}
                className="py-3 rounded-xl bg-gray-100 text-gray-600 font-bold">ຍົກເລີກ</button>
              <button onClick={handleSaveGame} disabled={saving}
                className="py-3 rounded-xl bg-blue-600 text-white font-bold disabled:opacity-50">
                {saving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package Form */}
      {showPkgForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="font-bold text-xl">{editingPkg ? "ແກ້ໄຂແພັກເກດ" : `ເພີ່ມແພັກເກດ — ${selectedGame?.name}`}</h2>
            <input placeholder="ຊື່ສິນຄ້າ * (ເຊັ່ນ: 86 Diamond)" value={pkgForm.name}
              onChange={e => setPkgForm({ ...pkgForm, name: e.target.value })}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-400" />
            <input placeholder="ລາຄາ (ກີບ) *" type="number" value={pkgForm.price}
              onChange={e => setPkgForm({ ...pkgForm, price: e.target.value })}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-400" />
            <input placeholder="URL ຮູບພາບ (ບໍ່ໃສ່ກໍໄດ້)" value={pkgForm.image_url}
              onChange={e => setPkgForm({ ...pkgForm, image_url: e.target.value })}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-400" />
            {pkgForm.image_url && (
              <img src={pkgForm.image_url} className="w-20 h-20 rounded-xl object-cover mx-auto" />
            )}
            <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700">
              ປະເພດ: <strong>{inputTypeLabel(selectedGame?.input_type)}</strong>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={pkgForm.is_active}
                onChange={e => setPkgForm({ ...pkgForm, is_active: e.target.checked })} />
              <span className="text-sm">ເປີດໃຊ້ງານ</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShowPkgForm(false)}
                className="py-3 rounded-xl bg-gray-100 text-gray-600 font-bold">ຍົກເລີກ</button>
              <button onClick={handleSavePkg} disabled={saving}
                className="py-3 rounded-xl bg-blue-600 text-white font-bold disabled:opacity-50">
                {saving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Category Form */}
      {showCodeCategoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="font-bold text-xl">{editingCodeCategory ? "ແກ້ໄຂໝວດໝູ່" : "ເພີ່ມໝວດໝູ່"}</h2>
            <input placeholder="ຊື່ໝວດໝູ່ * (ເຊັ່ນ: A1)" value={codeCategoryForm.name}
              onChange={e => setCodeCategoryForm({ ...codeCategoryForm, name: e.target.value })}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-400" />
            <input placeholder="URL ຮູບພາບ (ບໍ່ໃສ່ກໍໄດ້)" value={codeCategoryForm.icon_url}
              onChange={e => setCodeCategoryForm({ ...codeCategoryForm, icon_url: e.target.value })}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-400" />
            {codeCategoryForm.icon_url && (
              <img src={codeCategoryForm.icon_url} className="w-20 h-20 rounded-xl object-cover mx-auto" />
            )}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShowCodeCategoryForm(false)}
                className="py-3 rounded-xl bg-gray-100 text-gray-600 font-bold">ຍົກເລີກ</button>
              <button onClick={handleSaveCodeCategory} disabled={saving}
                className="py-3 rounded-xl bg-blue-600 text-white font-bold disabled:opacity-50">
                {saving ? "ກຳລັງບັນທຶກ..." : "ຢືນຢັນ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Product Form */}
      {showCodeForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="font-bold text-xl">{editingCode ? "ແກ້ໄຂສິນຄ້າ" : `ເພີ່ມສິນຄ້າ — ${selectedCodeCategory?.name}`}</h2>
            <input placeholder="ຊື່ສິນຄ້າ * (ເຊັ່ນ: CDK)" value={codeForm.name}
              onChange={e => setCodeForm({ ...codeForm, name: e.target.value })}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-400" />
            <input placeholder="ລາຄາ (ກີບ) *" type="number" value={codeForm.price}
              onChange={e => setCodeForm({ ...codeForm, price: e.target.value })}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-400" />
            <input placeholder="URL ຮູບພາບ (ບໍ່ໃສ່ກໍໄດ້)" value={codeForm.image_url}
              onChange={e => setCodeForm({ ...codeForm, image_url: e.target.value })}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-400" />
            {codeForm.image_url && (
              <img src={codeForm.image_url} className="w-20 h-20 rounded-xl object-cover mx-auto" />
            )}
            <textarea placeholder="ລາຍລະອຽດ (ບໍ່ໃສ່ກໍໄດ້)" value={codeForm.description}
              onChange={e => setCodeForm({ ...codeForm, description: e.target.value })}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-400" rows={3} />
            <div className="bg-rose-50 rounded-xl p-3 text-sm text-rose-700">
              Stock ຈະເປັນແບບ <strong>Username:Password</strong>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={codeForm.is_active}
                onChange={e => setCodeForm({ ...codeForm, is_active: e.target.checked })} />
              <span className="text-sm">ເປີດໃຊ້ງານ</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShowCodeForm(false)}
                className="py-3 rounded-xl bg-gray-100 text-gray-600 font-bold">ຍົກເລີກ</button>
              <button onClick={handleSaveCode} disabled={saving}
                className="py-3 rounded-xl bg-blue-600 text-white font-bold disabled:opacity-50">
                {saving ? "ກຳລັງບັນທຶກ..." : "ຢືນຢັນ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Stock Form */}
      {showCodeStockForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4">
            <h2 className="font-bold text-xl">ເພີ່ມ Stock — {selectedCodeProduct?.name}</h2>
            <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700 space-y-1">
              <p className="font-bold">ຮູບແບບ: username:password</p>
              <p className="font-mono bg-white rounded-lg p-2 text-xs">
                user1:pass123<br />
                user2:pass456<br />
                user3:pass789
              </p>
            </div>
            <textarea
              placeholder={"user1:pass1\nuser2:pass2"}
              value={codeLines}
              onChange={e => setCodeLines(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-400 font-mono"
              rows={10}
            />
            <p className="text-sm text-gray-400">
              ຈຳນວນ: {codeLines.trim() ? codeLines.trim().split("\n").filter(l => l.trim()).length : 0} ລາຍການ
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShowCodeStockForm(false)}
                className="py-3 rounded-xl bg-gray-100 text-gray-600 font-bold">ຍົກເລີກ</button>
              <button onClick={handleAddCodeStock} disabled={saving}
                className="py-3 rounded-xl bg-green-600 text-white font-bold disabled:opacity-50">
                {saving ? "ກຳລັງບັນທຶກ..." : "ເພີ່ມ Stock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
