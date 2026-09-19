# Situs Pribadi — Spesifikasi Lengkap (v2.1)

Satu file, mandiri. Menggantikan `blog.md` (v1), `spec-v2.md`, dan `spec-v2.1-patch.md`. Tidak ada rujukan ke dokumen lain: agent cukup membaca file ini lalu membangun situs dari nol.

Konteks: pemilik satu orang (mahasiswa), konten bahasa Indonesia. Situs lama diabaikan seluruhnya (desain, warna, font, layout). Portfolio jadi utama, blog jadi pendukung, dan dokumen ini **ikut mengatur desain**, karena di versi lama justru bagian itu yang bikin hasilnya generik.

---

## 0. Cara pakai dokumen ini (baca ini dulu, khususnya kalau kamu AI agent)

Baca seluruh dokumen sebelum menulis kode. Lalu bangun **berurutan. Jangan lompat, jangan generate semua sekaligus.**

1. §1 diisi manusia dulu. Tanpa itu, jangan mulai. Serius. Kalau `lib/site.ts` masih berisi `ISI_DULU`, berhenti dan minta ke pemilik.
2. Scaffold: Next + TypeScript + Supabase client + env (§3, §4, §13).
3. Skema + RLS + Storage + RPC + seed (§5–§6).
4. Design tokens + layout shell (§9.1–§9.3). Belum halaman.
5. `/projects` dan `/projects/[slug]` (§7, §9.5, §11). Ini inti situsnya.
6. Landing `/` (§9.4). Dibuat **terakhir** dari halaman publik, karena isinya rangkuman halaman lain.
7. `/writing`, detail post, dan `/writing/kuliah/[courseSlug]` (§7, §9.6).
8. Auth + admin CRUD + upload (§8).
9. Gerak (§9.7), lalu SEO, performa, a11y (§12). Gerak ditambahkan **setelah** semua halaman jadi dan sudah terbaca rapi tanpa animasi.
10. Lewati §10 sekali lagi, lalu checklist §14.

Selesai berarti: `npm run typecheck`, `npm run lint`, dan `npm run build` lolos, §10 sudah dicek, dan semua kotak di §14 tercentang.

**Aturan keras:**

- Dilarang menambah fitur yang tidak ada di dokumen ini. Tidak ada command palette, tidak ada terminal interaktif, tidak ada heatmap kontribusi, tidak ada bento grid, tidak ada tombol like, tidak ada counter view yang tampil ke publik, tidak ada newsletter, tidak ada testimonial, tidak ada section "skills" berisi ikon logo teknologi.
- §10 adalah daftar larangan desain. Baca sebelum menulis CSS, baca lagi sesudahnya.
- Kalau ada yang ambigu, pilih yang lebih sedikit. Situs ini gagal kalau kebanyakan, bukan kekurangan.

---

## 1. Positioning — diisi manusia, bukan di-generate

Bagian ini yang paling sering hilang, dan itu akar masalah situs yang terasa generik: banyak spesifikasi mesin, nol baris soal apa yang mau dikatakan.

Isi tiga hal ini dalam kalimat utuh, bahasa sendiri, jangan bahasa lowongan kerja:

```
SATU_KALIMAT_SIAPA_AKU:
  (contoh bentuknya, bukan untuk disalin)
  "Mahasiswa [jurusan] di [kampus]. Lagi banyak main sama data dan
   backend, dan nulis apa yang lagi dipelajari di sini biar gak lupa."

SEDANG_MENGERJAKAN:
  1-2 kalimat soal apa yang lagi dikerjakan bulan ini. Diupdate berkala.
  Ini yang bikin situs kerasa hidup, bukan animasi.

AKU_MAU_ORANG_NGAPAIN:
  Pilih satu. Ngelirik proyek? Ngajak kerja? Baca tulisan?
  Semua keputusan layout di §9 ngikut jawaban ini.
```

Tiga string ini, plus data situs dan daftar matkul, disimpan di `lib/site.ts`, bukan hardcode di JSX:

```ts
// lib/site.ts
export const siteConfig = {
  name: "Raihan Daris Ramadhan",
  description:
    "Portfolio dan blog pribadi Raihan Daris Ramadhan, mahasiswa Teknik Informatika di ITPLN.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "ISI_DULU",
  github: "ISI_DULU",    // URL profil
  linkedin: "ISI_DULU",  // URL profil
};

export const positioning = {
  siapaAku:
    "Aku Raihan, mahasiswa Teknik Informatika semester 5 di ITPLN. Aku ngoding web, dan nulis apa yang lagi kupelajari dan kukerjakan di sini.",
  sedangMengerjakan:
    "Lagi bangun ulang situs ini dari nol: portfolio, blog, dan CMS buatan sendiri pakai Next.js dan Supabase.",
  akuMauOrangNgapain: "proyek", // "proyek" | "kerja" | "tulisan"
};

// Kosong dulu. Diisi pemilik hanya kalau ingin mengaitkan tulisan ke matkul (§5.5).
// Bentuk entri: { slug: "data-warehouse", title: "Data Warehouse" }
export const courses: Course[] = [];
```

Semua nilai `ISI_DULU` diisi manusia. Agent tidak boleh mengarang isinya. Nilai yang sudah terisi (nama, deskripsi, tiga kalimat positioning) adalah draf dari pemilik; agent tidak mengubahnya. `courses` sengaja kosong dulu; agent tidak mengisinya. Yang masih `ISI_DULU` (email, GitHub, LinkedIn) tetap harus diisi pemilik sebelum build dimulai.

Cek kalimatnya: kalau bisa dipakai orang lain tanpa diubah, berarti terlalu umum. "Passionate about building scalable web applications" bisa dipakai 400 ribu orang. Buang.


### 1.1 Gambaran pemilik (bahan copywriting)

Untuk agent: baca ini sebelum menulis kata apa pun yang tampil di situs (microcopy, teks empty state, deskripsi meta, isi seed, dan copy lain yang belum ditulis pemilik). Ini **bahan**, bukan konten: jangan tampilkan bagian ini apa adanya di situs, dan jangan menjadikannya daftar matkul di halaman mana pun.

Raihan Daris Ramadhan, mahasiswa Teknik Informatika di ITPLN, sekarang semester 5 (per September 2026). Ngoding web pakai Next.js (App Router), React, TypeScript, dan Supabase, lalu deploy di Vercel. Situs ini dia bangun sendiri, termasuk CMS-nya. Situs ini juga blog pribadinya: tulisannya boleh tentang apa saja yang lagi dipelajari atau dikerjakan, tidak terbatas pada kuliah.

Matkul yang sudah dia lulus: fondasi pemrograman (Algoritma dan Pemrograman I dan II, Pemrograman Berorientasi Objek, Struktur Data, Analisis Algoritma), web dan data (Pemrograman Web, Pemrograman SQL, Basis Data, Data Warehouse, Pemrosesan Data Terdistribusi, Pengantar Big Data, Statistik), sistem dan jaringan (Sistem Operasi, Pemrograman Sistem Operasi, Jaringan Komputer, Komunikasi Data, Perangkat Lunak Jaringan, Keamanan Sistem Komputer, Organisasi dan Arsitektur Komputer, Mikroprosesor, Teknik Digital), kecerdasan buatan dan citra (Kecerdasan Buatan, Pengolahan Citra Digital, Sistem Multimedia), perangkat lunak sebagai proses dan produk (Manajemen Proyek Perangkat Lunak, Interaksi Manusia dan Komputer), matematika (Aljabar Linier, Kalkulus I dan II, Matematika Diskrit, Metode Numerik), dan matkul umum (Bahasa Inggris, Bahasa Indonesia, Agama, Pancasila, Kewarganegaraan, Literasi Digital). Dari sebarannya, yang paling banyak mengarah ke pemrograman, data, dan sistem/jaringan.

Suara (draf dari cara pemilik menulis, boleh dikoreksi): "aku" untuk diri sendiri dan "kamu" untuk pembaca; santai tapi rapi; kalimat pendek dan langsung; boleh sedikit gaul ("gak", "biar") tapi bukan slang berlebihan; tanpa jargon lowongan kerja dan tanpa bahasa pemasaran. Frasa klise yang dilarang ada di §10.

