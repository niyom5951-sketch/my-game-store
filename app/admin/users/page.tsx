"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editingUser, setEditingUser] = useState<any>(null)
  const [newBalance, setNewBalance] = useState("")
  const [saving, setSaving] = useState(false)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])
async function handleUpdateBalance() {
  if (!newBalance) return
  setSaving(true)
  await fetch("/api/admin/users", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "update_balance",
      user_id: editingUser.id,
      balance: parseFloat(newBalance)
    })
  })

  setSaving(false)
  setEditingUser(null)
  load()
}


  async function handleToggleRole(user: any) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_role", user_id: user.id })
    })
    load()
  }

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("lo-LA")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ຈັດການ Users</h1>

      {/* Search */}
      <input
        placeholder="ຄົ້ນຫາ username ຫຼື email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-400"
      />

      {/* Edit Balance Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h2 className="font-bold text-xl">ແກ້ໄຂຍອດ — {editingUser.username}</h2>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm text-gray-400">ຍອດປັດຈຸບັນ</p>
              <p className="font-bold text-xl text-blue-600">
                {editingUser.balance?.toLocaleString()} ກີບ
              </p>
            </div>
            <input
              placeholder="ຍອດໃໝ່ (ກີບ)"
              type="number"
              value={newBalance}
              onChange={e => setNewBalance(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-400"
            />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setEditingUser(null)}
                className="py-3 rounded-xl bg-gray-100 text-gray-600 font-bold">
                ຍົກເລີກ
              </button>
              <button onClick={handleUpdateBalance} disabled={saving}
                className="py-3 rounded-xl bg-blue-500 text-white font-bold disabled:opacity-50">
                {saving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 text-sm text-gray-500">
              <tr>
                <th className="text-left p-4">ຜູ້ໃຊ້</th>
                <th className="text-right p-4">ຍອດເງິນ</th>
                <th className="text-center p-4">Role</th>
                <th className="text-center p-4">ວັນທີ</th>
                <th className="text-center p-4">ຈັດການ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {u.username?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{u.username}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right font-bold text-blue-600">
                    {u.balance?.toLocaleString()} ກີບ
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggleRole(u)}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        u.role === "admin"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {u.role === "admin" ? "Admin" : "User"}
                    </button>
                  </td>
                  <td className="p-4 text-center text-xs text-gray-400">
                    {formatDate(u.created_at)}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => {
                        setEditingUser(u)
                        setNewBalance(u.balance?.toString())
                      }}
                      className="px-3 py-1 bg-blue-50 text-blue-500 rounded-lg text-xs font-bold"
                    >
                      ແກ້ໄຂຍອດ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
