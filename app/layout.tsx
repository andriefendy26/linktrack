import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "LinkTrack", description: "Generator tracking link & dashboard analitik klik" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
