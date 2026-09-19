import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PostRows } from "@/components/content-rows";
import { RepoActivity } from "@/components/repo-activity";
import { getPublishedPosts, getPublishedProjectBySlug } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getPublishedProjectBySlug((await params).slug);
  if (!project) return {};
  const image = project.project_images?.[0]?.file_url;
  return { title: project.title, description: project.summary, openGraph: { images: image ? [image] : undefined } };
}

export default async function ProjectPage({ params }: Props) {
  const project = await getPublishedProjectBySlug((await params).slug);
  if (!project) notFound();
  const posts = await getPublishedPosts({ projectId: project.id, ascending: true });
  const images = [...(project.project_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const first = images[0];
  return <article className="measure">
    <header><h1>{project.title}</h1><p className="meta">{[project.period, project.role].filter(Boolean).join(" · ")}</p></header>
    {project.problem && <section className="project-section"><h2>Masalah</h2><p>{project.problem}</p></section>}
    {project.approach && <section className="project-section"><h2>Pendekatan</h2><p>{project.approach}</p></section>}
    {first && <ProjectFigure image={first.file_url} caption={first.caption} title={project.title} index={1} />}
    {project.outcome && <section className="project-section"><h2>Hasil</h2><p>{project.outcome}</p></section>}
    {images.slice(1).map((image, index) => <ProjectFigure image={image.file_url} caption={image.caption} title={project.title} index={index + 2} key={image.id} />)}
    <section className="project-section">
      <p className="meta">{project.tech_stack.join(" · ")}</p>
      <div className="contact-links">
        {project.repo_url && <Link href={project.repo_url}>Repo</Link>}
        {project.demo_url && <Link href={project.demo_url}>Demo</Link>}
      </div>
    </section>
    {project.repo_url && <Suspense fallback={null}><RepoActivity url={project.repo_url} /></Suspense>}
    {posts.length > 0 && <section className="section"><h2>Tulisan terkait</h2><PostRows posts={posts} /></section>}
  </article>;
}

function ProjectFigure({ image, caption, title, index }: { image: string; caption: string | null; title: string; index: number }) {
  return <figure className="project-image">
    <Image src={image} alt={caption || `${title}, gambar ${index}`} width={1200} height={800} sizes="(max-width: 899px) calc(100vw - 52px), 768px" />
    {caption && <figcaption className="meta">{caption}</figcaption>}
  </figure>;
}
