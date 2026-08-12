"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/AdminUi";

export default function SettingsPage() {
  const [form, setForm] = useState({
    radius_enabled: false,
    radius_lat: "",
    radius_lng: "",
    radius_meters: "50",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<Record<string, any>>("/settings", { auth: true })
      .then((res) => {
        setForm({
          radius_enabled: res.radius_enabled ?? false,
          radius_lat: res.radius_lat ?? "",
          radius_lng: res.radius_lng ?? "",
          radius_meters: res.radius_meters ?? "50",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/settings", {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({
          radius_enabled: form.radius_enabled,
          radius_lat: form.radius_lat ? parseFloat(form.radius_lat) : null,
          radius_lng: form.radius_lng ? parseFloat(form.radius_lng) : null,
          radius_meters: form.radius_meters ? parseInt(form.radius_meters, 10) : null,
        }),
      });
      alert("Pengaturan berhasil disimpan.");
    } catch (e: any) {
      alert(e.message || "Gagal menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
  }

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung Geolocation.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          radius_lat: position.coords.latitude.toString(),
          radius_lng: position.coords.longitude.toString(),
        }));
      },
      (error) => {
        alert(`Gagal mengambil lokasi: ${error.message}`);
      }
    );
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Memuat...</div>;
  }

  return (
    <>
      <PageHeader title="Pengaturan Sistem" description="Atur batasan radius Kiosk dan konfigurasi sistem lainnya." />
      
      <div className="max-w-2xl space-y-6">
        <form onSubmit={save} className="card p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800">Geofencing Kiosk</h2>
            <p className="text-sm text-slate-500">Batasi akses Kiosk Tamu hanya untuk pengunjung yang berada di sekitar lokasi sekolah.</p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-600"
              checked={form.radius_enabled}
              onChange={(e) => setForm({ ...form, radius_enabled: e.target.checked })}
            />
            <span className="font-semibold text-slate-700">Aktifkan Pembatasan Radius</span>
          </label>

          {form.radius_enabled && (
            <div className="space-y-4 rounded-xl bg-slate-50 p-4 border border-slate-100">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Latitude (Titik Pusat)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    className="field"
                    value={form.radius_lat}
                    onChange={(e) => setForm({ ...form, radius_lat: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Longitude (Titik Pusat)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    className="field"
                    value={form.radius_lng}
                    onChange={(e) => setForm({ ...form, radius_lng: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Jarak Maksimal Radius (Meter)</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="field max-w-[200px]"
                  value={form.radius_meters}
                  onChange={(e) => setForm({ ...form, radius_meters: e.target.value })}
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
                >
                  📍 Gunakan Lokasi Saya Saat Ini
                </button>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100">
            <button disabled={saving} className="btn-primary w-full md:w-auto">
              {saving ? "Menyimpan..." : "Simpan Pengaturan"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
