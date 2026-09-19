import { notFound } from "next/navigation";
import { updateProjectAction } from "@/actions/project-actions";
import { ProjectForm } from "@/components/admin/project-form";
import { StatusNotice } from "@/components/admin/status-notice";
import { getAdminProject } from "@/lib/data";

export default async function EditProjectPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; success?: string }> }) {
  const { id } = await params;
  const project = await getAdminProject(id);
  if (!project) notFound();
  return <><h1>Edit proyek</h1><StatusNotice {...await searchParams} /><ProjectForm project={project} action={updateProjectAction.bind(null, id)} /></>;
}
