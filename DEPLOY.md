# Panduan setup dan deploy

Panduan ini untuk situs portfolio, tulisan, dan CMS di repository ini. Target production: **https://raihandaris.web.id**. Dibutuhkan akun GitHub, Supabase, Vercel, serta akses pengaturan DNS domain.

## 1. Pilih versi kode

Kode aplikasi dikembangkan di branch `hoplite/eleutherna-091c74bd`. Setelah pull request ditinjau, merge ke `main` sebelum memakai `main` sebagai Production Branch Vercel. Push branch saja tidak memperbarui `main`.

Jika ingin mencoba sebelum merge, import branch tersebut sebagai deployment uji. Jangan menghubungkan kredensial database production ke preview yang tidak dipercaya.

## 2. Buat Supabase dari database kosong

1. Buat project di dashboard Supabase, pilih region yang dekat dengan pengunjung, lalu simpan password database di password manager.
2. Tunggu project siap, buka **SQL Editor**, salin seluruh isi [`supabase/setup.sql`](supabase/setup.sql), lalu jalankan **satu kali**.
3. Pastikan tabel berikut tersedia di schema `public`: `projects`, `posts`, `post_files`, `project_images`, `site_settings`, dan `post_drafts`.
4. Pastikan `site_settings` memiliki satu baris dengan `id = 1`.
5. Di **Storage**, pastikan bucket `note-files` dibuat dengan akses public, batas 10 MiB, dan MIME JPEG, PNG, WebP, serta PDF. Konfigurasi ini sudah disertakan dalam SQL.
6. **Jangan jalankan `supabase/seed.sql` di production.** File itu berisi contoh untuk development, bukan portfolio sebenarnya.

Fresh setup terbaru sudah memuat profil dan autosave. Tidak perlu menjalankan dua migrasi tambahan setelah fresh setup berhasil.

### Jika setup versi lama sudah pernah dijalankan

Jangan mengulang `setup.sql` dan jangan menghapus tabel yang berisi data. Backup terlebih dahulu, kemudian jalankan:

1. [`supabase/migrations/20260919_add_profile_fields.sql`](supabase/migrations/20260919_add_profile_fields.sql)
2. [`supabase/migrations/20260919_post_drafts.sql`](supabase/migrations/20260919_post_drafts.sql)

Uji migrasi di development dahulu. Jika muncul error constraint/index, periksa data yang sudah ada; jangan menghapus draft atau menonaktifkan RLS untuk memaksa migrasi berhasil.

### Batas privasi yang perlu diketahui

- Teks artikel/proyek yang belum diterbitkan tidak dapat dibaca pengunjung lewat query publik.
- Tabel `post_drafts` sepenuhnya privat; browser tidak diberi izin membaca atau menulis langsung. Semua akses lewat server yang memeriksa admin.
- **Bucket media bersifat public.** Gambar/PDF yang sudah diunggah dapat diakses oleh siapa pun yang memiliki URL, termasuk media yang dilampirkan pada draft. Jangan unggah dokumen rahasia.
- Jangan menambahkan policy Storage write untuk `anon` atau `authenticated`; aplikasi memakai signed upload URL dari server admin.

## 3. Buat satu akun admin

1. Buka **Authentication → Users → Add user/Create user**.
2. Buat akun menggunakan email milik pemilik situs dan password kuat. Pilih konfirmasi email otomatis jika dashboard menyediakan opsi tersebut, atau pastikan user sudah berstatus confirmed sebelum login.
3. Catat email yang sama untuk environment `ADMIN_EMAIL`; masukkan tanpa spasi di awal/akhir.
4. Di konfigurasi Authentication, matikan **Allow new users to sign up**. Tetap aktifkan metode login email/password.
5. Atur **Site URL** menjadi `https://raihandaris.web.id`. Login aplikasi saat ini menggunakan email/password langsung; tidak membutuhkan callback OAuth. Alur reset password melalui email belum dibuat di aplikasi.

Password admin adalah password akun Auth, **bukan** password database dan bukan API key. Tidak perlu menyimpan password admin di environment aplikasi.

