import { updateSettingsAction } from "@/actions/settings-actions";
import { StatusNotice } from "@/components/admin/status-notice";
import { getAdminContent } from "@/lib/data";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const { settings } = await getAdminContent();
  return <>
    <h1>Pengaturan profil</h1>
    <p>Isi yang kosong tidak akan ditampilkan di situs publik. URL foto dan CV harus menggunakan HTTPS.</p>
    <StatusNotice {...await searchParams} />
    <form className="admin-form" action={updateSettingsAction}>
      <label>Email publik<input type="email" name="publicEmail" defaultValue={settings?.public_email ?? ""} /></label>
      <label>URL GitHub<input type="url" name="githubUrl" defaultValue={settings?.github_url ?? ""} /></label>
      <label>URL LinkedIn<input type="url" name="linkedinUrl" defaultValue={settings?.linkedin_url ?? ""} /></label>
      <label>Bio singkat<textarea name="aboutBio" maxLength={4000} defaultValue={settings?.about_bio ?? ""} placeholder="Tulis 1–3 paragraf tentang diri dan pendekatanmu." /></label>
      <label>Pendidikan<textarea name="education" maxLength={2000} defaultValue={settings?.education ?? ""} placeholder="Satu item per baris, misalnya: Mahasiswa Teknik Informatika di ITPLN" /></label>
      <label>Fokus dan minat<textarea name="focusInterests" maxLength={1200} defaultValue={settings?.focus_interests ?? ""} placeholder="Topik atau area yang sedang dipelajari." /></label>
      <label>URL foto profil<input type="url" name="profilePhotoUrl" maxLength={2048} defaultValue={settings?.profile_photo_url ?? ""} placeholder="https://..." /></label>
      <label>URL CV publik<input type="url" name="cvUrl" maxLength={2048} defaultValue={settings?.cv_url ?? ""} placeholder="https://..." /></label>
      <button>Simpan pengaturan</button>
    </form>
  </>;
}
