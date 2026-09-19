"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseCsv, slugify } from "@/lib/utils";
import { postInputSchema } from "@/lib/validations";
import { refreshPostCover } from "@/actions/upload-actions";
import { deleteEditorDraft } from "@/lib/draft-server";

function input(formData: FormData) {
  return postInputSchema.safeParse({
    title: formData.get("title"), summary: formData.get("summary"), body: formData.get("body") ?? "",
    topics: formData.get("topics") ?? "", courseSlug: formData.get("courseSlug") ?? "",
    weekNumber: formData.get("weekNumber") ?? "", projectId: formData.get("projectId") ?? "",
    published: formData.get("published") === "on", publishedAt: formData.get("publishedAt") ?? "",
  });
}

async function availableSlug(title: string, excludeId?: string) {
  const client = createAdminClient();
  const base = slugify(title) || "tulisan";
  for (let index = 1; index < 100; index++) {
    const value = index === 1 ? base : `${base}-${index}`;
    let query = client.from("posts").select("id").eq("slug", value);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return value;
  }
  throw new Error("Tidak dapat membuat slug unik.");
}

function payload(value: ReturnType<typeof postInputSchema.parse>, slug: string) {
  return {
    title: value.title, slug, summary: value.summary, body: value.body,
    topics: parseCsv(value.topics), course_slug: value.courseSlug, week_number: value.weekNumber,
    project_id: value.projectId, published: value.published, published_at: value.publishedAt,
  };
}

function refresh(slug?: string) {
  revalidatePath("/"); revalidatePath("/writing"); revalidatePath("/projects");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/writing/${slug}`);
  revalidatePath("/admin/dashboard");
}

export async function createPostAction(formData: FormData) {
  await requireAdmin();
  const parsed = input(formData);
  if (!parsed.success) redirect(`/admin/writing/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  const slug = await availableSlug(parsed.data.title);
  const { data, error } = await createAdminClient().from("posts").insert(payload(parsed.data, slug)).select("id").single();
  if (error) redirect(`/admin/writing/new?error=${encodeURIComponent(error.code === "23505" ? "Matkul dan minggu itu sudah dipakai." : error.message)}`);
  const draftId = String(formData.get("_draftId") ?? "");
  if (draftId) {
    try { await deleteEditorDraft(draftId); } catch { /* The post save must not depend on the optional draft table. */ }
  }
  refresh(slug);
  redirect(`/admin/writing/${data.id}/edit?success=dibuat&saved=${crypto.randomUUID()}`);
}

export async function updatePostAction(id: string, formData: FormData) {
  await requireAdmin();
  const parsed = input(formData);
  if (!parsed.success) redirect(`/admin/writing/${id}/edit?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  const client = createAdminClient();
  const { data: old } = await client.from("posts").select("slug, updated_at").eq("id", id).single();
  const expectedUpdatedAt = String(formData.get("_basePostUpdatedAt") ?? "");
  if (!old || (expectedUpdatedAt && old.updated_at !== expectedUpdatedAt)) {
    redirect(`/admin/writing/${id}/edit?error=${encodeURIComponent("Tulisan berubah di tempat lain. Muat ulang sebelum menyimpan.")}`);
  }
  const slug = await availableSlug(parsed.data.title, id);
  const { data: updated, error } = await client.from("posts").update(payload(parsed.data, slug)).eq("id", id).eq("updated_at", expectedUpdatedAt || old.updated_at).select("id").maybeSingle();
  if (error) redirect(`/admin/writing/${id}/edit?error=${encodeURIComponent(error.code === "23505" ? "Matkul dan minggu itu sudah dipakai." : error.message)}`);
  if (!updated) redirect(`/admin/writing/${id}/edit?error=${encodeURIComponent("Tulisan berubah di tempat lain. Muat ulang sebelum menyimpan.")}`);
  refresh(old.slug); refresh(slug);
  const { data: files } = await client.from("post_files").select("id, file_path").eq("post_id", id);
  const removeIds = new Set(formData.getAll("remove_file_ids").map(String));
  const removed = (files ?? []).filter((file) => removeIds.has(file.id));
  if (removed.length) {
    const { error: storageError } = await client.storage.from("note-files").remove(removed.map((file) => file.file_path));
    if (storageError) redirect(`/admin/writing/${id}/edit?error=${encodeURIComponent("Teks tersimpan, tetapi file Storage belum terhapus.")}`);
    const { error: deleteError } = await client.from("post_files").delete().in("id", removed.map((file) => file.id));
    if (deleteError) redirect(`/admin/writing/${id}/edit?error=${encodeURIComponent("Teks tersimpan, tetapi metadata file belum terhapus.")}`);
  }
  const fileUpdates = await Promise.all((files ?? []).filter((file) => !removeIds.has(file.id)).map((file) => {
    const sortOrder = Number(formData.get(`sort_order_${file.id}`));
    return client.from("post_files").update({ sort_order: Number.isInteger(sortOrder) ? sortOrder : 0 }).eq("id", file.id);
  }));
  if (fileUpdates.some((result) => result.error)) redirect(`/admin/writing/${id}/edit?error=${encodeURIComponent("Teks tersimpan, tetapi urutan file belum diperbarui.")}`);
  await refreshPostCover(id);
  const draftId = String(formData.get("_draftId") ?? "");
  if (draftId) {
    try { await deleteEditorDraft(draftId); } catch { /* The post save must not depend on the optional draft table. */ }
  }
  refresh(old?.slug); refresh(slug);
  redirect(`/admin/writing/${id}/edit?success=disimpan&saved=${crypto.randomUUID()}`);
}

export async function togglePostAction(id: string, nextState: boolean) {
  await requireAdmin();
  const { error } = await createAdminClient().from("posts").update({ published: nextState }).eq("id", id);
  if (error) redirect(`/admin/dashboard?error=${encodeURIComponent(error.message)}`);
  refresh();
  redirect(`/admin/dashboard?success=${nextState ? "dipublikasikan" : "disimpan-sebagai-draft"}`);
}

export async function deletePostAction(id: string) {
  await requireAdmin();
  const client = createAdminClient();
  const { data: files } = await client.from("post_files").select("file_path").eq("post_id", id);
  const paths = files?.map((file) => file.file_path) ?? [];
  if (paths.length) {
    const { error } = await client.storage.from("note-files").remove(paths);
    if (error) redirect("/admin/dashboard?error=storage");
  }
  const { error } = await client.from("posts").delete().eq("id", id);
  if (error) redirect(`/admin/dashboard?error=${encodeURIComponent(error.message)}`);
  refresh();
  redirect("/admin/dashboard?success=dihapus");
}
