"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Paginated } from "@/lib/types";
import { Empty, LoadingCard, PageHeader } from "@/components/AdminUi";

type Visitor = {
  id: string;
  name: string;
  phone: string;
  phone_last4?: string;
  institution?: string | null;
  active: boolean;
  visits_count: number;
  created_at: string;
  photo_url?: string | null;
};

export default function VisitorsPage() {
  const [data, setData] = useState<Paginated<Visitor> | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  
  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", institution: "", active: true });

  async function load(q = search) {
    setLoading(true);
    try {
      setData(await api<Paginated<Visitor>>(`/visitors?search=${encodeURIComponent(q)}&per_page=50`, { auth: true }));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus data tamu ini?")) return;
    await api(`/visitors/${id}`, { method: "DELETE", auth: true });
    await load();
  }

  function edit(visitor: Visitor) {
    setEditingVisitor(visitor);
    setForm({
      name: visitor.name,
      phone: visitor.phone,
      institution: visitor.institution || "",
      active: visitor.active
    });
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingVisitor) return;
    await api(`/visitors/${editingVisitor.id}`, {
      method: "PATCH",
      auth: true,
      body: JSON.stringify(form)
    });
    setEditingVisitor(null);
    await load();
  }

  return (
    <>
      <PageHeader title="Data tamu" description="Cari profil tamu dan lihat frekuensi kunjungannya." />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void load(search);
        }}
        className="mb-5 flex gap-2"
      >
        <input
          className="field max-w-md"
          placeholder="Cari nama, instansi, atau 4 digit akhir"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-primary">Cari</button>
      </form>
      
      {loading ? (
        <LoadingCard />
      ) : (
        <section className="card overflow-hidden">
          {!data?.data.length ? (
            <Empty />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-4">Nama</th>
                    <th className="p-4">Telepon</th>
                    <th className="p-4">Instansi</th>
                    <th className="p-4">Kunjungan</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Terdaftar</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((v) => (
                    <tr key={v.id} className="border-t border-slate-100">
                      <td className="p-4 font-bold">{v.name}</td>
                      <td className="p-4">{v.phone}</td>
                      <td className="p-4">{v.institution || "-"}</td>
                      <td className="p-4">{v.visits_count}</td>
                      <td className="p-4">
                        <span className={v.active ? "text-brand-700" : "text-red-700"}>
                          {v.active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="p-4">{new Date(v.created_at).toLocaleDateString("id-ID")}</td>
                      <td className="p-4 text-right space-x-2">
                        {v.photo_url && (
                          <button
                            onClick={() => setPreviewPhoto(v.photo_url!)}
                            className="rounded px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                          >
                            Foto
                          </button>
                        )}
                        <button
                          onClick={() => edit(v)}
                          className="rounded px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(v.id)}
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

      {editingVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold">Edit Tamu</h2>
            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="label">Nama</label>
                <input
                  className="field w-full"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Telepon</label>
                <input
                  className="field w-full"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Instansi</label>
                <input
                  className="field w-full"
                  value={form.institution}
                  onChange={(e) => setForm({ ...form, institution: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600"
                />
                Status Aktif
              </label>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingVisitor(null)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewPhoto && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/75 p-4" onClick={() => setPreviewPhoto(null)}>
          <div className="relative max-h-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="font-bold">Preview Wajah</h3>
              <button onClick={() => setPreviewPhoto(null)} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="p-4 flex justify-center">
              <img src={previewPhoto} alt="Wajah Pengguna" className="max-h-[70vh] rounded object-contain" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
