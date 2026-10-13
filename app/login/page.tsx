"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (r.ok) { router.push("/dashboard"); router.refresh(); }
    else setError((await r.json()).error ?? "Gagal masuk");
  }

  return (
    <div className="wrap" style={{ maxWidth: 380, paddingTop: 96 }}>
      <form className="card" onSubmit={submit}>
        <h1 style={{ marginBottom: 14 }}>LinkTrack</h1>
        <p className="muted">Masuk untuk mengelola tracking link.</p>
        <input type="password" placeholder="Password dashboard" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        {error && <p className="err">{error}</p>}
        <div style={{ marginTop: 12 }}><button type="submit">Masuk</button></div>
      </form>
    </div>
  );
}
