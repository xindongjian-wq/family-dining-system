import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "今天吃什么 - 家庭点餐系统",
  description: "家庭点餐系统，记录每一餐",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
