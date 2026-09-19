"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeFileName } from "@/lib/utils";

export type UploadKind = "post-image" | "post-pdf" | "project-image";
const imageTypes = ["image/jpeg", "image/png", "image/webp"];

function expectedPrefix(kind: UploadKind, parentId: string) {
  return kind === "project-image" ? `projects/${parentId}/` : `${parentId}/`;
}

export async function createUploadUrl(kind: UploadKind, parentId: string, fileName: string, mime: string, size: number) {
  await requireAdmin();
  if (size <= 0 || size > 10 * 1024 * 1024) throw new Error("Ukuran file maksimal 10MB.");
  if (kind === "post-pdf" ? mime !== "application/pdf" : !imageTypes.includes(mime)) throw new Error("Jenis file tidak didukung.");
  const client = createAdminClient();
  const table = kind === "project-image" ? "projects" : "posts";
  const { data: parent } = await client.from(table).select("id").eq("id", parentId).maybeSingle();
  if (!parent) throw new Error("Konten induk tidak ditemukan.");
  if (kind === "post-pdf") {
    const { count } = await client.from("post_files").select("id", { count: "exact", head: true }).eq("post_id", parentId).eq("file_type", "pdf");
    if (count) throw new Error("Satu tulisan hanya boleh punya satu PDF.");
  }
  const path = `${expectedPrefix(kind, parentId)}${Date.now()}-${sanitizeFileName(fileName)}`;
  const { data, error } = await client.storage.from("note-files").createSignedUploadUrl(path);
  if (error) throw new Error(error.message);
  return { path, token: data.token };
}

export async function registerUpload(kind: UploadKind, parentId: string, path: string, fileName: string) {
  await requireAdmin();
  if (!path.startsWith(expectedPrefix(kind, parentId))) throw new Error("Path upload tidak valid.");
  const client = createAdminClient();
  const { data: publicData } = client.storage.from("note-files").getPublicUrl(path);
  if (kind === "project-image") {
    const { data: last } = await client.from("project_images").select("sort_order").eq("project_id", parentId).order("sort_order", { ascending: false }).limit(1).maybeSingle();
    const { error } = await client.from("project_images").insert({ project_id: parentId, file_path: path, file_url: publicData.publicUrl, sort_order: (last?.sort_order ?? -1) + 1 });
    if (error) throw new Error(error.message);
    revalidatePath("/projects");
  } else {
    if (kind === "post-pdf") {
      const { count } = await client.from("post_files").select("id", { count: "exact", head: true }).eq("post_id", parentId).eq("file_type", "pdf");
      if (count) throw new Error("Satu tulisan hanya boleh punya satu PDF.");
    }
    const { data: last } = await client.from("post_files").select("sort_order").eq("post_id", parentId).order("sort_order", { ascending: false }).limit(1).maybeSingle();
    const { error } = await client.from("post_files").insert({ post_id: parentId, file_name: fileName, file_path: path, file_url: publicData.publicUrl, file_type: kind === "post-pdf" ? "pdf" : "image", sort_order: (last?.sort_order ?? -1) + 1 });
    if (error) throw new Error(error.code === "23505" ? "Satu tulisan hanya boleh punya satu PDF." : error.message);
    await refreshPostCover(parentId);
    revalidatePath("/writing");
  }
}

export async function discardUpload(path: string) {
  await requireAdmin();
  if (!/^(projects\/)?[0-9a-f-]{36}\/\d+-[a-z0-9.-]+$/i.test(path)) return;
  const client = createAdminClient();
  const [{ count: postCount }, { count: projectCount }] = await Promise.all([
    client.from("post_files").select("id", { count: "exact", head: true }).eq("file_path", path),
    client.from("project_images").select("id", { count: "exact", head: true }).eq("file_path", path),
  ]);
  if (postCount || projectCount) return;
  const { error } = await client.storage.from("note-files").remove([path]);
  if (error) console.error("orphan_upload_cleanup_failed", { path, stage: "discard" });
}

export async function refreshPostCover(postId: string) {
  await requireAdmin();
  const client = createAdminClient();
  const { data } = await client.from("post_files").select("file_url").eq("post_id", postId).eq("file_type", "image").order("sort_order").order("created_at").limit(1).maybeSingle();
  await client.from("posts").update({ cover_image_url: data?.file_url ?? null }).eq("id", postId);
}
