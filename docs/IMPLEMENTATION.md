# Baseline Implementasi

## 1. Keputusan arsitektur

Laravel menjadi sumber kebenaran untuk data tamu, kunjungan, otorisasi, file metadata, dan vector search. AI Service hanya melakukan inferensi. Pembagian ini menjaga AI Service tetap stateless dan menghindari duplikasi akses database.

Satu tamu dapat memiliki beberapa embedding. Desain ini lebih aman daripada relasi satu-ke-satu karena sistem dapat menyimpan sampel tambahan dari sudut dan kondisi pencahayaan berbeda. Kolom `is_primary` menandai sampel utama.

## 2. Tahapan pengembangan

### Tahap A. Fondasi

- Jalankan Docker Compose dalam mode mock.
- Uji login, registrasi, identifikasi, check-in, check-out, dan ekspor CSV.
- Ganti kredensial default.
- Konfigurasikan retensi foto.

### Tahap B. Kalibrasi wajah

- Aktifkan InsightFace asli pada lingkungan uji.
- Kumpulkan data uji dengan persetujuan.
- Hitung false accept rate dan false reject rate pada beberapa threshold.
- Tetapkan threshold berdasarkan risiko operasional, bukan berdasarkan satu contoh.

### Tahap C. Penguatan produksi

- Aktifkan HTTPS.
- Gunakan secret manager.
- Pisahkan jaringan publik dan privat.
- Tambahkan backup terenkripsi dan uji pemulihan.
- Tambahkan liveness atau anti-spoofing.
- Terapkan observability, alerting, dan audit review.

## 3. Kontrak layanan

Frontend hanya memanggil Laravel. Laravel memanggil AI Service melalui jaringan privat dengan token layanan. Browser tidak boleh memanggil AI Service atau MinIO secara langsung kecuali memakai URL bertanda tangan yang berumur pendek.

## 4. Strategi vector search

Baseline memakai cosine distance pgvector:

```sql
SELECT visitor_id, 1 - (embedding <=> :query_vector::vector) AS score
FROM face_embeddings
WHERE active = true
ORDER BY embedding <=> :query_vector::vector
LIMIT 1;
```

HNSW index tersedia pada migrasi. Untuk dataset kecil, PostgreSQL mungkin memilih sequential scan karena biayanya lebih rendah. Ini normal.

## 5. Definition of done minimum

- Seluruh health check lulus.
- Tidak ada password default di produksi.
- Check-in median di bawah 10 detik pada jaringan target.
- Audit log mencatat login, registrasi, identifikasi berhasil, check-in, dan check-out.
- Backup dan restore telah diuji.
- Kebijakan persetujuan, retensi, koreksi, dan penghapusan data tersedia.
