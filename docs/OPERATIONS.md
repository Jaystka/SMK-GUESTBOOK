# Operasional

## Pemeriksaan harian

1. Pastikan container berstatus sehat.
2. Periksa panjang antrean worker.
3. Periksa kapasitas PostgreSQL dan MinIO.
4. Tinjau error log API dan AI Service.
5. Tinjau kunjungan yang belum check-out.

## Insiden AI Service

Sistem harus menampilkan pencarian melalui telepon sebagai fallback. Jangan menurunkan threshold hanya untuk mengatasi gangguan atau kegagalan pengenalan karena tindakan tersebut dapat meningkatkan false acceptance.

## Retensi

Buat job terjadwal untuk menghapus foto kunjungan sesuai kebijakan organisasi. Riwayat metadata dapat memiliki masa retensi berbeda dari foto dan embedding.

## Pemulihan

1. Pulihkan PostgreSQL.
2. Pulihkan bucket MinIO.
3. Pulihkan `APP_KEY` dan `PHONE_HASH_KEY` yang sesuai dengan backup.
4. Jalankan migrasi.
5. Jalankan smoke test.
6. Uji dekripsi data contoh dan akses foto privat.
