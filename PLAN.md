# Rencana Pengerjaan Situs Pribadi

Dokumen ini mengatur urutan kerja sampai situs diluncurkan. `spec.md` v2.2 menjadi baseline teknis; revisi desain dan penambahan di bawah ini mengikuti persetujuan lanjutan pemilik.

## Penambahan yang disetujui — 19 September 2026

- Komposisi mobile tersendiri: karya lebih awal, kartu screenshot, fokus yang dapat dibuka, dan peta proses ringkas. Identitas desktop tetap dipertahankan.
- Halaman Tentang dengan profil, pendidikan, minat, foto, dan CV yang dikelola dari admin.
- Autosave snapshot draft privat dan preview Markdown; artikel yang sudah terbit tidak berubah sampai disimpan secara eksplisit.
- Daftar isi, artikel terkait, dan pencarian tulisan.
- Bahan studi kasus faktual dari repository disiapkan sebagai draft, bukan konten publik otomatis.
- Lab/Eksperimen ditunda. Navigasi publik tidak memuat tautan admin.

Perubahan schema tersedia pada fresh setup dan migrasi terpisah. Verifikasi end-to-end auth, RLS, autosave, dan media terhadap Supabase nyata tetap menjadi bagian M2/M6/M7 sebelum peluncuran.

## Status saat ini — 19 September 2026

- [x] M0: keputusan produk dan domain selesai.
- [x] M1: scaffold, dependency, lint, typecheck, dan production build selesai.
- [ ] M2: schema, RLS, Storage, dan seed sudah ditulis; penerapan serta test terhadap project Supabase menunggu environment production/development.
- [x] M3–M5: shell visual dan seluruh route publik sudah diimplementasikan serta diverifikasi pada desktop/mobile tanpa data.
- [ ] M6–M7: auth, CMS, pengaturan kontak, dan upload sudah diimplementasikan; pengujian end-to-end menunggu kredensial Supabase.
- [x] M8: GitHub activity, motion, analytics, SEO, cron route, dan validasi domain sudah diimplementasikan pada level aplikasi.
- [ ] M9: deploy, migrasi production, smoke test data nyata, dan observasi 48 jam dilakukan setelah repository dihubungkan ke Supabase/Vercel.

## Cara kerja

- Satu milestone diselesaikan, diuji, dan direview sebelum milestone berikutnya.
- Penambahan di luar baseline memerlukan persetujuan pemilik; daftar di atas telah disetujui.
- Setiap milestone berakhir dengan `npm run typecheck`, `npm run lint`, dan test yang relevan. `npm run build` wajib mulai M1 dan diulang pada setiap milestone.
- Perubahan database diuji pada project Supabase development lebih dulu. Production hanya menerima SQL yang sama setelah backup dan review.
- Simpan screenshot untuk perubahan visual material dan rekaman singkat untuk alur admin/upload sebelum peluncuran.

## Keputusan pemilik

- [x] Positioning di §1 dipakai sebagai draf awal.
- [x] Mulai dari database kosong.
- [x] Domain production: `https://raihandaris.web.id`.
- [x] `courses` kosong saat peluncuran awal.
- [x] Email publik, GitHub, dan LinkedIn diisi belakangan lewat `/admin/settings`.

Secrets Supabase, GitHub, cron, dan password admin masuk ke environment, bukan repository.

## M0 — Finalisasi input dan fondasi kerja

**Hasil:** semua blocker manusia selesai dan lingkungan development siap.

1. Tetapkan `siteConfig` dan domain production.
2. Gunakan jalur database fresh setup.
3. Siapkan Supabase development dan environment lokal.
4. Tentukan baseline browser: Chrome/Edge, Firefox, dan Safari versi stabil terbaru; mobile diuji minimal pada viewport 390×844.

**Lulus jika:** env example lengkap tanpa secret dan jalur database tercatat. Kontak publik boleh kosong karena diatur setelah deploy melalui admin.

## M1 — Scaffold dan quality gates

**Hasil:** aplikasi Next.js minimal yang bisa dibangun dan dideploy.

1. Scaffold Next.js, TypeScript, CSS Modules, lint, dan typecheck.
2. Pasang dependency sesuai §3 tanpa dependency UI tambahan.
3. Buat empat Supabase client dan validasi konfigurasi server/client.
4. Tambahkan `siteConfig`, struktur route, error boundary, dan fallback dasar.
5. Siapkan CI untuk install, typecheck, lint, dan build.

**Lulus jika:** halaman minimal render tanpa Supabase, service-role tidak masuk client bundle, dan seluruh quality gate lolos.

## M2 — Database, RLS, Storage, dan seed

**Hasil:** model data development siap dipakai aplikasi.

1. Implementasikan `setup.sql` atau migrasi v1 final.
2. Terapkan RLS read-only publik, RPC view, bucket, limit MIME/ukuran, serta seluruh index dan constraint.
3. Buat seed placeholder dan jalankan hanya di development.
4. Uji anon hanya membaca published; anon/authenticated tidak dapat menulis.
5. Uji constraint pasangan course/week dan race satu PDF per post.

**Lulus jika:** test SQL/security lolos, draft tidak terlihat oleh anon, dan rollback/backup path untuk production terdokumentasi.

## M3 — Design system dan shell publik

