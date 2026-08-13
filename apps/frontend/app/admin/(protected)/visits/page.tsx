"use client";
import { useEffect, useState } from "react";
import { api, API_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Paginated, Visit } from "@/lib/types";
import { Empty, LoadingCard, PageHeader } from "@/components/AdminUi";
export default function VisitsPage() {
  const [data, setData] = useState<Paginated<Visit> | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setData(
        await api<Paginated<Visit>>("/visits?per_page=50", { auth: true }),
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function checkout(id: string) {
    await api(`/visits/${id}/checkout`, { method: "PATCH", auth: true });
    await load();
  }
  
  async function showPhoto(url: string) {
    try {
      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!r.ok) throw new Error("Gagal mengambil foto");
      const blob = await r.blob();
      setPreviewPhoto(URL.createObjectURL(blob));
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function download() {
    const r = await fetch(`${API_URL}/reports/visits.csv`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "laporan-kunjungan.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <PageHeader
        title="Riwayat kunjungan"
        description="Lihat kunjungan aktif, selesaikan check-out, dan unduh laporan."
        action={
          <button onClick={download} className="btn-secondary">
            Unduh CSV
          </button>
        }
      />
      {loading ? (
        <LoadingCard />
      ) : (
        <section className="card overflow-hidden">
          {!data?.data.length ? (
            <Empty />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-4">Tamu</th>
                    <th className="p-4">Tujuan</th>
                    <th className="p-4">Bertemu</th>
                    <th className="p-4">Metode</th>
                    <th className="p-4">Masuk</th>
                    <th className="p-4">Keluar</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((v) => (
                    <tr key={v.id} className="border-t border-slate-100">
                      <td className="p-4 font-bold">{v.visitor?.name}</td>
                      <td className="p-4">{v.purpose}</td>
                      <td className="p-4">
                        {v.employee?.name || v.meet_person || "-"}
                      </td>
                      <td className="p-4">{v.recognition_method}</td>
                      <td className="p-4">
                        {new Date(v.checkin_time).toLocaleString("id-ID")}
                      </td>
                      <td className="p-4">
                        {v.checkout_time
                          ? new Date(v.checkout_time).toLocaleString("id-ID")
                          : "-"}
                      </td>
                      <td className="p-4 space-x-2">
                        {v.photo_url && (
                          <button
                            onClick={() => showPhoto(v.photo_url!)}
                            className="rounded-lg bg-blue-100 px-3 py-2 font-semibold text-blue-800"
                          >
                            Foto
                          </button>
                        )}
                        {!v.checkout_time && (
                          <button
                            onClick={() => checkout(v.id)}
                            className="rounded-lg bg-brand-100 px-3 py-2 font-semibold text-brand-800"
                          >
                            Check-out
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
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
