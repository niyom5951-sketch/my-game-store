"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function BannerManager() {
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<any>(null)
  const [form, setForm] = useState({
    image_url: "",
    title: "",
    link_url: "",
    sort_order: "0",
    is_active: true
  })
  const [success, setSuccess] = useState("")

  async function load() {
    const supabase = createClient()
    const { data } = await supabase
      .from("banners").select("*").order("sort_order")
    setBanners(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd() {
    setEditingBanner(null)
    setForm({ image_url: "", title: "", link_url: "", sort_order: String(banners.length), is_active: true })
    setShowForm(true)
  }

  function openEdit(b: any) {
    setEditingBanner(b)
    setForm({
      image_url: b.image_url || "",
      title: b.title || "",
      link_url: b.link_url || "",
      sort_order: String(b.sort_order ?? 0),
      is_active: b.is_active
    })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.image_url) return
    setSaving(true)
    const supabase = createClient()
    const payload = {
      image_url: form.image_url,
      title: form.title,
      link_url: form.link_url,
      sort_order: parseInt(form.sort_order) || 0,
      is_active: form.is_active
    }

    if (editingBanner) {
      await supabase.from("banners").update(payload).eq("id", editingBanner.id)
    } else {
      await supabase.from("banners").insert(payload)
    }

    setSaving(false)
    setShowForm(false)
    setSuccess("ບັນທຶກສຳເລັດ!")
    setTimeout(() => setSuccess(""), 2000)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm("ລຶບ banner ນີ້?")) return
    const supabase = createClient()
    await supabase.from("banners").delete().eq("id", id)
    load()
  }

  async function handleToggle(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from("banners").update({ is_active: !current }).eq("id", id)
    load()
  }

  if (loading) return (
    <div className="flex justify-center py-6">
      <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-lg">🖼️ ຈັດການ Banner</h2>
        <button onClick={openAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition">
          + ເພີ່ມ Banner
        </button>
      </div>

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-green-600 font-bold text-sm text-center">
          {success}
        </div>
      )}

      {banners.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">ຍັງບໍ່ມີ Banner</div>
      ) : (
        <div className="space-y-3">
          {banners.map((b, i) => (
            <div key={b.id} className="flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-800 rounded-2xl">
              {/* Preview */}
              <img
                src={b.image_url}
                alt={b.title || "banner"}
                className="w-20 h-12 object-cover rounded-xl flex-shrink-0 bg-gray-100"
                onError={e => { (e.target as HTMLImageElement).src = "" }}
              />

              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-800 dark:text-white truncate">
                  {b.title || `Banner ${i + 1}`}
                </p>
                {b.link_url && (
                  <p className="text-xs text-gray-400 truncate">{b.link_url}</p>
                )}
                <p className="text-xs text-gray-400">ລຳດັບ: {b.sort_order}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggle(b.id, b.is_active)}
                  className={`text-xs px-2 py-1 rounded-full font-bold transition ${b.is_active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
                >
                  {b.is_active ? "ເປີດ" : "ປິດ"}
                </button>
                <button
                  onClick={() => openEdit(b)}
                  className="text-xs px-2 py-1 bg-blue-50 text-blue-500 rounded-lg font-bold hover:bg-blue-100 transition"
                >
                  ແກ້
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="text-xs px-2 py-1 bg-red-50 text-red-500 rounded-lg font-bold hover:bg-red-100 transition"
                >
                  ລຶບ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h2 className="font-bold text-xl">{editingBanner ? "ແກ້ໄຂ Banner" : "ເພີ່ມ Banner"}</h2>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">URL ຮູບ Banner *</label>
              <input
                placeholder="https://example.com/banner.jpg"
                value={form.image_url}
                onChange={e => setForm({ ...form, image_url: e.target.value })}
                className="w-full border dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-400 dark:bg-gray-800 dark:text-white text-sm"
              />
              {form.image_url && (
                <img src={form.image_url} alt="preview" className="w-full h-32 object-cover rounded-xl mt-2" />
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">ຊື່ Banner (ທາງເລືອກ)</label>
              <input
                placeholder="ເຊັ່ນ: ໂປຣໂມຊັ່ນ Free Fire"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-400 dark:bg-gray-800 dark:text-white text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Link URL (ທາງເລືອກ)</label>
              <input
                placeholder="https://example.com (ກົດ banner ແລ້ວໄປໜ້ານີ້)"
                value={form.link_url}
                onChange={e => setForm({ ...form, link_url: e.target.value })}
                className="w-full border dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-400 dark:bg-gray-800 dark:text-white text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">ລຳດັບ</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.sort_order}
                  onChange={e => setForm({ ...form, sort_order: e.target.value })}
                  className="w-full border dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-400 dark:bg-gray-800 dark:text-white text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">ສະຖານະ</label>
                <button
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition ${form.is_active ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}
                >
                  {form.is_active ? "ເປີດ" : "ປິດ"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 transition"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.image_url}
                className="py-3 rounded-xl bg-blue-500 text-white font-bold disabled:opacity-50 hover:bg-blue-600 transition"
              >
                {saving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}