Batas yang harus dijaga: "lulus matkul" bukan "ahli". Jangan menulis kalimat yang mengklaim tingkat kemampuan (mahir, expert, berpengalaman bertahun-tahun), pengalaman kerja, sertifikat, atau angka yang tidak ada di bagian ini. Dia masih mahasiswa dan tidak berpura-pura sebaliknya; nada yang jujur soal itu (lagi belajar, lagi bikin) lebih kuat daripada nada profesional yang dibuat-buat. Kalau copy butuh fakta yang tidak ada di sini (deskripsi proyek, pengalaman, dan sejenisnya), pakai `ISI_DULU` atau tanya pemilik, jangan mengarang.

---

## 2. Gambaran & Prinsip

- Jenis aplikasi: **portfolio pribadi (utama) + tulisan/blog (pendukung) + CMS admin pribadi**.
- Pemilik satu orang, satu admin. Bahasa konten: Indonesia.
- Konsep konten:
  - `Course` = mata kuliah (mis. `data-warehouse`). Konstanta di kode (`lib/site.ts`), bukan tabel DB. Menambah matkul = tambah satu entri.
  - `Post` = satu tulisan. Matkul + minggu **opsional** (harus terisi bersamaan atau kosong bersamaan). Proyek terkait juga **opsional**. Post adalah post: bisa tulisan tentang satu matkul, tentang satu proyek, atau tulisan lepas (blog pribadi).
  - `Project` = karya portfolio, dengan gambar sendiri dan (opsional) tulisan terkait.
- Prinsip:
  - Publik hanya bisa **read** post/proyek yang `published = true`.
  - Admin mengelola semua lewat Server Actions dengan `service_role`. Key itu tidak pernah sampai ke browser.
  - Kalau Supabase belum dikonfigurasi, mati, atau ter-pause: halaman publik tetap render (data §1 dari konstanta, daftar kosong dengan empty state). Jangan crash.
  - Tidak ada public sign-up. Hanya satu admin.

---

## 3. Tech Stack & Konfigurasi

| Lapisan | Teknologi / Versi acuan | Fungsi |
|---|---|---|
| Framework | Next.js `16.2.2` App Router | Routing, RSC, Server Actions, `revalidatePath`, metadata/SEO |
| UI runtime | React `19.2.4`, React DOM `19.2.4` | Komponen |
| Bahasa | TypeScript `5` | Type safety |
| Styling | CSS biasa (global + CSS Modules) dengan custom properties dari §9.2 | Tanpa Tailwind, tanpa UI kit |
| Font | `next/font`: Newsreader (atau Source Serif 4) + Archivo | §9.3 |
| Backend | Supabase: Postgres + Auth + Storage + RLS + RPC | Satu-satunya backend |
| Supabase client | `@supabase/supabase-js ^2.101.1`, `@supabase/ssr ^0.10.0` | Lihat §4 |
| Validasi | `zod ^4.3.6` | Validasi form di server |
| Markdown | `react-markdown ^10.1.0`, `remark-gfm ^4.0.1`, `rehype-slug ^6.0.0` | Render `body` post + tabel + anchor heading |
| Gerak | `motion` (dulu Framer Motion; acuan `^12`), GSAP opsional | Lihat §9.7: CSS dulu, `motion` untuk scroll/observer |
| Analytics | `@vercel/analytics ^2.0.1` | Page analytics (tidak terlihat) |
| Deploy/Cron | Vercel + Vercel Cron | Hosting + keepalive harian |

Tidak dipakai: library ikon atau command palette apa pun (`lucide-react`, `cmdk`, dst). Gerak diatur lengkap di §9.7: CSS dulu, `motion` untuk yang butuh scroll/observer, GSAP hanya bila Motion tidak cukup.

`next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // images.unoptimized harus false (default). Jangan diubah.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Tidak ada serverActions.bodySizeLimit khusus: file tidak lewat Server Action (§8.3).
  async redirects() {
    return [
      { source: "/blog", destination: "/writing", permanent: true },
      { source: "/blog/:course", destination: "/writing/kuliah/:course", permanent: true },
      { source: "/blog/:course/:slug", destination: "/writing/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
```

Redirect ada untuk URL situs lama yang mungkin sudah tersebar. `/blog/:course/:slug` hanya benar kalau slug post tidak berubah.

---

## 4. Struktur Kode (acuan, bukan keharusan)

```text
src/
  app/
    layout.tsx                        # shell: rail + tulang punggung (§9.3)
    template.tsx                      # animasi masuk antar halaman (§9.7 M8)
    page.tsx                          # landing
    projects/page.tsx
    projects/[slug]/page.tsx
    writing/page.tsx
    writing/[slug]/page.tsx
    writing/kuliah/[courseSlug]/page.tsx
    admin/login/page.tsx
    admin/(protected)/layout.tsx      # guard requireAdmin
    admin/(protected)/dashboard/page.tsx
    admin/(protected)/writing/new/page.tsx
    admin/(protected)/writing/[id]/edit/page.tsx
    admin/(protected)/projects/page.tsx
    admin/(protected)/projects/new/page.tsx
    admin/(protected)/projects/[id]/edit/page.tsx
    api/cron/keep-supabase-alive/route.ts
    sitemap.ts, robots.ts, not-found.tsx, loading.tsx
  actions/
    post-actions.ts        # create/update/delete/toggle post
    project-actions.ts     # create/update/delete/toggle project
    upload-actions.ts      # createUploadUrl, registerUpload, hapus file/gambar
    auth-actions.ts        # logout
    analytics-actions.ts   # incrementViewCount (satu-satunya isinya)
  lib/
    data.ts                # query publik (anon) + admin (service_role)
    auth.ts                # getAdminAccess(), requireAdmin()
    site.ts                # siteConfig, positioning, courses[] (§1)
    validations.ts         # Zod schemas
    utils.ts               # slugify, storage path, file helpers
    reading-time.ts        # estimasi baca
    github.ts              # aktivitas repo (§11)
    motion.ts              # token easing/durasi (§9.7)
    supabase/browser.ts, server.ts, admin.ts, config.ts
  components/motion/       # Reveal, BackboneProgress, dst (client, kecil; hanya di layout publik, §9.7)
  types/content.ts         # Post, PostFile, Project, ProjectImage, Course
supabase/
  setup.sql                # satu file, lihat §6
middleware.ts              # refresh session Supabase untuk /admin/:path*
vercel.json                # cron 0 3 * * *
next.config.ts
```

Catatan `middleware.ts`: di Next 16 konvensi ini bernama `proxy.ts` (`middleware.ts` deprecated). Ikuti dokumentasi versi yang terpasang.

Empat file Supabase client, untuk tiga peran:

1. **Public anon (tanpa session)**: read publik di RSC. `persistSession: false, autoRefreshToken: false`.
2. **Server (anon + cookies)**: auth check (`auth.getUser()`). Dipakai di `lib/auth.ts` dan middleware/proxy.
3. **Admin (service_role, tanpa session)**: semua mutasi admin, read admin, Storage sisi server, RPC. `import "server-only"`; tidak pernah diimpor dari kode yang jalan di browser.
4. **Browser (anon)**: hanya untuk `uploadToSignedUrl` (§8.3).

Semua query publik di `lib/data.ts` dibungkus try/catch: gagal → array kosong / `null`, bukan throw (§12).

---

## 5. Model Data

### 5.1 `posts`

```ts
Post {
  id: uuid PK default gen_random_uuid()
  title: text NOT NULL
  slug: text NOT NULL UNIQUE            // unik global, titik
  summary: text NOT NULL
  body: text | null                     // markdown, max 20000 karakter
  topics: text[] NOT NULL DEFAULT '{}'  // mis. ['postgres','etl']
  course_slug: text | null              // boleh null, tanpa default
  week_number: int | null               // boleh null; 1..16 kalau diisi
  project_id: uuid | null               // FK -> projects.id ON DELETE SET NULL
  published: boolean NOT NULL DEFAULT false
  published_at: timestamptz | null      // null = fallback ke created_at saat tampil
  cover_image_url: text | null          // otomatis dari gambar pertama, bukan input manual
  views: int NOT NULL DEFAULT 0         // internal, tidak pernah tampil ke publik
  created_at, updated_at                // updated_at via trigger set_updated_at()
}
```

