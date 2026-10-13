"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Row = { id: number; slug: string; url: string; label: string | null; created_at: string; clicks: number; uniques: number };

export default function Dashboard() {
  const [links, setLinks] = useState<Row[]>([]);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const router = useRouter();
  const base = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "");

  const load = useCallback(async () => {
    const r = await fetch("/api/links");
    if (r.ok) setLinks(await r.json());
  }, []);
  useEffect(() => { load(); }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const r = await fetch("/api/links", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, label, slug }) });
    if (!r.ok) return setError((await r.json()).error ?? "Gagal membuat link");
    setUrl(""); setLabel(""); setSlug(""); load();
  }

  async function remove(id: number) {
    if (!confirm("Hapus link ini beserta seluruh data kliknya?")) return;
    await fetch(`/api/links/${id}`, { method: "DELETE" });
    load();
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(text); setTimeout(() => setCopied(null), 1500);
  }

  async function logout() {
    await fetch("/api/login", { method: "DELETE" });
    router.push("/login");
  }

  const total = links.reduce((a, l) => a + l.clicks, 0);

  return (
    <div className="wrap">
      <div className="top">
        <h1>LinkTrack</h1>
        <button className="ghost" onClick={logout}>Keluar</button>
      </div>

      <div className="grid" style={{ marginBottom: 16 }}>
        <div className="card"><div className="muted">Total link</div><div className="stat">{links.length}</div></div>
        <div className="card"><div className="muted">Total klik (non-bot)</div><div className="stat">{total}</div></div>
      </div>

      <form className="card" onSubmit={create}>
        <h2>Buat tracking link</h2>
        <div className="row">
          <div><label className="muted">URL tujuan</label><input placeholder="https://contoh.com/halaman" value={url} onChange={(e) => setUrl(e.target.value)} required /></div>
          <div><label className="muted">Label (opsional)</label><input placeholder="Kampanye Instagram" value={label} onChange={(e) => setLabel(e.target.value)} /></div>
          <div><label className="muted">Slug (opsional)</label><input placeholder="promo-okt" value={slug} onChange={(e) => setSlug(e.target.value)} /></div>
          <button type="submit">Generate</button>
        </div>
        {error && <p className="err">{error}</p>}
      </form>

      <div className="card scroll">
        <h2>Daftar link</h2>
        <table>
          <thead><tr><th>Link tracking</th><th>Tujuan</th><th>Klik</th><th>Unik</th><th></th></tr></thead>
          <tbody>
            {links.map((l) => {
              const short = `${base}/l/${l.slug}`;
              return (
                <tr key={l.id}>
                  <td>
                    <div><b>{l.label || l.slug}</b></div>
                    <code>{short}</code>
                  </td>
                  <td style={{ maxWidth: 240, wordBreak: "break-all" }}>{l.url}</td>
                  <td>{l.clicks}</td>
                  <td>{l.uniques}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button className="ghost" onClick={() => copy(short)}>{copied === short ? "Tersalin ✓" : "Salin"}</button>{" "}
                    <Link className="btn" href={`/dashboard/${l.id}`}>Detail</Link>{" "}
                    <button className="danger" onClick={() => remove(l.id)}>Hapus</button>
                  </td>
                </tr>
              );
            })}
            {links.length === 0 && <tr><td colSpan={5} className="muted">Belum ada link. Buat yang pertama di atas.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
