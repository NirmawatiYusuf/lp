"use client";

import { useEffect, useState } from "react";
import { incrementViewCount } from "@/actions/analytics-actions";

export function PostClient({ id, slug, title }: { id: string; slug: string; title: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const key = `viewed:${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    void incrementViewCount(id);
  }, [id, slug]);

  async function share() {
    if (navigator.share) await navigator.share({ title, url: location.href });
    else {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
    }
  }

  return <button className="secondary" type="button" onClick={share}>{copied ? "Tautan disalin" : "Bagikan"}</button>;
}
