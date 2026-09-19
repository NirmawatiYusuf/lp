import { createProjectAction } from "@/actions/project-actions";
import { ProjectForm } from "@/components/admin/project-form";
import { StatusNotice } from "@/components/admin/status-notice";

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return <><h1>Proyek baru</h1><StatusNotice {...await searchParams} /><ProjectForm action={createProjectAction} /></>;
}
