import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.pragma("foreign_keys = ON");
  db.prepare("DELETE FROM links WHERE id = ?").run(Number(id));
  return NextResponse.json({ ok: true });
}
