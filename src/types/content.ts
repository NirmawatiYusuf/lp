export type Course = {
  slug: string;
  title: string;
  description?: string;
  semester?: number;
  year?: string;
};

export type PostFile = {
  id: string;
  post_id: string;
  file_name: string;
  file_path: string;
  file_url: string;
  file_type: "image" | "pdf";
  sort_order: number;
  created_at: string;
};

export type ProjectImage = {
  id: string;
  project_id: string;
  file_path: string;
  file_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  problem: string | null;
  approach: string | null;
  outcome: string | null;
  role: string | null;
  period: string | null;
  tech_stack: string[];
  repo_url: string | null;
  demo_url: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  project_images?: ProjectImage[];
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string | null;
  topics: string[];
  course_slug: string | null;
  week_number: number | null;
  project_id: string | null;
  published: boolean;
  published_at: string | null;
  sort_at: string;
  cover_image_url: string | null;
  views: number;
  created_at: string;
  updated_at: string;
  post_files?: PostFile[];
  projects?: Pick<Project, "id" | "slug" | "title" | "published"> | null;
};

export type SiteSettings = {
  id: 1;
  public_email: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  about_bio: string | null;
  education: string | null;
  focus_interests: string | null;
  profile_photo_url: string | null;
  cv_url: string | null;
  updated_at: string;
};
