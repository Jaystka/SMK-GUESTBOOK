"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AuthUser, Paginated } from "@/lib/types";
import { Empty, LoadingCard, PageHeader } from "@/components/AdminUi";

export default function UsersPage() {
  const [data, setData] = useState<Paginated<AuthUser & { active: boolean }> | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "operator" });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setData(await api<Paginated<AuthUser & { active: boolean }>>("/users?per_page=100", { auth: true }));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await api(`/users/${editingId}`, { method: "PATCH", auth: true, body: JSON.stringify({ ...form }) });
    } else {
      await api("/users", { method: "POST", auth: true, body: JSON.stringify({ ...form, active: true }) });
    }
    setEditingId(null);
    setForm({ name: "", email: "", password: "", role: "operator" });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Apakah Anda yakin ingin menonaktifkan dan menghapus pengguna ini?")) return;
    try {
      await api(`/users/${id}`, { method: "DELETE", auth: true });
      await load();
    } catch (e: any) {
      alert(e.message || "Gagal menghapus pengguna");
    }
  }

  function edit(user: AuthUser & { active: boolean }) {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: "", // do not show password, keep empty unless changing
      role: user.role
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ name: "", email: "", password: "", role: "operator" });
  }

  return (
    <>
      <PageHeader title="Manajemen Pengguna" description="Kelola akun admin, operator, dan security sistem." />
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form onSubmit={save} className="card h-fit space-y-4 p-5">
          <h2 className="text-lg font-bold">{editingId ? "Edit pengguna" : "Tambah pengguna"}</h2>
          
          <div>
            <label className="label">Nama Lengkap</label>
            <input
              className="field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Email Lengkap</label>
            <input
              type="email"
              className="field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Password {editingId && <span className="text-xs font-normal text-slate-400">(Kosongkan jika tidak diubah)</span>}</label>
            <input
              type="password"
              className="field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editingId}
              minLength={8}
            />
          </div>

          <div>
            <label className="label">Role</label>
            <select
              className="field"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="super_admin">Super Admin</option>
              <option value="operator">Operator</option>
              <option value="security">Security</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button className="btn-primary flex-1">{editingId ? "Update" : "Simpan"}</button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="rounded-lg bg-slate-100 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200">
                Batal
              </button>
            )}
          </div>
        </form>

        {loading ? (
          <LoadingCard />
        ) : (
          <section className="card overflow-hidden">
            {!data?.data.length ? (
              <Empty />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[600px]">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-4">Nama</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((u) => (
                      <tr key={u.id} className="border-t border-slate-100">
                        <td className="p-4 font-bold">{u.name}</td>
                        <td className="p-4">{u.email}</td>
                        <td className="p-4">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                            u.role === 'operator' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {u.role.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={u.active ? "text-brand-700 font-medium" : "text-red-700 font-medium"}>
                            {u.active ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => edit(u)}
                            className="rounded px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => remove(u.id)}
                            className="rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}
