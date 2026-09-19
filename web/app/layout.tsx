import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "内容增长决策助手",
  description:
    "从用户反馈和历史表现出发，判断下一步什么内容最值得做，以及为什么。",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
