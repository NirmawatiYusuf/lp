import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import type { DraftSaveResult, DraftSnapshot, EditorDraft } from "../src/lib/draft-types";
import type { Post } from "../src/types/content";
import type { PostEditorProps } from "../src/components/admin/post-editor";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/" });
for (const [name, value] of Object.entries({
  window: dom.window,
  document: dom.window.document,
  navigator: dom.window.navigator,
  HTMLElement: dom.window.HTMLElement,
  Event: dom.window.Event,
  CustomEvent: dom.window.CustomEvent,
  FormData: dom.window.FormData,
  localStorage: dom.window.localStorage,
  getComputedStyle: dom.window.getComputedStyle,
})) {
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
}
Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", { value: true, writable: true });

let cleanup: typeof import("@testing-library/react").cleanup;
let fireEvent: typeof import("@testing-library/react").fireEvent;
let render: typeof import("@testing-library/react").render;
let screen: typeof import("@testing-library/react").screen;
let waitFor: typeof import("@testing-library/react").waitFor;
let PostEditor: typeof import("../src/components/admin/post-editor").PostEditor;
const testOptions = { timeout: 15_000 };

test.before(async () => {
  ({ cleanup, fireEvent, render, screen, waitFor } = await import("@testing-library/react"));
  ({ PostEditor } = await import("../src/components/admin/post-editor"));
});

const emptySnapshot: DraftSnapshot = {
  title: "",
  summary: "",
  body: "",
  topics: "",
  courseSlug: "",
  weekNumber: "",
  projectId: "",
  published: false,
  publishedAt: "",
};

function snapshot(overrides: Partial<DraftSnapshot> = {}): DraftSnapshot {
  return { ...emptySnapshot, ...overrides };
}

function draft(overrides: Partial<EditorDraft> = {}): EditorDraft {
  return {
    id: "draft-1",
    postId: null,
    snapshot: snapshot({ title: "Draft tersimpan", summary: "Ringkasan draft yang cukup panjang." }),
    basePostUpdatedAt: null,
    updatedAt: "2026-02-01T00:00:00.000Z",
    stale: false,
    ...overrides,
  };
}

function post(updatedAt = "2026-02-01T00:00:00.000Z"): Post {
  return {
    id: "post-1",
    title: "Tulisan awal",
    slug: "tulisan-awal",
    summary: "Ringkasan tulisan awal yang cukup panjang.",
    body: "Isi awal",
    topics: ["catatan"],
    course_slug: null,
    week_number: null,
    project_id: null,
    published: false,
    published_at: null,
    sort_at: updatedAt,
    cover_image_url: null,
    views: 0,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: updatedAt,
  };
}

function success(draftId = "draft-1"): DraftSaveResult {
  return { ok: true, draftId, savedAt: "2026-02-01T00:00:00.000Z" };
}

function renderEditor(overrides: Partial<PostEditorProps> = {}) {
  const props: PostEditorProps = {
    projects: [],
    action: async () => {},
    saveDraft: async ({ draftId }) => success(draftId ?? "draft-1"),
    loadDraft: async () => null,
    discardDraft: async () => {},
    debounceMs: 20,
    ...overrides,
  };
  return render(<PostEditor {...props} />);
}

