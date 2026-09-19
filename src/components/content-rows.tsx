import Link from "next/link";
import Image from "next/image";
import type { Post, Project } from "@/types/content";
import { courses } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export function ProjectRows({ projects, visual = false }: { projects: Project[]; visual?: boolean }) {
  if (!projects.length) return <div className="project-empty"><span>00</span><div><strong>Dokumentasi proyek sedang disiapkan.</strong><p>Studi kasus akan memuat konteks, proses pengembangan, dan hasil setiap proyek.</p></div></div>;
  if (visual) return <div className="project-visual-list" role="region" aria-label="Kartu proyek pilihan" tabIndex={0}>{projects.map((project, index) => {
    const cover = [...(project.project_images ?? [])].sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at))[0];
    return <Link className="project-visual-card" href={`/projects/${project.slug}`} key={project.id}>
      <div className="project-visual-cover">{cover ? <Image src={cover.file_url} alt={cover.caption || `Tampilan ${project.title}`} fill sizes="(max-width: 600px) 85vw, (max-width: 900px) 50vw, 400px" /> : <div className="project-cover-fallback"><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><span>{project.tech_stack.slice(0, 2).join(" / ")}</span></div>}<span className="project-cover-link" aria-hidden="true">↗</span></div>
      <div className="project-visual-copy"><span className="project-card-meta">{project.period || "Studi kasus"}</span><h3>{project.title}</h3><p>{project.summary}</p><span className="tech-line">{project.tech_stack.slice(0, 3).join(" · ")}</span></div>
    </Link>;
  })}</div>;
  return <div className="project-list">{projects.map((project, index) => (
    <Link className="project-card" href={`/projects/${project.slug}`} key={project.id}>
      <span className="project-index">{String(index + 1).padStart(2, "0")}</span>
      <div className="project-card-copy"><span className="project-card-meta">{project.period || "Project"}</span><h3>{project.title}</h3><p>{project.summary}</p><span className="tech-line">{project.tech_stack.join(" · ")}</span></div>
      <span className="project-arrow">↗</span>
    </Link>
  ))}</div>;
}

export function PostRows({ posts }: { posts: Post[] }) {
  if (!posts.length) return <div className="writing-empty"><p>Publikasi pertama sedang disusun.</p><span>Catatan teknis dan pembelajaran proyek akan tersedia di sini.</span></div>;
  return <div className="post-list">{posts.map((post, index) => {
    const course = courses.find((item) => item.slug === post.course_slug);
    return <Link className="post-row" href={`/writing/${post.slug}`} key={post.id}>
      <span className="post-number">{String(index + 1).padStart(2, "0")}</span>
      <div><span className="post-date">{formatDate(post.published_at ?? post.created_at)}</span><h3>{post.title}</h3><p>{post.summary}</p>{course && <span className="post-topic">{course.title} · minggu {post.week_number}</span>}</div>
      <span className="post-arrow">→</span>
    </Link>;
  })}</div>;
}
