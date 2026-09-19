import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ImageConfigContext } from "next/dist/shared/lib/image-config-context.shared-runtime";
import { imageConfigDefault } from "next/dist/shared/lib/image-config";
import nextConfig from "../next.config";
import { FocusAreas } from "../src/components/focus-areas";
import { ProjectRows } from "../src/components/content-rows";
import type { Project } from "../src/types/content";

const project: Project = {
  id: "1", title: "Sistem dokumentasi", slug: "sistem-dokumentasi", summary: "Dokumentasi pengembangan yang dapat ditelusuri.",
  problem: null, approach: null, outcome: null, role: null, period: null, tech_stack: ["TypeScript"],
  repo_url: null, demo_url: null, published: true, sort_order: 0, created_at: "2026-01-01", updated_at: "2026-01-01",
};

test("mobile focus areas use native, initially collapsed exclusive disclosures", () => {
  const html = renderToStaticMarkup(<FocusAreas />);
  assert.equal((html.match(/<details name="focus-area"/g) ?? []).length, 3);
  assert.equal((html.match(/<summary>/g) ?? []).length, 3);
  assert.doesNotMatch(html, /<details[^>]+open/);
});

test("visual project cards remain valid without media and do not invent screenshots", () => {
  const html = renderToStaticMarkup(<ProjectRows projects={[project]} visual />);
  assert.match(html, /href="\/projects\/sistem-dokumentasi"/);
  assert.match(html, /project-cover-fallback/);
  assert.doesNotMatch(html, /<img/);
  assert.match(html, /tabindex="0"/i);
});

test("empty project data never renders a fabricated project card", () => {
  const html = renderToStaticMarkup(<ProjectRows projects={[]} visual />);
  assert.doesNotMatch(html, /project-visual-card|href=/);
});

test("the lowest ordered uploaded screenshot becomes the project cover", () => {
  const images = [2, 0, 1].map((order) => ({
    id: String(order), project_id: project.id, file_path: `${order}.webp`,
    file_url: `https://example.supabase.co/storage/v1/object/public/note-files/${order}.webp`,
    caption: `Screenshot ${order}`, sort_order: order, created_at: "2026-01-01",
  }));
  const html = renderToStaticMarkup(<ImageConfigContext.Provider value={{ ...imageConfigDefault, ...nextConfig.images }}><ProjectRows projects={[{ ...project, project_images: images }]} visual /></ImageConfigContext.Provider>);
  assert.match(html, /alt="Screenshot 0"/);
  assert.doesNotMatch(html, /alt="Screenshot [12]"/);
  assert.deepEqual(images.map((image) => image.sort_order), [2, 0, 1]);
});
