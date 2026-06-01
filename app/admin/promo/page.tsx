"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function AdminPromoPage() {
  const [promos, setPromos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    code: "", value: "", max_uses: "1", expires_at: "", is_active: true
  })

  async function load() {
    const supabase = createClient()
    const { data } = await supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false })
    setPromos(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSave() {
    if (!form.code || !form.value) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from("promo_codes").insert({
      code: form.code.toUpperCase(),
      value: parseFloat(form.value),
      max_uses: parseInt(form.max_uses),
      expires_at: form.expires_at || null,
      is_active: form.is_active
    })
    setSaving(false)
    setShowForm(false)
    setForm({ code: "", value: "", max_uses: "1", expires_at: "", is_active: true })
    load()
  }

  async function handleToggle(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from("promo_codes").update({ is_active: !current }).eq("id", id)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm("ລຶບໂຄ້ດນີ້?")) return
    const supabase = createClient()
    await supabase.from("promo_codes").delete().eq("id", id)
    load()
  }

  function formatDate(d: string) {
    if (!d) return "-"
    return new Date(d).toLocaleDateString("lo-LA")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ຈັດການໂຄ້ດ</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold"
        >
          + ສ້າງໂຄ້ດ
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="font-bold text-xl">ສ້າງໂຄ້ດໃໝ່</h2>
            <div className="space-y-3">
              <input
                placeholder="ໂຄ້ດ (ຕົວພິມໃຫຍ່)"
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-400 font-mono"
              />
              <input
                placeholder="ມູນຄ່າ (ກີບ)"
                type="number"
                value={form.value}
                onChange={e => setForm({ ...form, value: e.target.value })}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-400"
              />
              <input
                placeholder="ໃຊ້ໄດ້ກີ່ຄັ້ງ"
                type="number"
                value={form.max_uses}
                onChange={e => setForm({ ...form, max_uses: e.target.value })}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-400"
              />
              <div>
                <p className="text-sm text-gray-400 mb-1">ວັນໝົດອາຍຸ (ຖ້າບໍ່ໃສ່ = ບໍ່ໝົດ)</p>
                <input
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={e => setForm({ ...form, expires_at: e.target.value })}
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-400"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm({ ...form, is_active: e.target.checked })}
                />
                <span>ເປີດໃຊ້ງານ</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="py-3 rounded-xl bg-gray-100 text-gray-600 font-bold"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="py-3 rounded-xl bg-blue-500 text-white font-bold disabled:opacity-50"
              >
                {saving ? "ກຳລັງສ້າງ..." : "ສ້າງ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ລາຍການ */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : promos.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400">
          ຍັງບໍ່ມີໂຄ້ດ
        </div>
      ) : (
        <div className="space-y-3">
          {promos.map(p => (
            <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono font-bold text-xl">{p.code}</p>
                  <p className="text-blue-600 font-bold">
                    {p.value?.toLocaleString()} ກີບ
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm text-gray-400">
                    ໃຊ້ແລ້ວ: {p.used_count}/{p.max_uses}
                  </p>
                  <p className="text-xs text-gray-400">
                    ໝົດ: {formatDate(p.expires_at)}
                  </p>
                  <button
                    onClick={() => handleToggle(p.id, p.is_active)}
                    className={`text-xs px-2 py-1 rounded-full font-bold ${
                      p.is_active
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {p.is_active ? "ເປີດ" : "ປິດ"}
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min((p.used_count / p.max_uses) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => handleDelete(p.id)}
                className="mt-3 w-full py-2 bg-red-50 text-red-500 rounded-xl text-sm font-bold"
              >
                🗑️ ລຶບ
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}