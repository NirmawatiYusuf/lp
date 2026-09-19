"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminConfigured } from "@/lib/supabase/config";

export async function incrementViewCount(postId: string) {
  if (!isAdminConfigured() || !/^[0-9a-f-]{36}$/i.test(postId)) return;
  try {
    await createAdminClient().rpc("increment_post_views", { post_id: postId });
  } catch {
    // View counts are best-effort and must never affect the page.
  }
}
