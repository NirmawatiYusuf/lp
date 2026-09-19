export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

export function hasPublicSupabaseConfig() {
  return Boolean(supabaseConfig.url && supabaseConfig.anonKey);
}

export function isAdminConfigured() {
  return Boolean(
    supabaseConfig.url &&
      supabaseConfig.anonKey &&
      supabaseConfig.serviceRoleKey &&
      process.env.ADMIN_EMAIL,
  );
}
