import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./config";

export function createPublicClient() {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) return null;
  return createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
