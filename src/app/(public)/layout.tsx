import Link from "next/link";
import { PublicShell } from "@/components/motion/public-shell";
import { siteConfig } from "@/lib/site";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const header = (
    <header className="site-header">
      <Link className="brand" href="/" aria-label={`${siteConfig.name}, beranda`}>
        <span className="brand-mark">RD</span>
        <span className="brand-copy"><strong>Raihan Daris</strong><small>Developer & student</small></span>
      </Link>
      <nav className="site-nav" aria-label="Navigasi utama">
        <Link href="/projects"><span>01</span> Proyek</Link>
        <Link href="/writing"><span>02</span> Tulisan</Link>
        <Link href="/about"><span>03</span> Tentang</Link>
        <Link href="/#kontak"><span>04</span> Kontak</Link>
      </nav>
    </header>
  );
  return <PublicShell header={header}>{children}</PublicShell>;
}
