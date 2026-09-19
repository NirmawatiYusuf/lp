import "server-only";

import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DraftSnapshot, EditorDraft } from "@/lib/draft-types";
import { normalizeDraftSnapshot } from "@/lib/draft-types";

type DraftRow = {
  id: string;
  post_id: string | null;
  snapshot: DraftSnapshot;
  base_post_updated_at: string | null;
  updated_at: string;
};

export async function getAdminUserId() {
  await requireAdmin();
  const client = await createServerSupabaseClient();
  if (!client) throw new Error("Konfigurasi Supabase belum lengkap.");
  const { data } = await client.auth.getUser();
  if (!data.user) throw new Error("Sesi admin tidak ditemukan.");
  return data.user.id;
}

function toEditorDraft(row: DraftRow, liveUpdatedAt: string | null) {
  return {
    id: row.id,
    postId: row.post_id,
    snapshot: normalizeDraftSnapshot(row.snapshot),
    basePostUpdatedAt: row.base_post_updated_at,
    updatedAt: row.updated_at,
    stale: row.post_id !== null && liveUpdatedAt !== row.base_post_updated_at,
  } satisfies EditorDraft;
}

export async function getEditorDraft(postId?: string, draftId?: string) {
  const userId = await getAdminUserId();
  const client = createAdminClient();
  let query = client
    .from("post_drafts")
    .select("id, post_id, snapshot, base_post_updated_at, updated_at")
    .eq("user_id", userId);
  query = draftId ? query.eq("id", draftId) : postId ? query.eq("post_id", postId) : query.is("post_id", null).order("updated_at", { ascending: false }).limit(1);
  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;

  let liveUpdatedAt: string | null = null;
  if (data.post_id) {
    const { data: post } = await client.from("posts").select("updated_at").eq("id", data.post_id).maybeSingle();
    liveUpdatedAt = post?.updated_at ?? null;
  }
  return toEditorDraft(data as DraftRow, liveUpdatedAt);
}

export async function deleteEditorDraft(draftId: string) {
  const userId = await getAdminUserId();
  const { error } = await createAdminClient().from("post_drafts").delete().eq("id", draftId).eq("user_id", userId);
  if (error) throw new Error("Draft tidak dapat dihapus.");
}

export async function deleteEditorDraftForPost(postId: string) {
  const userId = await getAdminUserId();
  const { error } = await createAdminClient().from("post_drafts").delete().eq("post_id", postId).eq("user_id", userId);
  if (error) throw new Error("Draft tidak dapat dihapus.");
}
