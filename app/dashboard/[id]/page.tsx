import Link from "next/link";
import { notFound } from "next/navigation";
import { db, Link as LinkRow, Click } from "@/lib/db";

export const dynamic = "force-dynamic";

function breakdown(linkId: number, col: string) {
  return db.prepare(
    `SELECT COALESCE(NULLIF(${col}, ''), 'Tidak diketahui') AS name, COUNT(*) AS n
     FROM clicks WHERE link_id = ? AND is_bot = 0 GROUP BY name ORDER BY n DESC LIMIT 8`
  ).all(linkId) as { name: string; n: number }[];
}

function Bars({ title, rows }: { title: string; rows: { name: string; n: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <div className="card">
      <h2>{title}</h2>
      {rows.length === 0 && <p className="muted">Belum ada data</p>}
      {rows.map((r) => (
        <div className="bl" key={r.name}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.name}>{r.name}</span>
          <div><div className="bar" style={{ width: `${(r.n / max) * 100}%` }} /></div>
          <span>{r.n}</span>
        </div>
      ))}
    </div>
  );
}

export default async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const link = db.prepare("SELECT * FROM links WHERE id = ?").get(Number(id)) as LinkRow | undefined;
  if (!link) notFound();

  const totals = db.prepare(
    `SELECT COUNT(*) AS total, COUNT(DISTINCT ip_hash) AS uniques,
            SUM(CASE WHEN is_bot = 1 THEN 1 ELSE 0 END) AS bots
     FROM clicks WHERE link_id = ?`
  ).get(link.id) as { total: number; uniques: number; bots: number };
  const humans = totals.total - (totals.bots ?? 0);

  const daily = db.prepare(
    `SELECT date(clicked_at) AS d, COUNT(*) AS n FROM clicks
     WHERE link_id = ? AND is_bot = 0 AND clicked_at >= datetime('now', '-13 days')
     GROUP BY d ORDER BY d`
  ).all(link.id) as { d: string; n: number }[];

  const recent = db.prepare(
    "SELECT * FROM clicks WHERE link_id = ? ORDER BY id DESC LIMIT 50"
  ).all(link.id) as Click[];

  return (
    <div className="wrap">
      <div className="top">
        <div>
          <Link href="/dashboard">← Kembali</Link>
          <h1 style={{ marginTop: 8 }}>{link.label || link.slug}</h1>
          <div className="muted" style={{ wordBreak: "break-all" }}>/l/{link.slug} → {link.url}</div>
        </div>
      </div>

      <div className="grid" style={{ marginBottom: 16 }}>
        <div className="card"><div className="muted">Klik (non-bot)</div><div className="stat">{humans}</div></div>
        <div className="card"><div className="muted">Pengunjung unik</div><div className="stat">{totals.uniques}</div></div>
        <div className="card"><div className="muted">Terdeteksi bot</div><div className="stat">{totals.bots ?? 0}</div></div>
      </div>

      <Bars title="Klik 14 hari terakhir" rows={daily.map((r) => ({ name: r.d, n: r.n }))} />

      <div className="grid">
        <Bars title="Browser" rows={breakdown(link.id, "browser")} />
        <Bars title="Sistem operasi" rows={breakdown(link.id, "os")} />
        <Bars title="Perangkat" rows={breakdown(link.id, "device")} />
        <Bars title="Negara" rows={breakdown(link.id, "country")} />
        <Bars title="Referrer" rows={breakdown(link.id, "referrer")} />
        <Bars title="Bahasa" rows={breakdown(link.id, "language")} />
      </div>

      <div className="card scroll">
        <h2>50 klik terakhir</h2>
        <table>
          <thead>
            <tr><th>Waktu (UTC)</th><th>Visitor</th><th>Browser / OS</th><th>Perangkat</th><th>Lokasi</th><th>Referrer</th><th>Bot</th></tr>
          </thead>
          <tbody>
            {recent.map((c) => (
              <tr key={c.id}>
                <td>{c.clicked_at}</td>
                <td><code>{c.ip ?? c.ip_hash ?? "-"}</code></td>
                <td>{c.browser} / {c.os}</td>
                <td>{c.device}</td>
                <td>{[c.city, c.country].filter(Boolean).join(", ") || "-"}</td>
                <td style={{ maxWidth: 200, wordBreak: "break-all" }}>{c.referrer || "langsung"}</td>
                <td>{c.is_bot ? "Ya" : "-"}</td>
              </tr>
            ))}
            {recent.length === 0 && <tr><td colSpan={7} className="muted">Belum ada klik.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
