const areas = [
  { title: "Web development", label: "Build", text: "Mengubah kebutuhan menjadi antarmuka responsif dan alur produk yang utuh, dari struktur komponen sampai pengalaman pengguna.", stack: "Next.js · React · TypeScript" },
  { title: "Backend & data", label: "Connect", text: "Merancang model data, autentikasi, dan integrasi layanan dengan perhatian pada keamanan serta kejelasan operasional.", stack: "PostgreSQL · Supabase · API" },
  { title: "Dokumentasi teknis", label: "Explain", text: "Mencatat alasan di balik keputusan teknis agar sistem dapat dipahami, dievaluasi, dan dikembangkan lebih lanjut.", stack: "Studi kasus · Tulisan · Riset" },
];

export function FocusAreas() {
  return <>
    <div className="practice-grid desktop-practice">{areas.map((area, index) => <article key={area.title}>
      <span>0{index + 1} / {area.label}</span><h3>{area.title}</h3><p>{area.text}</p><small>{area.stack}</small>
    </article>)}</div>
    <div className="mobile-practice">{areas.map((area, index) => <details name="focus-area" key={area.title}>
      <summary><span className="focus-number">0{index + 1}</span><span><small>{area.label}</small><strong>{area.title}</strong></span><span className="focus-toggle" aria-hidden="true">+</span></summary>
      <div><p>{area.text}</p><small>{area.stack}</small></div>
    </details>)}</div>
  </>;
}
