"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { createUploadUrl, discardUpload, registerUpload, type UploadKind } from "@/actions/upload-actions";

export function UploadManager({ kind, parentId, label }: { kind: UploadKind; parentId: string; label: string }) {
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [status, setStatus] = useState("");
  const accept = kind === "post-pdf" ? "application/pdf" : "image/jpeg,image/png,image/webp";

  async function upload() {
    const file = input.current?.files?.[0];
    if (!file) return;
    setStatus("Mengunggah…");
    let path: string | undefined;
    try {
      const signed = await createUploadUrl(kind, parentId, file.name, file.type, file.size);
      path = signed.path;
      const { error } = await createBrowserSupabaseClient().storage.from("note-files").uploadToSignedUrl(signed.path, signed.token, file);
      if (error) throw error;
      await registerUpload(kind, parentId, signed.path, file.name);
      setStatus("Berhasil diunggah.");
      if (input.current) input.current.value = "";
      router.refresh();
    } catch (error) {
      if (path) await discardUpload(path);
      setStatus(error instanceof Error ? error.message : "Upload gagal.");
    }
  }

  return <div><label>{label}<input ref={input} type="file" accept={accept} /></label><button type="button" className="secondary" onClick={upload}>Unggah</button>{status && <p className="meta" role="status">{status}</p>}</div>;
}
