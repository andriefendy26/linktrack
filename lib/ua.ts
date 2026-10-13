// Parser User-Agent sederhana (tanpa dependensi)
export function parseUA(ua: string) {
  const s = ua || "";
  const isBot = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|preview|curl|wget|python-requests|headless/i.test(s);

  let browser = "Lainnya";
  if (/Edg\//.test(s)) browser = "Edge";
  else if (/OPR\/|Opera/.test(s)) browser = "Opera";
  else if (/SamsungBrowser/.test(s)) browser = "Samsung Internet";
  else if (/Firefox\//.test(s)) browser = "Firefox";
  else if (/Chrome\/|CriOS/.test(s)) browser = "Chrome";
  else if (/Safari\//.test(s)) browser = "Safari";

  let os = "Lainnya";
  if (/Windows/.test(s)) os = "Windows";
  else if (/Android/.test(s)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(s)) os = "iOS";
  else if (/Mac OS X|Macintosh/.test(s)) os = "macOS";
  else if (/Linux/.test(s)) os = "Linux";

  let device = "Desktop";
  if (/iPad|Tablet/.test(s)) device = "Tablet";
  else if (/Mobi|iPhone|Android/.test(s)) device = "Mobile";

  return { browser, os, device, isBot };
}
