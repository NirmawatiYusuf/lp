"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";
import { projectInputSchema } from "@/lib/validations";

function input(formData: FormData) {
  return projectInputSchema.safeParse({
    title: formData.get("title"), slug: formData.get("slug") ?? "", summary: formData.get("summary"),
    problem: formData.get("problem") ?? "", approach: formData.get("approach") ?? "", outcome: formData.get("outcome") ?? "",
    role: formData.get("role") ?? "", period: formData.get("period") ?? "", techStack: formData.get("techStack") ?? "",
    repoUrl: formData.get("repoUrl") ?? "", demoUrl: formData.get("demoUrl") ?? "",
    published: formData.get("published") === "on", sortOrder: formData.get("sortOrder") ?? 0,
  });
}

async function availableSlug(raw: string, excludeId?: string) {
  const client = createAdminClient();
  const base = slugify(raw) || "proyek";
  for (let index = 1; index < 100; index++) {
    const value = index === 1 ? base : `${base}-${index}`;
    let query = client.from("projects").select("id").eq("slug", value);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return value;
  }
  throw new Error("Tidak dapat membuat slug unik.");
}

function payload(value: ReturnType<typeof projectInputSchema.parse>, slug: string) {
  return {
    title: value.title, slug, summary: value.summary, problem: value.problem, approach: value.approach,
    outcome: value.outcome, role: value.role, period: value.period,
    tech_stack: value.techStack.split(",").map((item) => item.trim()).filter(Boolean),
    repo_url: value.repoUrl, demo_url: value.demoUrl, published: value.published, sort_order: value.sortOrder,
  };
}

function refresh(slug?: string) {
  revalidatePath("/"); revalidatePath("/projects"); revalidatePath("/writing");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/projects/${slug}`);
  revalidatePath("/admin/projects"); revalidatePath("/admin/dashboard");
}

export async function createProjectAction(formData: FormData) {
  await requireAdmin();
  const parsed = input(formData);
  if (!parsed.success) redirect(`/admin/projects/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  const slug = await availableSlug(parsed.data.slug || parsed.data.title);
  const { data, error } = await createAdminClient().from("projects").insert(payload(parsed.data, slug)).select("id").single();
  if (error) redirect(`/admin/projects/new?error=${encodeURIComponent(error.message)}`);
  refresh(slug);
  redirect(`/admin/projects/${data.id}/edit?success=dibuat`);
}

export async function updateProjectAction(id: string, formData: FormData) {
  await requireAdmin();
  const parsed = input(formData);
  if (!parsed.success) redirect(`/admin/projects/${id}/edit?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  const client = createAdminClient();
  const { data: old } = await client.from("projects").select("slug").eq("id", id).single();
  const { data: images } = await client.from("project_images").select("id, file_path").eq("project_id", id);
  const removeIds = new Set(formData.getAll("remove_image_ids").map(String));
  const removed = (images ?? []).filter((image) => removeIds.has(image.id));
  if (removed.length) {
    const { error: storageError } = await client.storage.from("note-files").remove(removed.map((image) => image.file_path));
    if (storageError) redirect(`/admin/projects/${id}/edit?error=Gagal+menghapus+gambar+Storage`);
    await client.from("project_images").delete().in("id", removed.map((image) => image.id));
  }
  await Promise.all((images ?? []).filter((image) => !removeIds.has(image.id)).map((image) => {
    const sortOrder = Number(formData.get(`sort_order_${image.id}`));
    const caption = String(formData.get(`caption_${image.id}`) ?? "").trim() || null;
    return client.from("project_images").update({ sort_order: Number.isInteger(sortOrder) ? sortOrder : 0, caption }).eq("id", image.id);
  }));
  const slug = await availableSlug(parsed.data.slug || parsed.data.title, id);
  const { error } = await client.from("projects").update(payload(parsed.data, slug)).eq("id", id);
  if (error) redirect(`/admin/projects/${id}/edit?error=${encodeURIComponent(error.message)}`);
  refresh(old?.slug); refresh(slug);
  redirect(`/admin/projects/${id}/edit?success=disimpan`);
}

export async function toggleProjectAction(id: string, nextState: boolean) {
  await requireAdmin();
  const { error } = await createAdminClient().from("projects").update({ published: nextState }).eq("id", id);
  if (error) redirect(`/admin/projects?error=${encodeURIComponent(error.message)}`);
  refresh();
  redirect(`/admin/projects?success=${nextState ? "dipublikasikan" : "disimpan-sebagai-draft"}`);
}

export async function deleteProjectAction(id: string) {
  await requireAdmin();
  const client = createAdminClient();
  const { data: images } = await client.from("project_images").select("file_path").eq("project_id", id);
  const paths = images?.map((image) => image.file_path) ?? [];
  if (paths.length) {
    const { error } = await client.storage.from("note-files").remove(paths);
    if (error) redirect("/admin/projects?error=storage");
  }
  const { error } = await client.from("projects").delete().eq("id", id);
  if (error) redirect(`/admin/projects?error=${encodeURIComponent(error.message)}`);
  refresh();
  redirect("/admin/projects?success=dihapus");
}
