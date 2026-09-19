import type { Metadata } from "next";
import { ProjectRows } from "@/components/content-rows";
import { getPublishedProjects } from "@/lib/data";

export const metadata: Metadata = { title: "Proyek", description: "Proyek yang dikerjakan Raihan Daris Ramadhan." };

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();
  return <>
    <header className="page-hero">
      <p className="eyebrow">01 / Portfolio</p>
      <div className="page-hero-copy"><h1>Proyek <em>pilihan.</em></h1><p>Case study yang mempertemukan konteks masalah, pertimbangan teknis, proses implementasi, dan hasil yang dapat dievaluasi secara terbuka.</p></div>
    </header>
    <div className="page-content"><ProjectRows projects={projects} /></div>
  </>;
}
