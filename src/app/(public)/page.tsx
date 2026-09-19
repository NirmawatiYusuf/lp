import Link from "next/link";
import { PostRows, ProjectRows } from "@/components/content-rows";
import { FocusAreas } from "@/components/focus-areas";
import { HeroArtwork, HeroHeadline, Reveal } from "@/components/motion/reveal";
import { getPublishedPosts, getPublishedProjects, getSiteSettings } from "@/lib/data";
import { positioning } from "@/lib/site";

const process = [
  { title: "Pahami", caption: "Masalah & konteks", detail: "Mendefinisikan masalah, batasan, pengguna, dan ukuran keberhasilan sebelum menulis kode." },
  { title: "Rancang", caption: "Struktur & sistem", detail: "Membentuk struktur informasi, model data, dan arsitektur komponen yang mudah dikembangkan." },
  { title: "Bangun", caption: "Implementasi & uji", detail: "Mengimplementasikan bagian terpenting lebih dulu, lalu memvalidasi perilaku dan kualitasnya." },
  { title: "Evaluasi", caption: "Hasil & pembelajaran", detail: "Menguji hasil, meninjau kegagalan, dan menyimpan pembelajaran sebagai dokumentasi yang berguna." },
];

export default async function HomePage() {
  const [projects, posts, settings] = await Promise.all([
    getPublishedProjects(3), getPublishedPosts({ limit: 2 }), getSiteSettings(),
  ]);

  return <>
    <section className="home-hero">
      <div className="hero-copy">
        <p className="eyebrow"><span>Raihan Daris / Portfolio</span><span>Engineering · Design · Writing</span></p>
        <HeroHeadline />
        <p className="hero-intro"><span className="desktop-intro">{positioning.siapaAku}</span><span className="mobile-intro">Pengembangan web, data, dan sistem. Karya serta proses belajar, terdokumentasi.</span></p>
        <div className="hero-actions"><Link className="button button-primary" href="#karya">Jelajahi karya <span>↗</span></Link><Link className="text-link hero-secondary" href="/about">Kenali lebih dekat <span>→</span></Link></div>
      </div>
      <HeroArtwork />
    </section>

    <section className="marquee-band" aria-label="Teknologi yang digunakan"><div><span>Next.js <i>✦</i> TypeScript <i>✦</i> Supabase <i>✦</i> PostgreSQL <i>✦</i> React <i>✦</i> Built with intention <i>✦</i>&nbsp;</span><span aria-hidden="true">Next.js <i>✦</i> TypeScript <i>✦</i> Supabase <i>✦</i> PostgreSQL <i>✦</i> React <i>✦</i> Built with intention <i>✦</i>&nbsp;</span></div></section>

    <Reveal>
      <section className="home-section featured-section" id="karya">
        <div className="section-kicker"><span>01 / Karya</span><p>Masalah nyata, keputusan teknis, dan hasil yang dapat ditelusuri.</p></div>
        <div className="section-title-row"><h2>Selected work</h2><Link className="circle-link" href="/projects" aria-label="Semua proyek">↗</Link></div>
        {projects.length ? <ProjectRows projects={projects} visual /> : <div className="work-placeholder"><span className="work-placeholder-mark" aria-hidden="true">↗</span><div><strong>Studi kasus sedang disiapkan.</strong><p>Kenali fokus dan pendekatan di balik karya.</p><Link className="text-link" href="/about">Tentang Raihan <span>→</span></Link></div></div>}
      </section>
    </Reveal>

    <Reveal>
      <section className="home-section practice-section">
        <div className="section-kicker"><span>02 / Fokus</span><p>Produk yang terstruktur, dapat dirawat, dan nyaman digunakan.</p></div>
        <div className="section-title-row"><h2>Engineering<br /><em>with context.</em></h2></div>
        <FocusAreas />
      </section>
    </Reveal>

    <Reveal>
      <section className="process-section">
        <div className="process-heading"><p className="eyebrow">03 / Proses</p><h2>Struktur sebelum<br /><em>kompleksitas.</em></h2><p className="desktop-process-intro">Setiap proyek adalah rangkaian keputusan. Bukan menambahkan teknologi sebanyak mungkin, melainkan memilih pendekatan yang tepat dan dapat dijelaskan.</p><p className="mobile-process-intro">Empat tahap. Satu alur yang dapat ditelusuri.</p></div>
        <ol className="process-list">{process.map((step, index) => <li key={step.title}><span>0{index + 1}</span><div><strong>{step.title}</strong><p>{step.detail}</p></div></li>)}</ol>
        <ol className="process-map">{process.map((step, index) => <li key={step.title}><span>0{index + 1}<i aria-hidden="true">{index < 3 ? "↗" : "✓"}</i></span><strong>{step.title}</strong><small>{step.caption}</small></li>)}</ol>
      </section>
    </Reveal>

    {posts.length > 0 && <Reveal>
      <section className="home-section writing-section">
        <div className="section-kicker"><span>04 / Publikasi</span><p>Catatan teknis dan pembelajaran di balik proses.</p></div>
        <div className="section-title-row"><h2>Baru diterbitkan</h2><Link className="text-link" href="/writing">Arsip lengkap <span>→</span></Link></div>
        <PostRows posts={posts} />
      </section>
    </Reveal>}

    <Reveal>
      <section className={`now-section${posts.length ? "" : " now-after-process"}`}>
        <p className="eyebrow">Saat ini / Dalam pengembangan</p>
        <div><h2>Belajar melalui<br /><em>karya.</em></h2><p>{positioning.sedangMengerjakan}</p><Link className="text-link" href="/about">Tentang & perjalanan <span>→</span></Link></div>
        <div className="now-index"><span>Web development</span><span>Data & sistem</span><span>Dokumentasi teknis</span></div>
      </section>
    </Reveal>

    <section className="contact-section" id="kontak">
      <p className="eyebrow">Kolaborasi</p><h2>Mari membangun sesuatu<br /><em>yang layak diingat.</em></h2>
      {settings && (settings.public_email || settings.github_url || settings.linkedin_url) ? <div className="contact-links">
        {settings.public_email && <a href={`mailto:${settings.public_email}`}>{settings.public_email} <span>↗</span></a>}
        {settings.github_url && <a href={settings.github_url} rel="noreferrer noopener">GitHub <span>↗</span></a>}
        {settings.linkedin_url && <a href={settings.linkedin_url} rel="noreferrer noopener">LinkedIn <span>↗</span></a>}
      </div> : <p className="contact-placeholder">Informasi kolaborasi akan tersedia di sini.</p>}
    </section>
  </>;
}
