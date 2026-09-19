import Link from "next/link";
import type { Post } from "@/types/content";
import { formatDate } from "@/lib/utils";
import { selectRelatedPosts } from "./article-related";
import styles from "./article-body.module.css";

export function RelatedArticles({ current, posts }: { current: Post; posts: Post[] }) {
  const related = selectRelatedPosts(current, posts);
  if (!related.length) return null;

  return <section className={styles.related} aria-labelledby="related-articles-title">
    <h2 id="related-articles-title">Tulisan terkait</h2>
    <div className={styles.relatedList}>
      {related.map((post) => <Link className={styles.relatedItem} href={`/writing/${post.slug}`} key={post.id}>
        <span className={styles.relatedMeta}>{formatDate(post.published_at ?? post.created_at)}</span>
        <span className={styles.relatedTitle}>{post.title}</span>
        <span className={styles.relatedSummary}>{post.summary}</span>
      </Link>)}
    </div>
  </section>;
}
