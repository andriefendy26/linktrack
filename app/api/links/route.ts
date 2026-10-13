import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = db.prepare(`
    SELECT l.*,
      (SELECT COUNT(*) FROM clicks c WHERE c.link_id = l.id AND c.is_bot = 0) AS clicks,
      (SELECT COUNT(DISTINCT ip_hash) FROM clicks c WHERE c.link_id = l.id AND c.is_bot = 0) AS uniques
    FROM links l ORDER BY l.id DESC
  `).all();
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { url?: string; label?: string; slug?: string };
  let url: URL;
  try {
    url = new URL(body.url ?? "");
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
  } catch {
    return NextResponse.json({ error: "URL tujuan tidak valid (harus http/https)" }, { status: 400 });
  }

  let slug = (body.slug ?? "").trim();
  if (slug && !/^[a-zA-Z0-9_-]{3,40}$/.test(slug)) {
    return NextResponse.json({ error: "Slug hanya huruf, angka, - dan _ (3-40 karakter)" }, { status: 400 });
  }
  if (!slug) slug = randomBytes(5).toString("base64url").slice(0, 7);

  try {
    const r = db.prepare("INSERT INTO links (slug, url, label) VALUES (?, ?, ?)").run(slug, url.toString(), body.label?.trim() || null);
    return NextResponse.json({ id: r.lastInsertRowid, slug }, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof Error && /UNIQUE/.test(e.message)) {
      return NextResponse.json({ error: "Slug sudah dipakai" }, { status: 409 });
    }
    throw e;
  }
}
