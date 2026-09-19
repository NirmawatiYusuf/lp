import type { Project } from "@/types/content";
import { UploadManager } from "./upload-manager";

export function ProjectForm({ project, action }: { project?: Project; action: (data: FormData) => void | Promise<void> }) {
  return <form className="admin-form" action={action}>
    <label>Judul<input name="title" required minLength={2} defaultValue={project?.title} /></label>
    <label>Slug (opsional)<input name="slug" defaultValue={project?.slug} /></label>
    <label>Ringkasan<textarea name="summary" required minLength={20} defaultValue={project?.summary} /></label>
    <label>Masalah<textarea name="problem" defaultValue={project?.problem ?? ""} /></label>
    <label>Pendekatan<textarea name="approach" defaultValue={project?.approach ?? ""} /></label>
    <label>Hasil<textarea name="outcome" defaultValue={project?.outcome ?? ""} /></label>
    <label>Peran<input name="role" defaultValue={project?.role ?? ""} /></label>
    <label>Periode<input name="period" defaultValue={project?.period ?? ""} /></label>
    <label>Tech stack, dipisah koma<input name="techStack" required defaultValue={project?.tech_stack.join(", ")} /></label>
    <label>URL repo<input type="url" name="repoUrl" defaultValue={project?.repo_url ?? ""} /></label>
    <label>URL demo<input type="url" name="demoUrl" defaultValue={project?.demo_url ?? ""} /></label>
    <label>Urutan<input type="number" name="sortOrder" defaultValue={project?.sort_order ?? 0} /></label>
    <label><input type="checkbox" name="published" defaultChecked={project?.published} /> Published</label>
    {project && <section><h2>Gambar</h2>
      <UploadManager kind="project-image" parentId={project.id} label="Tambah gambar" />
      {(project.project_images ?? []).map((image) => <div key={image.id} className="notice">
        <a href={image.file_url}>Lihat gambar</a>
        <label>Caption<input name={`caption_${image.id}`} defaultValue={image.caption ?? ""} /></label>
        <label>Urutan<input type="number" name={`sort_order_${image.id}`} defaultValue={image.sort_order} /></label>
        <label><input type="checkbox" name="remove_image_ids" value={image.id} /> Hapus saat menyimpan</label>
      </div>)}
    </section>}
    <button type="submit">Simpan proyek</button>
  </form>;
}
