# Keamanan dan Privasi

Data embedding wajah merupakan data biometrik sensitif. Organisasi harus menetapkan dasar pemrosesan, pemberitahuan privasi, persetujuan bila diperlukan, tujuan penggunaan, masa retensi, mekanisme koreksi, dan penghapusan.

## Kontrol yang sudah tersedia

- Token Laravel Sanctum.
- Role middleware.
- Rate limiting.
- Encrypted cast untuk nomor telepon dan alamat.
- Bucket MinIO privat.
- Token antarlayanan untuk AI Service.
- Audit log.
- Validasi MIME, ukuran file, dan jumlah wajah.

## Kontrol sebelum produksi

- TLS pada reverse proxy.
- Secret manager dan rotasi kredensial.
- Kunci enkripsi aplikasi yang dibackup dengan aman.
- Network policy yang melarang akses publik ke PostgreSQL, Redis, MinIO, dan AI Service.
- Liveness detection untuk menolak foto cetak atau layar ponsel.
- Antivirus atau content scanning untuk unggahan non-gambar jika fitur diperluas.
- Retensi otomatis untuk foto kunjungan.
- Pengujian akses berbasis role.

## Ancaman utama

- Spoofing menggunakan foto atau video.
- False positive yang mengaitkan orang dengan identitas salah.
- Kebocoran foto dan embedding.
- Penyalahgunaan endpoint identifikasi untuk enumerasi identitas.
- Pencurian token operator.

Respons baseline mengembalikan data minimal pada endpoint publik. Detail sensitif hanya tersedia setelah autentikasi.

## Kunci kriptografi

Simpan `APP_KEY` dan `PHONE_HASH_KEY` secara terpisah dari repositori. Jangan mengganti kunci tanpa rencana migrasi karena perubahan `APP_KEY` memengaruhi dekripsi data lama dan perubahan `PHONE_HASH_KEY` memengaruhi pencarian nomor telepon.
