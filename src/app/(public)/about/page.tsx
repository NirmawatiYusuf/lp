import Link from "next/link";
import { getSiteSettings } from "@/lib/data";
import { positioning, siteConfig } from "@/lib/site";
import styles from "./about.module.css";

export const metadata = {
  title: "Tentang",
  description: `Tentang ${siteConfig.name}, minat, dan latar belakang yang dibagikan melalui portfolio ini.`,
};

function paragraphs(value: string) {
  return value.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
}

function lines(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const bio = settings?.about_bio || positioning.sedangMengerjakan;
  const education = lines(settings?.education || "Mahasiswa Teknik Informatika di ITPLN");
  const focus = settings?.focus_interests || "Pengembangan web, data, dan sistem.";
  const initials = siteConfig.name.split(" ").map((name) => name[0]).slice(0, 2).join("");
  const firstName = siteConfig.name.split(" ")[0];

  return <div className={styles.aboutPage}>
    <section className={styles.intro}>
      <p className={styles.kicker}><span>Tentang</span><span>Profil & konteks kerja</span></p>
      <div className={styles.introGrid}>
        <div>
          <h1>Halo, saya <em>{firstName}.</em></h1>
          <p className={styles.lead}>{positioning.siapaAku}</p>
          {settings?.cv_url && <div className={styles.actions}><a className="button button-primary" href={settings.cv_url} target="_blank" rel="noreferrer noopener">Lihat CV <span>↗</span></a></div>}
        </div>
        <figure className={styles.profileFigure}>
          {settings?.profile_photo_url ? (
            // Owner-controlled URLs are validated as HTTPS; plain img supports hosts outside next.config remotePatterns.
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.portrait} src={settings.profile_photo_url} alt={siteConfig.name} />
          ) : <div className={styles.monogram} aria-label={siteConfig.name}>{initials}</div>}
          <figcaption className={styles.figureNote}><span>{siteConfig.name}</span><span>RD / 01</span></figcaption>
        </figure>
      </div>
    </section>

    <section className={styles.content}>
      <div className={styles.sectionLabel}>Sedikit konteks</div>
      <div className={styles.contentBody}>
        <article className={styles.bio}>
          <h2>Hal yang sedang<br /><em>dibangun.</em></h2>
          {paragraphs(bio).map((paragraph, paragraphIndex) => <p key={`${paragraphIndex}-${paragraph}`}>{paragraph.split(/\r?\n/).map((line, lineIndex, lines) => <span key={`${lineIndex}-${line}`}>{line}{lineIndex < lines.length - 1 && <br />}</span>)}</p>)}
        </article>
        <div className={styles.details}>
          <section className={styles.detail}>
            <h2>Pendidikan</h2>
            <ul>{education.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          <section className={styles.detail}>
            <h2>Fokus & minat</h2>
            {paragraphs(focus).map((paragraph, paragraphIndex) => <p key={`${paragraphIndex}-${paragraph}`}>{paragraph.split(/\r?\n/).map((line, lineIndex, lines) => <span key={`${lineIndex}-${line}`}>{line}{lineIndex < lines.length - 1 && <br />}</span>)}</p>)}
          </section>
        </div>
        <Link className="text-link" href="/projects">Lihat karya yang tersedia <span>→</span></Link>
      </div>
    </section>
  </div>;
}