## 4. Siapkan environment

Ambil Project URL serta API keys dari dialog **Connect** atau **Settings → API Keys** di Supabase. Nama menu dapat berubah; jenis key dan nilainya yang penting.

| Nama environment | Nilai yang diisi | Penggunaan |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL project, seperti `https://<project-ref>.supabase.co` | Browser dan server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Publishable key**; legacy `anon` juga didukung | Browser dan server; akses dibatasi RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret key**; legacy `service_role` juga didukung | Rahasia, hanya server |
| `ADMIN_EMAIL` | Email user Auth yang dibuat pada langkah 3 | Server; membatasi pemilik CMS |
| `CRON_SECRET` | String acak panjang tanpa newline | Server; melindungi endpoint cron |
| `NEXT_PUBLIC_SITE_URL` | **`https://raihandaris.web.id`** tanpa trailing slash | URL canonical production |
| `GITHUB_TOKEN` | Opsional; token read-only dengan izin minimum ke repo yang diperlukan | Server; membantu batas API GitHub |
| `ENABLE_EXPERIMENTAL_COREPACK` | `1` di Vercel | Build; memakai pnpm yang dipin di `package.json` |

Walaupun nama environment masih memakai istilah `ANON_KEY` dan `SERVICE_ROLE_KEY`, nilai publishable/secret baru digunakan dengan nama yang sama. Jangan menukar kedua jenis key. Supabase merekomendasikan key generasi baru untuk setup baru.

Untuk membuat `CRON_SECRET`, jalankan **di komputer sendiri**, lalu salin hasilnya ke Vercel/password manager, bukan ke chat atau repository:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

`GITHUB_TOKEN` boleh dikosongkan. Situs tetap berfungsi; panel aktivitas repo dapat tidak tersedia ketika batas API GitHub tercapai.

**Aturan penting:**

- Jangan pernah menambahkan prefix `NEXT_PUBLIC_` pada secret/service-role key.
- Jangan commit `.env.local`, `.env.production`, password, atau screenshot dashboard yang menampilkan secret. Repository ini publik.
- Untuk Preview/Development, lebih aman menggunakan project Supabase terpisah beserta akun admin development.
- Mengubah environment Vercel memerlukan deployment baru. Nilai `NEXT_PUBLIC_*` digunakan saat build; sekadar mengubah setting tidak memperbarui deployment yang sudah ada.

## 5. Import ke Vercel

1. Login Vercel, pilih **Add New → Project**, lalu import `NirmawatiYusuf/lp` melalui integrasi GitHub.
2. Gunakan konfigurasi berikut:

   | Pengaturan | Nilai |
   | --- | --- |
   | Framework Preset | Next.js |
   | Root Directory | Root repository (`./`) |
   | Node.js Version | `24.x` — juga dipin oleh `engines.node` |
   | Package manager | pnpm `10.26.0` melalui Corepack |
   | Install Command | Biarkan otomatis; jangan override ke versi pnpm lama |
   | Build Command | `pnpm build` |
   | Output Directory | Default Next.js; jangan isi `out` |
   | Production Branch | `main`, setelah PR kode aplikasi di-merge |

3. Masukkan environment pada langkah 4 untuk **Production** sebelum deployment pertama. Pastikan `ENABLE_EXPERIMENTAL_COREPACK=1` sudah aktif saat install dependency.
4. Jika membutuhkan preview CMS, isi environment **Preview** menggunakan Supabase development. Jangan membagikan secret production ke build branch/fork yang tidak dipercaya.
5. Deploy. Halaman publik memang bisa dibangun tanpa Supabase, jadi build yang berhasil saja belum membuktikan CMS siap.
6. Periksa Build Logs: framework Next.js terdeteksi, pnpm sesuai, dan build selesai tanpa error.

Build production sengaja menolak `NEXT_PUBLIC_SITE_URL` yang berbeda dari `https://raihandaris.web.id`. Vercel menyediakan `VERCEL_ENV` otomatis; tidak perlu membuat atau mengubahnya sendiri.

## 6. Hubungkan domain

