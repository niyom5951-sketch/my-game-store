"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({})
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [showGameForm, setShowGameForm] = useState(false)
  const [editingGame, setEditingGame] = useState<any>(null)
  const [gameForm, setGameForm] = useState({
    name: "", icon_url: "", input_type: "uid", sort_order: "0", is_active: true
  })

  async function load() {
    const supabase = createClient()
    const [s, g] = await Promise.all([
      supabase.from("settings").select("*"),
      supabase.from("games").select("*").order("sort_order")
    ])
    const obj: any = {}
    s.data?.forEach(d => obj[d.key] = d.value)
    setSettings(obj)
    setGames(g.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const updates = Object.entries(settings).map(([key, value]) =>
      supabase.from("settings").update({ value }).eq("key", key)
    )
    await Promise.all(updates)
    setSaving(false)
    setSuccess("ບັນທຶກສຳເລັດ!")
    setTimeout(() => setSuccess(""), 3000)
  }

  async function handleSaveGame() {
    const supabase = createClient()
    const payload = {
      name: gameForm.name,
      icon_url: gameForm.icon_url,
      input_type: gameForm.input_type,
      sort_order: parseInt(gameForm.sort_order),
      is_active: gameForm.is_active
    }
    if (editingGame) {
      await supabase.from("games").update(payload).eq("id", editingGame.id)
    } else {
      await supabase.from("games").insert(payload)
    }
    setShowGameForm(false)
    load()
  }

  async function handleDeleteGame(id: string) {
    if (!confirm("ລຶບເກມນີ້?")) return
    const supabase = createClient()
    await supabase.from("games").delete().eq("id", id)
    load()
  }

  async function handleToggleGame(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from("games").update({ is_active: !current }).eq("id", id)
    load()
  }

  function openEditGame(g: any) {
    setEditingGame(g)
    setGameForm({
      name: g.name, icon_url: g.icon_url || "",
      input_type: g.input_type, sort_order: g.sort_order?.toString(),
      is_active: g.is_active
    })
    setShowGameForm(true)
  }

  function openAddGame() {
    setEditingGame(null)
    setGameForm({ name: "", icon_url: "", input_type: "uid", sort_order: "0", is_active: true })
    setShowGameForm(true)
  }

  if (loading) return (
    <div className="flex justify-center py-10">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">ຕັ້ງຄ່າ</h1>

      {/* ທະນາຄານ */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-lg">🏦 ຂໍ້ມູນທະນາຄານ</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="font-bold text-sm text-blue-600">BCEL</p>
            <input placeholder="ຊື່ທະນາຄານ" value={settings.bank_bcel_name || ""}
              onChange={e => setSettings({ ...settings, bank_bcel_name: e.target.value })}
              className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-400" />
            <input placeholder="ເລກບັນຊີ" value={settings.bank_bcel_number || ""}
              onChange={e => setSettings({ ...settings, bank_bcel_number: e.target.value })}
              className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-400" />
            <input placeholder="ຊື່ບັນຊີ" value={settings.bank_bcel_account_name || ""}
              onChange={e => setSettings({ ...settings, bank_bcel_account_name: e.target.value })}
              className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-400" />
            <input placeholder="URL QR Code" value={settings.bank_bcel_qr_url || ""}
              onChange={e => setSettings({ ...settings, bank_bcel_qr_url: e.target.value })}
              className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div className="space-y-3">
            <p className="font-bold text-sm text-green-600">LDB</p>
            <input placeholder="ຊື່ທະນາຄານ" value={settings.bank_ldb_name || ""}
              onChange={e => setSettings({ ...settings, bank_ldb_name: e.target.value })}
              className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-400" />
            <input placeholder="ເລກບັນຊີ" value={settings.bank_ldb_number || ""}
              onChange={e => setSettings({ ...settings, bank_ldb_number: e.target.value })}
              className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-400" />
            <input placeholder="ຊື່ບັນຊີ" value={settings.bank_ldb_account_name || ""}
              onChange={e => setSettings({ ...settings, bank_ldb_account_name: e.target.value })}
              className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-400" />
            <input placeholder="URL QR Code" value={settings.bank_ldb_qr_url || ""}
              onChange={e => setSettings({ ...settings, bank_ldb_qr_url: e.target.value })}
              className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
        </div>
      </div>

      {/* ເບີໂທ */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-lg">📱 ເບີໂທຮ້ານ (Unitel)</h2>
        <input placeholder="ເບີ Unitel" value={settings.shop_phone_unitel || ""}
          onChange={e => setSettings({ ...settings, shop_phone_unitel: e.target.value })}
          className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-400" />
      </div>

      {/* ເປີດ/ປິດວິທີເຕີມ */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-lg">⚙️ ເປີດ/ປິດວິທີເຕີມເງິນ</h2>
        <div className="space-y-3">
          {[
            { key: "bank_enabled", label: "🏦 ທະນາຄານ" },
            { key: "phone_enabled", label: "📱 ບັດໂທ" },
            { key: "card_enabled", label: "💳 ເລກບັດ" },
            { key: "code_enabled", label: "🎟️ ໂຄ້ດ" },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="font-bold">{item.label}</span>
              <button
                onClick={() => setSettings({
                  ...settings,
                  [item.key]: settings[item.key] === "true" ? "false" : "true"
                })}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
                  settings[item.key] === "true"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {settings[item.key] === "true" ? "ເປີດ" : "ປິດ"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">🔧 Maintenance Mode</h2>
            <p className="text-sm text-gray-400">ປິດເວັບຊົ່ວຄາວ</p>
          </div>
          <button
            onClick={() => setSettings({
              ...settings,
              maintenance_mode: settings.maintenance_mode === "true" ? "false" : "true"
            })}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
              settings.maintenance_mode === "true"
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {settings.maintenance_mode === "true" ? "ເປີດຢູ່" : "ປິດຢູ່"}
          </button>
        </div>
      </div>

      {/* ຈັດການເກມ */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg">🎮 ຈັດການເກມ</h2>
          <button onClick={openAddGame}
            className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold">
            + ເພີ່ມເກມ
          </button>
        </div>
        <div className="space-y-3">
          {games.map(g => (
            <div key={g.id} className="flex items-center gap-3 p-3 border rounded-xl">
              {g.icon_url ? (
                <img src={g.icon_url} className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">🎮</div>
              )}
              <div className="flex-1">
                <p className="font-bold text-sm">{g.name}</p>
                <p className="text-xs text-gray-400">{g.input_type}</p>
              </div>
              <button onClick={() => handleToggleGame(g.id, g.is_active)}
                className={`text-xs px-2 py-1 rounded-full font-bold ${
                  g.is_active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                }`}>
                {g.is_active ? "ເປີດ" : "ປິດ"}
              </button>
              <button onClick={() => openEditGame(g)}
                className="text-xs px-2 py-1 bg-blue-50 text-blue-500 rounded-lg font-bold">
                ແກ້ໄຂ
              </button>
              <button onClick={() => handleDeleteGame(g.id)}
                className="text-xs px-2 py-1 bg-red-50 text-red-500 rounded-lg font-bold">
                ລຶບ
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Game Form Modal */}
      {showGameForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="font-bold text-xl">{editingGame ? "ແກ້ໄຂເກມ" : "ເພີ່ມເກມ"}</h2>
            <input placeholder="ຊື່ເກມ" value={gameForm.name}
              onChange={e => setGameForm({ ...gameForm, name: e.target.value })}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-400" />
            <input placeholder="URL ໄອຄອນ" value={gameForm.icon_url}
              onChange={e => setGameForm({ ...gameForm, icon_url: e.target.value })}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-400" />
            {gameForm.icon_url && (
              <img src={gameForm.icon_url} className="w-20 h-20 rounded-xl object-cover mx-auto" />
            )}
            <select value={gameForm.input_type}
              onChange={e => setGameForm({ ...gameForm, input_type: e.target.value })}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-400">
              <option value="uid">UID ເທົ່ານັ້ນ</option>
              <option value="uid_zone">UID + Zone ID</option>
              <option value="username_password">Username + Password</option>
            </select>
            <input placeholder="ລຳດັບ (0, 1, 2...)" type="number" value={gameForm.sort_order}
              onChange={e => setGameForm({ ...gameForm, sort_order: e.target.value })}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-400" />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={gameForm.is_active}
                onChange={e => setGameForm({ ...gameForm, is_active: e.target.checked })} />
              <span>ເປີດໃຊ້ງານ</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShowGameForm(false)}
                className="py-3 rounded-xl bg-gray-100 text-gray-600 font-bold">ຍົກເລີກ</button>
              <button onClick={handleSaveGame}
                className="py-3 rounded-xl bg-blue-500 text-white font-bold">ບັນທຶກ</button>
            </div>
          </div>
        </div>
      )}

      {/* ບັນທຶກ */}
      {success && <p className="text-green-600 text-center font-bold">{success}</p>}
      <button onClick={handleSave} disabled={saving}
        className="w-full bg-blue-500 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50">
        {saving ? "ກຳລັງບັນທຶກ..." : "💾 ບັນທຶກທຸກຢ່າງ"}
      </button>
    </div>
  )
}