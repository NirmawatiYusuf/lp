"use server";

import { deleteEditorDraft, getAdminUserId, getEditorDraft } from "@/lib/draft-server";
import { normalizeDraftSnapshot, type DraftSaveResult, type DraftSnapshot, type EditorDraft } from "@/lib/draft-types";
import { createAdminClient } from "@/lib/supabase/admin";

type SaveDraftInput = {
  draftId?: string | null;
  postId?: string | null;
  basePostUpdatedAt?: string | null;
  expectedDraftUpdatedAt?: string | null;
  snapshot: Partial<DraftSnapshot>;
};

export async function savePostDraftAction(input: SaveDraftInput): Promise<DraftSaveResult> {
  try {
    const userId = await getAdminUserId();
    const client = createAdminClient();
    const snapshot = normalizeDraftSnapshot(input.snapshot);
    const postId = input.postId || null;
    let liveUpdatedAt: string | null = null;

    if (postId) {
      const { data: post, error } = await client.from("posts").select("updated_at").eq("id", postId).maybeSingle();
      if (error || !post) return { ok: false, code: "unavailable", message: "Tulisan tidak ditemukan." };
      liveUpdatedAt = post.updated_at;
      if (input.basePostUpdatedAt !== liveUpdatedAt) {
        return { ok: false, code: "stale", message: "Tulisan berubah di tempat lain. Konfirmasi versi editor sebelum melanjutkan.", currentPostUpdatedAt: liveUpdatedAt! };
      }
    }

    let existing = null as { id: string; post_id: string | null; base_post_updated_at: string | null; updated_at: string } | null;
    if (input.draftId) {
      const { data } = await client
        .from("post_drafts")
        .select("id, post_id, base_post_updated_at, updated_at")
        .eq("id", input.draftId)
        .eq("user_id", userId)
        .maybeSingle();
      existing = data;
      if (!existing) return { ok: false, code: "stale", message: "Draft sudah berubah atau dihapus. Konfirmasi isi editor sebelum melanjutkan." };
      if (existing && existing.post_id !== postId) {
        return { ok: false, code: "unavailable", message: "Draft tidak cocok dengan tulisan ini." };
      }
    } else if (postId) {
      const { data } = await client
        .from("post_drafts")
        .select("id, post_id, base_post_updated_at, updated_at")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .maybeSingle();
      existing = data;
      if (existing) return { ok: false, code: "stale", message: "Draft lain sudah tersimpan. Muat ulang editor untuk memeriksanya." };
    }

    if (existing) {
      if (input.expectedDraftUpdatedAt !== existing.updated_at) return { ok: false, code: "stale", message: "Draft telah berubah di tab lain. Muat ulang untuk memeriksa versi terbaru." };
      if (postId && existing.base_post_updated_at !== liveUpdatedAt) {
        return { ok: false, code: "stale", message: "Tulisan berubah di tempat lain. Draft lama tidak ditimpa." };
      }
      const { data, error } = await client
        .from("post_drafts")
        .update({ snapshot, base_post_updated_at: liveUpdatedAt })
        .eq("id", existing.id)
        .eq("user_id", userId)
        .eq("updated_at", existing.updated_at)
        .select("id, updated_at")
        .single();
      if (error || !data) return { ok: false, code: "unavailable", message: "Draft belum tersimpan. Coba lagi." };
      return { ok: true, draftId: data.id, savedAt: data.updated_at };
    }

    const { data, error } = await client
      .from("post_drafts")
      .insert({ user_id: userId, post_id: postId, snapshot, base_post_updated_at: liveUpdatedAt })
      .select("id, updated_at")
      .single();
    if (error?.code === "23505") {
      const conflictingDraft = await getEditorDraft(postId ?? undefined);
      return { ok: false, code: "stale", message: "Tab lain sudah menyimpan draft. Pilih draft tersimpan atau isi editor ini sebelum melanjutkan.", conflictingDraft: conflictingDraft ?? undefined };
    }
    if (error || !data) return { ok: false, code: "unavailable", message: "Draft belum tersimpan. Coba lagi." };
    return { ok: true, draftId: data.id, savedAt: data.updated_at };
  } catch {
    return { ok: false, code: "unavailable", message: "Draft belum tersimpan. Coba lagi." };
  }
}

export async function loadPostDraftAction(draftId: string): Promise<EditorDraft | null> {
  try {
    return await getEditorDraft(undefined, draftId);
  } catch {
    return null;
  }
}

export async function deletePostDraftAction(draftId: string) {
  await deleteEditorDraft(draftId);
}
