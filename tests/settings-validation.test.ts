import assert from "node:assert/strict";
import test from "node:test";
import { siteSettingsSchema } from "../src/lib/validations";

const emptySettings = {
  publicEmail: "",
  githubUrl: "",
  linkedinUrl: "",
  aboutBio: "",
  education: "",
  focusInterests: "",
  profilePhotoUrl: "",
  cvUrl: "",
};

test("site settings accept empty optional profile fields and normalize them to null", () => {
  const result = siteSettingsSchema.safeParse(emptySettings);

  assert.equal(result.success, true);
  if (!result.success) return;
  assert.equal(result.data.aboutBio, null);
  assert.equal(result.data.education, null);
  assert.equal(result.data.focusInterests, null);
  assert.equal(result.data.profilePhotoUrl, null);
  assert.equal(result.data.cvUrl, null);
});

test("site settings accept HTTPS photo and CV URLs", () => {
  const result = siteSettingsSchema.safeParse({
    ...emptySettings,
    profilePhotoUrl: "https://cdn.example.com/profile.webp",
    cvUrl: "https://docs.example.com/raihan-cv.pdf",
  });

  assert.equal(result.success, true);
});

test("site settings reject dangerous or insecure photo and CV schemes", () => {
  for (const field of ["profilePhotoUrl", "cvUrl"] as const) {
    for (const value of ["javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "http://example.com/file"]) {
      const result = siteSettingsSchema.safeParse({ ...emptySettings, [field]: value });
      assert.equal(result.success, false, `${field} should reject ${value}`);
    }
  }
});
