import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./config";

export function createAdminClient() {
  if (!supabaseConfig.url || !supabaseConfig.serviceRoleKey) {
    throw new Error("Konfigurasi Supabase admin belum lengkap.");
  }
  return createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
