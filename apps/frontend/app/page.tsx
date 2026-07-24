import { CheckInFlow } from "@/components/CheckInFlow";

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-white to-slate-50 shadow-[0_8px_16px_-4px_rgba(34,167,230,0.4),inset_0_-4px_6px_-1px_rgba(0,0,0,0.1),inset_0_2px_5px_rgba(255,255,255,1)] border border-slate-200 p-2">
              <img src="/logosmk.png" alt="Logo SMK" className="h-full w-full object-contain drop-shadow-sm" />
            </div>
            <div><p className="text-sm font-semibold tracking-wide text-brand-700 uppercase">Buku Tamu Digital</p><h1 className="text-xl font-bold md:text-2xl">SMKN NGADIROJO</h1></div>
          </div>
          {/* <a href="/admin/login" className="rounded-2xl border border-white/50 bg-white/40 backdrop-blur-md px-5 py-2.5 text-sm font-semibold text-slate-800 transition-all duration-300 hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">Login Admin</a> */}
        </header>
        <CheckInFlow />
        <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-5 text-slate-500">Dengan menekan tombol di atas, Anda menyetujui kebijakan privasi sekolah terkait pencatatan kunjungan dan pengenalan wajah.</p>
      </div>
    </main>
  );
}
