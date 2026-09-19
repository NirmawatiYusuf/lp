# Situs Raihan Daris Ramadhan

Portfolio, tulisan, dan CMS pribadi yang dibangun dengan Next.js 16, Supabase, dan TypeScript. Domain production ditetapkan ke `https://raihandaris.web.id`.

**Panduan lengkap:** [DEPLOY.md](DEPLOY.md) — mulai dari database kosong, akun admin, environment, Vercel, DNS, sampai pemeriksaan setelah peluncuran.

## Menjalankan lokal

Gunakan Node.js 24 dan pnpm 10.26.0 sesuai `package.json`.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Halaman publik tetap dapat dibuka tanpa konfigurasi Supabase. CMS, data, dan upload baru aktif setelah environment diisi.

## Menyiapkan Supabase baru

1. Buat project Supabase.
2. Buka SQL Editor dan jalankan `supabase/setup.sql` satu kali.
3. Opsional untuk development: jalankan `supabase/seed.sql`. Jangan jalankan seed di production.
4. Buka Authentication → Users, lalu buat satu user admin secara manual.
5. Matikan public sign-up pada pengaturan Authentication.
6. Pastikan bucket `note-files` bersifat public, maksimum 10MB, dan MIME sesuai `setup.sql`.

## Environment

Salin `.env.example`, lalu isi:

- `NEXT_PUBLIC_SUPABASE_URL`: project URL Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: publishable key (atau legacy anon key).
- `SUPABASE_SERVICE_ROLE_KEY`: secret key (atau legacy service-role key), hanya server. Nama environment tetap sama.
- `ADMIN_EMAIL`: harus sama persis dengan user Supabase Auth yang dibuat.
- `CRON_SECRET`: string acak minimal 16 karakter.
- `GITHUB_TOKEN`: opsional, fine-grained read-only untuk repository publik.
- `NEXT_PUBLIC_SITE_URL`: `https://raihandaris.web.id` di production.

Jangan commit `.env.local` atau menaruh service-role key pada variable `NEXT_PUBLIC_*`.

## Deploy ke Vercel

1. Push repository ke GitHub dan import ke Vercel.
2. Pilih Next.js, Node.js 24.x, dan aktifkan `ENABLE_EXPERIMENTAL_COREPACK=1` agar pnpm mengikuti versi di `package.json`. Biarkan Install Command otomatis; Build Command `pnpm build`.
3. Isi semua environment di atas untuk Production. Isi environment Supabase juga untuk Preview bila CMS perlu diuji di preview.
4. Deploy dan hubungkan domain `raihandaris.web.id` di Vercel.
5. Atur DNS sesuai instruksi Vercel.
6. Buka `/admin/login`, masuk, lalu isi email publik, GitHub, dan LinkedIn di `/admin/settings`.
7. Buat konten dari CMS dan publish setelah preview selesai diperiksa.

`vercel.json` menjalankan keepalive Supabase satu kali per hari. Endpoint menolak request tanpa `Bearer CRON_SECRET`.

## Quality gates

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

## Profil, publikasi, dan editor

- `/about` memuat profil, pendidikan, minat, foto, dan tautan CV. Kelola isinya melalui pengaturan admin. Foto/CV bersifat opsional; masukkan URL HTTPS publik, bukan URL bertanda tangan yang akan kedaluwarsa.
- Landing mobile menampilkan karya lebih awal, menggunakan screenshot pertama berdasarkan urutan gambar sebagai sampul, fokus berbentuk accordion, dan proses empat tahap. Tidak ada proyek atau pencapaian contoh yang dipublikasikan otomatis.
- Bahan studi kasus yang berasal dari implementasi repository tersedia di `content/portfolio-case-study.md`. Tinjau, lengkapi atribusi serta screenshot, lalu masukkan melalui pengelola proyek.
- Editor artikel menyediakan preview Markdown dan autosave ke tabel **privat** `post_drafts`. Autosave tidak mengubah artikel publik; tombol simpan tetap diperlukan untuk menerapkan perubahan dan pilihan publikasi.
- Perhatikan status penyimpanan sebelum meninggalkan editor. Kegagalan koneksi atau migrasi yang belum diterapkan ditampilkan sebagai kegagalan autosave, bukan sebagai draft yang sudah tersimpan.
- Artikel memiliki daftar isi serta tulisan terkait. Arsip tulisan mendukung pencarian dan filter topik. Halaman Lab/Eksperimen belum dibuat.
- Tautan admin tidak ditampilkan pada halaman publik; autentikasi dan otorisasi server tetap menjadi batas aksesnya.

### Database yang sudah disiapkan sebelumnya

Untuk database baru, gunakan `supabase/setup.sql` terbaru. Jika versi lama sudah dijalankan, **jangan jalankan ulang fresh setup**; terapkan kedua migrasi berikut di SQL Editor Supabase:

1. `supabase/migrations/20260919_add_profile_fields.sql`
2. `supabase/migrations/20260919_post_drafts.sql`

Uji dengan Supabase development sebelum produksi: anon/authenticated tidak boleh membaca/menulis `post_drafts`; autosave, buka ulang draft, preview, simpan/publish, serta pengelolaan media harus diperiksa menggunakan akun admin. Tes komponen dengan transport tiruan tidak menggantikan pemeriksaan ini.

Spesifikasi awal ada di `spec.md`; keputusan lanjutan pemilik dan tahapan peluncuran dicatat di `PLAN.md`.
