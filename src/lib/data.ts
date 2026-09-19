import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";
import type { Post, Project, SiteSettings } from "@/types/content";

export async function getPublishedProjects(limit?: number): Promise<Project[]> {
  try {
    const client = createPublicClient();
    if (!client) return [];
    let query = client
      .from("projects")
      .select("*, project_images(*)")
      .eq("published", true)
      .order("sort_order")
      .order("created_at", { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Project[];
  } catch (error) {
    console.error("public_projects_query_failed", error);
    return [];
  }
}

export async function getPublishedProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const client = createPublicClient();
    if (!client) return null;
    const { data, error } = await client
      .from("projects")
      .select("*, project_images(*)")
      .eq("slug", slug)
      .eq("published", true)
      .order("sort_order", { referencedTable: "project_images" })
      .maybeSingle();
    if (error) throw error;
    return data as Project | null;
  } catch (error) {
    console.error("public_project_query_failed", error);
    return null;
  }
}

type PostFilters = { topic?: string; course?: string; projectId?: string; limit?: number; ascending?: boolean };

export async function getPublishedPosts(filters: PostFilters = {}): Promise<Post[]> {
  try {
    const client = createPublicClient();
    if (!client) return [];
    let query = client
      .from("posts")
      .select("*, projects(id, slug, title, published)")
      .eq("published", true)
      .order("sort_at", { ascending: filters.ascending ?? false });
    if (filters.topic) query = query.contains("topics", [filters.topic]);
    if (filters.course) query = query.eq("course_slug", filters.course);
    if (filters.projectId) query = query.eq("project_id", filters.projectId);
    if (filters.limit) query = query.limit(filters.limit);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Post[];
  } catch (error) {
    console.error("public_posts_query_failed", error);
    return [];
  }
}

export async function getCoursePosts(course: string): Promise<Post[]> {
  const posts = await getPublishedPosts({ course });
  return posts.sort((a, b) => (a.week_number ?? 0) - (b.week_number ?? 0));
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  try {
    const client = createPublicClient();
    if (!client) return null;
    const { data, error } = await client
      .from("posts")
      .select("*, post_files(*), projects(id, slug, title, published)")
      .eq("slug", slug)
      .eq("published", true)
      .order("sort_order", { referencedTable: "post_files" })
      .maybeSingle();
    if (error) throw error;
    return data as Post | null;
  } catch (error) {
    console.error("public_post_query_failed", error);
    return null;
  }
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const client = createPublicClient();
    if (!client) return null;
    const { data, error } = await client.from("site_settings").select("id, public_email, github_url, linkedin_url, about_bio, education, focus_interests, profile_photo_url, cv_url, updated_at").eq("id", 1).maybeSingle();
    if (error) throw error;
    return data as SiteSettings | null;
  } catch (error) {
    console.error("site_settings_query_failed", error);
    return null;
  }
}

export async function getAdminContent() {
  const client = createAdminClient();
  const [posts, projects, settings] = await Promise.all([
    client.from("posts").select("*").order("created_at", { ascending: false }),
    client.from("projects").select("*").order("sort_order"),
    client.from("site_settings").select("*").eq("id", 1).single(),
  ]);
  return {
    posts: (posts.data ?? []) as Post[],
    projects: (projects.data ?? []) as Project[],
    settings: settings.data as SiteSettings | null,
  };
}

export async function getAdminPost(id: string) {
  const client = createAdminClient();
  const { data } = await client.from("posts").select("*, post_files(*)").eq("id", id).maybeSingle();
  return data as Post | null;
}

export async function getAdminProject(id: string) {
  const client = createAdminClient();
  const { data } = await client.from("projects").select("*, project_images(*)").eq("id", id).maybeSingle();
  return data as Project | null;
}
