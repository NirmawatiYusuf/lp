"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const client = await createServerSupabaseClient();
  if (!client) redirect("/admin/login?error=config");
  if (!process.env.ADMIN_EMAIL || email !== process.env.ADMIN_EMAIL.toLowerCase()) {
    await client.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) redirect("/admin/login?error=credentials");
  redirect("/admin/dashboard");
}

export async function logoutAction() {
  const client = await createServerSupabaseClient();
  await client?.auth.signOut();
  redirect("/admin/login?success=logout");
}
