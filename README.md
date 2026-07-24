# Sistem Buku Tamu Sekolah Berbasis Face Recognition

Baseline monorepo untuk check-in tamu sekolah menggunakan Next.js, Laravel 12, FastAPI, InsightFace, PostgreSQL 16 dengan pgvector, Redis, MinIO, dan Nginx.

## Cakupan baseline

- Check-in melalui kamera browser.
- Identifikasi wajah tamu lama melalui embedding 512 dimensi.
- Registrasi tamu baru dan penyimpanan foto ke MinIO.
- Pencatatan tujuan, pegawai yang ditemui, waktu masuk, dan waktu keluar.
- Login admin berbasis Laravel Sanctum token.
- Role `super_admin`, `operator`, dan `security`.
- Dashboard kunjungan harian.
- CRUD tamu dan pegawai.
- Ekspor laporan CSV.
- Audit log untuk tindakan penting.
- PWA manifest dan service worker dasar.
- Mode AI mock untuk pengembangan dan pengujian ringan.
- Docker Compose untuk seluruh layanan.

## Memulai cepat

Persyaratan: Docker Engine, Docker Compose v2, dan OpenSSL.

```bash
cp .env.example .env
./scripts/generate-secrets.sh
# Salin nilai yang dihasilkan ke .env, lalu:
./scripts/bootstrap.sh
```

Akses aplikasi melalui `http://localhost:8080`.

Akun awal:

- Email: nilai `DEFAULT_ADMIN_EMAIL` pada `.env`
- Password: nilai `DEFAULT_ADMIN_PASSWORD` pada `.env`

Ubah password awal sebelum deployment.

## Mode AI

`AI_MOCK_MODE=true` menghasilkan embedding deterministik dari isi gambar. Mode ini tidak melakukan deteksi wajah dan hanya ditujukan untuk pengembangan alur aplikasi. Pencocokan mock hanya konsisten jika byte gambar yang sama dikirim ulang.

Untuk mengaktifkan InsightFace asli:

```dotenv
AI_MOCK_MODE=false
AI_MODEL_NAME=buffalo_l
AI_PROVIDERS=CPUExecutionProvider
```

Model akan diunduh oleh pustaka InsightFace saat pertama kali dipakai dan disimpan pada volume `insightface_models`. Pastikan kebijakan lisensi model sesuai dengan penggunaan organisasi. Kode InsightFace berlisensi MIT, sedangkan model pralatih yang disediakan proyek memiliki ketentuan nonkomersial tersendiri.

## Perintah utama

```bash
make up
make logs
make migrate
make seed
make test
make smoke
make backup
make down
```

## Struktur repositori

```text
apps/frontend/       Next.js App Router, TypeScript, Tailwind
services/api/        Laravel 12 REST API
services/ai/         FastAPI dan InsightFace
infra/               Nginx dan inisialisasi PostgreSQL
scripts/             Setup, smoke test, backup, restore
docs/                Arsitektur, API, keamanan, deployment, pengujian
```

## Alur identifikasi

1. Frontend mengambil satu frame kamera.
2. Laravel mengirim gambar ke AI Service untuk menghasilkan embedding.
3. Laravel menjalankan cosine nearest-neighbor search pada pgvector.
4. Sistem menerima kecocokan jika skor melewati `AI_MATCH_THRESHOLD`.
5. Frontend menampilkan data tamu atau formulir registrasi.

## Batas baseline

- Liveness dan anti-spoofing belum diaktifkan.
- Mode produksi harus memakai TLS dan pengelolaan secret eksternal.
- Threshold pengenalan wajib dikalibrasi memakai data nyata sekolah.
- Pencetakan badge, WhatsApp, multi-campus, CCTV, dan aplikasi seluler disiapkan sebagai pengembangan lanjutan.

Baca `docs/IMPLEMENTATION.md` untuk urutan implementasi dan `docs/SECURITY_PRIVACY.md` sebelum mengolah data biometrik nyata.
