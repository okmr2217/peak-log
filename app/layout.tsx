import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Peak Log",
  description: "楽しかった体験、達成感、エネルギーのある瞬間。あなたのピーク体験を記録して、あとから振り返ることができるログアプリ。",
  applicationName: "Peak Log",
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
