insert into projects
  (title, slug, summary, problem, approach, outcome, role, period, tech_stack, published, sort_order)
values
  ('Contoh proyek pertama', 'contoh-proyek-pertama', 'Contoh ringkasan proyek untuk menguji tampilan daftar dan halaman detail.', 'Contoh: masalah proyek ini.', 'Contoh: pendekatan yang dipilih.', 'Contoh: hasil proyek ini.', 'Proyek solo', 'Agustus 2026', array['Next.js', 'Supabase'], true, 0),
  ('Contoh proyek kedua', 'contoh-proyek-kedua', 'Contoh proyek tanpa gambar untuk memastikan empty field tidak merusak layout.', null, null, null, null, null, array['TypeScript'], true, 1),
  ('Contoh proyek draft', 'contoh-proyek-draft', 'Contoh draft yang tidak boleh terlihat oleh pengunjung publik situs.', null, null, null, null, null, array['Postgres'], false, 2);

insert into posts (title, slug, summary, body, topics, project_id, published, published_at)
values
  ('Contoh tulisan proyek', 'contoh-tulisan-proyek', 'Contoh ringkasan tulisan yang terhubung ke proyek pertama untuk menguji relasi.', '# Contoh tulisan\n\nIsi placeholder untuk development.', array['nextjs'], (select id from projects where slug = 'contoh-proyek-pertama'), true, now() - interval '2 days'),
  ('Contoh catatan belajar', 'contoh-catatan-belajar', 'Contoh ringkasan tulisan lepas untuk menguji daftar tulisan tanpa mata kuliah.', 'Isi placeholder untuk development.', array['belajar'], null, true, now() - interval '1 day'),
  ('Contoh tulisan lain', 'contoh-tulisan-lain', 'Contoh tulisan lepas kedua untuk memastikan urutan tanggal tampil dengan benar.', null, array['catatan'], null, true, now()),
  ('Contoh tulisan draft', 'contoh-tulisan-draft', 'Contoh draft yang tidak boleh terlihat oleh pembaca pada halaman publik.', 'Draft.', array['draft'], null, false, null);
