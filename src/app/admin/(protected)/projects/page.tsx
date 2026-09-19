import Link from "next/link";
import { deleteProjectAction, toggleProjectAction } from "@/actions/project-actions";
import { StatusNotice } from "@/components/admin/status-notice";
import { getAdminContent } from "@/lib/data";

export default async function AdminProjectsPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const { projects } = await getAdminContent();
  return <><div className="section-head"><h1>Proyek</h1><Link className="button" href="/admin/projects/new">Proyek baru</Link></div><StatusNotice {...await searchParams} /><table className="admin-table"><tbody>{projects.map((project) => <tr key={project.id}><td><Link href={`/admin/projects/${project.id}/edit`}>{project.title}</Link></td><td>{project.published ? "Published" : "Draft"}</td><td><div className="actions"><form action={toggleProjectAction.bind(null, project.id, !project.published)}><button className="secondary">{project.published ? "Jadikan draft" : "Publikasikan"}</button></form><form action={deleteProjectAction.bind(null, project.id)}><button className="secondary danger">Hapus</button></form></div></td></tr>)}</tbody></table></>;
}
