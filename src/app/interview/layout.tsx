import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "模擬面試 — AI 面試室",
  description: "貼上職缺描述，開始一場 AI 模擬面試。",
};

export default function InterviewLayout({ children }: LayoutProps<"/interview">) {
  return children;
}