Constraint:

- `posts_week_range`: `week_number IS NULL OR week_number BETWEEN 1 AND 16`.
- `posts_course_week_together`: `(course_slug IS NULL) = (week_number IS NULL)`. Mencegah post setengah jadi yang punya matkul tapi tanpa minggu.
- `posts_course_week_uniq`: partial unique index pada `(course_slug, week_number)` `WHERE course_slug IS NOT NULL AND week_number IS NOT NULL`. Artinya: untuk post bermatkul, satu minggu hanya satu post per matkul. Post tanpa matkul tidak terkena batas ini. Kalau kelak mau dua tulisan dalam seminggu, hapus index ini.

`project_id` independen dari `course_slug`/`week_number`: post boleh punya matkul, proyek, keduanya, atau tidak satu pun. Menghapus proyek tidak menghapus post-nya; `project_id` jadi null.

### 5.2 `post_files` (lampiran post)

```ts
PostFile {
  id: uuid PK
  post_id: uuid FK -> posts.id ON DELETE CASCADE
  file_name: text NOT NULL
  file_path: text NOT NULL   // {postId}/{timestamp}-{sanitized-name}
  file_url: text NOT NULL    // public URL Supabase Storage
  file_type: 'image' | 'pdf'
  sort_order: int NOT NULL DEFAULT 0
  created_at: timestamptz
}
```

Tampil diurut `sort_order ASC`, lalu `created_at ASC`.

### 5.3 `projects`

```ts
Project {
  id: uuid PK
  title: text NOT NULL
  slug: text NOT NULL UNIQUE
  summary: text NOT NULL              // 1-2 kalimat, dipakai di list
  problem: text | null                // masalahnya apa
  approach: text | null               // kenapa pendekatan itu yang dipilih
  outcome: text | null                // hasilnya, termasuk yang gagal
  role: text | null                   // solo / tim berapa orang, kamu ngapain
  period: text | null                 // mis. "Mar–Mei 2026"
  tech_stack: text[] NOT NULL DEFAULT '{}'
  repo_url: text | null
  demo_url: text | null
  published: boolean NOT NULL DEFAULT false
  sort_order: int NOT NULL DEFAULT 0
  created_at, updated_at
}
```

Tidak ada kolom `featured`: kalau semua proyek default `featured`, tidak ada yang featured. Landing cukup mengambil 3 teratas dari `sort_order`. `published` default `false` supaya proyek setengah tulis tidak bocor ke publik.

`problem` / `approach` / `outcome` / `role` adalah inti portfolio ini. Satu blob markdown selalu berubah jadi paragraf pemasaran; empat field terpisah memaksa jawaban yang spesifik.

### 5.4 `project_images`

```ts
ProjectImage {
  id: uuid PK
  project_id: uuid FK -> projects.id ON DELETE CASCADE
  file_path: text NOT NULL   // projects/{projectId}/{timestamp}-{sanitized-name}
  file_url: text NOT NULL
  caption: text | null       // dipakai sebagai alt text juga
  sort_order: int NOT NULL DEFAULT 0
  created_at
}
```

Gambar proyek naik ke Storage seperti lampiran post. Bukan string URL manual.

### 5.5 `Course` (konstanta kode, bukan tabel)

```ts
Course { slug: string; title: string; description?: string; semester?: number; year?: string }
```

Hanya `slug` dan `title` yang wajib. Menambah matkul = tambah satu entri di `courses` (`lib/site.ts`), tanpa migrasi DB. `courses` **boleh kosong** (kondisi awal): form admin menyembunyikan select matkul dan input minggu, `/writing/kuliah/[courseSlug]` selalu 404, dan tidak ada tautan matkul di mana pun. Untuk menguji halaman matkul saat development, tambah satu entri sementara dan hapus sebelum selesai.

---

## 6. Database: setup.sql, RLS, Storage, RPC

Semua ada di satu file `supabase/setup.sql`, dijalankan sekali di Supabase SQL Editor pada database kosong. Agent menulis file ini persis seperti di bawah.

```sql
-- supabase/setup.sql

-- trigger updated_at
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null,
  problem text,
  approach text,
  outcome text,
  role text,
  period text,
  tech_stack text[] not null default '{}',
  repo_url text,
  demo_url text,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger projects_set_updated_at
  before update on projects
  for each row execute function set_updated_at();

-- posts
create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null,
  body text,
  topics text[] not null default '{}',
  course_slug text,
  week_number int,
  project_id uuid references projects(id) on delete set null,
  published boolean not null default false,
  published_at timestamptz,
  cover_image_url text,
  views int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_week_range
    check (week_number is null or week_number between 1 and 16),
  constraint posts_course_week_together
    check ((course_slug is null) = (week_number is null))
);
create unique index posts_course_week_uniq
  on posts (course_slug, week_number)
  where course_slug is not null and week_number is not null;
create index posts_project_id_idx
  on posts (project_id) where project_id is not null;
create trigger posts_set_updated_at
  before update on posts
  for each row execute function set_updated_at();

-- post_files
create table post_files (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_url text not null,
  file_type text not null check (file_type in ('image', 'pdf')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index post_files_post_id_idx on post_files (post_id);

-- project_images
create table project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  file_path text not null,
  file_url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index project_images_project_id_idx on project_images (project_id);

-- RLS: publik hanya membaca yang published. Tidak ada policy tulis untuk siapa pun;
-- semua mutasi lewat service_role (bypass RLS).
alter table projects enable row level security;
alter table posts enable row level security;
alter table post_files enable row level security;
alter table project_images enable row level security;

revoke insert, update, delete on projects, posts, post_files, project_images
  from anon, authenticated;
grant select on projects, posts, post_files, project_images to anon, authenticated;

create policy projects_read_published on projects
  for select using (published = true);

create policy posts_read_published on posts
  for select using (published = true);

create policy post_files_read_published on post_files
  for select using (
    exists (select 1 from posts p where p.id = post_files.post_id and p.published)
  );

create policy project_images_read_published on project_images
  for select using (
    exists (select 1 from projects p where p.id = project_images.project_id and p.published)
  );

-- Storage: satu bucket, publik untuk baca
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'note-files', 'note-files', true, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- RPC views: hanya dipanggil dari Server Action lewat client admin
create or replace function increment_post_views(post_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update posts set views = views + 1 where id = post_id and published = true;
$$;

revoke all on function increment_post_views(uuid) from public, anon, authenticated;
grant execute on function increment_post_views(uuid) to service_role;
```

Aturan yang dirangkum dari SQL di atas:

- Bucket `note-files`: `public: true`, batas 10MB, mime hanya `image/jpeg`, `image/png`, `image/webp`, `application/pdf`. Path post: `{post_id}/{timestamp}-{sanitized_filename}`. Path gambar proyek: `projects/{project_id}/{timestamp}-{sanitized_filename}`.
- Tidak ada RPC untuk likes. `increment_post_views` hasilnya hanya dipakai di dashboard admin.
- Upload lewat signed URL yang dibuat server (§8.3) tidak butuh policy Storage tambahan.

### 6.1 Seed untuk development

`supabase/seed.sql` (hanya untuk lokal/dev, **jangan dijalankan di produksi**):

- 3 proyek: 2 published (satu tanpa gambar, satu dengan 3 gambar), 1 draft.
- 4 post: satu terkait proyek, satu draft, dan dua tulisan lepas tanpa matkul. Kalau `courses` sudah terisi, jadikan salah satunya bermatkul + minggu.
- Teks harus jelas placeholder (mis. "Contoh: masalah proyek ini..."), bukan copy pemasaran. Tujuannya menguji layout, bukan mengisi konten.

### 6.2 Kalau memakai database v1 yang sudah ada

Jangan jalankan `setup.sql` di atas. Pakai Lampiran A.

---

## 7. Routes

### 7.1 Publik

