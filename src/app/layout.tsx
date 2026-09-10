import type { Metadata } from "next";
import { Outfit, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { TypeDetail } from "@/components/type-detail";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

// Latin comes from Outfit; this carries the Chinese, at matching weights.
const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sc",
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Frank MBTI · 从 MBTI 到荣格八维",
  description:
    "通过 MBTI 代码逐步推导认知功能栈，理解性格类型背后的思维运作机制。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className={`${outfit.variable} ${notoSansSC.variable} font-sans antialiased`}>
        {/* Below lg the page scrolls normally; from lg up the app is a
            fixed frame and any overflow is handled inside a view. */}
        <div className="flex min-h-screen flex-col bg-paper lg:h-[100dvh] lg:min-h-0 lg:overflow-hidden">
          <SiteHeader />
          <main className="flex-1 lg:min-h-0 lg:overflow-y-auto">{children}</main>
          <Footer />

          {/* One detail surface for the whole site; it portals to <body> */}
          <TypeDetail />
        </div>
      </body>
    </html>
  );
}
