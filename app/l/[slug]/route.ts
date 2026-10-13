import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { db, Link } from "@/lib/db";
import { parseUA } from "@/lib/ua";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const link = db.prepare("SELECT * FROM links WHERE slug = ?").get(slug) as Link | undefined;
  if (!link) return new NextResponse("Link tidak ditemukan", { status: 404 });

  try {
    const h = req.headers;
    const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "").trim();
    const ua = h.get("user-agent") ?? "";
    const { browser, os, device, isBot } = parseUA(ua);
    const salt = process.env.APP_SECRET ?? "dev-secret";
    const ipHash = ip ? createHash("sha256").update(ip + salt).digest("hex").slice(0, 16) : null;
    const storeRaw = process.env.STORE_RAW_IP === "true";

    // Negara/kota dari header platform hosting (Vercel / Cloudflare), jika tersedia
    const country = h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? null;
    const cityRaw = h.get("x-vercel-ip-city");
    const city = cityRaw ? decodeURIComponent(cityRaw) : null;

    db.prepare(
      `INSERT INTO clicks (link_id, ip, ip_hash, user_agent, browser, os, device, is_bot, referrer, language, country, city)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      link.id, storeRaw ? ip || null : null, ipHash, ua.slice(0, 500), browser, os, device,
      isBot ? 1 : 0, h.get("referer"), h.get("accept-language")?.split(",")[0] ?? null, country, city
    );
  } catch (e) {
    console.error("gagal mencatat klik", e); // jangan blokir redirect
  }

  return NextResponse.redirect(link.url, 302);
}
