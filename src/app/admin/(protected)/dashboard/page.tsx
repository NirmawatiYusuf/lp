import Link from "next/link";
import { deletePostAction, togglePostAction } from "@/actions/post-actions";
import { StatusNotice } from "@/components/admin/status-notice";
import { getAdminContent } from "@/lib/data";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const { posts, projects } = await getAdminContent();
  const status = await searchParams;
  return <><h1>Dashboard</h1><StatusNotice {...status} /><div className="stats"><span className="stat"><strong>{posts.length}</strong> tulisan</span><span className="stat"><strong>{posts.filter((post) => post.published).length}</strong> published</span><span className="stat"><strong>{posts.reduce((sum, post) => sum + post.views, 0)}</strong> views</span><span className="stat"><strong>{projects.length}</strong> proyek</span></div><h2>Tulisan</h2><table className="admin-table"><thead><tr><th>Judul</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{posts.map((post) => <tr key={post.id}><td><Link href={`/admin/writing/${post.id}/edit`}>{post.title}</Link></td><td>{post.published ? "Published" : "Draft"}</td><td><div className="actions"><form action={togglePostAction.bind(null, post.id, !post.published)}><button className="secondary">{post.published ? "Jadikan draft" : "Publikasikan"}</button></form><form action={deletePostAction.bind(null, post.id)}><button className="secondary danger">Hapus</button></form></div></td></tr>)}</tbody></table></>;
}
