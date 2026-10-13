import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dir = path.join(process.cwd(), "data");
fs.mkdirSync(dir, { recursive: true });

function init() {
  const d = new Database(path.join(dir, "tracker.db"));
  d.pragma("journal_mode = WAL");
  d.exec(`
    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      url TEXT NOT NULL,
      label TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS clicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      link_id INTEGER NOT NULL REFERENCES links(id) ON DELETE CASCADE,
      clicked_at TEXT NOT NULL DEFAULT (datetime('now')),
      ip TEXT,
      ip_hash TEXT,
      user_agent TEXT,
      browser TEXT,
      os TEXT,
      device TEXT,
      is_bot INTEGER NOT NULL DEFAULT 0,
      referrer TEXT,
      language TEXT,
      country TEXT,
      city TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_clicks_link ON clicks(link_id, clicked_at);
  `);
  return d;
}

const g = globalThis as unknown as { __db?: Database.Database };
export const db: Database.Database = g.__db ?? (g.__db = init());

export type Link = { id: number; slug: string; url: string; label: string | null; created_at: string };
export type Click = {
  id: number; link_id: number; clicked_at: string; ip: string | null; ip_hash: string | null;
  user_agent: string | null; browser: string | null; os: string | null; device: string | null;
  is_bot: number; referrer: string | null; language: string | null; country: string | null; city: string | null;
};
