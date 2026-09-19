import Link from "next/link";

export default function NotFound() {
  return <main className="measure"><p className="eyebrow">404 / Tersesat</p><h1>Halaman ini tidak ditemukan.</h1><p>Alamat ini tidak mengarah ke halaman yang tersedia.</p><Link className="text-link" href="/">Kembali ke beranda <span>→</span></Link></main>;
}
