import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});
// 中文字型檔案很大，不預載，交由瀏覽器按需下載
const notoSansTC = Noto_Sans_TC({ variable: "--font-noto-sans-tc", weight: ["400", "500", "700"], preload: false });
const notoSerifTC = Noto_Serif_TC({ variable: "--font-noto-serif-tc", weight: ["500", "700"], preload: false });

export const metadata: Metadata = {
  title: "AI 面試室 — 把下一場面試，先練一次",
  description: "貼上職缺描述，AI 面試官依職缺出題、追問，最後給你逐題評分與示範回答。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${notoSansTC.variable} ${notoSerifTC.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink">
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
