# Deployment

## Pengembangan

Gunakan `AI_MOCK_MODE=true`. Seluruh port dapat diekspos pada host lokal.

## Produksi satu server

- Hanya port 80 dan 443 Nginx yang dibuka ke publik.
- Hapus pemetaan port PostgreSQL, MinIO API, MinIO Console, dan AI Service.
- Letakkan TLS certificate pada reverse proxy atau load balancer.
- Tetapkan `APP_ENV=production` dan `APP_DEBUG=false`.
- Gunakan secret acak untuk database, MinIO, AI token, dan APP_KEY.
- Tetapkan `AUTO_SEED=false` setelah bootstrap pertama.
- Gunakan image tag tetap untuk semua service.

## Scaling

- Frontend dan API dapat direplikasi di belakang load balancer.
- Worker dapat ditambah sesuai panjang antrean.
- AI Service dapat direplikasi. Gunakan GPU provider bila tersedia.
- PostgreSQL tetap menjadi stateful component utama. Gunakan backup, replication, dan monitoring.

## Backup

Jalankan `scripts/backup.sh` secara terjadwal. Backup database tidak mencakup objek MinIO. Buat backup bucket secara terpisah dan simpan kunci enkripsi aplikasi bersama prosedur pemulihan yang aman.
