import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArticleBody } from "@/components/article-body";
import { RelatedArticles } from "@/components/related-articles";
import { PostClient } from "@/components/post-client";
import { getPublishedPostBySlug, getPublishedPosts } from "@/lib/data";
import { courses, siteConfig } from "@/lib/site";
import { formatDate, readingTime } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublishedPostBySlug((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    openGraph: { type: "article", publishedTime: post.published_at ?? post.created_at, authors: [siteConfig.name], images: post.cover_image_url ? [post.cover_image_url] : undefined },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await getPublishedPostBySlug((await params).slug);
  if (!post) notFound();
  const publishedPosts = await getPublishedPosts();
  const course = courses.find((item) => item.slug === post.course_slug);
  const files = [...(post.post_files ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const images = files.filter((file) => file.file_type === "image");
  const pdf = files.find((file) => file.file_type === "pdf");
  return <article className="measure" id="article-top">
    <header>
      <h1>{post.title}</h1>
      <p className="meta">{formatDate(post.published_at ?? post.created_at)} · {readingTime(post.body ?? post.summary)} menit baca</p>
      <p className="meta">
        {course && <><Link href={`/writing/kuliah/${course.slug}`}>{course.title}</Link>, minggu {post.week_number}</>}
        {course && post.projects?.published && " · "}
        {post.projects?.published && <>Proyek: <Link href={`/projects/${post.projects.slug}`}>{post.projects.title}</Link></>}
      </p>
    </header>
    <ArticleBody markdown={post.body || post.summary} />
    {images.length > 0 && <div className="gallery">{images.map((image, index) => <Image key={image.id} src={image.file_url} alt={`${post.title}, gambar ${index + 1}`} width={1200} height={800} sizes="(max-width: 899px) calc(100vw - 52px), 768px" />)}</div>}
    <div className="actions section">
      {pdf && <a className="button secondary" href={pdf.file_url}>Unduh {pdf.file_name}</a>}
      <PostClient id={post.id} slug={post.slug} title={post.title} />
    </div>
    <RelatedArticles current={post} posts={publishedPosts} />
  </article>;
}
