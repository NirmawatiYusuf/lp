import assert from "node:assert/strict";
import test from "node:test";
import type { Post } from "../src/types/content";
import { selectRelatedPosts } from "../src/components/article-related";

const post = (values: Partial<Post>): Post => ({
  id: "current",
  title: "Current",
  slug: "current",
  summary: "Current summary",
  body: null,
  topics: [],
  course_slug: null,
  week_number: null,
  project_id: null,
  published: true,
  published_at: "2026-09-01T00:00:00.000Z",
  sort_at: "2026-09-01T00:00:00.000Z",
  cover_image_url: null,
  views: 0,
  created_at: "2026-09-01T00:00:00.000Z",
  updated_at: "2026-09-01T00:00:00.000Z",
  ...values,
});

test("selectRelatedPosts ranks overlap, excludes current, and never returns drafts", () => {
  const current = post({ topics: ["web"], course_slug: "web", project_id: "project" });
  const result = selectRelatedPosts(current, [
    post({ id: "draft", slug: "draft", title: "Draft", published: false, topics: ["web"] }),
    post({ id: "recent", slug: "recent", title: "Recent", sort_at: "2026-09-04T00:00:00.000Z" }),
    post({ id: "related", slug: "related", title: "Related", topics: ["web"], course_slug: "web" }),
    current,
  ]);

  assert.deepEqual(result.map(({ id }) => id), ["related", "recent"]);
});
