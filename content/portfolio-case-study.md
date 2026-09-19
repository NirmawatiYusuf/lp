# Draft studi kasus: portfolio dan CMS pribadi

Materi ini mendokumentasikan implementasi di repository, bukan klaim hasil produksi. Tinjau kembali sebelum diterbitkan melalui pengelola proyek. Tambahkan screenshot aplikasi dan tautan demo setelah deployment siap.

## Judul

Portfolio, publikasi, dan CMS pribadi

## Ringkasan

Platform untuk menyatukan dokumentasi proyek, publikasi teknis, dan profil profesional. Konten dikelola melalui area admin terpisah, dengan antarmuka publik yang disesuaikan untuk desktop dan ponsel.

## Masalah

Dokumentasi proyek dan catatan belajar membutuhkan satu tempat yang mudah dipelihara. Menambah artikel atau memperbarui profil sebaiknya tidak mengharuskan perubahan kode, sementara draft harus tetap terpisah dari konten publik.

## Pendekatan

- Next.js App Router memisahkan halaman publik, pengelola konten, dan operasi server.
- Supabase menyimpan konten, autentikasi, dan media. RLS membatasi pembacaan publik pada konten yang sudah diterbitkan.
- Editor menyimpan snapshot draft terpisah dari artikel publik dan menyediakan preview sebelum publikasi.
- Antarmuka mobile menggunakan pengantar ringkas, kartu proyek bergambar, detail fokus yang dapat dibuka, serta peta proses empat tahap.
- Halaman artikel memiliki daftar isi berbasis heading dan rekomendasi tulisan terkait.

## Hasil implementasi

Repository menyediakan halaman portfolio, publikasi, Tentang, dan pengelola konten. Pemeriksaan lokal mencakup TypeScript, lint, build production, serta pengujian komponen dan perilaku antarmuka.

Koneksi ke layanan Supabase nyata, deployment domain, dan validasi operasional produksi tetap perlu diselesaikan sebelum menyatakan platform telah diluncurkan. Belum ada klaim mengenai trafik, pengguna, atau peningkatan performa.

## Teknologi

Next.js, React, TypeScript, Supabase, PostgreSQL, Motion

## Diisi oleh pemilik sebelum publikasi

- Peran dan atribusi kontribusi, termasuk bantuan alat yang digunakan.
- Periode pengerjaan yang sebenarnya.
- Screenshot antarmuka yang telah dipilih.
- URL repository dan demo yang sudah dapat diakses.
