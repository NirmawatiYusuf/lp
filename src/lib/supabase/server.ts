import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseConfig } from "./config";

export async function createServerSupabaseClient() {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) return null;
  const store = await cookies();
  return createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(values) {
        try {
          values.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Cookie refresh is also handled by proxy.ts.
        }
      },
    },
  });
}
