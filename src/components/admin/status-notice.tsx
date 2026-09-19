export function StatusNotice({ success, error }: { success?: string; error?: string }) {
  if (!success && !error) return null;
  return <p className={`notice ${error ? "danger" : ""}`} role="status">{error ? decodeURIComponent(error) : `Berhasil: ${success}.`}</p>;
}
