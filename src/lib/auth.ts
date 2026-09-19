import "server-only";
import { redirect } from "next/navigation";
import { isAdminConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AdminAccess = "authorized" | "unauthenticated" | "unauthorized" | "config-missing";

export async function getAdminAccess(): Promise<AdminAccess> {
  if (!isAdminConfigured()) return "config-missing";
  const client = await createServerSupabaseClient();
  const { data } = await client!.auth.getUser();
  if (!data.user) return "unauthenticated";
  if (data.user.email?.toLowerCase() !== process.env.ADMIN_EMAIL?.toLowerCase()) return "unauthorized";
  return "authorized";
}

export async function requireAdmin() {
  const access = await getAdminAccess();
  if (access === "authorized") return;
  if (access === "config-missing") redirect("/admin/login?error=config");
  if (access === "unauthorized") redirect("/admin/login?error=unauthorized");
  redirect("/admin/login");
}
