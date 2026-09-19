export type DraftSnapshot = {
  title: string;
  summary: string;
  body: string;
  topics: string;
  courseSlug: string;
  weekNumber: string;
  projectId: string;
  published: boolean;
  publishedAt: string;
};

export type EditorDraft = {
  id: string;
  postId: string | null;
  snapshot: DraftSnapshot;
  basePostUpdatedAt: string | null;
  updatedAt: string;
  stale: boolean;
};

export type DraftSaveResult =
  | { ok: true; draftId: string; savedAt: string }
  | { ok: false; code: "stale" | "unavailable"; message: string; currentPostUpdatedAt?: string; conflictingDraft?: EditorDraft };

export const emptyDraftSnapshot: DraftSnapshot = {
  title: "",
  summary: "",
  body: "",
  topics: "",
  courseSlug: "",
  weekNumber: "",
  projectId: "",
  published: false,
  publishedAt: "",
};

export function normalizeDraftSnapshot(value: Partial<DraftSnapshot>): DraftSnapshot {
  return {
    title: String(value.title ?? "").slice(0, 500),
    summary: String(value.summary ?? "").slice(0, 5000),
    body: String(value.body ?? "").slice(0, 20000),
    topics: String(value.topics ?? "").slice(0, 2000),
    courseSlug: String(value.courseSlug ?? "").slice(0, 200),
    weekNumber: String(value.weekNumber ?? "").slice(0, 3),
    projectId: String(value.projectId ?? "").slice(0, 80),
    published: value.published === true,
    publishedAt: String(value.publishedAt ?? "").slice(0, 80),
  };
}

export function snapshotsEqual(left: DraftSnapshot, right: DraftSnapshot) {
  return JSON.stringify(left) === JSON.stringify(right);
}