**Hasil:** fondasi visual responsif tanpa motion.

1. Implementasikan token, font, rail, backbone, focus state, dark mode sistem, dan layout mobile.
2. Buat primitive teks, rule, link, empty state, serta baris project/post.
3. Verifikasi pada 390px, 768px, 900px, 1280px, dan dark mode.
4. Audit keyboard, contrast, overflow, dan tampilan tanpa JavaScript.

**Lulus jika:** shell sesuai §9.1–§9.3, tidak memakai pola terlarang §10, dan screenshot baseline disetujui.

## M4 — Proyek publik

**Hasil:** `/projects` dan detail proyek selesai tanpa aktivitas GitHub lebih dulu.

1. Implementasikan query publik dengan fallback aman.
2. Buat list, detail delapan langkah, gambar, metadata, dan tulisan terkait.
3. Tambahkan metadata, OG image, 404, loading state, serta responsive image sizes.
4. Uji proyek lengkap, field opsional kosong, tanpa gambar, draft, dan Supabase gagal.

**Lulus jika:** route proyek benar, draft tidak bocor, dan halaman tetap berguna saat data kosong/gagal.

## M5 — Writing dan landing

**Hasil:** seluruh halaman konten publik utama selesai.

1. Implementasikan `/writing`, filter topik/course, dan ordering `sort_at`.
2. Buat detail Markdown, heading anchor, GFM, reading time, gambar, PDF, share, metadata terkait, dan hit session.
3. Buat route course yang 404 ketika course tidak dikenal.
4. Buat landing terakhir dari tiga proyek dan tiga tulisan.
5. Tambahkan redirects lama dan uji slug/404.

**Lulus jika:** seluruh kombinasi post teruji, filter dapat dibagikan lewat URL, hit gagal tidak merusak halaman, dan landing tetap render tanpa Supabase.

## M6 — Auth dan CMS inti

**Hasil:** admin tunggal dapat mengelola post dan project tanpa upload.

1. Implementasikan login, logout, proxy refresh session, protected layout, dan pemeriksaan `ADMIN_EMAIL`.
2. Buat dashboard, CRUD post/project, dan pengaturan kontak publik dengan Zod dan pesan error ramah.
3. Implementasikan slug collision/race handling, toggle publish, revalidation, serta delete row tanpa file.
4. Uji unauthenticated, email salah, env hilang, validasi buruk, dan concurrent slug.

**Lulus jika:** semua mutasi memanggil `requireAdmin`, user non-admin ditolak, dan CRUD serta cache invalidation benar.

## M7 — Upload dan lifecycle file

**Hasil:** upload langsung ke Storage aman dan dapat dipulihkan.

1. Implementasikan signed upload, register, reorder, caption, cover derivation, dan delete.
2. Validasi parent ownership, prefix path, MIME, ukuran, dan batas satu PDF.
3. Implementasikan `discardUpload` dan logging objek yatim.
4. Uji kegagalan di setiap langkah: signed URL, transfer, register, cleanup, dan delete Storage.

**Lulus jika:** file tidak melewati Server Action, cleanup mengikuti urutan spec, race PDF ditolak DB, dan rekaman alur create→upload→publish→delete lolos.

## M8 — Integrasi dan polish terkontrol

**Hasil:** fitur pendukung selesai tanpa mengganggu core.

1. Tambahkan aktivitas GitHub dalam Suspense dan pastikan repo privat/error tidak tampil.
2. Tambahkan motion M1–M8 saja, setelah semua halaman terbaca tanpa motion.
3. Tambahkan analytics, sitemap, robots, cron keepalive, dan production URL validation.
4. Uji reduced motion, no-JS, keyboard, dark mode, timeout GitHub, dan cron authorization.

**Lulus jika:** admin tidak memuat library motion, tambahan JS gerak memenuhi budget, dan semua fallback bekerja.

## M9 — Hardening dan peluncuran

**Hasil:** production siap digunakan dan dapat dipulihkan.

1. Jalankan audit §10 dan checklist §14 baris demi baris.
2. Jalankan typecheck, lint, build, test, dependency audit, serta Lighthouse pada build production.
3. Uji smoke flow publik dan admin di preview deployment dengan database non-production.
4. Backup database production; jalankan setup/migrasi yang sudah diuji; isi env production.
5. Deploy, smoke test domain/canonical/OG/sitemap/robots, lalu publish konten pertama.
6. Pantau log, error, cron, dan Storage selama 48 jam pertama.

**Lulus jika:** seluruh checklist spec tercentang, tidak ada blocker aksesibilitas/security, target performa tercapai atau deviasi tercatat dan disetujui, serta rollback telah diuji secara tertulis.

## Definition of done proyek

- Semua route dan perilaku dalam `spec.md` selesai.
- Tidak ada `ISI_DULU`, secret, seed development, atau temporary course di hasil production.
- Typecheck, lint, build, test database/security, dan smoke test production lolos.
- UI diperiksa di light/dark, mobile/desktop, keyboard, reduced motion, dan tanpa JavaScript.
- Data draft tetap privat; service-role tidak pernah terkirim ke browser.
- Backup, rollback, setup admin, dan cara membersihkan orphan Storage terdokumentasi.
- Pemilik menyetujui copy, screenshot final, dan alur CMS sebelum domain diumumkan.