function changeField(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

async function waitForSaveCount(calls: unknown[], count: number) {
  await waitFor(() => assert.equal(calls.length, count));
}

test.afterEach(() => {
  cleanup();
  dom.window.localStorage.clear();
});

test("debounces partial drafts without invoking the publish action", testOptions, async () => {
  const saves: Array<{ snapshot: Partial<DraftSnapshot> }> = [];
  let actionCalls = 0;
  renderEditor({
    saveDraft: async (input) => {
      saves.push(input);
      return success();
    },
    action: async () => { actionCalls += 1; },
  });

  changeField("Judul", "Judul parsial");
  await waitForSaveCount(saves, 1);

  assert.equal(saves[0]?.snapshot.title, "Judul parsial");
  assert.equal(actionCalls, 0);
  assert.match(screen.getByRole("status").textContent ?? "", /Draft tersimpan/);
});

test("queues sequential saves and reports dirty until the latest revision is saved", testOptions, async () => {
  const saves: Array<Parameters<PostEditorProps["saveDraft"]>[0]> = [];
  let resolveFirst!: (result: DraftSaveResult) => void;
  let resolveSecond!: (result: DraftSaveResult) => void;
  const first = new Promise<DraftSaveResult>((resolve) => { resolveFirst = resolve; });
  const second = new Promise<DraftSaveResult>((resolve) => { resolveSecond = resolve; });

  renderEditor({
    saveDraft: async (input) => {
      saves.push(input);
      return saves.length === 1 ? first : second;
    },
  });

  changeField("Judul", "Judul pertama");
  await waitForSaveCount(saves, 1);
  changeField("Ringkasan", "Ringkasan baru yang cukup panjang untuk disimpan.");
  await new Promise((resolve) => setTimeout(resolve, 30));

  assert.equal(saves.length, 1);
  resolveFirst(success("draft-1"));
  await waitForSaveCount(saves, 2);
  assert.equal(saves[0]?.snapshot.summary, "");
  assert.equal(saves[1]?.snapshot.title, "Judul pertama");
  assert.equal(saves[1]?.snapshot.summary, "Ringkasan baru yang cukup panjang untuk disimpan.");
  assert.equal(saves[0]?.expectedDraftUpdatedAt, null);
  assert.equal(saves[1]?.expectedDraftUpdatedAt, "2026-02-01T00:00:00.000Z");
  assert.match(screen.getByRole("status").textContent ?? "", /Menyimpan draft/);
  const beforeUnload = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(beforeUnload);
  assert.equal(beforeUnload.defaultPrevented, true);

  resolveSecond(success("draft-1"));
  await waitFor(() => assert.match(screen.getByRole("status").textContent ?? "", /Draft tersimpan/));
});

test("restores an initial draft into fields and the private preview", testOptions, () => {
  renderEditor({
    initialDraft: draft({ snapshot: snapshot({ title: "Judul dipulihkan", summary: "Ringkasan dipulihkan cukup panjang.", body: "# Isi dipulihkan" }) }),
  });

  assert.equal((screen.getByLabelText("Judul") as HTMLInputElement).value, "Judul dipulihkan");
  assert.equal((screen.getByLabelText("Isi Markdown") as HTMLTextAreaElement).value, "# Isi dipulihkan");
  assert.ok(screen.getByRole("heading", { name: "Judul dipulihkan" }));
  assert.ok(screen.getByRole("heading", { name: "Isi dipulihkan" }));
  const previewToggle = screen.getByRole("button", { name: "Tutup preview" });
  assert.equal(previewToggle.getAttribute("aria-expanded"), "true");
  fireEvent.click(previewToggle);
  assert.equal(screen.getByRole("button", { name: "Lihat preview" }).getAttribute("aria-expanded"), "false");
  fireEvent.click(screen.getByRole("button", { name: "Lihat preview" }));
  assert.equal(screen.getByRole("button", { name: "Tutup preview" }).getAttribute("aria-expanded"), "true");
  assert.match(screen.getByRole("status").textContent ?? "", /Draft dipulihkan/);
});

test("does not let a slow local draft overwrite newer typing and requires deliberate recovery", testOptions, async () => {
  let resolveLoad!: (value: EditorDraft | null) => void;
  const load = new Promise<EditorDraft | null>((resolve) => { resolveLoad = resolve; });
  const saves: Array<{ snapshot: Partial<DraftSnapshot> }> = [];
  const discarded: string[] = [];
  dom.window.localStorage.setItem("admin-post-draft:new", "slow-draft");

  renderEditor({
    loadDraft: async () => load,
    saveDraft: async (input) => { saves.push(input); return success("new-draft"); },
    discardDraft: async (id) => { discarded.push(id); },
  });
  changeField("Judul", "Ketik lebih baru");

  resolveLoad(draft({ id: "slow-draft", snapshot: snapshot({ title: "Draft lama", summary: "Ringkasan draft lama cukup panjang." }) }));
  await waitFor(() => assert.ok(screen.getByRole("button", { name: "Pulihkan draft tersimpan" })));

  assert.equal((screen.getByLabelText("Judul") as HTMLInputElement).value, "Ketik lebih baru");
  assert.equal(screen.getByRole("button", { name: "Simpan tulisan" }).hasAttribute("disabled"), true);
  fireEvent.click(screen.getByRole("button", { name: "Gunakan isi editor saat ini" }));
  await waitForSaveCount(saves, 1);

  assert.deepEqual(discarded, ["slow-draft"]);
  assert.equal(saves[0]?.snapshot.title, "Ketik lebih baru");
});

test("continues autosaving when localStorage throws", testOptions, async () => {
  const storage = dom.window.localStorage;
  const originalGet = storage.getItem;
  const originalSet = storage.setItem;
  Object.defineProperty(storage, "getItem", { configurable: true, value: () => { throw new Error("blocked"); } });
  Object.defineProperty(storage, "setItem", { configurable: true, value: () => { throw new Error("blocked"); } });

  try {
    const saves: Array<{ snapshot: Partial<DraftSnapshot> }> = [];
    renderEditor({ saveDraft: async (input) => { saves.push(input); return success(); } });
    changeField("Judul", "Tersimpan tanpa storage");
    await waitForSaveCount(saves, 1);
    assert.equal(saves[0]?.snapshot.title, "Tersimpan tanpa storage");
  } finally {
    Object.defineProperty(storage, "getItem", { configurable: true, value: originalGet });
    Object.defineProperty(storage, "setItem", { configurable: true, value: originalSet });
  }
});

test("can discard a new draft and reset the editor without touching publish action", testOptions, async () => {
  const discarded: string[] = [];
  let actionCalls = 0;
  renderEditor({
    saveDraft: async () => success("reset-draft"),
    discardDraft: async (id) => { discarded.push(id); },
    action: async () => { actionCalls += 1; },
  });

  changeField("Judul", "Draft untuk dihapus");
  await waitFor(() => assert.ok(screen.queryByRole("button", { name: "Buang draft & mulai ulang" })));
  await waitFor(() => assert.match(screen.getByRole("status").textContent ?? "", /Draft tersimpan/));
  fireEvent.click(screen.getByRole("button", { name: "Buang draft & mulai ulang" }));

  await waitFor(() => assert.ok(!screen.queryByRole("button", { name: "Buang draft & mulai ulang" })));
  assert.deepEqual(discarded, ["reset-draft"]);
  assert.equal((screen.getByLabelText("Judul") as HTMLInputElement).value, "");
  assert.match(screen.getByRole("status").textContent ?? "", /Draft dihapus/);
  assert.equal(actionCalls, 0);
});

test("shows an accurate save error and retries successfully", testOptions, async () => {
  let attempts = 0;
  renderEditor({
    saveDraft: async () => {
      attempts += 1;
      return attempts === 1 ? { ok: false, code: "unavailable", message: "Server draft tidak tersedia." } : success();
    },
  });

  changeField("Judul", "Coba simpan ulang");
  await waitFor(() => assert.ok(screen.getByRole("button", { name: "Coba simpan draft lagi" })));
  assert.match(screen.getByRole("status").textContent ?? "", /Server draft tidak tersedia/);

  fireEvent.click(screen.getByRole("button", { name: "Coba simpan draft lagi" }));
  await waitFor(() => assert.equal(attempts, 2));
  await waitFor(() => assert.match(screen.getByRole("status").textContent ?? "", /Draft tersimpan/));
});

test("explicit submit captures fields and cancels the pending autosave timer", testOptions, async () => {
  const saves: Array<{ snapshot: Partial<DraftSnapshot> }> = [];
  const submitted: FormData[] = [];
  renderEditor({
    saveDraft: async (input) => { saves.push(input); return success("draft-submit"); },
    action: async (data) => { submitted.push(data); },
  });

  changeField("Judul", "Judul yang dikirim");
  changeField("Ringkasan", "Ringkasan yang valid untuk pengiriman eksplisit.");
  fireEvent.submit(screen.getByRole("button", { name: "Simpan tulisan" }).closest("form")!);
  await waitFor(() => assert.equal(submitted.length, 1));
  await new Promise((resolve) => setTimeout(resolve, 40));

  assert.equal(saves.length, 1);
  assert.equal(submitted.length, 1);
  assert.equal(submitted[0]?.get("title"), "Judul yang dikirim");
  assert.equal(submitted[0]?.get("summary"), "Ringkasan yang valid untuk pengiriman eksplisit.");
  assert.equal(submitted[0]?.get("_draftId"), "draft-submit");
});

test("autosaves the published flag but only the explicit action publishes", testOptions, async () => {
  const saves: Array<{ snapshot: Partial<DraftSnapshot> }> = [];
  const actions: FormData[] = [];
  renderEditor({
    saveDraft: async (input) => { saves.push(input); return success(); },
    action: async (data) => { actions.push(data); },
  });

  fireEvent.click(screen.getByRole("checkbox", { name: /Terbitkan saat menyimpan tulisan/ }));
  await waitForSaveCount(saves, 1);
  assert.equal(saves[0]?.snapshot.published, true);
  assert.equal(actions.length, 0);

  fireEvent.submit(screen.getByRole("button", { name: "Simpan tulisan" }).closest("form")!);
  await waitFor(() => assert.equal(actions.length, 1));
  assert.equal(actions[0]?.get("published"), "on");
});

test("blocks autosave after post updated_at changes until the current contents are confirmed", testOptions, async () => {
  const saves: Array<{ snapshot: Partial<DraftSnapshot> }> = [];
  const discarded: string[] = [];
  const view = renderEditor({
    post: post("2026-02-01T00:00:00.000Z"),
    saveDraft: async (input) => { saves.push(input); return success("post-draft"); },
    discardDraft: async (id) => { discarded.push(id); },
  });

  changeField("Judul", "Isi sebelum versi berubah");
  view.rerender(<PostEditor projects={[]} post={post("2026-02-02T00:00:00.000Z")} action={async () => {}} saveDraft={async (input) => { saves.push(input); return success("post-draft"); }} loadDraft={async () => null} discardDraft={async (id) => { discarded.push(id); }} debounceMs={20} />);
  await waitFor(() => assert.match(screen.getByRole("status").textContent ?? "", /Versi tulisan berubah/));
  await new Promise((resolve) => setTimeout(resolve, 35));
  assert.equal(saves.length, 0);

  fireEvent.click(screen.getByRole("button", { name: "Gunakan isi editor saat ini" }));
  await waitForSaveCount(saves, 1);
  assert.deepEqual(discarded, []);
  assert.equal(saves[0]?.snapshot.title, "Isi sebelum versi berubah");
});

test("uses the server-reported current post version after a stale save result", testOptions, async () => {
  const saves: Array<Parameters<PostEditorProps["saveDraft"]>[0]> = [];
  let attempts = 0;
  renderEditor({
    post: post("2026-02-01T00:00:00.000Z"),
    saveDraft: async (input) => {
      saves.push(input);
      attempts += 1;
      return attempts === 1
        ? { ok: false, code: "stale", message: "Versi server berubah.", currentPostUpdatedAt: "2026-02-03T00:00:00.000Z" }
        : success("post-draft");
    },
  });

  changeField("Judul", "Isi yang harus dikonfirmasi");
  await waitFor(() => assert.ok(screen.getByRole("button", { name: "Gunakan isi editor saat ini" })));
  fireEvent.click(screen.getByRole("button", { name: "Gunakan isi editor saat ini" }));
  await waitFor(() => assert.equal(saves.length, 2));

  assert.equal(saves[0]?.basePostUpdatedAt, "2026-02-01T00:00:00.000Z");
  assert.equal(saves[1]?.basePostUpdatedAt, "2026-02-03T00:00:00.000Z");
});
