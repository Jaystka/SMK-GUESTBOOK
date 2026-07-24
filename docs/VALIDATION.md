# Hasil Validasi Baseline

Validasi yang telah dijalankan pada source code:

- 71 berkas PHP lulus pemeriksaan sintaks `php -l`.
- 3 pengujian FastAPI lulus dalam mode AI mock.
- 18 berkas TypeScript dan TSX lulus parsing melalui esbuild.
- `docker-compose.yml`, workflow CI, dan OpenAPI lulus parsing YAML.
- `package.json`, `composer.json`, dan `tsconfig.json` lulus parsing JSON.
- 6 shell script lulus pemeriksaan `bash -n`.

Batas pemeriksaan lingkungan penyusunan:

- Docker Engine tidak tersedia sehingga build seluruh container belum dijalankan di lingkungan ini.
- Dependensi Composer dan npm tidak disertakan dalam ZIP. Dockerfile akan memasangnya saat build.
- Pengujian model InsightFace asli belum dijalankan karena model berukuran besar tidak disertakan. Mode mock telah diuji.

Jalankan `make up`, `make smoke`, dan `make test` pada mesin yang memiliki Docker sebelum deployment ke produksi.
