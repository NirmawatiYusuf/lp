import { createPostAction } from "@/actions/post-actions";
import { PostForm } from "@/components/admin/post-form";
import { StatusNotice } from "@/components/admin/status-notice";
import { getAdminContent } from "@/lib/data";
import { getEditorDraft } from "@/lib/draft-server";

export default async function NewPostPage({ searchParams }: { searchParams: Promise<{ error?: string; draft?: string }> }) {
  const params = await searchParams;
  const [content, initialDraft] = await Promise.all([
    getAdminContent(),
    getEditorDraft(undefined, params.draft),
  ]);
  return <><h1>Tulisan baru</h1><StatusNotice {...params} /><PostForm projects={content.projects} action={createPostAction} initialDraft={initialDraft?.postId ? null : initialDraft} /></>;
}