| Route | Isi |
|---|---|
| `/` | §1 + 3 proyek teratas + 3 tulisan terbaru + kontak (blok berid `kontak`) |
| `/projects` | Semua proyek published, urut `sort_order ASC, created_at DESC` |
| `/projects/[slug]` | Detail proyek. 404 kalau tidak ada / belum published |
| `/writing` | Semua post published, terbaru dulu (`published_at ?? created_at` DESC). Filter opsional `?topic=` dan `?course=` |
| `/writing/[slug]` | Detail post. 404 kalau tidak ada / belum published |
| `/writing/kuliah/[courseSlug]` | Satu matkul. 404 kalau slug tidak ada di `courses`. Post urut `week_number ASC` |

Aturan:

- Matkul dan minggu adalah metadata dan filter, bukan jalur wajib menuju tulisan. Route tulisan selalu dua segmen (`/writing/[slug]`), tidak tiga.
- Di halaman satu matkul, minggu naik (1 → 16) karena itu alur belajar. Di `/writing` umum, terbaru duluan. Header halaman matkul: judul, lalu deskripsi dan `Semester {semester}, {year}` sebagai metadata kecil, masing-masing hanya kalau terisi.
- `?topic=` memfilter `topics @> {nilai}`. `?course=` memfilter `course_slug`. Tidak ada search box dan tidak ada dropdown minggu: untuk daftar berisi 1–5 item itu fitur kosong. Kalau satu matkul nanti punya lebih dari 8 post, baru pertimbangkan lagi.
- Detail post: `getPublishedPostBySlug`; pisahkan `images` dan `pdf`; hitung reading time; generate metadata (§12); catat view sekali lewat komponen client kecil yang memanggil Server Action `incrementViewCount` saat mount (tanpa tampilan apa pun).
- Detail proyek: `getPublishedProjectBySlug`, gambar proyek (`sort_order ASC`), post terkait (§9.5), aktivitas repo (§11).

Redirect lama → baru sudah ada di `next.config.ts` (§3).

### 7.2 Admin dan API

| Route | Akses | Fungsi |
|---|---|---|
| `/admin/login` | publik (form) | Email + password → Supabase Auth. Hanya `ADMIN_EMAIL` yang diterima |
| `/admin/dashboard` | admin | List semua post + statistik + list proyek ringkas (§8.6) |
| `/admin/writing/new` | admin | Form create post (tanpa input file, lihat §8.3) |
| `/admin/writing/[id]/edit` | admin | Form edit + upload instan + reorder + hapus file |
| `/admin/projects` | admin | List semua proyek (`sort_order ASC, created_at DESC`) |
| `/admin/projects/new`, `/admin/projects/[id]/edit` | admin | Form create/edit (gambar proyek di halaman edit) |
| `/api/cron/keep-supabase-alive` | `Bearer CRON_SECRET` | Query ringan `select id from posts where published limit 1`; return `{ ok, checkedAt, durationMs, rowsSeen }` |

Antarmuka admin fungsional: pakai token yang sama (§9.2), tanpa dekorasi, aksen `--rule`.

---

## 8. Auth, Server Actions, Validasi, Upload

### 8.1 Auth

- Setup: buat user manual di Supabase Auth dengan email = `ADMIN_EMAIL`, matikan public sign-up.
- Login: `signInWithPassword(email, password)` lewat server client. Kalau email ≠ `ADMIN_EMAIL` (case-insensitive) → `signOut()` + status `unauthorized` → redirect `/admin/login?error=unauthorized`.
- Guard: middleware/proxy me-refresh session untuk `/admin/:path*`. `(protected)/layout.tsx` memanggil `requireAdmin()`: `unauthenticated → /admin/login`, `unauthorized → /admin/login?error=unauthorized`, `config-missing → tampilkan ConfigNotice`.
- Logout: `signOut()` → `/admin/login?success=logout`.
- `isAdminConfigured()` = semua ada: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`.
- Setiap Server Action mutasi memanggil `requireAdmin()` di baris pertama.

### 8.2 Validasi (Zod, di server)

Post (`postInputSchema`):

- `title`: min 5.
- `summary`: min 20.
- `body`: max 20000, opsional.
- `topics`: string koma → `string[]`: `split(",")`, trim, lowercase, buang kosong, buang duplikat.
- `courseSlug`, `weekNumber`: `.nullable().optional()`; string kosong dianggap `null`. Divalidasi bersama lewat `superRefine`: dua-duanya terisi atau dua-duanya kosong. Kalau terisi, `courseSlug` harus ada di `courses` dan `weekNumber` adalah integer 1..16.
- `projectId`: `z.string().uuid().nullable().optional()` (string kosong → `null`).
- `published`: boolean, default `false`.
- `published_at`: string tanggal opsional → ISO, atau `null` kalau kosong.

Project (`projectInputSchema`):

- `title`: min 2. `slug`: opsional. `summary`: **wajib, min 20**.
- `problem`, `approach`, `outcome`, `role`, `period`: opsional, max 5000.
- `techStack`: min 1 (string koma → array).
- `repoUrl`, `demoUrl`: URL https yang valid, opsional.
- `published`: default `false`. `sortOrder`: int, default 0.

### 8.3 Upload (signed URL)

File **tidak** lewat Server Action (boros memori, kena batas body, lambat). Alurnya:

1. Server Action `createUploadUrl(kind, parentId, fileName, mime, size)` → `requireAdmin` → validasi → `storage.from("note-files").createSignedUploadUrl(path)` → balikin `{ path, token }`.
2. Browser upload langsung ke Supabase Storage: `uploadToSignedUrl(path, token, file)` lewat browser client.
3. Server Action `registerUpload({ kind, parentId, path, fileName })` → `requireAdmin` → validasi → `getPublicUrl(path)` → INSERT row `post_files` / `project_images` dengan `sort_order` = max lama + 1 (mulai 0). Untuk `post_files`, hitung ulang `posts.cover_image_url`.

`kind` ∈ `post-image`, `post-pdf`, `project-image`.

Aturan:

- Path dibuat server, bukan klien: post `{postId}/{timestamp}-{sanitized-name}`; gambar proyek `projects/{projectId}/{timestamp}-{sanitized-name}`. `registerUpload` menolak `path` yang tidak diawali prefix yang sesuai. Nama file disanitasi: lowercase, strip diakritik, karakter di luar `a-z0-9.-` → `-`.
- Image harus `jpeg/png/webp`; PDF harus `application/pdf`; masing-masing ≤ 10MB. Gambar proyek hanya image.
- Maks **1 PDF per post**, dicek di `createUploadUrl` dan `registerUpload`. Image boleh banyak.
- Batas 10MB dan `allowed_mime_types` di bucket (§6) **wajib tetap diset**, karena bucket yang menegakkannya di sisi Storage.
- Cover post = URL image pertama (urut `sort_order ASC, created_at ASC`), bukan input manual. Proyek tidak punya kolom cover; OG image proyek diambil dari `project_images` pertama.
- Form baru (`writing/new`, `projects/new`) **tidak punya input file**: simpan draft dulu, lalu redirect ke halaman edit tempat upload aktif (`createUploadUrl` butuh `parentId`).
- Hapus file: hapus objek Storage dulu, lalu row, lalu hitung ulang cover post. Hapus post: hapus semua objek Storage post itu (pakai `file_path` dari row terkait) dulu, lalu row. Hapus proyek: hapus objek `projects/{id}/` dulu, lalu row. `ON DELETE CASCADE` hanya menghapus row, bukan file di Storage.

### 8.4 Post

Form admin: `title`, `summary`, `body` (markdown), `topics` (koma), matkul (select dari `courses`, urut abjad menurut `title`, boleh kosong), minggu (1..16, boleh kosong), proyek (select dari semua proyek termasuk yang draft, boleh kosong), `published`, `published_at` (opsional). Di halaman edit tambah: area upload, daftar file (`sort_order_{fileId}`, centang `remove_file_ids[]`).

**Create:**

1. `requireAdmin`, parse + validasi Zod.
2. Kalau matkul + minggu terisi: cek `(course_slug, week_number)` belum dipakai → tolak dengan pesan ramah kalau sudah.
3. Slug dari judul (`slugify`: lowercase, strip diakritik, non-alnum → `-`, pangkas `-` di ujung). Cek **global**; kalau sudah dipakai tambah `-2`, `-3`, dst.
4. `INSERT posts` dengan `cover_image_url = null`. Tangani `23505` (race) dengan pesan ramah.
5. `revalidatePath` (lihat bawah).
6. Redirect ke `/admin/writing/{id}/edit?success=dibuat`.

**Update:**

1. Ambil post lama. Cek unik minggu dengan `excludeId` (hanya kalau matkul + minggu terisi).
2. Baca `remove_file_ids[]` → bagi `remaining` vs `removed`.
3. Generate slug dari judul (exclude diri sendiri).
4. Update `sort_order` file lama dari input `sort_order_{fileId}`.
5. Hapus file terpilih dari Storage + DB.
6. Hitung ulang `cover_image_url` dari file akhir.
7. `UPDATE posts` semua field, lalu `revalidatePath`.
8. Redirect `.../edit?success=disimpan`.

**Aksi cepat:** `deletePostAction` (hapus objek Storage dulu, lalu row), `togglePublishAction(postId, nextState)` (tidak mengubah `published_at`).

**`revalidatePath` untuk post** (create/update/toggle/delete): `/`, `/writing`, `/writing/[slug]` (slug lama dan baru), `/writing/kuliah/[courseSlug]` (lama dan baru, kalau ada), `/projects/[slug]` untuk proyek terkait (lama dan baru kalau `project_id` berubah), `/admin/dashboard`.

### 8.5 Project

- `tech_stack`: input koma → `split(",").map(trim).filter(Boolean)` → `text[]`.
- `slug`: kalau input kosong pakai `slugify(title)`, kalau tidak `slugify(input)`. Tangani `23505` dengan pesan ramah.
- Di halaman edit: upload gambar (§8.3), `caption_{imageId}` dan `sort_order_{imageId}` per gambar, centang `remove_image_ids[]` yang diproses saat simpan.
- Aksi cepat: `delete` (hapus objek Storage `projects/{id}/` dulu), `toggle publish`.
- `revalidatePath`: `/`, `/projects`, `/projects/[slug]` (lama dan baru), `/writing/[slug]` (type `page`, semua, karena metadata proyek tampil di post), `/admin/dashboard`, `/admin/projects`.

### 8.6 Dashboard

- Hitung: `totalPosts`, `publishedPosts`, `totalViews = sum(views)`, `totalProjects`, `publishedProjects`. Views hanya tampil di sini, tidak pernah di halaman publik.
- List semua post (`created_at DESC`, termasuk draft) dan list proyek ringkas.
- Banner dari query param: `?success=dihapus|dipublikasikan|disimpan-sebagai-draft`, `?error=config|notfound`.

---

## 9. Design Brief

Bagian ini mengikat. Kalau agent menganggapnya saran, hasilnya akan jadi template lagi.

### 9.1 Prinsip

Situs ini **tulisan yang menumpuk**, bukan halaman produk. Bentuk acuannya indeks buku dan katalog, bukan landing page SaaS. Konsekuensinya: tidak ada hero raksasa, tidak ada kalimat sambutan, tidak ada tombol CTA besar di tengah layar. Halaman dibuka langsung dengan isi.

Keberanian dihabiskan di dua tempat: **tulang punggung vertikal** (§9.3) dan gerak yang menyertainya (§9.7). Selain itu semuanya tenang.

### 9.2 Token

```css
:root {
  color-scheme: light dark;

  /* dasar */
  --paper:      #E7E9E6;  /* abu pucat bersemu hijau, bukan krem */
  --paper-2:    #DDE0DC;  /* blok yang perlu dibedakan tipis */
  --ink:        #15181A;
  --ink-muted:  #5A625C;
  --rule:       #C6CBC5;

  /* aksen: satu per bagian situs, bukan hiasan */
  --accent-writing:  #1F5C4A;  /* pinus tua */
  --accent-projects: #8C2F39;  /* oxblood */
}