1. Pada project Vercel, buka **Settings → Domains** dan tambahkan `raihandaris.web.id`.
2. Di penyedia domain/DNS, masukkan record **persis seperti yang diberikan Vercel**. Jangan menyalin IP/CNAME dari panduan lama karena target dapat berbeda antar-project.
3. Hindari record A/AAAA/CNAME yang saling bertentangan pada hostname yang sama. Jangan menghapus record email (MX/TXT) yang masih digunakan.
4. Tunggu Vercel menampilkan konfigurasi domain valid dan sertifikat HTTPS aktif.
5. Opsional: tambahkan `www.raihandaris.web.id` dengan redirect ke domain utama tanpa `www`.

Canonical situs tetap domain utama. Periksa halaman dari domain itu setelah DNS aktif, bukan hanya dari URL sementara `vercel.app`.

## 7. Isi profil dan konten

1. Buka halaman masuk admin melalui URL langsung `/admin/login`, lalu login dengan user pada langkah 3. Tautan ini sengaja tidak ditampilkan di navigasi publik; jangan menambahkannya kembali.
2. Pada pengaturan admin, isi email publik, GitHub, LinkedIn, bio, pendidikan, serta fokus/minat. Field kontak kosong disembunyikan dari publik.
3. Untuk foto dan CV, unggah media yang boleh dipublikasikan ke Storage melalui dashboard, lalu salin **public HTTPS URL** ke pengaturan. Hindari signed URL sementara. Foto JPEG/PNG/WebP dan CV PDF sesuai aturan bucket.
4. Buat proyek dengan judul, ringkasan, masalah, pendekatan, hasil, peran, periode, dan stack yang benar-benar sesuai. Simpan sebelum menambahkan gambar; urutan gambar terkecil menjadi cover kartu di beranda.
5. Bahan studi kasus situs ini tersedia di [`content/portfolio-case-study.md`](content/portfolio-case-study.md). Tinjau dan lengkapi atribusi, screenshot, serta tautan yang sudah aktif sebelum diterbitkan.
6. Untuk tulisan, tunggu status **Draft tersimpan secara privat** sebelum meninggalkan editor. Preview tidak menerbitkan artikel. Tombol **Simpan tulisan** menerapkan isi dan pilihan publikasi secara eksplisit.
7. Upload media diterapkan langsung; urutan/penghapusan file diterapkan saat menyimpan tulisan. Setiap tulisan mendukung paling banyak satu PDF.

Halaman Lab/Eksperimen belum dibuat. Daftar mata kuliah sengaja kosong; bila dibutuhkan kemudian, konfigurasinya berada di `src/lib/site.ts`.

## 8. Checklist setelah deploy

- [ ] `/`, `/projects`, `/writing`, dan `/about` terbuka pada desktop dan ponsel tanpa scroll horizontal.
- [ ] Halaman publik tidak memiliki tautan ke admin; akses ke dashboard tanpa login diarahkan ke login.
- [ ] Akun admin bisa masuk dan keluar; akun lain tidak dapat membuka CMS.
- [ ] Pengaturan profil berubah pada halaman publik setelah disimpan.
- [ ] Buat draft tulisan, tunggu autosave, tutup/buka editor, lalu pastikan isi dipulihkan.
- [ ] Buka artikel yang sudah terbit, ubah teks dan tunggu autosave: pembaca publik masih melihat versi lama sampai **Simpan tulisan** ditekan.
- [ ] Uji konflik dengan membuka editor di dua tab: versi terbaru tidak ditimpa tanpa konfirmasi.
- [ ] Periksa preview, daftar isi, pencarian, serta artikel terkait menggunakan konten yang benar-benar diterbitkan.
- [ ] Upload gambar dan satu PDF; pastikan file melebihi 10 MiB ditolak dan file publik terbuka sesuai harapan.
- [ ] Buka sesi incognito: draft artikel/proyek tidak muncul, dan tabel `post_drafts` tidak dapat dibaca dengan key publik.
- [ ] `sitemap.xml` menggunakan domain utama dan tidak memuat halaman admin; `robots.txt` tersedia.
- [ ] Pantau Runtime Logs untuk error Supabase/auth/storage setelah uji coba.

