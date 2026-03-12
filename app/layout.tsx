import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Peak Log",
  description: "あなたのピーク体験を記録する",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