/* Ikut preferensi sistem. Tidak ada toggle dan tidak ada data-theme. */
@media (prefers-color-scheme: dark) {
  :root {
    --paper:      #101614;
    --paper-2:    #182220;
    --ink:        #DFE4DF;
    --ink-muted:  #8A958D;
    --rule:       #2C3833;
    --accent-writing:  #6FBFA2;
    --accent-projects: #D98A8F;
  }
}
```

Semua pasangan teks/latar di atas sudah dicek ≥ 4.5:1 di kedua tema (terendah: `--ink-muted` di atas `--paper-2` terang, 4.73:1). Kalau nilai token diubah, cek ulang.

Aksen dipakai untuk tulang punggung, link, dan rule aktif. Tidak untuk background blok, tidak untuk gradient, tidak untuk badge.

Radius: `2px` untuk semuanya. Bukan 0 (terlalu ketat, jadi genre broadsheet), bukan `rounded-2xl` (kit SaaS). Shadow: tidak ada, di mana pun. Pemisah pakai `1px solid var(--rule)`.

### 9.3 Tipografi & layout

Dua family, jelas berbeda, dimuat lewat `next/font` (§12):

- **Teks panjang: serif.** Newsreader atau Source Serif 4. Situs ini isinya prosa Indonesia yang panjang, dan serif lebih enak dibaca dalam blok. `line-height: 1.65`, measure `68ch`.
- **Struktur: grotesque.** Archivo. Untuk nama, nav, judul, metadata, tombol. `line-height: 1.2`.

Skala (rasio ~1.25, dibulatkan):

```
13 / 15 / 17 / 21 / 27 / 34 / 43
```

Body `17px`. Judul halaman `34px`. Judul post `27px`. Metadata `13px`, **sentence case, bukan ALL CAPS**.

Layout, dipakai di semua halaman:

```
┌──────────────┬─│─────────────────────────────────────────┐
│              │ │                                          │
│  rail        │ │  konten                                  │
│  (sticky)    │ │  max 68ch, rata kiri                     │
│              │ │                                          │
│  nama        │ │                                          │
│  §1 satu     │ │                                          │
│  kalimat     │ │                                          │
│              │ │                                          │
│  writing     │ │                                          │
│  projects    │ │                                          │
│  kontak      │ │                                          │
│              │ │                                          │
└──────────────┴─│─────────────────────────────────────────┘
   260px          ↑
              tulang punggung: 2px, full height,
              warnanya = aksen bagian yang sedang dibuka
```

Rail kiri `260px` sticky, konten mengalir di kanan. **Tidak pernah rata tengah**, tidak pernah simetris. Isi rail: nama, `positioning.siapaAku`, dan tiga tautan `writing`, `projects`, `kontak`. `kontak` menuju `/#kontak` (blok kontak di dasar landing). Tautan bagian yang sedang dibuka memakai aksen bagiannya.

Di bawah `900px` rail jadi header biasa di atas dan tulang punggung pindah ke kiri layar (`2px`, menempel tepi).

Tulang punggung itu satu-satunya elemen berwarna yang selalu ada. Warnanya berubah sesuai bagian: hijau pinus di area tulisan (`/writing*`), oxblood di area proyek (`/projects*`), `--rule` di landing, admin, dan 404. Itu memberi tahu posisi tanpa breadcrumb. Gerak tulang punggung (tumbuh, ganti warna, jadi indikator baca) ada di §9.7.

### 9.4 `/` — landing

```
rail │ [positioning.siapaAku, 27px serif, 2-3 baris]
     │
     │ Sedang dikerjakan
     │ [positioning.sedangMengerjakan, prosa 17px]
     │ ───────────────────────────────────────
     │ Proyek
     │ [3 baris proyek — bukan kartu, lihat §9.5]
     │ Semua proyek
     │ ───────────────────────────────────────
     │ Tulisan
     │ [3 baris tulisan]
     │ Semua tulisan
     │ ───────────────────────────────────────
     │ [email, github, linkedin — teks biasa]   (id="kontak")
```

Tidak ada gambar besar di atas. Halaman dibuka dengan kalimat, karena yang paling khas dari situs ini adalah tulisannya. Kalau data Supabase kosong atau gagal diambil, kalimat dan "Sedang dikerjakan" tetap tampil; daftar proyek/tulisan menampilkan empty state (§9.8).

