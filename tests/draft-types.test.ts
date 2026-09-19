import assert from "node:assert/strict";
import test from "node:test";
import { emptyDraftSnapshot, normalizeDraftSnapshot, snapshotsEqual } from "../src/lib/draft-types";

test("normalizeDraftSnapshot supports partial autosave input without validation", () => {
  const snapshot = normalizeDraftSnapshot({ title: "  Draft awal  ", published: true, body: "x".repeat(25000) });

  assert.equal(snapshot.title, "  Draft awal  ");
  assert.equal(snapshot.published, true);
  assert.equal(snapshot.body.length, 20000);
  assert.equal(snapshot.summary, "");
});

test("snapshotsEqual distinguishes meaningful editor changes", () => {
  const next = { ...emptyDraftSnapshot, title: "Tulisan baru" };

  assert.equal(snapshotsEqual(emptyDraftSnapshot, { ...emptyDraftSnapshot }), true);
  assert.equal(snapshotsEqual(emptyDraftSnapshot, next), false);
});
