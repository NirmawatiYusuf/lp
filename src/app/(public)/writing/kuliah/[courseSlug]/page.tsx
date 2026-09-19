import { notFound } from "next/navigation";
import { PostRows } from "@/components/content-rows";
import { getCoursePosts } from "@/lib/data";
import { courses } from "@/lib/site";

export default async function CoursePage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const course = courses.find((item) => item.slug === courseSlug);
  if (!course) notFound();
  const posts = await getCoursePosts(courseSlug);
  return <div className="measure"><h1>{course.title}</h1>{course.description && <p>{course.description}</p>}<p className="meta">{course.semester && `Semester ${course.semester}`}{course.semester && course.year && ", "}{course.year}</p><PostRows posts={posts} /></div>;
}
