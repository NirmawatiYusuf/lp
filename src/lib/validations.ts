import { z } from "zod";
import { courses } from "@/lib/site";

const optionalText = (max = 5000) => z.string().trim().max(max).transform((v) => v || null);
const optionalHttpsUrl = z
  .string()
  .trim()
  .transform((v) => v || null)
  .pipe(z.url().startsWith("https://").nullable());

const optionalHttpsUrlWithMax = (max: number) => z
  .string()
  .trim()
  .max(max)
  .transform((v) => v || null)
  .pipe(z.url().startsWith("https://").nullable());

export const postInputSchema = z
  .object({
    title: z.string().trim().min(5),
    summary: z.string().trim().min(20),
    body: z.string().max(20000).transform((v) => v || null),
    topics: z.string(),
    courseSlug: z.string().transform((v) => v || null),
    weekNumber: z.string().transform((v) => (v ? Number(v) : null)),
    projectId: z.string().transform((v) => v || null).pipe(z.uuid().nullable()),
    published: z.boolean(),
    publishedAt: z.string().refine((v) => !v || !Number.isNaN(Date.parse(v)), "Tanggal publikasi tidak valid.").transform((v) => (v ? new Date(v).toISOString() : null)),
  })
  .superRefine((value, context) => {
    if (Boolean(value.courseSlug) !== Boolean(value.weekNumber)) {
      context.addIssue({ code: "custom", path: ["courseSlug"], message: "Matkul dan minggu harus diisi bersama." });
    }
    if (value.courseSlug && !courses.some((course) => course.slug === value.courseSlug)) {
      context.addIssue({ code: "custom", path: ["courseSlug"], message: "Matkul tidak dikenal." });
    }
    if (value.weekNumber && (!Number.isInteger(value.weekNumber) || value.weekNumber < 1 || value.weekNumber > 16)) {
      context.addIssue({ code: "custom", path: ["weekNumber"], message: "Minggu harus antara 1 dan 16." });
    }
  });

export const projectInputSchema = z.object({
  title: z.string().trim().min(2),
  slug: z.string().trim(),
  summary: z.string().trim().min(20),
  problem: optionalText(),
  approach: optionalText(),
  outcome: optionalText(),
  role: optionalText(),
  period: optionalText(),
  techStack: z.string().trim().min(1),
  repoUrl: optionalHttpsUrl,
  demoUrl: optionalHttpsUrl,
  published: z.boolean(),
  sortOrder: z.coerce.number().int(),
});

export const siteSettingsSchema = z.object({
  publicEmail: z.string().trim().transform((v) => v || null).pipe(z.email().nullable()),
  githubUrl: optionalHttpsUrl.refine((url) => !url || new URL(url).hostname === "github.com", "Harus URL github.com."),
  linkedinUrl: optionalHttpsUrl.refine((url) => {
    if (!url) return true;
    const hostname = new URL(url).hostname;
    return hostname === "linkedin.com" || hostname.endsWith(".linkedin.com");
  }, "Harus URL LinkedIn."),
  aboutBio: optionalText(4000),
  education: optionalText(2000),
  focusInterests: optionalText(1200),
  profilePhotoUrl: optionalHttpsUrlWithMax(2048),
  cvUrl: optionalHttpsUrlWithMax(2048),
});
