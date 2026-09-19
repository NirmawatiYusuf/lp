"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { unstable_rethrow } from "next/navigation";
import { ArticleBody } from "@/components/article-body";
import { emptyDraftSnapshot, normalizeDraftSnapshot, snapshotsEqual, type DraftSnapshot, type EditorDraft, type DraftSaveResult } from "@/lib/draft-types";
import { courses } from "@/lib/site";
import type { Post, Project } from "@/types/content";
import styles from "./post-form.module.css";

export type PostEditorProps = {
  post?: Post;
  projects: Project[];
  action: (data: FormData) => void | Promise<void>;
  initialDraft?: EditorDraft | null;
  saveDraft: (input: { draftId?: string | null; postId?: string | null; basePostUpdatedAt?: string | null; expectedDraftUpdatedAt?: string | null; snapshot: Partial<DraftSnapshot> }) => Promise<DraftSaveResult>;
  loadDraft: (id: string) => Promise<EditorDraft | null>;
  discardDraft: (id: string) => Promise<void>;
  media?: ReactNode;
  debounceMs?: number;
};

function postSnapshot(post?: Post): DraftSnapshot {
  return post ? normalizeDraftSnapshot({ title: post.title, summary: post.summary, body: post.body ?? "", topics: post.topics.join(", "), courseSlug: post.course_slug ?? "", weekNumber: post.week_number?.toString() ?? "", projectId: post.project_id ?? "", published: post.published, publishedAt: post.published_at?.slice(0, 16) ?? "" }) : { ...emptyDraftSnapshot };
}

function storage(operation: "read" | "write" | "remove", id?: string) {
  try {
    if (operation === "read") return localStorage.getItem("admin-post-draft:new");
    if (operation === "write" && id) localStorage.setItem("admin-post-draft:new", id);
    if (operation === "remove") localStorage.removeItem("admin-post-draft:new");
  } catch { /* Autosave remains available when browser storage is blocked. */ }
  return null;
}

