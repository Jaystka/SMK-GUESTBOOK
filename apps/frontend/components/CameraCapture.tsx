"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScanFace, CheckCircle2, XCircle, AlertCircle, Loader2, Sparkles, UserPlus } from 'lucide-react';

type Props = {
  onCapture: (image: string) => void;
  status?: "idle" | "processing" | "success" | "error" | "unregistered";
  onRetry?: () => void;
  onRegister?: () => void;
};
export function CameraCapture({ onCapture, status = "idle", onRetry, onRegister }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const startingRef = useRef(false);
  const start = useCallback(async () => {
    if (startingRef.current || streamRef.current) return;
    startingRef.current = true;
    setError(null);
    setReady(false);
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: process.env.NEXT_PUBLIC_CAMERA_FACING_MODE ?? "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
      } catch (firstErr) {
        // Fallback to absolute most basic video request if the specific resolution/facing mode fails
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setReady(true);
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      setError(err?.message || "Kamera tidak dapat diakses.");
    } finally {
      startingRef.current = false;
    }
  }, []);

  // Single effect to handle camera lifecycle based on status
  useEffect(() => {
    if (status !== "idle") {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        setReady(false);
      }
    } else if (status === "idle" && !streamRef.current && !error) {
      void start();
    }

    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [status, start, error]);

  function capture() {
    const video = videoRef.current;
    if (!video || !ready) return;
    const canvas = document.createElement("canvas");
    const max = 640;
    const scale = Math.min(1, max / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    onCapture(canvas.toDataURL("image/jpeg", 0.85));
  }

  function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError("Ukuran foto maksimal 8 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onCapture(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col text-slate-800 w-full">

      {/* Container utama kamera - Kotak Aspect Ratio 4:3 */}
      <div className="relative w-full aspect-[4/3] bg-slate-100 rounded-3xl overflow-hidden shadow-inner group border border-slate-200">

        {/* Video Element */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${(status === 'idle' && ready && !error) ? 'opacity-100' : 'opacity-40 grayscale-[50%]'}`}
        />

        {/* Garis Panduan Wajah (Face Guide) - Selalu dipertahankan */}
        {(!error && ready) && (
          <div className="pointer-events-none absolute inset-[14%_25%] rounded-[45%] border-2 border-dashed border-white shadow-[0_0_15px_rgba(0,0,0,0.2)] transition-opacity duration-500 z-10" />
        )}

        {/* Efek Garis Scan saat Idle (Posisikan Wajah) */}
        {status === 'idle' && ready && !error && (
          <div className="pointer-events-none absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent to-brand-500/20 z-20 animate-[scan_3s_ease-in-out_infinite_alternate] overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-500 shadow-[0_0_15px_rgba(34,167,230,1)]"></div>
          </div>
        )}

        {/* Overlay saat Loading Awal */}
        {!ready && !error && status === 'idle' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white animate-in fade-in duration-300">
            <Loader2 size={48} className="text-brand-500 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Mengakses Kamera...</h3>
            <p className="text-sm text-slate-500 text-center">Mohon izinkan akses kamera pada browser Anda.</p>
          </div>
        )}

        {/* Overlay Error Kamera */}
        {error && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white p-6 animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 mb-4 border-2 border-orange-100">
              <AlertCircle size={40} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Kamera Tidak Ditemukan</h3>
            <p className="text-sm text-slate-500 mb-6 text-center">{error}</p>
          </div>
        )}

        {/* Overlay Processing (Memproses) */}
        {status === 'processing' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white animate-in zoom-in-95 duration-300">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-brand-500 shadow-sm border border-slate-200">
                <ScanFace size={48} strokeWidth={1.5} />
              </div>
              <svg className="animate-spin absolute -inset-3 w-30 h-30 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Memverifikasi Data...</h3>
            <p className="text-sm text-slate-500">Menganalisis fitur wajah Anda.</p>
          </div>
        )}

        {/* Overlay Success (Berhasil) */}
        {status === 'success' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white animate-in zoom-in-95 duration-500">
            <div className="mb-6 relative">
              <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 relative z-10 shadow-sm border-2 border-emerald-100">
                <CheckCircle2 size={56} strokeWidth={2} />
              </div>
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20" style={{ animationDuration: '2s' }}></div>
            </div>
            <h3 className="text-3xl font-extrabold text-emerald-500 mb-2">Autentikasi Berhasil</h3>
            <p className="text-sm text-slate-500">Wajah cocok. Identitas terverifikasi.</p>
          </div>
        )}

        {/* Overlay Error (Gagal Dikenali) */}
        {status === 'error' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white animate-in zoom-in-95 duration-500 p-6">
            <div className="mb-6 relative animate-[shake_0.5s_ease-in-out]">
              <div className="w-24 h-24 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 relative z-10 shadow-sm border-2 border-rose-100">
                <XCircle size={56} strokeWidth={2} />
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-rose-500 mb-2">Autentikasi Gagal</h3>
            <p className="text-sm text-slate-500 text-center max-w-[280px]">Wajah tidak dikenali atau belum terdaftar.</p>
          </div>
        )}

        {/* Overlay Unregistered (Popup User Baru) */}
        {status === 'unregistered' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white p-6 animate-in zoom-in-95 duration-500">
            <div className="flex flex-col items-center text-center w-full max-w-sm">
              <div className="mb-6 relative">
                <div className="w-24 h-24 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 relative z-10 shadow-sm border-2 border-brand-100">
                  <Sparkles size={48} strokeWidth={1.5} />
                </div>
                {/* Efek ping animasi yang ramah (menyambut) */}
                <div className="absolute inset-0 bg-brand-400 rounded-full animate-ping opacity-20" style={{ animationDuration: '2s' }}></div>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">Selamat Datang!</h3>
              <p className="text-sm text-slate-500 max-w-[280px]">Selamat berkunjung ke SMKN Ngadirojo. Silakan lakukan registrasi untuk melanjutkan.</p>
            </div>
          </div>
        )}

      </div>

      {/* Action Buttons */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 w-full">
        {status === 'idle' && (
          <>
            <button className="col-span-2 py-3 px-4 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 outline-none disabled:opacity-50" onClick={capture} disabled={!ready || error !== null}>
              Ambil Foto
            </button>
            <label className="hidden py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors text-center cursor-pointer shadow-sm disabled:opacity-50">
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={upload} />
              Unggah Foto
            </label>
          </>
        )}

        {status === 'processing' && (
          <button className="col-span-2 py-3 px-4 bg-slate-100 text-slate-400 rounded-xl font-medium cursor-not-allowed text-center" disabled>
            Memproses...
          </button>
        )}

        {status === 'success' && (
          <button className="col-span-2 py-3 px-4 bg-emerald-500 text-white rounded-xl font-medium shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all text-center pointer-events-none">
            Melanjutkan...
          </button>
        )}

        {status === 'error' && (
          <button onClick={onRetry} className="col-span-2 py-3 px-4 bg-rose-50 text-rose-600 rounded-xl font-medium hover:bg-rose-100 transition-colors shadow-sm">
            Coba Lagi Pindai Wajah
          </button>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
      `}} />
    </div>
  );
}
