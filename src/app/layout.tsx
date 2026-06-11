import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "MBTI 功能推导器 (逻辑解释版)",
  description:
    "通过 MBTI 代码逐步推导出认知功能栈，了解你的性格类型和认知功能。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className={`${outfit.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

