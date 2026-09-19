import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ArticleBody } from "../src/components/article-body";
import { extractHeadings } from "../src/components/article-headings";

test("extractHeadings keeps formatted, duplicate, and non-Latin headings out of fenced code", () => {
  const headings = extractHeadings(`# **Mulai**

\`\`\`
## Jangan tampil
\`\`\`

## **Mulai**
## 日本語の見出し`);

  assert.deepEqual(headings, [
    { depth: 1, text: "Mulai", id: "section-mulai" },
    { depth: 2, text: "Mulai", id: "section-mulai-1" },
    { depth: 2, text: "日本語の見出し", id: "section-日本語の見出し" },
  ]);
});

test("extractHeadings preserves literal underscores and rehype-slug spacing", () => {
  const headings = extractHeadings("## foo_bar\n## C++ / тест");

  assert.deepEqual(headings.map(({ id }) => id), ["section-foo_bar", "section-c--тест"]);
});

test("ArticleBody renders a TOC whose links match rendered heading anchors", () => {
  const markdown = [
    "# **Mulai**",
    "",
    "```md",
    "## Jangan tampil",
    "```",
    "",
    "## **Mulai**",
    "## 日本語の見出し",
  ].join("\n");
  const html = renderToStaticMarkup(createElement(ArticleBody, { markdown }));

  const tocIds = [...html.matchAll(/<li><a href="#([^"]+)"/g)].map((match) => match[1]);
  const headingIds = [...html.matchAll(/<h[1-6] id="([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(tocIds, ["section-mulai", "section-mulai-1", "section-日本語の見出し"]);
  assert.deepEqual(headingIds, tocIds);
  assert.equal((html.match(/<li>/g) ?? []).length, 3);
  assert.match(html, /href="#section-mulai">Mulai<\/a>/);
  assert.match(html, /href="#section-mulai-1">Mulai<\/a>/);
  assert.match(html, /href="#section-日本語の見出し">日本語の見出し<\/a>/);
  assert.doesNotMatch(html, /jangan-tampil/);
});

test("the AST heading list follows rendered Markdown for blockquotes, setext headings, and GFM", () => {
  const markdown = [
    "> # Kutipan **tebal**",
    "",
    "Setext _heading_",
    "----------------",
    "",
    "| GFM | heading |",
    "| --- | --- |",
    "| ## | not a heading |",
  ].join("\n");
  const html = renderToStaticMarkup(createElement(ArticleBody, { markdown }));
  const tocIds = [...html.matchAll(/<li><a href="#([^"]+)"/g)].map((match) => match[1]);
  const headingIds = [...html.matchAll(/<h[1-6] id="([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(tocIds, ["section-kutipan-tebal", "section-setext-heading"]);
  assert.deepEqual(headingIds, tocIds);
});

test("raw HTML stays escaped and TOC targets still match rendered headings", () => {
  const markdown = "## <em>Important</em>\n\n## Fish &amp; chips\n\n## Foo\n## Foo\n## Foo-1";
  const html = renderToStaticMarkup(createElement(ArticleBody, { markdown }));
  const tocIds = [...html.matchAll(/<li><a href=\"#([^\"]+)\"/g)].map((match) => match[1]);
  const headingIds = [...html.matchAll(/<h[1-6] id=\"([^\"]+)\"/g)].map((match) => match[1]);
  assert.deepEqual(tocIds, headingIds);
  assert.equal(new Set(headingIds).size, headingIds.length);
  assert.match(html, /&lt;em&gt;Important&lt;\/em&gt;/);
});

test("heading permalinks do not wrap Markdown links in nested anchors", () => {
  const html = renderToStaticMarkup(createElement(ArticleBody, { markdown: "## Read [the docs](https://example.com)" }));
  const heading = html.match(/<h2[^>]*>(.*?)<\/h2>/)?.[1] ?? "";
  assert.match(heading, /href="https:\/\/example.com"/);
  assert.doesNotMatch(heading, /<a[^>]*>[^]*?<a[^>]*>[^]*?<\/a>[^]*?<\/a>/);
});

test("article headings cannot shadow the page's top anchors", () => {
  assert.deepEqual(extractHeadings("## Top\n## Article-top").map(({ id }) => id), ["section-top", "section-article-top"]);
});
