import type { MetadataRoute } from "next";
import { getPublishedPosts, getPublishedProjects } from "@/lib/data";
import { courses, siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getPublishedProjects(), getPublishedPosts()]);
  const courseSlugs = new Set(posts.map((post) => post.course_slug).filter(Boolean));
  return [
    "", "/projects", "/writing", "/about",
    ...projects.map((project) => `/projects/${project.slug}`),
    ...posts.map((post) => `/writing/${post.slug}`),
    ...courses.filter((course) => courseSlugs.has(course.slug)).map((course) => `/writing/kuliah/${course.slug}`),
  ].map((path) => ({ url: `${siteConfig.url}${path}`, lastModified: new Date() }));
}
