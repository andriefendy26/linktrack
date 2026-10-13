// Web Crypto: berjalan di Edge (middleware) maupun Node (route handler)
export const COOKIE = "lt_session";

export async function sessionToken(): Promise<string> {
  const secret = process.env.APP_SECRET ?? "dev-secret";
  const pass = process.env.DASHBOARD_PASSWORD ?? "admin";
  const data = new TextEncoder().encode(`${secret}:${pass}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function checkPassword(input: string): boolean {
  const pass = process.env.DASHBOARD_PASSWORD ?? "admin";
  if (input.length !== pass.length) return false;
  let diff = 0;
  for (let i = 0; i < pass.length; i++) diff |= input.charCodeAt(i) ^ pass.charCodeAt(i);
  return diff === 0;
}
