import { loadPostDraftAction, deletePostDraftAction, savePostDraftAction } from "@/actions/draft-actions";
import type { EditorDraft } from "@/lib/draft-types";
import type { Post, Project } from "@/types/content";
import { UploadManager } from "./upload-manager";
import { PostEditor } from "./post-editor";

export function PostForm({ post, projects, action, initialDraft }: { post?: Post; projects: Project[]; action: (data: FormData) => void | Promise<void>; initialDraft?: EditorDraft | null }) {
  const media = post ? <section><h2>File</h2>
    <p className="muted">Upload diterapkan langsung. Urutan dan penghapusan file diterapkan saat menyimpan tulisan.</p>
    <UploadManager kind="post-image" parentId={post.id} label="Tambah gambar" />
    <UploadManager kind="post-pdf" parentId={post.id} label="Tambah PDF" />
    {(post.post_files ?? []).map((file) => <div key={file.id} className="notice">
      <a href={file.file_url}>{file.file_name}</a>
      <label>Urutan<input type="number" name={`sort_order_${file.id}`} defaultValue={file.sort_order} /></label>
      <label><input type="checkbox" name="remove_file_ids" value={file.id} /> Hapus saat menyimpan</label>
    </div>)}
  </section> : <p className="muted">Simpan tulisan sebagai draft terlebih dahulu untuk menambahkan media.</p>;
  return <PostEditor post={post} projects={projects} action={action} initialDraft={initialDraft} saveDraft={savePostDraftAction} loadDraft={loadPostDraftAction} discardDraft={deletePostDraftAction} media={media} />;
}
