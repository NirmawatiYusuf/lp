import type { Post } from "@/types/content";

type RelatedPost = Pick<Post, "id" | "slug" | "title" | "summary" | "topics" | "course_slug" | "project_id" | "published" | "published_at" | "sort_at" | "created_at">;

function overlap(left: string[], right: string[]) {
  const rightSet = new Set(right);
  return left.reduce((count, value) => count + (rightSet.has(value) ? 1 : 0), 0);
}

function relevance(current: Post, candidate: RelatedPost) {
  const topicOverlap = overlap(current.topics ?? [], candidate.topics ?? []);
  const courseMatch = current.course_slug && current.course_slug === candidate.course_slug ? 1 : 0;
  const projectMatch = current.project_id && current.project_id === candidate.project_id ? 1 : 0;
  return topicOverlap * 3 + courseMatch * 2 + projectMatch * 2;
}

function compareByDate(left: RelatedPost, right: RelatedPost) {
  const dateDifference = new Date(right.sort_at || right.published_at || right.created_at).getTime() - new Date(left.sort_at || left.published_at || left.created_at).getTime();
  if (dateDifference !== 0) return dateDifference;
  const titleDifference = left.title.localeCompare(right.title, "id");
  return titleDifference || left.id.localeCompare(right.id);
}

export function selectRelatedPosts(current: Post, posts: RelatedPost[], limit = 3) {
  return posts
    .filter((post) => post.published && post.id !== current.id && post.slug !== current.slug)
    .sort((left, right) => relevance(current, right) - relevance(current, left) || compareByDate(left, right))
    .slice(0, limit);
}
