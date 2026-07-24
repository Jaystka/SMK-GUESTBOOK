# Strategi Pengujian

## Unit dan feature API

- Login sukses dan gagal.
- Validasi role.
- Registrasi tamu.
- Identifikasi di atas dan di bawah threshold.
- Pembuatan kunjungan.
- Check-out idempotent.
- Filter laporan.

## AI Service

- Base64 valid dan tidak valid.
- Mode mock menghasilkan embedding 512 dimensi yang ternormalisasi.
- Mode asli menolak gambar tanpa wajah dan lebih dari satu wajah.
- Similarity mengembalikan kandidat tertinggi.

## Frontend

- Kamera mendapat izin.
- Fallback upload bekerja saat kamera tidak tersedia.
- Form tidak dapat dikirim dua kali.
- Token kedaluwarsa mengarahkan pengguna ke login.

## Uji biometrik

Pisahkan data kalibrasi dan data pengujian. Ukur false accept rate, false reject rate, distribusi skor genuine, dan distribusi skor impostor. Lakukan pengujian lintas pencahayaan, usia, perangkat kamera, kacamata, masker, dan sudut wajah.
