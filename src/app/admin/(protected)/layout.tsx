import Link from "next/link";
import { logoutAction } from "@/actions/auth-actions";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <main className="admin-shell"><nav className="admin-nav"><Link href="/admin/dashboard">Dashboard</Link><Link href="/admin/writing/new">Tulisan baru</Link><Link href="/admin/projects">Proyek</Link><Link href="/admin/settings">Pengaturan</Link><form action={logoutAction}><button className="secondary">Keluar</button></form></nav>{children}</main>;
}
