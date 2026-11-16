import Link from "next/link";
import { Logo } from "./logo";

const NAV = [
  { href: "/#features", label: "功能" },
  { href: "/#how", label: "使用流程" },
  { href: "/#preview", label: "評分報告" },
  { href: "/#faq", label: "常見問題" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="transition-colors hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/interview"
          className="group inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-on-ink transition-colors hover:bg-accent"
        >
          開始練習
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </div>
    </header>
  );
}
