import { toString } from "hast-util-to-string";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export type TocItem = { depth: number; text: string; id: string };

type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

function createProcessor() {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug, { prefix: "section-" });
}

function visitHeadings(node: HastNode, headings: TocItem[]) {
  if (node.type === "element" && /^h[1-6]$/.test(node.tagName ?? "")) {
    const id = node.properties?.id;
    if (typeof id === "string") {
      headings.push({
        depth: Number(node.tagName?.slice(1)),
        text: toString(node as Parameters<typeof toString>[0]),
        id,
      });
    }
  }

  node.children?.forEach((child) => visitHeadings(child, headings));
}

export function extractHeadings(markdown: string): TocItem[] {
  const processor = createProcessor();
  const tree = processor.runSync(processor.parse(markdown)) as HastNode;
  const headings: TocItem[] = [];
  visitHeadings(tree, headings);
  return headings;
}
