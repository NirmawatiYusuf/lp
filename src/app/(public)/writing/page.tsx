import Link from "next/link";
import type { Metadata } from "next";
import { PostRows } from "@/components/content-rows";
import { getPublishedPosts } from "@/lib/data";
import styles from "@/components/writing-search.module.css";

export const metadata: Metadata = { title: "Tulisan", description: "Tulisan dan catatan belajar Raihan Daris Ramadhan." };
type Props = { searchParams: Promise<{ topic?: string; course?: string; q?: string }> };

export default async function WritingPage({ searchParams }: Props) {
  const filters = await searchParams;
  const all = await getPublishedPosts();
  const query = (filters.q ?? "").trim().toLocaleLowerCase("id");
  const posts = filters.topic || filters.course
    ? all.filter((post) => (!filters.topic || post.topics.includes(filters.topic)) && (!filters.course || post.course_slug === filters.course))
    : all;
  const searchedPosts = query
    ? posts.filter((post) => [post.title, post.summary, post.body ?? "", ...post.topics].join(" ").toLocaleLowerCase("id").includes(query))
    : posts;
  const topics = [...new Set(all.flatMap((post) => post.topics))].sort((a, b) => a.localeCompare(b, "id"));
  const querySuffix = query ? `&q=${encodeURIComponent(filters.q?.trim() ?? "")}` : "";
  const activeFilters = [filters.topic, filters.course].filter(Boolean).join(" · ");
  return <>
    <header className="page-hero">
      <p className="eyebrow">02 / Journal</p>
      <div className="page-hero-copy"><h1>Catatan dan <em>tulisan.</em></h1><p>Arsip proses berpikir yang mengurai pembelajaran teknis, evaluasi keputusan, pertanyaan yang belum selesai, dan detail penting dari setiap eksperimen.</p></div>
    </header>
    <div className="page-content">
      <form className={styles.search} role="search" action="/writing" method="get">
        {filters.topic && <input type="hidden" name="topic" value={filters.topic} />}
        {filters.course && <input type="hidden" name="course" value={filters.course} />}
        <label htmlFor="writing-search">Cari tulisan<input id="writing-search" name="q" type="search" defaultValue={filters.q ?? ""} placeholder="Judul, topik, atau isi" /></label>
        <button type="submit">Cari</button>
      </form>
      {topics.length > 0 && <nav className="filters" aria-label="Filter topik"><Link href={`/writing${querySuffix ? `?q=${encodeURIComponent(filters.q?.trim() ?? "")}` : ""}`}>Semua</Link>{topics.map((topic) => <Link href={`/writing?topic=${encodeURIComponent(topic)}${querySuffix}`} key={topic}>{topic}</Link>)}</nav>}
      {searchedPosts.length > 0 || !(query || filters.topic || filters.course)
        ? <PostRows posts={searchedPosts} />
        : <div className={styles.noResults} role="status">
          <p>Tidak ada tulisan yang cocok.</p>
          {query
            ? <span>Pencarian “{filters.q?.trim()}” tidak menemukan hasil.</span>
            : <span>Filter “{activeFilters}” tidak menemukan hasil.</span>}
          <Link href="/writing">Hapus filter <span>→</span></Link>
        </div>}
    </div>
  </>;
}