export function PostEditor({ post, projects, action, initialDraft, saveDraft, loadDraft, discardDraft, media, debounceMs = 800 }: PostEditorProps) {
  const starting = initialDraft && !initialDraft.stale ? initialDraft.snapshot : postSnapshot(post);
  const [snapshot, setSnapshot] = useState(starting);
  const [status, setStatus] = useState(initialDraft?.stale ? "stale" : initialDraft ? "saved" : "idle");
  const [message, setMessage] = useState(initialDraft?.stale ? "Draft tersimpan lebih lama dari versi tulisan saat ini." : initialDraft ? "Draft dipulihkan dari penyimpanan privat." : "Autosave aktif setelah mulai menulis.");
  const [recovery, setRecovery] = useState<EditorDraft | null>(initialDraft?.stale ? initialDraft : null);
  const [submitting, setSubmitting] = useState(false);
  const [hasDraft, setHasDraft] = useState(Boolean(initialDraft));
  const [previewOpen, setPreviewOpen] = useState(true);
  const current = useRef(snapshot);
  const saved = useRef(starting);
  const draftId = useRef(initialDraft?.id ?? "");
  const draftVersion = useRef(initialDraft?.updatedAt ?? null);
  const baseVersion = useRef(post?.updated_at ?? null);
  const blocked = useRef(Boolean(initialDraft?.stale));
  const revision = useRef(0);
  const submitLock = useRef(false);
  const active = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queue = useRef<Promise<DraftSaveResult | null>>(Promise.resolve(null));

  useEffect(() => {
    active.current = true;
    const warn = (event: BeforeUnloadEvent) => {
      if (!snapshotsEqual(current.current, saved.current)) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("beforeunload", warn);
    return () => { active.current = false; if (timer.current) clearTimeout(timer.current); window.removeEventListener("beforeunload", warn); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (post || initialDraft) return;
    const id = storage("read");
    if (!id) return;
    const startedAt = revision.current;
    void loadDraft(id).then((draft) => {
      if (cancelled || !active.current) return;
      if (!draft) { storage("remove"); return; }
      if (draft.postId) return;
      if (revision.current !== startedAt) {
        blocked.current = true;
        if (timer.current) clearTimeout(timer.current);
        setRecovery(draft); setStatus("stale"); setMessage("Ada draft tersimpan. Pilih sebelum mengganti isi editor.");
        return;
      }
      draftId.current = draft.id; draftVersion.current = draft.updatedAt; current.current = draft.snapshot; saved.current = draft.snapshot; setHasDraft(true);
      setSnapshot(draft.snapshot); setStatus("saved"); setMessage("Draft dipulihkan dari penyimpanan privat.");
    }).catch(() => {
      if (!cancelled) { setStatus("error"); setMessage("Draft belum dapat dipulihkan. Muat ulang untuk mencoba lagi."); }
    });
    return () => { cancelled = true; };
  }, [initialDraft, loadDraft, post]);

  useEffect(() => {
    const next = post?.updated_at ?? null;
    if (next !== baseVersion.current) {
      baseVersion.current = next;
      if (timer.current) clearTimeout(timer.current);
      blocked.current = true;
      setStatus("stale");
      setMessage("Versi tulisan berubah, termasuk setelah upload. Isi editor tetap aman; konfirmasi sebelum melanjutkan.");
    }
  }, [post?.updated_at]);

  function enqueueSave() {
    const pending = queue.current.catch(() => null).then(async (): Promise<DraftSaveResult> => {
      if (blocked.current || !active.current) return { ok: false, code: "stale", message: "Konfirmasi versi draft terlebih dahulu." };
      const value = current.current;
      const savingRevision = revision.current;
      if (draftId.current && snapshotsEqual(value, saved.current)) return { ok: true, draftId: draftId.current, savedAt: "" };
      setStatus("saving"); setMessage("Menyimpan draft…");
      let result: DraftSaveResult;
      try {
        result = await saveDraft({ draftId: draftId.current || null, postId: post?.id ?? null, basePostUpdatedAt: baseVersion.current, expectedDraftUpdatedAt: draftVersion.current, snapshot: value });
      } catch { result = { ok: false, code: "unavailable", message: "Draft belum tersimpan. Coba lagi." }; }
      if (result.ok) {
        draftId.current = result.draftId; draftVersion.current = result.savedAt; saved.current = value;
        if (!post) storage("write", result.draftId);
        if (active.current && !blocked.current) {
          setHasDraft(true);
          const dirty = savingRevision !== revision.current;
          setStatus(dirty ? "dirty" : "saved");
          setMessage(dirty ? "Ada perubahan baru yang belum tersimpan…" : "Draft tersimpan secara privat.");
        }
      } else if (active.current) {
        if (result.conflictingDraft) setRecovery(result.conflictingDraft);
        if (result.currentPostUpdatedAt) baseVersion.current = result.currentPostUpdatedAt;
        blocked.current = result.code === "stale";
        setStatus(result.code === "stale" ? "stale" : "error"); setMessage(result.message);
      }
      return result;
    });
    queue.current = pending;
    return pending;
  }

  function change<K extends keyof DraftSnapshot>(key: K, value: DraftSnapshot[K]) {
    if (submitLock.current) return;
    const next = { ...current.current, [key]: value };
    current.current = next; revision.current += 1; setSnapshot(next);
    if (timer.current) clearTimeout(timer.current);
    if (blocked.current) return;
    setStatus("dirty"); setMessage("Perubahan belum tersimpan…");
    timer.current = setTimeout(() => { timer.current = null; void enqueueSave(); }, debounceMs);
  }

  async function resolveRecovery(restore: boolean) {
    if (submitLock.current) return;
    submitLock.current = true; setSubmitting(true);
    if (timer.current) clearTimeout(timer.current);
    await queue.current;
    try {
      const ids = new Set([recovery?.id, draftId.current].filter((id): id is string => Boolean(id)));
      for (const id of ids) await discardDraft(id);
      draftId.current = ""; draftVersion.current = null; setHasDraft(false);
      const value = restore && recovery ? recovery.snapshot : current.current;
      current.current = value; setSnapshot(value); revision.current += 1;
      blocked.current = false; setRecovery(null);
      await enqueueSave();
    } catch { setStatus("stale"); setMessage("Draft lama belum dapat diproses. Coba lagi; isi editor belum diubah."); }
    finally { submitLock.current = false; setSubmitting(false); }
  }

  async function startOver() {
    if (post || submitLock.current) return;
    submitLock.current = true; setSubmitting(true);
    if (timer.current) clearTimeout(timer.current);
    await queue.current;
    try {
      if (draftId.current) await discardDraft(draftId.current);
      storage("remove"); draftId.current = ""; draftVersion.current = null; blocked.current = false; setHasDraft(false);
      current.current = { ...emptyDraftSnapshot }; saved.current = current.current; revision.current += 1;
      setSnapshot(current.current); setRecovery(null); setStatus("idle"); setMessage("Draft dihapus. Editor baru siap digunakan.");
    } catch { setStatus("error"); setMessage("Draft belum dapat dihapus. Isi editor tetap dipertahankan."); }
    finally { submitLock.current = false; setSubmitting(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLock.current || blocked.current) return;
    const data = new FormData(event.currentTarget);
    submitLock.current = true; setSubmitting(true);
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    try {
      const result = await enqueueSave();
      if (!result.ok && result.code === "stale") return;
      data.set("_draftId", draftId.current);
      data.set("_basePostUpdatedAt", baseVersion.current ?? "");
      await action(data);
    } catch (error) {
      unstable_rethrow(error);
      setStatus("error"); setMessage("Tulisan belum berhasil disimpan. Isi editor tetap dipertahankan; coba simpan tulisan lagi.");
    } finally { submitLock.current = false; if (active.current) setSubmitting(false); }
  }

  return <div className={`${styles.editorShell} ${previewOpen ? "" : styles.editorSingle}`}>
    <form className="admin-form" onSubmit={submit}>
      <div className={styles.saveStatus} role="status" aria-live="polite"><span className={`${styles.statusDot} ${styles[`status${status}`]}`} aria-hidden="true" />{message}</div>
      <p className={styles.help}>Autosave menyimpan teks dan pengaturan sebagai draft privat, bukan perubahan pada artikel publik.</p>
      {!post && hasDraft && <button type="button" className="secondary" disabled={submitting} onClick={() => void startOver()}>Buang draft & mulai ulang</button>}
      {status === "error" && <button type="button" className="secondary" onClick={() => void enqueueSave()}>Coba simpan draft lagi</button>}
      {status === "stale" && <div className={styles.staleActions}>{recovery && <button type="button" disabled={submitting} onClick={() => void resolveRecovery(true)}>Pulihkan draft tersimpan</button>}<button type="button" disabled={submitting} onClick={() => void resolveRecovery(false)}>Gunakan isi editor saat ini</button></div>}
      <fieldset disabled={submitting} className={styles.fields}>
        <label>Judul<input name="title" required minLength={5} maxLength={500} value={snapshot.title} onChange={(e) => change("title", e.target.value)} /></label>
        <label>Ringkasan<textarea name="summary" required minLength={20} maxLength={5000} value={snapshot.summary} onChange={(e) => change("summary", e.target.value)} /></label>
        <label>Isi Markdown<textarea name="body" maxLength={20000} value={snapshot.body} onChange={(e) => change("body", e.target.value)} /></label>
        <label>Topik, dipisah koma<input name="topics" maxLength={2000} value={snapshot.topics} onChange={(e) => change("topics", e.target.value)} /></label>
        {courses.length > 0 && <><label>Matkul<select name="courseSlug" value={snapshot.courseSlug} onChange={(e) => change("courseSlug", e.target.value)}><option value="">Tanpa matkul</option>{courses.map((course) => <option value={course.slug} key={course.slug}>{course.title}</option>)}</select></label><label>Minggu<input type="number" min={1} max={16} name="weekNumber" value={snapshot.weekNumber} onChange={(e) => change("weekNumber", e.target.value)} /></label></>}
        <label>Proyek<select name="projectId" value={snapshot.projectId} onChange={(e) => change("projectId", e.target.value)}><option value="">Tanpa proyek</option>{projects.map((project) => <option value={project.id} key={project.id}>{project.title}</option>)}</select></label>
        <label>Tanggal publikasi<input type="datetime-local" name="publishedAt" value={snapshot.publishedAt} onChange={(e) => change("publishedAt", e.target.value)} /></label>
        <label><input type="checkbox" name="published" checked={snapshot.published} onChange={(e) => change("published", e.target.checked)} /> Terbitkan saat menyimpan tulisan</label>
        {media}
      </fieldset>
      <div className={styles.formFooter}><button type="submit" disabled={submitting || status === "stale"}>{submitting ? "Menyimpan tulisan…" : "Simpan tulisan"}</button><button className="secondary" type="button" aria-expanded={previewOpen} aria-controls="editor-preview" onClick={() => setPreviewOpen(!previewOpen)}>{previewOpen ? "Tutup preview" : "Lihat preview"}</button></div>
    </form>
    <aside id="editor-preview" className={`${styles.preview} ${previewOpen ? styles.previewOpen : ""}`} aria-label="Pratinjau tulisan">
      <div className={styles.previewHeader}><span>Preview perubahan</span><span>Draft privat</span></div>
      <article id="article-top" className="measure"><header><h1>{snapshot.title || "Judul tulisan"}</h1><p className="meta">Pratinjau privat · belum diterapkan</p><p className={styles.previewSummary}>{snapshot.summary || "Ringkasan tulisan akan tampil di sini."}</p></header><ArticleBody markdown={snapshot.body || snapshot.summary} /></article>
    </aside>
  </div>;
}