### 9.5 `/projects` dan `/projects/[slug]`

List proyek bukan grid kartu. Baris penuh, dipisah rule, tiap baris begini:

```
Nama proyek                                        Mar–Mei 2026
Ringkasan satu-dua kalimat yang menjelaskan masalahnya.
Next.js · Postgres · dbt
─────────────────────────────────────────────────────────────
```

Alasan bukan grid: grid kartu memaksa semua proyek terlihat sama penting dan sama besar, padahal tidak. Baris membiarkan proyek terbaikmu ada di atas dan dibaca duluan. Baris yang sama dipakai di landing.

Detail proyek, urutan tetap:

1. Judul, periode, peran. Tanpa gambar dulu.
2. **Masalah**: satu paragraf.
3. **Pendekatan**: kenapa ini, bukan yang lain.
4. Screenshot pertama, lebar penuh kolom (tidak diperbesar melewati ukuran aslinya), dengan caption.
5. **Hasil**, termasuk yang tidak berhasil. Bagian ini yang paling dipercaya orang.
6. Screenshot sisanya.
7. **Tulisan terkait**: daftar post published dengan `project_id` proyek ini, urut `published_at ?? created_at` naik (dibaca sebagai cerita proyek dari awal). Satu baris per post: judul, ringkasan satu baris, tanggal. Kalau tidak ada post terkait, bagian ini **tidak dirender** (bukan empty state).
8. Stack, repo, demo, aktivitas repo (§11). Di bawah, bukan di atas.

Bagian yang field-nya kosong (`problem`, `approach`, `outcome`, `role`, `period`) atau tidak punya gambar dilewati, tanpa placeholder.

Tech stack ditulis sebagai teks dipisah `·`, bukan chip berwarna, bukan ikon logo. Repo dan demo adalah link teks biasa berlabel "Repo" dan "Demo", tanpa panah dan tanpa ikon.

### 9.6 `/writing` dan `/writing/[slug]`

List: satu baris per post: judul, ringkasan satu baris, tanggal. Kalau punya matkul, tambahkan `Data Warehouse, minggu 7` sebagai teks metadata kecil. Di list, metadata itu teks biasa (barisnya sudah link). Filter topik berupa daftar link teks di atas (dimulai dengan "Semua", lalu topik dari post published, urut abjad), bukan dropdown.

Detail post: judul, tanggal, reading time, metadata (matkul + minggu; `Proyek: {judul}` kalau post terkait proyek yang published), lalu langsung isi. Di halaman detail, nama matkul menjadi link ke `/writing/kuliah/{slug}` dan nama proyek link ke `/projects/{slug}`. Kalau `body` kosong, `summary` tampil sebagai isi. Setelah isi: galeri gambar, lampiran PDF, tombol share (Web Share API, fallback salin tautan).

Format tanggal: `id-ID` long (mis. "12 September 2026"). Reading time: `ceil(jumlah kata / 200)`, minimal 1.

Tidak ada: view count publik, tombol like.

Markdown: heading dapat anchor (`rehype-slug` + komponen heading yang membungkus teks dengan link `#id`), tabel pakai `remark-gfm`, blok kode monospace tanpa tema warna-warni. Gambar dalam prosa boleh melebar sedikit melewati measure `68ch` supaya ada ritme.

### 9.7 Gerak dan interaksi

Gerak punya dua tugas: **menunjukkan struktur** (garis yang tergambar, baris yang tersusun) dan **menunjukkan posisi** (tulang punggung). Gerak yang tidak mengerjakan salah satunya adalah dekorasi, dan dibuang.

**Urutan kerja:** bangun semua halaman sampai terbaca dan rapi tanpa animasi, baru tambahkan gerak (§0 langkah 9). Kalau animasinya dicabut dan situs jadi rusak, berarti animasinya salah tempat.

#### Library

- **CSS dulu.** Hover, transisi warna, garis yang tergambar, dan animasi masuk di atas fold semuanya CSS (`@keyframes`, `transition`, `:has()`).
- **`motion`** (dulu Framer Motion; impor dari `motion/react`) untuk yang butuh observer atau scroll: reveal di bawah fold (`whileInView`) dan progres scroll (`useScroll`). Pakai `LazyMotion` + `domAnimation` dan komponen `m.*` supaya bundle kecil, dan hormati `prefers-reduced-motion` (`MotionConfig reducedMotion="user"` dan `useReducedMotion()`).
- **GSAP** (+ `@gsap/react`, plugin `ScrollTrigger` / `SplitText`) diizinkan hanya kalau ada kebutuhan yang tidak bisa dipenuhi Motion, mis. timeline berurutan yang di-scrub scroll. Impor plugin seperlunya dan muat hanya di halaman yang memakainya. Jangan memakai Motion dan GSAP untuk hal yang sama.
- Tidak dipakai kecuali pemilik meminta: Lenis/locomotive (membajak scroll), Lottie, three.js/R3F, dan library gerak lain.
- Semua library gerak hanya dimuat di layout publik. Area `/admin` tidak memuatnya.

Token gerak. CSS dan `lib/motion.ts` harus kembar:

```css
:root {
  --ease-out:    cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-fast: 150ms;   /* hover, warna */
  --dur-base: 300ms;   /* transisi kecil */
  --dur-slow: 600ms;   /* reveal */
}
```

```ts
// lib/motion.ts
export const ease = { out: [0.22, 1, 0.36, 1], inOut: [0.65, 0, 0.35, 1] } as const;
export const dur = { fast: 0.15, base: 0.3, slow: 0.6 } as const;
```

#### Momen gerak (hanya ini)

**M1. Tulang punggung tumbuh.** Sekali saat halaman pertama dimuat (bukan tiap pindah halaman). `transform: scaleY(0 → 1)`, `transform-origin: top`, 700ms, `--ease-in-out`. CSS keyframes.

**M2. Warna tulang punggung berganti.** Saat pindah area (landing, tulisan, proyek), `background-color` crossfade 300ms. Client component kecil membaca `usePathname()` dan mengatur `data-area` pada elemen; warnanya tetap lewat CSS.

**M3. Tulang punggung jadi indikator baca.** Hanya di detail post dan detail proyek, menggantikan warna solid di §9.3. Trek `--rule`, isi berwarna aksen: `scaleY = 0.06 + 0.94 × scrollYProgress` (`useScroll`). Tidak ada progress bar terpisah.

**M4. Kalimat utama landing.** Blok `positioning.siapaAku` muncul dengan `clip-path: inset(0 0 100% 0) → inset(0)` ditambah `translateY(8px → 0)`, 700ms, delay 150ms, `--ease-out`. CSS keyframes, karena ini kandidat LCP dan tidak boleh menunggu JS. Satu blok, bukan per baris atau per kata.

**M5. Baris tersusun.** Untuk baris di list (landing, `/projects`, `/writing`, Tulisan terkait): garis pemisah tergambar dulu (`scaleX 0 → 1`, origin kiri, 500ms), lalu isi baris naik (`translateY 12px → 0` + opacity, 500ms). Stagger 70ms, maksimal 6 baris per kelompok; sisanya muncul bersamaan. Sekali saja. Baris yang sudah di viewport awal memakai CSS keyframes dengan `animation-delay` yang sama; baris di bawah fold memakai `whileInView` (`once: true`, `margin: "-10% 0px"`).

**M6. Screenshot proyek.** Di bawah fold: `clip-path: inset(0 0 100% 0) → inset(0)`, 700ms, `--ease-out`, lalu caption fade 300ms. Gambar yang sudah terlihat saat halaman dimuat tampil langsung tanpa animasi.

**M7. Hover dan fokus.** CSS saja, hanya di `@media (hover: hover)`: warna judul menjadi aksen (150ms), garis bawah tergambar dari kiri (200ms), baris lain di list meredup ke opacity 0.55 lewat `.list:has(.row:hover) .row:not(:hover)`. Fokus keyboard mendapat perlakuan yang sama (tanpa peredupan yang menyembunyikan teks).

**M8. Masuk halaman.** `app/template.tsx` membungkus konten dengan class `route-enter` (CSS: opacity 0 → 1, 250ms). Hanya animasi masuk; tidak ada animasi keluar karena tidak andal di App Router. Area admin menonaktifkannya lewat CSS.

