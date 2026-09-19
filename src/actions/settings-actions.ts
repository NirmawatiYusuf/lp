"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteSettingsSchema } from "@/lib/validations";

export async function updateSettingsAction(formData: FormData) {
  await requireAdmin();
  const value = (name: string) => String(formData.get(name) ?? "");
  const parsed = siteSettingsSchema.safeParse({
    publicEmail: value("publicEmail"),
    githubUrl: value("githubUrl"),
    linkedinUrl: value("linkedinUrl"),
    aboutBio: value("aboutBio"),
    education: value("education"),
    focusInterests: value("focusInterests"),
    profilePhotoUrl: value("profilePhotoUrl"),
    cvUrl: value("cvUrl"),
  });
  if (!parsed.success) redirect(`/admin/settings?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  const { error } = await createAdminClient().from("site_settings").update({
    public_email: parsed.data.publicEmail,
    github_url: parsed.data.githubUrl,
    linkedin_url: parsed.data.linkedinUrl,
    about_bio: parsed.data.aboutBio,
    education: parsed.data.education,
    focus_interests: parsed.data.focusInterests,
    profile_photo_url: parsed.data.profilePhotoUrl,
    cv_url: parsed.data.cvUrl,
  }).eq("id", 1);
  if (error) redirect(`/admin/settings?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/sitemap.xml");
  redirect("/admin/settings?success=disimpan");
}
