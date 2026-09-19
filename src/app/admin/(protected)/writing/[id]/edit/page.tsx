import { notFound } from "next/navigation";
import { updatePostAction } from "@/actions/post-actions";
import { PostForm } from "@/components/admin/post-form";
import { StatusNotice } from "@/components/admin/status-notice";
import { getAdminContent, getAdminPost } from "@/lib/data";
import { getEditorDraft } from "@/lib/draft-server";

export default async function EditPostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; success?: string; saved?: string }> }) {
  const { id } = await params;
  const [post, content] = await Promise.all([getAdminPost(id), getAdminContent()]);
  if (!post) notFound();
  const initialDraft = await getEditorDraft(id);
  const status = await searchParams;
  return <><h1>Edit tulisan</h1><StatusNotice {...status} /><PostForm key={`${id}:${status.saved ?? ""}`} post={post} projects={content.projects} action={updatePostAction.bind(null, id)} initialDraft={initialDraft} /></>;
}
