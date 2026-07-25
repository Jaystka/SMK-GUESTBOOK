"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Employee, Paginated } from "@/lib/types";
import { Empty, LoadingCard, PageHeader } from "@/components/AdminUi";

export default function EmployeesPage() {
  const [data, setData] = useState<Paginated<Employee> | null>(null);
  const [form, setForm] = useState({ name: "", department: "", position: "" });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setData(await api<Paginated<Employee>>("/employees?per_page=100", { auth: true }));
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
      await api(`/employees/${editingId}`, { method: "PATCH", auth: true, body: JSON.stringify({ ...form }) });
    } else {
      await api("/employees", { method: "POST", auth: true, body: JSON.stringify({ ...form, active: true }) });
    }
    setEditingId(null);
    setForm({ name: "", department: "", position: "" });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus pegawai ini?")) return;
    await api(`/employees/${id}`, { method: "DELETE", auth: true });
    await load();
  }

  function edit(employee: Employee) {
    setEditingId(employee.id);
    setForm({
      name: employee.name,
      department: employee.department || "",
      position: employee.position || ""
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ name: "", department: "", position: "" });
  }

  return (
    <>
      <PageHeader title="Data pegawai" description="Kelola daftar pegawai yang dapat dipilih pada formulir kunjungan." />
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form onSubmit={save} className="card h-fit space-y-4 p-5">
          <h2 className="text-lg font-bold">{editingId ? "Edit pegawai" : "Tambah pegawai"}</h2>
          {(
            [
              ["name", "Nama"],
              ["department", "Unit atau bagian"],
              ["position", "Jabatan"]
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input
                className="field"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={key === "name"}
              />
            </div>
          ))}
          <div className="flex gap-2">
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
                      <th className="p-4">Bagian</th>
                      <th className="p-4">Jabatan</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((e) => (
                      <tr key={e.id} className="border-t border-slate-100">
                        <td className="p-4 font-bold">{e.name}</td>
                        <td className="p-4">{e.department || "-"}</td>
                        <td className="p-4">{e.position || "-"}</td>
                        <td className="p-4">
                          <span className={e.active ? "text-brand-700" : "text-red-700"}>
                            {e.active ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => edit(e)}
                            className="rounded px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => remove(e.id)}
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