Selain M1–M8, tidak ada yang bergerak.

#### Aturan yang tidak boleh dilanggar

1. Animasikan hanya `transform`, `opacity`, dan `clip-path`. Tidak pernah `width`, `height`, `top`, `left`, atau `margin`.
2. Jarak maksimal 12px, tanpa rotate, skala tidak lebih dari 1.02, tanpa bounce atau overshoot.
3. Semua reveal terjadi sekali. Tidak ada animasi yang berulang atau looping.
4. Elemen yang mungkin jadi LCP (judul halaman, kalimat utama, paragraf pertama, gambar pertama) tidak boleh dirender tersembunyi oleh JS. Untuk mereka pakai CSS keyframes, yang berjalan tanpa menunggu hidrasi.
5. Konten harus terbaca tanpa JS. State awal tersembunyi untuk reveal di bawah fold hanya boleh berlaku setelah hidrasi (mis. class `js` yang dipasang script inline kecil di `<head>`, dengan CSS `.js [data-reveal]:not([data-in])`), atau pakai `animation-timeline: view()` sebagai progressive enhancement.
6. `prefers-reduced-motion: reduce`: M1, M4, M5, M6, M8 dimatikan (elemen langsung tampil); M2 berganti warna tanpa transisi; M3 menjadi tulang punggung aksen penuh yang statis; M7 hanya perubahan warna. Uji dengan setting OS-nya.
7. Animasi adalah komponen client yang kecil (`components/motion/`: `Reveal`, `BackboneProgress`, dst). Halaman dan kontennya tetap server component. Jangan menaruh `"use client"` di halaman hanya demi animasi.
8. Anggaran: tambahan JS akibat gerak ≤ 30KB gzip di landing, CLS tetap < 0.05, LCP tetap < 2.0s (§12).

#### Dilarang

Parallax, scroll hijack atau smooth-scroll library, kursor kustom, tilt/3D pada kartu, tombol magnetik, marquee dan teks berjalan, background partikel atau blob gradient, efek ketik/scramble pada judul, count-up angka, `hover:scale`, spinner dekoratif, tirai atau wipe antar halaman, dan fade-and-slide-up yang seragam di semua section saat scroll. M5 boleh karena tugasnya menunjukkan struktur baris; paragraf, heading, dan blok lain tidak dianimasikan saat scroll.

### 9.8 Copy

Bahasa Indonesia, orang pertama, kalimat biasa. Sentence case di seluruh antarmuka.

Empty state adalah ajakan, bukan permintaan maaf:

- Tulisan kosong: "Belum ada tulisan di sini."
- Proyek kosong: "Belum ada proyek di sini."
- Filter tidak cocok: "Tidak ada yang cocok dengan filter ini." + link "Lihat semua".
- Error: sebutkan apa yang gagal dan apa yang bisa dilakukan. Jangan minta maaf.

Nama tombol konsisten dari aksi sampai notifikasi: tombol "Publikasikan" menghasilkan pesan "Dipublikasikan".

---

## 10. Daftar larangan desain

Agent: baca sebelum dan sesudah menulis CSS. Ini gejala yang bikin situs kebaca hasil generate.

- Label ALL CAPS yang di-`letter-spacing` di atas setiap heading.
- Satu kata di judul yang diwarnai atau di-gradient sendiri.
- Panah `→` ditempel di akhir teks link dan tombol.
- Metadata digabung titik tengah dalam pola `A · B · C` di mana-mana. Sekali di baris tech stack cukup.
- Semua konten dipotong jadi kartu identik: radius sama, border sama, shadow abu-abu lembut yang sama.
- Penanda bernomor `01 / 02 / 03` untuk hal yang bukan urutan.
- Latar krem `#F4F1EA` dengan aksen terakota `#D97757`. Itu palet yang sedang dipakai semua orang.
- Hitam pekat generik (`#0B0B0B`, `#111`) sebagai latar dark mode. Dark mode situs ini memakai `--paper` bersemu pinus (§9.2); itu disengaja, yang dilarang adalah warna generiknya.
- Monospace untuk label data kecil sebagai dekorasi.
- Section "Skills" berisi grid ikon logo teknologi.
- Statistik vanity: jumlah post, total views, jam ngoding, cangkir kopi, bintang/fork repo.
- Kalimat seperti "Passionate about...", "Let's build something amazing together", "Crafting digital experiences".
- Semua section lebar sama dan rata tengah.
- Gerak yang tidak menunjukkan struktur atau posisi: fade-and-slide-up seragam di semua section, parallax, hover scale, animasi berulang (daftar lengkap di §9.7).

Uji mandiri sebelum selesai: tutup nama dan isi kontennya, lalu tanya apakah halaman ini bisa jadi milik orang lain tanpa diubah. Kalau bisa, ada yang salah.

---

## 11. Aktivitas repo dari GitHub

Hanya di detail proyek, hanya teks. Tujuannya membuat proyek terasa hidup tanpa animasi atau statistik vanity.

Env (server-only, jangan `NEXT_PUBLIC_`): `GITHUB_TOKEN`, opsional. Fine-grained token dengan akses hanya *Public repositories* (read-only, tanpa permission tambahan). Tanpa token, batasnya 60 request/jam per IP; dengan token 5000/jam.

`lib/github.ts`:

```ts
parseRepo(url: string): { owner: string; repo: string } | null
  // hanya https://github.com/{owner}/{repo}; selain itu null

getRepoActivity(owner: string, repo: string):
  Promise<{ pushedAt: string; commits: { date: string; message: string }[] } | null>
```

Perilaku `getRepoActivity`:

1. `GET https://api.github.com/repos/{owner}/{repo}` → ambil `pushed_at` dan `private`. Kalau `private === true` → return `null` (jangan pernah menampilkan commit repo privat di situs publik).
2. `GET .../commits?per_page=5` → `commit.author.date` dan baris pertama `commit.message`, dipotong 100 karakter.
3. Header: `Accept: application/vnd.github+json`, `X-GitHub-Api-Version: 2022-11-28`, `Authorization: Bearer ${GITHUB_TOKEN}` hanya kalau token ada.
4. `fetch(..., { next: { revalidate: 3600 }, signal: AbortSignal.timeout(3000) })`.
5. Status selain 200, timeout, atau JSON aneh → `null`. Tidak pernah throw.

Tampilan, di langkah 8 detail proyek (§9.5), di bawah baris stack/repo/demo:

```
Terakhir dikerjakan 12 September 2026
12 Sep   perbaiki query keepalive
10 Sep   tambah RLS project_images
```

- Teks polos, dua kolom (tanggal, pesan). Tanpa titik tengah, tanpa panah, tanpa ikon GitHub.
- `null` (atau `repo_url` kosong / bukan GitHub) → seluruh blok tidak dirender, tanpa pesan error.
- Komponen ini async server component terpisah, dibungkus `<Suspense fallback={null}>`, supaya GitHub yang lambat tidak menahan LCP halaman.
- **Tidak** dipanggil dari landing atau `/projects` (list). Hanya detail.
- Tetap dilarang (§10): bintang, fork, jumlah commit, heatmap kontribusi.

---

## 12. Performa, SEO, Aksesibilitas

- `images.unoptimized` harus `false`. Pakai `next/image` + `remotePatterns` ke `https://*.supabase.co/storage/v1/object/public/**` (§3), dengan `sizes` yang benar. PNG beberapa MB tanpa optimasi merusak LCP di jaringan seluler.
- Font dimuat lewat `next/font`, `display: swap`, subset latin saja.
- Landing dan `/projects` harus tetap merender kalau Supabase mati atau ter-pause. Data §1 dari konstanta; query proyek/post fallback ke array kosong yang tetap menampilkan §1. Jangan crash.
- Cron keepalive dipertahankan, tapi diperlakukan sebagai best-effort.
- `sitemap.ts`: `/`, `/projects`, `/writing`, semua proyek dan post published, dan halaman matkul yang punya post published. `robots.ts`: izinkan semua, larang `/admin` dan `/api`, cantumkan sitemap.
- Metadata root (`layout.tsx`): `title.default` = `siteConfig.name`, `title.template` = `"%s — " + siteConfig.name`, `description` = `siteConfig.description`. Judul halaman `/projects` dan `/writing`: "Proyek" dan "Tulisan".
- `generateMetadata()`:
  - Detail post: title, description = `summary`, OG `article` + `publishedTime` + author (`siteConfig.name`) + cover (`cover_image_url`).
  - Detail proyek: title, description = `summary`, OG image = `project_images` pertama.