Pengujian repository mencakup tes komponen, TypeScript, lint, build, dan UI publik. Checklist database nyata ini tetap harus dilakukan setelah layanan dikonfigurasi; kredensial Supabase production tidak disertakan dalam repository.

### Cron

`vercel.json` menjadwalkan pemeriksaan database setiap hari pada `0 3 * * *` (nominal 03:00 UTC/10:00 WIB; ketepatan waktu mengikuti paket Vercel). Cron Vercel berjalan pada deployment production dan mengirim `Authorization: Bearer <CRON_SECRET>` otomatis.

Periksa **Settings → Cron Jobs** dan log eksekusinya. Membuka endpoint langsung tanpa authorization memang menghasilkan HTTP 401. Cron ini bukan backup database atau jaminan bahwa project gratis tidak pernah dihentikan sementara oleh penyedia.

## 9. Menjalankan lokal dan melakukan update

Gunakan Node.js 24 dengan Corepack/pnpm tersedia, kemudian:

```bash
git clone https://github.com/NirmawatiYusuf/lp.git
cd lp
# Jika PR belum di-merge:
git checkout hoplite/eleutherna-091c74bd
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
# Isi .env.local dengan konfigurasi development.
pnpm dev
```

Untuk quality gates:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

Untuk update berikutnya: uji perubahan, tinjau PR, terapkan migrasi yang diperlukan setelah backup, lalu merge ke Production Branch. Integrasi GitHub–Vercel akan membuat deployment baru. Rollback aplikasi Vercel **tidak** otomatis mengembalikan schema/data Supabase.

## Troubleshooting

| Gejala | Periksa |
| --- | --- |
| Build menolak domain | `NEXT_PUBLIC_SITE_URL` harus tepat `https://raihandaris.web.id`, lalu redeploy. |
| `package.json` tidak ditemukan saat deploy | Production Branch masih hanya berisi spesifikasi; merge PR aplikasi atau pilih branch yang sudah memuat kode. |
| Login menampilkan error konfigurasi | URL Supabase, key publik, key server, dan `ADMIN_EMAIL` harus terisi pada environment deployment tersebut. |
| Kredensial ditolak | Email/password user Auth benar, email confirmed, provider email aktif, dan `ADMIN_EMAIL` sesuai tanpa spasi. |
| Login berhasil tetapi akses ditolak | Akun tersebut tidak cocok dengan `ADMIN_EMAIL`. Jangan menghapus pemeriksaan otorisasi atau membuka RLS. |
| Konten tetap kosong | Pastikan SQL berhasil, isi row `published = true` melalui CMS, cek URL/key project dan Runtime Logs. Fallback kosong tidak membuktikan koneksi DB sehat. |
| Autosave gagal | Pastikan tabel/migrasi `post_drafts` sudah ada, sesi admin aktif, dan secret/server key benar. Jangan keluar sebelum status penyimpanan dikonfirmasi. |
| Upload gagal | Simpan konten induk dahulu; cek bucket, MIME, ukuran, satu PDF per tulisan, sesi, dan signed upload. |
| Gambar tidak tampil | Pastikan public URL, bucket public, dan host Supabase sesuai `next.config.ts`; custom Storage domain perlu ditambahkan secara eksplisit. |
| Environment sudah diubah, tetapi hasil sama | Buat deployment baru; periksa apakah perubahan diterapkan ke Production atau Preview yang benar. |
| Cron 401/503 | 401: secret tidak cocok. 503: konfigurasi admin/database belum siap atau query gagal; cek log. |

## Referensi resmi

- [Vercel: build settings dan Corepack](https://vercel.com/docs/builds/configure-a-build)
- [Vercel: package managers](https://vercel.com/docs/package-managers)
- [Vercel: versi Node.js](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)
- [Vercel: pengamanan cron](https://vercel.com/docs/cron-jobs/manage-cron-jobs)
- [Supabase: API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase: publishable/secret keys](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys)
- [Supabase: login email/password](https://supabase.com/docs/guides/auth/passwords)
