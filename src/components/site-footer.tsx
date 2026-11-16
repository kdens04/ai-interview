import Link from "next/link";
import { Logo } from "./logo";

const COLUMNS = [
  {
    title: "產品",
    links: [
      { href: "/interview", label: "開始模擬面試" },
      { href: "/#features", label: "功能介紹" },
      { href: "/#preview", label: "評分報告" },
    ],
  },
  {
    title: "資源",
    links: [
      { href: "/#how", label: "使用流程" },
      { href: "/#faq", label: "常見問題" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper-2/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            依職缺客製的 AI 模擬面試。出題、追問、評分、示範回答，一次完成。
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{col.title}</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© 2026 AI 面試室</span>
          <span>評分與示範回答由 AI 生成，僅供練習參考。</span>
        </div>
      </div>
    </footer>
  );
}