- Fokus keyboard terlihat jelas. Semua gambar punya alt: `caption` untuk gambar proyek; untuk gambar post dan kalau `caption` kosong, pakai fallback `{judul}, gambar {n}`. Kontras teks minimal 4.5:1 di kedua tema.
- Gerak (§9.7) tidak boleh merusak target di bawah: tambahan JS ≤ 30KB gzip di landing, elemen LCP tidak pernah disembunyikan oleh JS, hanya `transform` / `opacity` / `clip-path` yang dianimasikan, dan `/admin` tidak memuat library gerak.
- Target Lighthouse: LCP < 2.0s di mobile 4G, CLS < 0.05.

---

## 13. Env & Setup

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=
CRON_SECRET=          # acak min 16 char
GITHUB_TOKEN=         # opsional, server-only (§11)
# opsional: NEXT_PUBLIC_SITE_URL=https://domain-kamu (untuk share link absolut)
```

`vercel.json`:

```json
{ "crons": [{ "path": "/api/cron/keep-supabase-alive", "schedule": "0 3 * * *" }] }
```

Langkah:

1. `npm install`, buat `.env.example` berisi kunci di atas (tanpa nilai), salin ke `.env.local`.
2. Supabase → SQL Editor → jalankan `supabase/setup.sql` (dan `supabase/seed.sql` hanya untuk dev).
3. Auth → Users → buat user `ADMIN_EMAIL` + password, matikan sign-up publik.
4. Pastikan bucket `note-files` publik + limit + mime sesuai §6.
5. `npm run dev` → buka `localhost:3000`. Daftar kosong itu normal (empty state).
6. Login `/admin/login`, tulis post pertama, publish.
7. Deploy Vercel: isi semua env termasuk `CRON_SECRET`; `vercel.json` sudah menjadwalkan `0 3 * * *` ke `/api/cron/keep-supabase-alive`. Vercel Hobby hanya 1x/hari, zona UTC. Supabase free bisa pause setelah 7 hari inaktif; cron hanya best-effort, jaminan resmi hanya upgrade Pro.

Script `package.json`: `dev`, `build`, `start`, `lint`, `typecheck` (`tsc --noEmit`).

---

## 14. Checklist

- [ ] §1 diisi manusia, disimpan di `lib/site.ts` (tidak ada `ISI_DULU` tersisa)
- [ ] Scaffold Next + TS + empat file Supabase client, env + `.env.example`
- [ ] `setup.sql` dijalankan: tabel, partial unique index, check constraint, RLS, bucket, RPC
- [ ] Policy tulis tidak ada; `service_role` hanya di server
- [ ] Design tokens + dua font + layout shell dengan tulang punggung
- [ ] Dark mode lewat media query, tanpa `data-theme`
- [ ] Gerak M1–M8 sesuai §9.7; `prefers-reduced-motion` diuji; konten terbaca tanpa JS; LCP tidak tersembunyi; admin tanpa library gerak
- [ ] `/projects` list baris + detail 8 langkah (termasuk Tulisan terkait)
- [ ] `lib/github.ts` + blok aktivitas repo di `<Suspense fallback={null}>`; repo privat tidak pernah tampil
- [ ] `/` landing
- [ ] `/writing` + detail + filter topik
- [ ] `/writing/kuliah/[courseSlug]` urut minggu naik
- [ ] Redirect dari route lama
- [ ] Auth single-admin + middleware/proxy + protected layout
- [ ] Admin CRUD post (termasuk `project_id`) + proyek + gambar proyek
- [ ] Upload lewat signed URL; form baru menyimpan draft lalu redirect ke edit
- [ ] Hapus post/proyek menghapus objek Storage sebelum row
- [ ] Views internal di dashboard, tidak tampil publik
- [ ] Halaman publik tetap render saat Supabase mati
- [ ] SEO: sitemap, robots, metadata, OG
- [ ] `typecheck`, `lint`, `build` lolos
- [ ] Lewati §10 sekali lagi

---

## Lampiran A. Migrasi dari database v1 (lewati kalau mulai dari database kosong)

Hanya kalau database Supabase versi lama dipakai ulang. Catatan sebelum menjalankan:

- `posts.slug` di v1 sudah `UNIQUE` global, jadi tidak ada risiko slug kembar, dan redirect `/blog/:course/:slug → /writing/:slug` aman selama slug tidak diubah.
- `posts.course_slug` di v1 punya `DEFAULT 'data-warehouse'`. Default itu **harus dibuang**. Kalau tidak, post tanpa matkul yang tidak mengirim kolom itu akan terisi `'data-warehouse'` tanpa minggu dan langsung gagal di CHECK `posts_course_week_together`.
- Nama constraint/policy lama tidak diketahui. Cek dulu (query di komentar SQL).

```sql
-- supabase/migrations/20260920_v2_reshape.sql
-- Cek nama lama sebelum menjalankan:
--   select conname from pg_constraint where conrelid = 'posts'::regclass and contype = 'u';
--   select indexname from pg_indexes where tablename = 'posts';
--   select policyname from pg_policies where tablename = 'projects';

begin;

-- posts
alter table posts alter column course_slug drop not null;
alter table posts alter column course_slug drop default;
alter table posts alter column week_number drop not null;
alter table posts add column topics text[] not null default '{}';
alter table posts add column project_id uuid references projects(id) on delete set null;
alter table posts drop column likes;
drop function if exists increment_post_likes(uuid);

-- ganti UNIQUE(course_slug, week_number) dengan partial index.
-- Kalau query di atas menunjukkan namanya beda, sesuaikan; kalau ternyata
-- berupa unique index (bukan constraint), pakai: drop index <nama>;
alter table posts drop constraint if exists posts_course_slug_week_number_key;
create unique index posts_course_week_uniq
  on posts (course_slug, week_number)
  where course_slug is not null and week_number is not null;

alter table posts drop constraint if exists posts_week_range;
alter table posts add constraint posts_week_range
  check (week_number is null or week_number between 1 and 16);
alter table posts add constraint posts_course_week_together
  check ((course_slug is null) = (week_number is null));

create index posts_project_id_idx on posts (project_id) where project_id is not null;

-- projects
alter table projects rename column description to summary;
alter table projects rename column github_url to repo_url;
alter table projects
  add column problem text,
  add column approach text,
  add column outcome text,
  add column role text,
  add column period text;
alter table projects alter column published set default false;

-- policy ALL for authenticated: isi nama dari query pg_policies di atas
-- drop policy "<nama>" on projects;

-- project_images (sama dengan setup.sql)
create table project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  file_path text not null,
  file_url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index project_images_project_id_idx on project_images (project_id);
alter table project_images enable row level security;
revoke insert, update, delete on project_images from anon, authenticated;
grant select on project_images to anon, authenticated;
create policy project_images_read_published on project_images
  for select using (
    exists (
      select 1 from projects p
      where p.id = project_images.project_id and p.published
    )
  );

commit;
```

Setelah konten proyek dipindah **manual** (jangan salin otomatis `long_description` ke satu field; blob itu justru yang mau dihindari, isi ulang ke `problem` / `approach` / `outcome`) dan gambar proyek diunggah ulang ke `project_images`:

```sql
alter table projects
  drop column long_description,
  drop column cover_image_url,
  drop column featured;
```

`summary` wajib `min 20` (§8.2), sedangkan `description` v1 cuma `min 10`. Proyek lama yang ringkasannya pendek akan ditolak Zod saat pertama kali diedit; perpanjang ringkasannya.

Bagian lain dari `setup.sql` yang belum ada di database v1 (mis. `revoke insert, update, delete` dan fungsi `increment_post_views` yang dibatasi ke `service_role`) boleh diterapkan terpisah dari §6.
