import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VeriGen AI",
  description: "The GitHub Copilot for Hardware Engineers"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

