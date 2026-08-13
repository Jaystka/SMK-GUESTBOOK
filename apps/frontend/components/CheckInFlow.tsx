"use client";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Employee, VisitorMatch } from "@/lib/types";
import { CameraCapture } from "./CameraCapture";

type Step = "capture" | "register" | "visit" | "success";
type Visitor = { id: string; name: string; institution?: string | null; confidence?: number | null; method: "face" | "new_registration" | "phone" };

export function CheckInFlow() {
  const [step, setStep] = useState<Step>("capture"); const [image, setImage] = useState(""); const [scanStatus, setScanStatus] = useState<"idle" | "processing" | "success" | "error" | "unregistered">("idle"); const [message, setMessage] = useState<string | null>(null); const [visitor, setVisitor] = useState<Visitor | null>(null); const [employees, setEmployees] = useState<Employee[]>([]);
  const [locationAllowed, setLocationAllowed] = useState<boolean | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => { 
    api<{ data: Employee[] }>("/employees/options").then(r => setEmployees(r.data)).catch(() => setEmployees([])); 
    checkLocation();
  }, []);

  async function checkLocation() {
    try {
      const settings = await api<Record<string, any>>("/settings");
      if (settings.radius_enabled && settings.radius_lat && settings.radius_lng && settings.radius_meters) {
        if (!navigator.geolocation) {
          setLocationError("Browser Anda tidak mendukung deteksi lokasi. Akses ditolak.");
          setLocationAllowed(false);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat1 = pos.coords.latitude;
            const lon1 = pos.coords.longitude;
            const lat2 = parseFloat(settings.radius_lat);
            const lon2 = parseFloat(settings.radius_lng);
            const maxDist = parseInt(settings.radius_meters, 10);
            
            const R = 6371e3; // meters
            const phi1 = lat1 * Math.PI/180;
            const phi2 = lat2 * Math.PI/180;
            const dPhi = (lat2-lat1) * Math.PI/180;
            const dLambda = (lon2-lon1) * Math.PI/180;
            const a = Math.sin(dPhi/2) * Math.sin(dPhi/2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda/2) * Math.sin(dLambda/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const d = R * c;
            
            if (d > maxDist) {
              setLocationError(`Anda berada terlalu jauh (${Math.round(d)} meter) dari lokasi sekolah. Maksimal jarak adalah ${maxDist} meter.`);
              setLocationAllowed(false);
            } else {
              setLocationAllowed(true);
            }
          },
          (err) => {
            setLocationError("Gagal mendapatkan izin lokasi. Anda harus mengizinkan akses lokasi untuk check-in.");
            setLocationAllowed(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        setLocationAllowed(true);
      }
    } catch (e) {
      // API error, just allow to avoid blocking legitimate users if DB isn't ready
      setLocationAllowed(true);
    }
  }

  async function identify(photo: string) {
    setImage(photo); setScanStatus("processing"); setMessage(null);
    try {
      const result = await api<VisitorMatch>("/face/identify", { method: "POST", body: JSON.stringify({ image: photo }) });
      if (result.matched && result.visitor_id && result.name) {
        setVisitor({ id: result.visitor_id, name: result.name, institution: result.institution, confidence: result.confidence, method: "face" });
        setScanStatus("success");
        setTimeout(() => { setScanStatus("idle"); setStep("visit"); }, 2000);
      } else {
        setScanStatus("unregistered");
        setTimeout(() => { setScanStatus("idle"); setStep("register"); }, 2500);
      }
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Gagal menghubungi server.");
      setScanStatus("error");
    }
  }
  function reset() { setStep("capture"); setImage(""); setVisitor(null); setMessage(null); setScanStatus("idle"); }
  function handleRetry() { setScanStatus("idle"); setMessage(null); }
  if (locationAllowed === null) {
    return <div className="grid min-h-[60vh] place-items-center"><div className="text-center"><div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div><p className="text-slate-500 font-medium">Memeriksa lokasi Anda...</p></div></div>;
  }
  
  if (locationAllowed === false) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="card max-w-md p-8 text-center shadow-lg border border-red-100">
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-red-50 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Akses Ditolak</h2>
          <p className="mt-3 text-slate-500 leading-relaxed">{locationError}</p>
          <button onClick={checkLocation} className="btn-secondary w-full mt-6">Coba Periksa Ulang</button>
        </div>
      </div>
    );
  }

  return <div className="grid gap-6 lg:grid-cols-[1fr_.78fr]">
    <section className="card p-6 md:p-10">
      {step === "capture" && (
        <div className="mb-6">
          <span className="badge">REGISTRASI TAMU</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">Selamat Datang!</h2>
          <p className="mt-2 text-slate-500 leading-relaxed">Silakan posisikan wajah Anda di depan kamera untuk memulai. Kami akan mengenali Anda dalam hitungan detik.</p>
        </div>
      )}
      {message && <div className="mb-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">{message}</div>}
      {step === "capture" && <CameraCapture onCapture={identify} status={scanStatus as any} onRetry={handleRetry} onRegister={() => { setScanStatus("idle"); setStep("register"); }} />}
      {step === "register" && <RegistrationForm image={image} onRegistered={(v) => { setVisitor(v); setStep("visit"); }} onBack={reset} />}
      {step === "visit" && visitor && <VisitForm visitor={visitor} image={image} employees={employees} onSuccess={() => setStep("success")} onBack={reset} />}
      {step === "success" && visitor && <div className="py-16 text-center animate-in fade-in zoom-in duration-500"><div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-brand-100 text-5xl text-brand-600 shadow-[0_0_40px_rgba(34,167,230,0.3)] ring-8 ring-brand-50">✓</div><h3 className="mt-6 text-3xl font-extrabold text-slate-900">Registrasi Berhasil!</h3><p className="mt-3 text-slate-500 text-lg">Terima kasih telah berkunjung, <strong className="text-brand-700">{visitor.name}</strong>. Silakan menuju ruangan tujuan Anda. Semoga hari Anda menyenangkan!</p><button onClick={reset} className="btn-primary mt-8 px-8 py-4 text-lg">Kembali ke Beranda</button></div>}
    </section>
    <aside className="card overflow-hidden p-6 md:p-8">
      <div className="mb-6 flex justify-center">
        <video src="/animasi2.mp4" autoPlay loop muted playsInline className="w-[85%] md:w-[75%] max-w-[350px] h-auto object-contain drop-shadow-md rounded-2xl" />
      </div>
      <div className="rounded-3xl bg-gradient-to-br from-brand-800 to-slate-900 p-7 text-white shadow-inner"><p className="text-sm font-bold text-brand-400 tracking-wider">LANGKAH REGISTRASI DIGITAL</p><ol className="mt-6 space-y-5">{["Hadap ke kamera", "Sistem mengenali Anda", "Sampaikan keperluan kunjungan", "Selesai! Anda siap masuk"].map((item, index) => <li key={item} className="flex gap-4 items-start"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-sm font-bold backdrop-blur-md border border-white/20 shadow-sm">{index + 1}</span><span className="pt-1 font-medium text-brand-50 leading-relaxed">{item}</span></li>)}</ol></div><div className="hidden mt-8 rounded-2xl bg-slate-50/50 p-6 border border-slate-100"><h3 className="font-bold text-slate-800">Cari dengan Nomor Telepon</h3><p className="mt-1 text-sm text-slate-500">Gunakan nomor telepon jika kamera bermasalah.</p><PhoneSearch onFound={(v) => { setVisitor(v); setStep("visit"); }} /></div>
    </aside>
  </div>;
}

function RegistrationForm({ image, onRegistered, onBack }: { image: string; onRegistered: (v: Visitor) => void; onBack: () => void }) {
  const [form, setForm] = useState({ name: "", phone: "", address: "", institution: "", consent: false }); const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);
  async function submit(e: React.FormEvent) { e.preventDefault(); setBusy(true); setError(null); try { const r = await api<{ id: string; name: string }>("/visitors", { method: "POST", body: JSON.stringify({ ...form, photo: image }) }); onRegistered({ id: r.id, name: r.name, institution: form.institution, method: "new_registration" }); } catch (err) { setError(err instanceof ApiError ? err.message : "Registrasi gagal."); } finally { setBusy(false); } }
  return <form onSubmit={submit} className="space-y-5 animate-in slide-in-from-right-4 duration-500"><div><h3 className="text-2xl font-extrabold text-slate-900">Mari Berkenalan!</h3><p className="mt-1 text-sm text-slate-500">Sepertinya ini kunjungan pertama Anda. Mohon lengkapi data berikut untuk memudahkan kunjungan Anda berikutnya.</p></div>{error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-100">{error}</p>}<div className="grid gap-5 sm:grid-cols-2"><Field label="Nama Lengkap" value={form.name} onChange={v => setForm({ ...form, name: v })} required /><Field label="Nomor Telepon" value={form.phone} onChange={v => setForm({ ...form, phone: v })} required /><Field label="Instansi / Asal" value={form.institution} onChange={v => setForm({ ...form, institution: v })} /><Field label="Alamat" value={form.address} onChange={v => setForm({ ...form, address: v })} /></div><label className="flex gap-4 rounded-2xl bg-white/50 border border-slate-200 p-5 text-sm transition-colors hover:bg-white cursor-pointer"><input type="checkbox" checked={form.consent} onChange={e => setForm({ ...form, consent: e.target.checked })} required className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600" /><span className="text-slate-600 leading-relaxed">Saya menyetujui penyimpanan data dan representasi wajah untuk keperluan buku tamu sekolah.</span></label><div className="flex gap-4 pt-2"><button type="button" className="btn-secondary w-1/3" onClick={onBack}>Kembali</button><button className="btn-primary flex-1" disabled={busy}>{busy ? "Menyimpan..." : "Daftar dan Lanjut"}</button></div></form>;
}

function VisitForm({ visitor, image, employees, onSuccess, onBack }: { visitor: Visitor; image: string; employees: Employee[]; onSuccess: () => void; onBack: () => void }) {
  const [purpose, setPurpose] = useState(""); const [employeeId, setEmployeeId] = useState(""); const [meetPerson, setMeetPerson] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);
  const [isGroup, setIsGroup] = useState(false); const [groupMembers, setGroupMembers] = useState<{name: string}[]>([]);
  const [duration, setDuration] = useState("");

  async function submit(e: React.FormEvent) { 
    e.preventDefault(); 
    if (isGroup && groupMembers.length === 0) {
      setError("Daftar pengunjung tambahan tidak boleh kosong jika ini adalah kunjungan rombongan.");
      return;
    }
    if (isGroup && groupMembers.some(m => !m.name.trim())) {
      setError("Nama pengunjung tambahan tidak boleh kosong.");
      return;
    }
    setBusy(true); setError(null); 
    try { 
      await api("/visits", { 
        method: "POST", 
        body: JSON.stringify({ 
          visitor_id: visitor.id, 
          purpose, 
          employee_id: employeeId || null, 
          meet_person: employeeId ? null : meetPerson, 
          visit_photo: image, 
          confidence_score: visitor.confidence ?? null, 
          recognition_method: visitor.method,
          is_group: isGroup,
          group_members: isGroup ? groupMembers.filter(m => m.name.trim() !== '') : null,
          duration: duration ? parseInt(duration) : null
        }) 
      }); 
      onSuccess(); 
    } catch (err) { 
      setError(err instanceof ApiError ? err.message : "Registrasi gagal."); 
    } finally { 
      setBusy(false); 
    } 
  }

  function addMember() {
    setGroupMembers([...groupMembers, { name: "" }]);
  }

  function updateMember(index: number, name: string) {
    const newMembers = [...groupMembers];
    newMembers[index].name = name;
    setGroupMembers(newMembers);
  }

  function removeMember(index: number) {
    setGroupMembers(groupMembers.filter((_, i) => i !== index));
  }

  return <form onSubmit={submit} className="space-y-6 animate-in slide-in-from-right-4 duration-500">
    <div className="rounded-2xl bg-gradient-to-r from-brand-50 to-sky-50/30 p-6 border border-brand-100/50 shadow-sm"><p className="text-xs font-bold text-brand-600 tracking-widest uppercase mb-1">SELAMAT DATANG KEMBALI</p><h3 className="text-2xl font-extrabold text-slate-900">Senang melihat Anda kembali, {visitor.name}!</h3><p className="mt-1 text-sm text-slate-500">{visitor.institution || "Instansi belum dicatat"}{visitor.confidence != null ? ` • Akurasi ${(visitor.confidence * 100).toFixed(1)}%` : ""}</p></div>
    {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-100">{error}</p>}
    
    <div><label className="label">Apa keperluan kunjungan Anda hari ini?</label><textarea className="field min-h-32 resize-none" required value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Contoh: Menemui kepala sekolah untuk rapat, mengantar barang, dll." /></div>
    <div><label className="label">Siapa yang ingin Anda temui?</label><select className="field" value={employeeId} onChange={e => setEmployeeId(e.target.value)}><option value="">Pilih dari daftar atau ketik manual di bawah</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name}{e.department ? ` • ${e.department}` : ""}</option>)}</select></div>
    {!employeeId && <Field label="Tuliskan nama atau bagian yang ingin ditemui" value={meetPerson} onChange={setMeetPerson} required />}
    
    <div className="rounded-2xl border border-slate-200 p-5 space-y-4">
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={isGroup} onChange={(e) => setIsGroup(e.target.checked)} className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-600" />
        <span className="font-semibold text-slate-700">Ini adalah Kunjungan Rombongan</span>
      </label>
      
      {isGroup && (
        <div className="pl-8 space-y-3 mt-4">
          <p className="text-sm text-slate-500">Tambahkan daftar nama orang yang ikut bersama Anda (selain Anda sendiri).</p>
          {groupMembers.map((member, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input type="text" placeholder="Nama Lengkap" className="field flex-1 !mt-0" value={member.name} onChange={(e) => updateMember(i, e.target.value)} required />
              <button type="button" onClick={() => removeMember(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
          <button type="button" onClick={addMember} className="btn-secondary w-full text-sm border-dashed">
            + Tambah Anggota Rombongan
          </button>
        </div>
      )}
    </div>
    
    <div>
      <label className="label">Berapa lama estimasi kunjungan Anda?</label>
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "1 Jam", value: "1" },
          { label: "2 Jam", value: "2" },
          { label: "3 Jam", value: "3" },
          { label: "Lebih", value: "" }
        ].map((opt) => (
          <label key={opt.label} className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${duration === opt.value ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300'}`}>
            <input type="radio" name="duration" className="hidden" value={opt.value} checked={duration === opt.value} onChange={(e) => setDuration(e.target.value)} />
            {opt.label}
          </label>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500">Kami akan melakukan check-out otomatis saat waktu yang Anda pilih habis.</p>
    </div>

    <div className="flex gap-4 pt-2"><button type="button" className="btn-secondary w-1/3" onClick={onBack}>Batal</button><button className="btn-primary flex-1" disabled={busy}>{busy ? "Mencatat..." : "Selesaikan Check-in"}</button></div>
  </form>;
}

function PhoneSearch({ onFound }: { onFound: (v: Visitor) => void }) { const [phone, setPhone] = useState(""); const [error, setError] = useState(""); async function search() { setError(""); try { const r = await api<{ id: string; name: string; institution?: string }>(`/visitors/search?phone=${encodeURIComponent(phone)}`); onFound({ id: r.id, name: r.name, institution: r.institution, method: "phone" }); } catch { setError("Data tidak ditemukan."); } } return <div className="mt-4 flex gap-2"><input className="field min-w-0" placeholder="Nomor telepon" value={phone} onChange={e => setPhone(e.target.value)} /><button className="btn-secondary shrink-0" onClick={search} disabled={!phone}>Cari</button>{error && <span className="self-center text-xs text-red-700">{error}</span>}</div> }
function Field({ label, value, onChange, required = false }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) { return <div><label className="label">{label}</label><input className="field" value={value} onChange={e => onChange(e.target.value)} required={required} /></div> }
