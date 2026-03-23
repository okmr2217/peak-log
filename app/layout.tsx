import type { Metadata } from "next";
import { Noto_Sans_JP, Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

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
      <body className={`${roboto.variable} ${notoSansJP.variable} antialiased font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
