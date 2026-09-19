import type { Course } from "@/types/content";

const productionUrl = "https://raihandaris.web.id";
const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (process.env.VERCEL_ENV === "production" && configuredUrl !== productionUrl) {
  throw new Error(`NEXT_PUBLIC_SITE_URL production wajib ${productionUrl}.`);
}

export const siteConfig = {
  name: "Raihan Daris Ramadhan",
  description:
    "Portfolio dan blog pribadi Raihan Daris Ramadhan, mahasiswa Teknik Informatika di ITPLN.",
  url: configuredUrl ?? productionUrl,
};

export const positioning = {
  siapaAku:
    "Mahasiswa Teknik Informatika di ITPLN yang berfokus pada pengembangan web, data, dan sistem. Portfolio ini mendokumentasikan karya, keputusan teknis, serta proses belajar di baliknya.",
  sedangMengerjakan:
    "Mengembangkan platform portfolio dan publikasi mandiri dengan Next.js serta Supabase—mulai dari identitas visual, arsitektur data, sampai CMS dan alur deployment production.",
  akuMauOrangNgapain: "proyek" as const,
};

export const courses: Course[] = [];
