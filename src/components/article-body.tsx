import type { ElementType, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { toString } from "hast-util-to-string";
import { extractHeadings } from "./article-headings";
import styles from "./article-body.module.css";

function Heading({ depth, id, children, node, ...props }: { depth: 1 | 2 | 3 | 4 | 5 | 6; id?: string; children?: ReactNode; node?: unknown; [key: string]: unknown }) {
  const Tag = `h${depth}` as ElementType;
  const label = node ? toString(node as Parameters<typeof toString>[0]) : undefined;
  return <Tag id={id} aria-label={label} {...props}>{children}{id && <> <a className={styles.headingAnchor} href={`#${id}`} aria-label={`Tautan bagian ${id}`}>#</a></>}</Tag>;
}

export function ArticleBody({ markdown, showToc = true }: { markdown: string; showToc?: boolean }) {
  const headings = showToc ? extractHeadings(markdown) : [];
  return <>
    {headings.length > 0 && <details className={styles.toc} open>
      <summary>Daftar isi</summary>
      <nav aria-label="Daftar isi artikel">
        <ol>{headings.map((heading, index) => <li key={`${heading.id}-${index}`}><a href={`#${heading.id}`}>{heading.text}</a></li>)}</ol>
      </nav>
    </details>}
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[[rehypeSlug, { prefix: "section-" }]]} components={{
        h1: (props) => <Heading depth={1} {...props} />,
        h2: (props) => <Heading depth={2} {...props} />,
        h3: (props) => <Heading depth={3} {...props} />,
        h4: (props) => <Heading depth={4} {...props} />,
        h5: (props) => <Heading depth={5} {...props} />,
        h6: (props) => <Heading depth={6} {...props} />,
      }}>{markdown}</ReactMarkdown>
    </div>
    <a className={styles.topLink} href="#article-top">↑ Kembali ke atas</a>
  </>;
}
