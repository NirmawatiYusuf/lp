import { redirect } from "next/navigation";
import { loginAction } from "@/actions/auth-actions";
import { getAdminAccess } from "@/lib/auth";
import { StatusNotice } from "@/components/admin/status-notice";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const access = await getAdminAccess();
  if (access === "authorized") redirect("/admin/dashboard");
  const status = await searchParams;
  const messages: Record<string, string> = { config: "Environment admin belum lengkap.", unauthorized: "Email ini bukan admin.", credentials: "Email atau password tidak cocok." };
  return <main className="login-page">
    <section className="login-visual"><span className="brand-mark">RD</span><h2>Ruang untuk<br /><em>merawat karya.</em></h2><p className="eyebrow">Private studio · Raihan Daris</p><div className="login-shape" aria-hidden="true" /></section>
    <section className="login-panel"><div className="login-panel-inner"><p className="eyebrow">Content management</p><h1>Masuk ke studio</h1><p>Kelola proyek, tulisan, media, dan identitas publik dari satu tempat.</p><StatusNotice success={status.success} error={status.error ? messages[status.error] ?? status.error : undefined} /><form className="admin-form" action={loginAction}><label>Email<input type="email" name="email" autoComplete="email" required /></label><label>Password<input type="password" name="password" autoComplete="current-password" required /></label><button>Masuk ke dashboard</button></form></div></section>
  </main>;
}
